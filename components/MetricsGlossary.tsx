// components/MetricsGlossary.tsx
"use client";

type Metric = {
  name: string;
  short?: string;
  what: string;
  why: string;
  range?: string;
  notes?: string;
  formula?: string;
};

const METRICS: Metric[] = [
  {
    name: "AUC (ROC-AUC)",
    what: "Probability a random positive gets a higher score than a random negative.",
    why: "Ranking quality independent of threshold.",
    range: "0.5 (chance) → 1.0 (perfect)",
    notes: "Insensitive to calibration.",
  },
  {
    name: "Log Loss",
    what: "Penalizes confident wrong predictions. Uses predicted probabilities.",
    why: "Measures probabilistic quality.",
    range: "0 → ∞ (lower is better)",
    formula: "−(1/N) Σ [ y·log(p) + (1−y)·log(1−p) ]",
  },
  {
    name: "Brier Score",
    what: "Mean squared error of probabilities.",
    why: "Captures calibration + refinement.",
    range: "0 → 1 (lower is better)",
    formula: "(1/N) Σ (p − y)²",
  },
  {
    name: "Accuracy",
    what: "Share of correct labels at a chosen threshold (default 0.5).",
    why: "Simple, but hides calibration and class imbalance.",
  },
  {
    name: "Precision / Recall",
    short: "Precision: TP/(TP+FP). Recall: TP/(TP+FN).",
    what: "Quality vs. coverage for the PASS class (or RUSH).",
    why: "Useful when you care about one class’s errors.",
  },
  {
    name: "ECE (Expected Calibration Error)",
    what: "Average gap between predicted probability and empirical frequency across bins.",
    why: "Quantifies calibration.",
    range: "0 → 1 (lower is better)",
  },
  {
    name: "MCE (Maximum Calibration Error)",
    what: "Worst-case bin gap between predicted prob and observed freq.",
    why: "Conservative calibration check.",
  },
  {
    name: "Confusion Matrix",
    what: "Counts of TP/FP/FN/TN at a threshold.",
    why: "Explains which mistakes dominate.",
  },
];

function Card({ m }: { m: Metric }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <h3 className="text-base font-semibold">{m.name}</h3>
      {m.short && <p className="mt-1 text-xs text-gray-600">{m.short}</p>}
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="font-medium">What</dt>
          <dd className="text-gray-700">{m.what}</dd>
        </div>
        <div>
          <dt className="font-medium">Why</dt>
          <dd className="text-gray-700">{m.why}</dd>
        </div>
        {m.range && (
          <div>
            <dt className="font-medium">Range</dt>
            <dd className="text-gray-700">{m.range}</dd>
          </div>
        )}
        {m.formula && (
          <div>
            <dt className="font-medium">Formula</dt>
            <dd>
              <code className="rounded bg-gray-50 px-1 py-0.5">{m.formula}</code>
            </dd>
          </div>
        )}
        {m.notes && (
          <div>
            <dt className="font-medium">Notes</dt>
            <dd className="text-gray-700">{m.notes}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export function MetricsGlossary() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">Metrics Glossary</h2>
      <p className="text-sm text-gray-600">
        These are the main metrics referenced on the Model and Process pages. “Lower is better” for
        loss-like metrics; “higher is better” for AUC.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => (
          <Card key={m.name} m={m} />
        ))}
      </div>
    </section>
  );
}
