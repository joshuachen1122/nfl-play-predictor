"use client";
import { useEffect, useState } from "react";
import { loadManifest, ModelManifest } from "./loader";

const VERSIONS = ["1.0", "2.0"]; // add/remove as you export

function MetricRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b py-1">
      <span className="capitalize text-gray-600">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

export default function ModelPage() {
  const [version, setVersion] = useState<string>(VERSIONS[1]);
  const [data, setData] = useState<ModelManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setData(null);
    loadManifest(version)
      .then(setData)
      .catch(() => setError(`No manifest for ${version} yet. Export it first.`));
  }, [version]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Model Results</h1>

      {/* Version selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Version:</span>
        <select
          className="rounded border px-2 py-1"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        >
          {VERSIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {error && <div className="rounded border bg-yellow-50 p-3 text-yellow-800">{error}</div>}

      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 rounded-2xl border p-4">
            <h2 className="mb-3 text-lg font-semibold">Key Metrics</h2>
            {Object.keys(data.metrics).length ? (
              <div className="space-y-1">
                {Object.entries(data.metrics).map(([k, v]) => (
                  <MetricRow key={k} k={k} v={v} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No metrics detected—update your exporter regexes or fill manually.</p>
            )}
            <div className="mt-4 text-xs text-gray-500">Model version: {data.model_version}</div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border p-4">
            <h2 className="mb-3 text-lg font-semibold">Figures</h2>
            {data.images.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {data.images.map((src) => (
                  <figure key={src} className="rounded-lg border p-2">
                    <img src={src} alt={src.split("/").pop() || "figure"} className="w-full" />
                    <figcaption className="mt-1 text-xs text-gray-500">{src.split("/").pop()}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No images exported for this version.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
