'use client'

import React, {useMemo, useState} from 'react'

/**
 * Methodology page — light theme only, no external UI deps.
 * Content/structure unchanged; colors/backgrounds simplified for readability.
 */

/* --------------------------- Tiny UI Primitives --------------------------- */

function Card(props: React.PropsWithChildren<{className?: string}>) {
  return (
    <div
      className={
        'rounded-2xl border border-gray-200 bg-white shadow-sm ' +
        (props.className ?? '')
      }
    >
      {props.children}
    </div>
  )
}

function SectionTitle({eyebrow, title, kicker}: {eyebrow?: string; title: string; kicker?: string}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-gray-900">{title}</h2>
      {kicker && <p className="mt-2 text-sm text-gray-600">{kicker}</p>}
    </div>
  )
}

function StatChip({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function Pill({children}: {children: React.ReactNode}) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
      {children}
    </span>
  )
}

function CTAButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const {className, ...rest} = props
  return (
    <button
      {...rest}
      className={
        'inline-flex items-center justify-center rounded-xl border border-transparent ' +
        'bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 ' +
        'focus:outline-none focus:ring-2 focus:ring-indigo-400 ' +
        (className ?? '')
      }
    />
  )
}

function Accordion({
  items,
}: {
  items: {id: string; title: string; content: React.ReactNode; defaultOpen?: boolean}[]
}) {
  return (
    <div className="rounded-2xl border border-gray-200 divide-y divide-gray-200 bg-white">
      {items.map((it) => (
        <details
          key={it.id}
          className="group p-4"
          {...(it.defaultOpen ? {open: true} : {})}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <span className="text-sm font-semibold text-gray-900">{it.title}</span>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 group-open:rotate-90">
              ▶
            </span>
          </summary>
          <div className="mt-3 text-sm text-gray-700">{it.content}</div>
        </details>
      ))}
    </div>
  )
}

function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  children,
}: {
  tabs: {id: T; label: string}[]
  value: T
  onChange: (v: T) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
        {tabs.map((t) => {
          const active = t.id === value
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ' +
                (active
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900')
              }
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

/* ------------------------ Toy Context Explorer (UI) ----------------------- */

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n))
}

function PlayContextExplorer() {
  const [down, setDown] = useState<1 | 2 | 3 | 4>(1)
  const [ydstogo, setYds] = useState(10)
  const [scoreDiff, setScoreDiff] = useState(0) // offense score - defense
  const [secLeft, setSecLeft] = useState(900) // quarter seconds

  // Illustrative heuristic (not the trained model)
  const passProb = useMemo(() => {
    const base = down === 1 ? 0.47 : down === 2 ? 0.55 : down === 3 ? 0.72 : 0.82
    const distAdj = clamp((ydstogo - 10) / 20, -0.15, 0.2)
    const scoreAdj = clamp((-scoreDiff) / 21, -0.12, 0.12)
    const timeAdj = clamp((900 - secLeft) / 900, 0, 1) * 0.08
    return clamp(base + distAdj + scoreAdj + timeAdj)
  }, [down, ydstogo, scoreDiff, secLeft])

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <SectionTitle
          eyebrow="Interactive"
          title="Play Context Explorer"
          kicker="Adjust the situation to see how context nudges rush vs pass tendency (illustrative)."
        />
        <div className="hidden md:flex flex-col items-end gap-2">
          <Pill>Down-aware</Pill>
          <Pill>Distance, Score, Time</Pill>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">Down</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((d) => (
                <button
                  key={d}
                  onClick={() => setDown(d as 1 | 2 | 3 | 4)}
                  className={
                    'rounded-lg border px-3 py-2 text-sm ' +
                    (down === d
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50')
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Yards To Go: <span className="font-mono">{ydstogo}</span>
            </label>
            <input
              type="range"
              min={1}
              max={25}
              value={ydstogo}
              onChange={(e) => setYds(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Score Diff (Offense − Defense):{' '}
              <span className="font-mono">
                {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
              </span>
            </label>
            <input
              type="range"
              min={-21}
              max={21}
              value={scoreDiff}
              onChange={(e) => setScoreDiff(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Secs Left in Quarter: <span className="font-mono">{secLeft}</span>
            </label>
            <input
              type="range"
              min={0}
              max={900}
              step={15}
              value={secLeft}
              onChange={(e) => setSecLeft(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* Gauge */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Estimated Pass Probability</div>
              <div className="flex gap-4">
                <StatChip label="Down" value={String(down)} />
                <StatChip label="To Go" value={`${ydstogo}`} />
                <StatChip label="Score Diff" value={`${scoreDiff}`} />
                <StatChip label="Sec Left" value={`${secLeft}`} />
              </div>
            </div>

            <div className="relative h-12 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-indigo-600 transition-[width] duration-500"
                style={{width: `${(passProb * 100).toFixed(0)}%`}}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-wide text-white">
                <span>Rush</span>
                <span>Pass</span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-4xl font-bold tabular-nums text-gray-900">
                {(passProb * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                (Heuristic visual only — real model uses engineered features & LightGBM.)
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  )
}

/* --------------------------- Page Implementation -------------------------- */

type TabKey = 'v1' | 'v2'

export default function MethodologyPage() {
  const [tab, setTab] = useState<TabKey>('v2')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 bg-white text-gray-900">
      {/* HERO */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-fuchsia-500 p-[1px]">
        <div className="rounded-[22px] bg-white px-6 py-10">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Methodology
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900">
                How we predict Rush vs Pass
              </h1>
              <p className="mt-3 text-sm text-gray-700">
                Version 2.0 evolves beyond single-play context. We engineered coach
                tendencies, short-term momentum, historical team/defense priors, and
                game-state “next snap” signals — then trained a calibrated LightGBM
                classifier with group-aware validation and random-search tuning.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>LightGBM</Pill>
                <Pill>Feature Engineering</Pill>
                <Pill>GroupKFold (by game)</Pill>
                <Pill>Random Search Tuning</Pill>
                <Pill>Calibration</Pill>
              </div>
            </div>

            <Card className="p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-indigo-50 p-4">
                  <div className="text-xs font-semibold text-indigo-700">
                    Why LightGBM?
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-indigo-900/80">
                    <li>Handles mixed numerical + categorical features</li>
                    <li>Nonlinear interactions without manual crosses</li>
                    <li>Fast training, strong baselines, built-in feature importances</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-fuchsia-50 p-4">
                  <div className="text-xs font-semibold text-fuchsia-700">
                    What changed in 2.0
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-fuchsia-900/80">
                    <li>Coach down & distance priors (smoothed)</li>
                    <li>Short-term pass-rate windows (team/drive)</li>
                    <li>Team & defense historical tendencies</li>
                    <li>“Next snap” game state (clock, field, timeouts)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="mb-10 grid gap-5 md:grid-cols-3">
        <Card className="p-5">
          <div className="mb-2 text-sm font-semibold text-gray-900">Feature Engineering</div>
          <p className="text-sm text-gray-600">
            We added coach-specific priors by down & distance buckets (with Bayesian
            smoothing), rolling short-term tendencies (last 3–10 plays), and
            league-informed priors for both offense and defense — plus next-snap
            context (timeouts, clock, field position).
          </p>
        </Card>

        <Card className="p-5">
          <div className="mb-2 text-sm font-semibold text-gray-900">Model Choice</div>
          <p className="text-sm text-gray-600">
            Gradient-boosted trees (LightGBM) excel with tabular, interaction-heavy
            sports data. We leverage categorical support and robust regularization to
            avoid overfitting while capturing nuanced play-calling patterns.
          </p>
        </Card>

        <Card className="p-5">
          <div className="mb-2 text-sm font-semibold text-gray-900">Training & Tuning</div>
          <p className="text-sm text-gray-600">
            Grouped CV by game prevents leakage across plays. We used random search
            over learning rate, leaves, child samples, subsampling, and L2 — then
            early stopping on a validation fold and post-hoc calibration.
          </p>
        </Card>
      </div>

      {/* Interactive toy */}
      <PlayContextExplorer />

      {/* Tabs: 1.0 vs 2.0 (approach only) */}
      <div className="mt-10">
        <SectionTitle title="Approach by version" kicker="High-level design only (comparisons live on Models → Process)." />
        <Tabs<TabKey>
          tabs={[
            {id: 'v1', label: 'v1.0 (Foundations)'},
            {id: 'v2', label: 'v2.0 (Engineered)'},
          ]}
          value={tab}
          onChange={setTab}
        >
          {tab === 'v1' && (
            <Card className="p-5">
              <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                <li>Single-row context: prediction depends on prior play only.</li>
                <li>Baseline categorical handling with LightGBM.</li>
                <li>No coach/team/defense priors; minimal sequential signals.</li>
                <li>Early stopping with a simple holdout; basic thresholding.</li>
              </ul>
            </Card>
          )}

          {tab === 'v2' && (
            <Card className="p-5">
              <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
                <li>
                  <span className="font-semibold">Coach priors:</span> expanding pass
                  rates (overall + by down + by distance) with Laplace/Beta smoothing.
                </li>
                <li>
                  <span className="font-semibold">Short-term windows:</span> rolling
                  pass % over last 3/5/10 plays, plus drive-local recency.
                </li>
                <li>
                  <span className="font-semibold">Historical tendencies:</span> offense
                  & defense long-horizon priors (overall and by down).
                </li>
                <li>
                  <span className="font-semibold">Environment (next snap):</span> down,
                  distance, yardline_100, half/quarter seconds, timeouts, home/away.
                </li>
                <li>
                  <span className="font-semibold">Leakage controls:</span> only
                  as-of/previous info; no future columns.
                </li>
                <li>
                  <span className="font-semibold">Training:</span> GroupKFold by game,
                  random search (20+ trials), early stopping, calibration review.
                </li>
              </ul>
            </Card>
          )}
        </Tabs>
      </div>

      {/* Why LightGBM */}
      <div className="mt-10">
        <SectionTitle title="Why LightGBM?" />
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="p-5">
            <div className="mb-2 text-sm font-semibold text-gray-900">Tabular performance</div>
            <p className="text-sm text-gray-600">
              Sports play-by-play is mixed-type, sparse, and interaction-heavy.
              LightGBM handles high-cardinality categoricals (when cast to categories)
              and nonlinearities without manual feature crossing.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>Fast training</Pill>
              <Pill>Early stopping</Pill>
              <Pill>Feature importances</Pill>
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-2 text-sm font-semibold text-gray-900">Operationally pragmatic</div>
            <p className="text-sm text-gray-600">
              It’s lightweight for iteration, easy to calibrate, and simple to deploy
              for live inference compared to heavier DL architectures.
            </p>
          </Card>
        </div>
      </div>

      {/* Tuning & calibration details */}
      <div className="mt-10">
        <SectionTitle title="Tuning & Calibration" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-2 text-sm font-semibold text-gray-900">Random search (group-aware)</div>
            <p className="text-sm text-gray-600">
              We sample learning rate, num_leaves, min_child_samples, feature/bagging
              fractions, bagging frequency, and L2; each trial trains with grouped CV
              by game to avoid leakage.
            </p>
            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-xs leading-relaxed">
              <pre className="overflow-x-auto">
{`for trial in range(N):
  params = sample()
  cv_logloss = mean_over_folds(
    fit_lightgbm(
      X_train_fold, y_train_fold,
      eval_set=(X_val_fold, y_val_fold),
      categorical_feature=cats,
      early_stopping_rounds=150
    )
  )
  keep_best(params, cv_logloss)`}
              </pre>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-2 text-sm font-semibold text-gray-900">Post-hoc calibration</div>
            <p className="text-sm text-gray-600">
              After fixing the best iteration, we review reliability by bins and
              consider temperature/Platt/Isotonic if systematic bias appears. We also
              pick the decision threshold on validation for the target operating point.
            </p>
            <Accordion
              items={[
                {
                  id: 'gloss',
                  title: 'Calibration notes',
                  content: (
                    <ul className="list-disc pl-5 text-gray-700">
                      <li>Inspect ECE / reliability curves (0.1 width bins)</li>
                      <li>Prefer simple temperature scaling first</li>
                      <li>Threshold chosen on validation, not test</li>
                    </ul>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-12 rounded-2xl border border-gray-200 p-6 text-center bg-white">
        <div className="text-sm text-gray-700">
          Want to dive into the exact feature scripts or training cell? See the notebooks:
          <span className="ml-2 font-semibold">Predicting Rush or Pass 1.0/2.0</span>.
        </div>
        <div className="mt-4">
          <CTAButton onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            Back to top
          </CTAButton>
        </div>
      </div>
    </div>
  )
}
