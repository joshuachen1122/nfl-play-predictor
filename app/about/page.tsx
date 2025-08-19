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

const TRY_VERSIONS = ["2.0", "1.0"]; // check newest first

async function loadFirstAvailable(): Promise<Manifest | null> {
  for (const v of TRY_VERSIONS) {
    try {
      const res = await fetch(`/data/model-${v}.json`, { cache: "no-store" });
      if (res.ok) return (await res.json()) as Manifest;
    } catch {
      // ignore and try next
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
    <article className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
          <span>About</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span>Rush vs Pass Predictor</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          What this project is & how it’s built
        </h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          <strong>{site.name}</strong> is a concise, public showcase of a model that predicts
          whether an NFL offense will <em>rush</em> or <em>pass</em> before the snap. Version{" "}
          <strong>2.0</strong> is complete and live; it expands context beyond a single play with
          smarter priors and short-term momentum, trained via group-aware validation and tuned with
          random search.
        </p>
      </header>

      {/* Status */}
      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm text-gray-600">Latest snapshot</div>
            <div className="text-xl font-semibold text-gray-900">
              v{snap?.model_version ?? "—"}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/model"
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              See the Model
            </Link>
            <Link
              href="/process"
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Methodology
            </Link>
            <Link
              href="/model/compare"
              className="hidden rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 sm:block"
            >
              Compare Versions
            </Link>
          </div>
        </div>

        {snap ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">ROC-AUC</div>
              <div className="text-xl font-semibold text-gray-900">
                {snap.metrics?.auc ?? "—"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Log Loss</div>
              <div className="text-xl font-semibold text-gray-900">
                {snap.metrics?.logloss ?? "—"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">Figures</div>
              <div className="text-xl font-semibold text-gray-900">{snap.images?.length ?? 0}</div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-600">
            Export a notebook with the provided script to populate metrics and figures (see{" "}
            <code>tools/export_site_assets.py</code>).
          </p>
        )}
      </section>

      {/* Why LightGBM & What’s in 2.0 */}
      <section className="mb-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Why LightGBM?</h2>
          <ul className="mt-3 list-inside list-disc text-gray-700">
            <li>Excels on tabular data with mixed numeric + categorical features</li>
            <li>Captures nonlinear interactions without heavy manual crosses</li>
            <li>Fast training, strong baselines, feature importances out of the box</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">What’s new in v2.0</h2>
          <ul className="mt-3 list-inside list-disc text-gray-700">
            <li>Coach <strong>down</strong> & <strong>distance</strong> priors with Bayesian smoothing</li>
            <li>Short-term pass-rate windows (last 3–10 plays) at team/drive level</li>
            <li>Historical tendencies for both offense and defense</li>
            <li>“Next-snap” game-state context (clock, field position, timeouts)</li>
            <li>GroupKFold by <em>game_id</em> to prevent leakage; post-hoc calibration</li>
          </ul>
        </div>
      </section>

      {/* Feature Engineering */}
      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Feature Engineering (highlights)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <ul className="list-inside list-disc text-gray-700">
            <li>Coach tendencies by down & distance buckets (smoothed)</li>
            <li>Rolling pass-rate windows over recent plays (3, 5, 10)</li>
            <li>Team & defense priors informed by league rates</li>
          </ul>
          <ul className="list-inside list-disc text-gray-700">
            <li>Game state at next snap: down, distance, clock, yardline, timeouts</li>
            <li>Clean categorical handling (IDs → categories) for LightGBM</li>
            <li>Drop/guard potential leakage fields and post-play outcomes</li>
          </ul>
        </div>
      </section>

      {/* Training & Tuning */}
      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Training & Tuning</h2>
        <ul className="mt-3 list-inside list-disc text-gray-700">
          <li>Grouped CV by <em>game_id</em>, early stopping on a validation fold</li>
          <li>
            Random search over{" "}
            <code>learning_rate, num_leaves, min_child_samples, feature_fraction, bagging_fraction, bagging_freq, lambda_l2</code>
          </li>
          <li>Chosen threshold via validation curve; optional post-hoc calibration</li>
        </ul>
      </section>

      {/* Tech Stack */}
      <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Tech Stack</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-gray-900">Frontend</div>
            <p className="text-gray-700">
              Next.js 14, TypeScript, Tailwind CSS. Notebook text via <code>react-markdown</code>.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Modeling</div>
            <p className="text-gray-700">Python, LightGBM, scikit-learn, pandas, NumPy.</p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Artifacts</div>
            <p className="text-gray-700">
              Exporter writes <code>public/data/model-&lt;version&gt;.json</code> plus images under{" "}
              <code>public/images/&lt;version&gt;/</code>.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Deploy</div>
            <p className="text-gray-700">Static site on Vercel; future API on FastAPI + Postgres.</p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">What’s next</h2>
        <ul className="mt-3 list-inside list-disc text-gray-700">
          <li>Public API endpoint for live predictions + a simple “Try It” page</li>
          <li>Slice dashboards (down/distance/field zone; per-team coach tendences)</li>
          <li>Continuous calibration checks and drift monitoring</li>
        </ul>
      </section>

      {/* Footer links */}
      <footer className="mt-8 text-sm text-gray-600">
        Questions or suggestions? Find the links in the footer or open an issue on{" "}
        <a href={site.social.github} className="underline">
          GitHub
        </a>
        .
      </footer>
    </article>
  );
}
