"use client";
import { useEffect, useState } from "react";
import { loadManifest, ModelManifest } from "../loader";

const A = "1.0";
const B = "2.0";

function Table({ a, b }: { a: ModelManifest; b: ModelManifest }) {
  const keys = Array.from(new Set([...Object.keys(a.metrics), ...Object.keys(b.metrics)]));
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2">Metric</th>
          <th className="text-left py-2">v{A}</th>
          <th className="text-left py-2">v{B}</th>
        </tr>
      </thead>
      <tbody>
        {keys.map((k) => (
          <tr key={k} className="border-b">
            <td className="py-1 capitalize">{k}</td>
            <td className="py-1">{a.metrics[k] ?? "—"}</td>
            <td className="py-1">{b.metrics[k] ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ComparePage() {
  const [m1, setM1] = useState<ModelManifest | null>(null);
  const [m2, setM2] = useState<ModelManifest | null>(null);

  useEffect(() => { loadManifest(A).then(setM1).catch(()=>{}); }, []);
  useEffect(() => { loadManifest(B).then(setM2).catch(()=>{}); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Compare v{A} vs v{B}</h1>
      {m1 && m2 ? (
        <Table a={m1} b={m2} />
      ) : (
        <div className="rounded border bg-yellow-50 p-3 text-yellow-800">
          Export both versions first (model-{A}.json and model-{B}.json).
        </div>
      )}
    </div>
  );
}