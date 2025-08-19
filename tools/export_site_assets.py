# Execute notebook and export ordered steps with robust header detection.
# Usage:
#   python tools/export_site_assets.py "Predicting Rush or Pass 1.0.ipynb" --version 1.0

import argparse, base64, json, re
from pathlib import Path
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor

# --- Heading detectors -------------------------------------------------------
MD_HEAD_RE    = re.compile(r"^\s{0,3}(#{1,2})\s+(.+)$", re.M)         # # / ##
H_TAG_RE      = re.compile(r"<h([12])[^>]*>(.*?)</h\1>", re.I | re.S)  # <h1|h2>...</h1|h2>
TAG_STRIP_RE  = re.compile(r"<[^>]+>")                                 # strip all tags
HEAVY_HTML_RE = re.compile(r"</?(table|tr|td|th|thead|tbody|tfoot|svg|img|pre|code|style|script)\b", re.I)

def strip_html(s: str) -> str:
    return TAG_STRIP_RE.sub("", s or "").strip()

def md_heading(md: str):
    """If markdown starts with #/##, return title and the body without that heading."""
    m = MD_HEAD_RE.search(md or "")
    if not m:
        return None, md
    title = re.sub(r"\s+#+\s*$", "", (m.group(2) or "").strip())
    body = MD_HEAD_RE.sub("", md, count=1).lstrip()
    return title, body

def html_heading_from_html(html: str):
    """Return heading title if html looks like a section header (<h1|h2> or short plain HTML)."""
    if not html:
        return None
    m = H_TAG_RE.search(html)
    if m:
        return strip_html(m.group(2))
    if HEAVY_HTML_RE.search(html):
        return None
    line = " ".join(strip_html(html).split())
    return line if line and len(line) <= 80 else None

def html_heading_from_plain(text: str):
    """Return heading title if plain text contains <h1|h2>...</h1|h2> literally."""
    if not text:
        return None
    m = H_TAG_RE.search(text)
    return strip_html(m.group(2)) if m else None

# --- Metrics (unchanged) -----------------------------------------------------
def extract_metrics(text: str):
    def find(p): 
        m = re.search(p, text, re.I); 
        return m.group(1) if m else None
    out = {
        "auc":       find(r"(?:AUC|roc[_\s-]*auc)[^\d]*([0-1]\.\d{2,4})"),
        "accuracy":  find(r"(?:accuracy|acc\b)[^\d]*([0-1]?\.\d{2,4}|[1-9]\d(?:\.\d{1,2})?%)"),
        "logloss":   find(r"(?:log[-\s]*loss|binary[-\s]*logloss)[^\d]*([0-9]\.\d{2,4})"),
        "precision": find(r"(?:precision)[^\d]*([0-1]?\.\d{2,4}|[1-9]\d(?:\.\d{1,2})?%)"),
        "recall":    find(r"(?:recall)[^\d]*([0-1]?\.\d{2,4}|[1-9]\d(?:\.\d{1,2})?%)"),
        "brier":     find(r"(?:brier)[^\d]*([0-9]\.\d{2,4})"),
    }
    return {k:v for k,v in out.items() if v}

# --- Main --------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("notebook")
    ap.add_argument("--version", default="1.0")
    args = ap.parse_args()

    nb_path = Path(args.notebook)
    nb = nbformat.read(nb_path, as_version=4)

    # Execute so images/HTML/prints are materialized
    ExecutePreprocessor(timeout=1200, kernel_name="python3").preprocess(
        nb, {"metadata": {"path": str(nb_path.parent.resolve())}}
    )

    img_dir = Path("public/images") / args.version
    data_dir = Path("public/data")
    img_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)

    # Keep executed copy for reference
    nbformat.write(nb, open(nb_path.with_suffix(".executed.ipynb"), "w", encoding="utf-8"))

    steps = []
    current = None
    img_idx = 1
    global_text = []
    global_images = []
    last_title = None

    def start_step(title: str):
        nonlocal last_title
        s = {"index": len(steps)+1, "title": title or f"Step {len(steps)+1}", "blocks": []}
        steps.append(s)
        last_title = title
        return s

    for cell in nb.cells:
        if cell.cell_type == "markdown":
            md = cell.source or ""
            global_text.append(md)

            # A) Markdown headings (# / ##)
            title, body = md_heading(md)  # returns (title or None, body_without_heading)

            # B) NEW: HTML headings inside markdown (e.g., "<h2>Load Data</h2>")
            if not title:
                html_title = html_heading_from_html(md)  # uses H_TAG_RE under the hood
                if html_title:
                    title = html_title
                    # strip only the first <h1>/<h2> tag pair from this cell
                    body = H_TAG_RE.sub("", md, count=1).lstrip()
                else:
                    body = md

            if title and title != last_title:
                current = start_step(title)
            elif current is None:
                current = start_step("Prologue")

            if body.strip():
                current["blocks"].append({"type": "markdown", "content": body})
            continue

        elif cell.cell_type == "code":
            if current is None:
                current = start_step("Prologue")

            code = (cell.source or "").rstrip()
            if code:
                current["blocks"].append({"type":"code","language":"python","content":code})

            for out in cell.get("outputs", []):
                otype = out.get("output_type")
                data  = out.get("data", {}) if isinstance(out, dict) else {}

                # 1) STREAM (prints)
                if otype == "stream" and out.get("text"):
                    txt = out["text"]
                    # If the print actually contains <h1|h2> tags, treat as header & skip emitting
                    title = html_heading_from_plain(txt)
                    if title and title != last_title:
                        current = start_step(title)
                        continue
                    global_text.append(txt)
                    current["blocks"].append({"type":"stdout","content": txt})
                    continue

                # 2) RICH (display_data/execute_result)
                if otype in ("display_data","execute_result"):
                    data = out.get("data", {}) if isinstance(out, dict) else {}

                    # Detect if this output contains an HTML DataFrame/table
                    html = None
                    saw_html_table = False
                    if "text/html" in data:
                        html = data["text/html"]
                        if isinstance(html, list):
                            html = "".join(html)
                        # pandas usually wraps with <table> or <div class="dataframe">...</div>
                        if "<table" in html or 'class="dataframe"' in html:
                            saw_html_table = True

                    # a) If HTML exists, record it (tables will be styled on the site)
                    if html is not None:
                        title = html_heading_from_html(html)  # your existing helper
                        if title and title != last_title:
                            current = start_step(title)
                            # don't render the heading block itself if it *is* the section title
                            # (otherwise you'll see the heading duplicated inside the section)
                            html = None  # suppress rendering the header HTML
                        if html:
                            global_text.append(strip_html(html))
                            current["blocks"].append({"type": "html", "content": html})

                    # b) Images
                    if "image/png" in data:
                        b64 = data["image/png"];  b64 = b64.encode() if isinstance(b64, str) else b64
                        png = base64.b64decode(b64)
                        name = f"cell_{cell.execution_count or 0}_img_{img_idx:02d}.png"
                        (img_dir / name).write_bytes(png)
                        rel = f"/images/{args.version}/{name}"
                        global_images.append(rel)
                        current["blocks"].append({"type": "image", "src": rel, "alt": name})
                        img_idx += 1

                    if "image/svg+xml" in data:
                        svg = data["image/svg+xml"];  svg = "".join(svg) if isinstance(svg, list) else svg
                        name = f"cell_{cell.execution_count or 0}_img_{img_idx:02d}.svg"
                        (img_dir / name).write_text(svg, encoding="utf-8")
                        rel = f"/images/{args.version}/{name}"
                        global_images.append(rel)
                        current["blocks"].append({"type": "image", "src": rel, "alt": name})
                        img_idx += 1

                    # c) Plain text result: SKIP if we already captured an HTML table
                    if "text/plain" in data:
                        txt = data["text/plain"]
                        # treat printed <h1>/<h2> as section starts (your existing logic)
                        title = html_heading_from_plain(txt)
                        if title and title != last_title:
                            current = start_step(title)
                        elif not saw_html_table:  # << prevent duplicate tables
                            global_text.append(txt)
                            current["blocks"].append({"type": "stdout", "content": txt})

    # Drop empty first step and reindex
    if steps and not steps[0]["blocks"]:
        steps = steps[1:]
    for i, s in enumerate(steps, 1):
        s["index"] = i

    # Manifests
    manifest = {
        "model_version": args.version,
        "metrics": extract_metrics("\n".join(global_text)),
        "images": global_images,
        "notes": "Auto-generated from executed notebook"
    }
    (data_dir / f"model-{args.version}.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (data_dir / f"model-{args.version}-steps.json").write_text(
        json.dumps({"model_version": args.version, "steps": steps}, indent=2), encoding="utf-8"
    )

if __name__ == "__main__":
    main()
