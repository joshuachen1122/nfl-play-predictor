# tools/export_site_assets.py
# Usage examples:
#   python tools/export_site_assets.py "Predicting Rush or Pass 1.0.ipynb" --version 1.0
#   python tools/export_site_assets.py "Predicting Rush or Pass 2.0.ipynb" --version 2.0
#
# Outputs:
#   public/data/model-<version>.json                # key metrics + images (high level)
#   public/data/model-<version>-steps.json          # ordered "steps" with code/markdown/outputs
#   public/images/<version>/...                     # extracted figures

import argparse, base64, json, os, re
from pathlib import Path
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor

HEADING_RE = re.compile(r"^\s{0,3}(#{1,3})\s+(.+)$", re.M)

def normalize_heading(md: str):
    """Return (level, text) for the first h1/h2/h3 in a markdown chunk, else None."""
    m = HEADING_RE.search(md)
    if not m:
        return None
    level = len(m.group(1))
    text = m.group(2).strip()
    # remove trailing hashes if present
    text = re.sub(r"\s+#+\s*$", "", text)
    return level, text

def extract_metrics(text: str):
    def find(pat):
        m = re.search(pat, text, re.I)
        return m.group(1) if m else None
    metrics = {
        "auc": find(r"(?:AUC|roc[_\s-]*auc)[^\d]*([0-1]\.\d{2,4})"),
        "accuracy": find(r"(?:accuracy|acc\b)[^\d]*([0-1]?\.\d{2,4}|[1-9]\d(?:\.\d{1,2})?%)"),
        "logloss": find(r"(?:log[-\s]*loss|binary[-\s]*logloss)[^\d]*([0-9]\.\d{2,4})"),
        "precision": find(r"(?:precision)[^\d]*([0-1]?\.\d{2,4}|[1-9]\d(?:\.\d{1,2})?%)"),
        "recall": find(r"(?:recall)[^\d]*([0-1]?\.\d{2,4}|[1-9]\d(?:\.\d{1,2})?%)"),
        "brier": find(r"(?:brier)[^\d]*([0-9]\.\d{2,4})"),
    }
    return {k: v for k, v in metrics.items() if v}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("notebook")
    ap.add_argument("--version", default="1.0")
    args = ap.parse_args()

    nb_path = Path(args.notebook)
    if not nb_path.exists():
        raise SystemExit(f"Notebook not found: {nb_path}")

    # Execute the notebook in-place (so we capture images/prints)
    nb = nbformat.read(nb_path, as_version=4)
    ep = ExecutePreprocessor(timeout=1200, kernel_name="python3")
    ep.preprocess(nb, {"metadata": {"path": str(nb_path.parent.resolve())}})

    # Output dirs
    img_dir = Path("public/images") / args.version
    data_dir = Path("public/data")
    img_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)

    # Save executed notebook (optional breadcrumb)
    exec_nb_path = nb_path.with_suffix(".executed.ipynb")
    nbformat.write(nb, open(exec_nb_path, "w", encoding="utf-8"))

    # GLOBAL aggregations for top-level metrics & images
    global_text = []
    global_images = []

    # Group cells into "steps" based on markdown headings (h1/h2/h3).
    steps = []
    current = None
    step_index = 0
    image_counter = 1

    def start_step(title: str):
        nonlocal step_index, current
        step_index += 1
        current = {
            "index": step_index,
            "title": title,
            "markdown": "",
            "blocks": []  # each block: {"type":"code"/"stdout"/"image","content":...}
        }
        steps.append(current)

    # Default first step if the notebook starts with code/no heading
    start_step("Introduction")

    for cell in nb.cells:
        if cell.cell_type == "markdown":
            md = cell.source or ""
            global_text.append(md)
            head = normalize_heading(md)
            if head:  # start a new step at headings
                level, text = head
                start_step(text)
                # Remove the heading line before storing markdown (keep body)
                md = HEADING_RE.sub("", md, count=1).lstrip()
            # append markdown to current step
            if md.strip():
                current["markdown"] += (("\n\n" if current["markdown"] else "") + md)

        elif cell.cell_type == "code":
            code = cell.source or ""
            if code.strip():
                current["blocks"].append({"type": "code", "language": "python", "content": code})
            # outputs
            for out in cell.get("outputs", []):
                if out.get("output_type") == "stream" and out.get("text"):
                    text = out["text"]
                    global_text.append(text)
                    current["blocks"].append({"type": "stdout", "content": text})
                if out.get("output_type") in ("display_data", "execute_result"):
                    data = out.get("data", {})
                    # images
                    if "image/png" in data:
                        b64 = data["image/png"]
                        if isinstance(b64, str): b64 = b64.encode("utf-8")
                        png = base64.b64decode(b64)
                        name = f"cell_{cell.execution_count or 0}_img_{image_counter:02d}.png"
                        (img_dir / name).write_bytes(png)
                        rel = f"/images/{args.version}/{name}"
                        global_images.append(rel)
                        current["blocks"].append({"type": "image", "src": rel, "alt": name})
                        image_counter += 1
                    if "image/svg+xml" in data:
                        svg = data["image/svg+xml"]
                        if isinstance(svg, list): svg = "".join(svg)
                        name = f"cell_{cell.execution_count or 0}_img_{image_counter:02d}.svg"
                        (img_dir / name).write_text(svg, encoding="utf-8")
                        rel = f"/images/{args.version}/{name}"
                        global_images.append(rel)
                        current["blocks"].append({"type": "image", "src": rel, "alt": name})
                        image_counter += 1
                    # plain text results
                    if "text/plain" in data:
                        text = data["text/plain"]
                        global_text.append(text)
                        current["blocks"].append({"type": "stdout", "content": text})

    # Extract a few "headline" metrics from all text we saw
    metrics = extract_metrics("\n".join(global_text))

    # Top-level manifest (as before)
    manifest = {
        "model_version": args.version,
        "metrics": metrics,
        "images": global_images,
        "notes": "Auto-generated from executed notebook",
    }
    (data_dir / f"model-{args.version}.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    # Detailed step-by-step manifest
    steps_manifest = {
        "model_version": args.version,
        "steps": steps
    }
    (data_dir / f"model-{args.version}-steps.json").write_text(json.dumps(steps_manifest, indent=2), encoding="utf-8")

    print(f"✅ Wrote public/data/model-{args.version}.json")
    print(f"✅ Wrote public/data/model-{args.version}-steps.json")
    print(f"✅ Saved images → {img_dir}")
    print(f"ℹ️  Executed notebook saved → {exec_nb_path}")

if __name__ == "__main__":
    main()
