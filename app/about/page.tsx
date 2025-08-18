// app/about/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

type Manifest = {
  model_version: string;
  metrics: Record<string, string>;
  images: string[];
};

const TRY_VERSIONS = ["2.0", "1.0"]; // checks in this order

async function loadFirstAvailable(): Promise<Manifest | null> {
  for (const v of TRY_VERSIONS) {
    try {
      const res = await fetch(`/data/model-${v}.json`, { cache: "no-store" });
      if (res.ok) return (await res.json()) as Manifest;
    } catch {
      // ignore
    }
  }
  return null;
}

export default function AboutPage() {
  const [snap, setSnap] = useState<Manifest | null>(null);

  useEffect(() => {
    loadFirstAvailable().then(setSnap);
  }, []);

  return (
    <article className="prose max-w-none">
      <h1>About this project</h1>
      <p>
        <strong>{site.name}</strong> is a public, static showcase for a model that predicts whether
        an NFL offense will <em>rush</em> or <em>pass</em> before the snap. The site documents the
        end-to-end workflow (data → features → training → evaluation) and is designed to grow into a
        full app (API, DB, auth) without a redesign.
      </p>

      {/* PROJECT STATUS */}
      <div className="not-prose mt-4 rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Project status</div>
            <div className="text-lg font-semibold">
              Latest snapshot:{" "}
              {snap ? <span>v{snap.model_version}</span> : <span className="text-gray-500">—</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/model" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
              Model
            </Link>
            <Link href="/process" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
              Process
            </Link>
            <Link
              href="/model/compare"
              className="hidden rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50 sm:block"
            >
              Compare
            </Link>
          </div>
        </div>
        {snap && (
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">ROC-AUC</div>
              <div className="text-xl font-semibold">{snap.metrics?.auc ?? "—"}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Log Loss</div>
              <div className="text-xl font-semibold">{snap.metrics?.logloss ?? "—"}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Figures</div>
              <div className="text-xl font-semibold">{snap.images?.length ?? 0}</div>
            </div>
          </div>
        )}
        {!snap && (
          <p className="mt-2 text-sm text-gray-600">
            Export a notebook using the provided script to populate metrics and figures (see
            <code> tools/export_site_assets.py</code>).
          </p>
        )}
      </div>

      <h2>Goals</h2>
      <ul>
        <li>
          <strong>Transparency:</strong> show the code and reasoning, not only final charts.
        </li>
        <li>
          <strong>Reproducibility:</strong> generate all public artifacts directly from executed
          notebooks (versioned manifests + images).
        </li>
        <li>
          <strong>Extensibility:</strong> start static today, grow to an API-backed app (Option B)
          with no UI refactor.
        </li>
      </ul>

      <h2>Tech stack</h2>
      <ul>
        <li>
          <strong>Frontend:</strong> Next.js 14, TypeScript, Tailwind. Code highlighting via{" "}
          <code>prism-react-renderer</code>; Markdown rendering for notebook text via{" "}
          <code>react-markdown</code>.
        </li>
        <li>
          <strong>Artifacts:</strong> a small Python exporter executes a notebook and writes{" "}
          <code>public/data/model-&lt;version&gt;.json</code> plus images under{" "}
          <code>public/images/&lt;version&gt;/</code>.
        </li>
        <li>
          <strong>(Future)</strong> API: FastAPI (Python), Postgres for logs/feedback, and hosting
          on Render/Railway/Fly. Frontend on Vercel.
        </li>
      </ul>

      <h2>Data & ethics</h2>
      <ul>
        <li>
          Uses publicly available play-by-play data (e.g., packages like <code>nfl_data_py</code>).
        </li>
        <li>
          Focus is on pre-snap context only; no individual player tracking or private data.
        </li>
        <li>
          Educational and research purposes; not affiliated with the NFL or any team.
        </li>
      </ul>

      <h2>Versioning</h2>
      <p>
        The site is version-aware. Each release (e.g., <strong>v1.0</strong>,{" "}
        <strong>v2.0</strong>) gets a manifest and figure set. The Model page includes a version
        selector and an optional side-by-side compare. The Process page renders a step-by-step
        timeline of markdown, code, stdout, and images grouped by notebook headings.
      </p>

      <h2>Roadmap</h2>
      <ul>
        <li>Publish v2.0 with richer features and better calibration.</li>
        <li>Compare page with green/red deltas and calibration drift.</li>
        <li>Interactive “Predict” page once the FastAPI backend is live.</li>
        <li>Slice dashboards (down/distance/field zone; per-team analysis).</li>
        <li>Optional feedback collection (thumbs up/down) and AB testing.</li>
      </ul>

      <h2>Acknowledgments</h2>
      <ul>
        <li>Open-source contributors behind play-by-play data tools.</li>
        <li>Libraries: LightGBM, scikit-learn, pandas, NumPy, and the broader Python/JS ecosystem.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions or suggestions? Open an issue on{" "}
        <a href={site.social.github} className="underline">
          GitHub
        </a>{" "}
        or reach out via the links in the footer.
      </p>

      <h2>Disclaimer</h2>
      <p>
        This site is for educational purposes only and is not affiliated with or endorsed by the NFL
        or any team. All trademarks are property of their respective owners.
      </p>
    </article>
  );
}
