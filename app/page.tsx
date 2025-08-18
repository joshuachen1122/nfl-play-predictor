// app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Manifest = {
  model_version: string;
  metrics: Record<string, string>;
  images: string[];
};

const TRY_VERSIONS = ["2.0", "1.0"]; // tries v2.0 first, falls back to v1.0

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

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value ?? "—"}</div>
    </div>
  );
}

export default function HomePage() {
  const [snap, setSnap] = useState<Manifest | null>(null);

  useEffect(() => {
    loadFirstAvailable().then(setSnap);
  }, []);

  const auc = snap?.metrics?.auc;
  const logloss = snap?.metrics?.logloss;
  const brier = snap?.metrics?.brier;
  const thumb = snap?.images?.[0];

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">NFL Play Predictor</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Static showcase for a rush vs. pass model. Explore the modeling process, results, and how
          things improve from <strong>v1.0</strong> to <strong>v2.0</strong>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/model" className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90">
            See the Model
          </Link>
          <Link href="/process" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
            Step-by-Step Process
          </Link>
          <Link
            href="/model/compare"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50 hidden sm:inline-block"
          >
            Compare Versions
          </Link>
        </div>
        {snap && (
          <p className="mt-3 text-xs text-gray-500">
            Showing latest available snapshot: <span className="font-medium">v{snap.model_version}</span>
          </p>
        )}
      </section>

      {/* LATEST SNAPSHOT */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">Headline Metrics</h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Stat label="ROC-AUC" value={auc} />
            <Stat label="Log Loss" value={logloss} />
            <Stat label="Brier" value={brier} />
          </div>
          <div className="text-sm text-gray-600">
            Metrics are parsed from the executed notebook export. See{" "}
            <Link href="/methodology" className="underline">
              Methodology
            </Link>{" "}
            for definitions and caveats.
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border overflow-hidden">
            {thumb ? (
              <img src={thumb} alt="Model figure" className="w-full" />
            ) : (
              <div className="flex h-60 items-center justify-center text-sm text-gray-500">
                Export your notebook to see a preview image here (public/images/&lt;version&gt;/…)
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>
              Want the full story? Check the{" "}
              <Link href="/process" className="underline">
                Process
              </Link>{" "}
              page for code, outputs, and figures grouped by step.
            </span>
            <Link href="/model" className="underline">
              View all figures →
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section>
        <h2 className="text-lg font-semibold">What’s inside</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border p-5 shadow-sm">
            <h3 className="mb-1 text-base font-semibold">Process</h3>
            <p className="text-sm text-gray-600">
              A clean, collapsible walkthrough of the notebook — markdown, code, stdout, and figures
              — organized into steps.
            </p>
            <Link href="/process" className="mt-2 inline-block text-sm underline">
              Explore →
            </Link>
          </div>
          <div className="rounded-2xl border p-5 shadow-sm">
            <h3 className="mb-1 text-base font-semibold">Model</h3>
            <p className="text-sm text-gray-600">
              Versioned manifests (v1.0, v2.0) with headline metrics and gallery. Ready for a
              side-by-side compare.
            </p>
            <Link href="/model" className="mt-2 inline-block text-sm underline">
              See results →
            </Link>
          </div>
          <div className="rounded-2xl border p-5 shadow-sm">
            <h3 className="mb-1 text-base font-semibold">Methodology</h3>
            <p className="text-sm text-gray-600">
              Data, feature engineering, evaluation, calibration, and a quick glossary of the key
              metrics we report.
            </p>
            <Link href="/methodology" className="mt-2 inline-block text-sm underline">
              Read more →
            </Link>
          </div>
        </div>
      </section>

      {/* VERSIONING NOTE */}
      <section className="rounded-2xl border p-5 bg-white">
        <h2 className="text-lg font-semibold">Versioning</h2>
        <p className="mt-1 text-sm text-gray-700">
          The site reads <code>public/data/model-&lt;version&gt;.json</code> and images under{" "}
          <code>public/images/&lt;version&gt;/</code>. Export your notebook with the provided tool
          to add new versions. When you publish <strong>v2.0</strong>, the homepage will
          automatically pick it up as the latest snapshot.
        </p>
        <div className="mt-2 text-sm">
          <Link href="/model/compare" className="underline">
            Compare v1.0 vs v2.0 →
          </Link>
        </div>
      </section>
    </div>
  );
}
