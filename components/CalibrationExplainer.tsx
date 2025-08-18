// components/CalibrationExplainer.tsx
"use client";

type Pt = { x: number; y: number };

// simple demo curves
const PERFECT: Pt[] = Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  return { x: t, y: t };
});

// a mildly overconfident S-shaped reliability curve
const OVERCONF: Pt[] = Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  const y = 0.5 + 0.48 * (t - 0.5) + 0.12 * (t - 0.5) ** 3; // just to visualize
  return { x: t, y: Math.max(0, Math.min(1, y)) };
});

// a toy probability histogram
const HIST = [5, 10, 20, 30, 25, 18, 12, 8, 6, 4];

function Path({ pts, color = "currentColor" }: { pts: Pt[]; color?: string }) {
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * 200 + 20} ${200 - p.y * 200 + 20}`)
    .join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={2} />;
}

export function CalibrationExplainer() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Calibration Explained</h2>
      <p className="text-sm text-gray-700">
        A model is <em>well-calibrated</em> if predicted probabilities match observed frequencies.
        On the reliability diagram, the closer the curve is to the diagonal, the better the
        calibration. If it’s consistently above the diagonal, the model underestimates; below means
        it overestimates. You can fix systematic miscalibration with Platt scaling or isotonic
        regression (applied on a validation split).
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Reliability diagram */}
        <figure className="rounded-2xl border p-3">
          <figcaption className="mb-2 text-sm font-medium">Reliability Diagram</figcaption>
          <svg viewBox="0 0 240 240" className="w-full">
            {/* axes */}
            <rect x="20" y="20" width="200" height="200" fill="white" stroke="#e5e7eb" />
            {/* diagonal */}
            <Path pts={PERFECT} color="#10b981" />
            {/* overconfident curve */}
            <Path pts={OVERCONF} color="#3b82f6" />
            {/* ticks */}
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i}>
                <line
                  x1={20 + (i * 200) / 5}
                  y1={220}
                  x2={20 + (i * 200) / 5}
                  y2={224}
                  stroke="#9ca3af"
                />
                <line
                  x1={16}
                  y1={220 - (i * 200) / 5}
                  x2={20}
                  y2={220 - (i * 200) / 5}
                  stroke="#9ca3af"
                />
              </g>
            ))}
            {/* legend */}
            <g>
              <line x1="30" y1="30" x2="50" y2="30" stroke="#10b981" strokeWidth="2" />
              <text x="58" y="33" fontSize="10" fill="#374151">
                Perfect
              </text>
              <line x1="110" y1="30" x2="130" y2="30" stroke="#3b82f6" strokeWidth="2" />
              <text x="138" y="33" fontSize="10" fill="#374151">
                Model
              </text>
            </g>
          </svg>
          <p className="mt-2 text-xs text-gray-600">
            Green = ideal; Blue = model reliability (illustrative).
          </p>
        </figure>

        {/* Score distribution */}
        <figure className="rounded-2xl border p-3">
          <figcaption className="mb-2 text-sm font-medium">Score Distribution (p(PASS))</figcaption>
          <svg viewBox="0 0 240 240" className="w-full">
            <rect x="20" y="20" width="200" height="200" fill="white" stroke="#e5e7eb" />
            {HIST.map((h, i) => {
              const w = 200 / HIST.length - 4;
              const x = 22 + i * (200 / HIST.length);
              const y = 220 - (h / Math.max(...HIST)) * 200;
              const height = 220 - y;
              return <rect key={i} x={x} y={y} width={w} height={height} fill="#3b82f6" opacity={0.8} />;
            })}
          </svg>
          <p className="mt-2 text-xs text-gray-600">
            Helps spot under/over-use of extreme probabilities.
          </p>
        </figure>
      </div>

      <div className="rounded-2xl border p-4 bg-white">
        <h3 className="font-semibold">Practical workflow</h3>
        <ol className="mt-2 list-decimal pl-5 text-sm text-gray-700 space-y-1">
          <li>Train on weeks ≤ t; validate on weeks t+1…T.</li>
          <li>Plot reliability (and ECE). If miscalibrated, fit isotonic/Platt on validation.</li>
          <li>Apply the calibrator to predictions at inference time; re-check ECE/MCE.</li>
          <li>Expose a threshold slider in the UI if a class-specific objective matters.</li>
        </ol>
      </div>
    </section>
  );
}
