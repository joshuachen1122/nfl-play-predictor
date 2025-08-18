"use client";
import { useEffect, useState } from "react";
import { NotebookStep } from "@/components/NotebookStep";
import { loadSteps, StepsManifest } from "./loader";

const VERSIONS = ["1.0", "2.0"]; // export 2.0 when ready

export default function ProcessPage() {
  const [version, setVersion] = useState<string>(VERSIONS[0]);
  const [data, setData] = useState<StepsManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    loadSteps(version)
      .then(setData)
      .catch(() => setError(`No steps found for v${version}. Run the exporter for this version.`));
  }, [version]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modeling Process</h1>
          <p className="text-gray-600">Step-by-step code, outputs, and commentary from the notebook.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Version</span>
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
      </div>

      {error && <div className="rounded border bg-yellow-50 p-3 text-yellow-800">{error}</div>}

      {data && (
        <div className="space-y-4">
          {data.steps.map((s, i) => (
            <NotebookStep
              key={i}
              index={s.index}
              title={s.title}
              markdown={s.markdown}
              blocks={s.blocks}
              defaultOpen={i < 2} // open first couple by default
            />
          ))}
        </div>
      )}
    </div>
  );
}
