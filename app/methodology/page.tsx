// app/methodology/page.tsx
import { MetricsGlossary } from "@/components/MetricsGlossary";
import { CalibrationExplainer } from "@/components/CalibrationExplainer";

export default function Page() {
  return (
    <article className="prose max-w-none">
      <h1>Methodology</h1>

      <p>
        This page documents how the NFL rush/pass predictor is built and evaluated. It covers data
        sourcing, preprocessing, feature engineering, modeling, evaluation, and known limitations.
        Version tags refer to the site’s <strong>Model</strong> and <strong>Process</strong> pages
        (e.g., v1.0 today, v2.0 soon).
      </p>

      <h2>1) Data</h2>
      <ul>
        <li>
          <strong>Source:</strong> public play-by-play (pbp) data (e.g., NFLfastR /
          <code>nfl_data_py</code>), filtered to regular season plays and standard offensive snaps.
        </li>
        <li>
          <strong>Target:</strong> binary label <code>is_pass</code> (PASS vs RUSH) for the offense
          at snap.
        </li>
        <li>
          <strong>Exclusions:</strong> obvious non-plays (kneels, spikes, timeouts, penalties that
          negate the play), special teams, two-point tries, aborted plays.
        </li>
        <li>
          <strong>Leakage guardrails:</strong> remove post-snap/derived columns (yards gained,
          EPA/WPA, result text, defender IDs, etc.). Keep only information plausibly known at the
          moment of the snap.
        </li>
      </ul>

      <h2>2) Preprocessing</h2>
      <ul>
        <li>
          <strong>Deduping & sorting:</strong> sort by (season, week, game_id, drive, play_id);
          one row per snap.
        </li>
        <li>
          <strong>Missing values:</strong> impute booleans to <code>0/1</code>; numeric imputation
          with medians; drop rows missing essential state (down/distance/yardline).
        </li>
        <li>
          <strong>Categoricals:</strong> normalize team/formation strings; one-hot or binary flags
          for common formations and tempo.
        </li>
        <li>
          <strong>Train/validation split:</strong> time-based split by <em>weeks or seasons</em> to
          avoid future-to-past leakage (e.g., train on weeks 1–k, validate on k+1–n).
        </li>
      </ul>

      <h2>3) Feature Engineering</h2>
      <p>Only pre-snap context features are used. Examples below (v1.0 baseline set):</p>
      <ul>
        <li>
          <strong>Down & Distance:</strong> <code>down</code>, <code>ydstogo</code>; also non-linear
          transforms like <code>min(ydstogo, 10)</code>.
        </li>
        <li>
          <strong>Field Position:</strong> <code>yardline_100</code> (yards to goal); red-zone flag
          (<code>&lt;=20</code>), backed-up flag (<code>&gt;=80</code>).
        </li>
        <li>
          <strong>Clock Context:</strong> seconds remaining in half; half/minute buckets; two-minute
          warning flag.
        </li>
        <li>
          <strong>Game State:</strong> score differential (offense − defense), possession changes on
          previous drive, goal-to-go flag.
        </li>
        <li>
          <strong>Personnel & Tempo (if available):</strong> shotgun, no-huddle, motion, personnel
          group string → compact numeric encoding (e.g., 11/12/21).
        </li>
        <li>
          <strong>Home/Away & Hash (if available):</strong> home indicator; left/center/right hash.
        </li>
      </ul>

      <p className="mt-4">
        <strong>v2.0 (planned improvements):</strong> richer personnel parsing, motion counts,
        condensed/under-center split, opponent defense tendencies (rolling priors), and drive/script
        position features (e.g., first 15 plays).
      </p>

      <h2>4) Modeling</h2>
      <ul>
        <li>
          <strong>Baseline (v1.0):</strong> Gradient-boosted trees (LightGBM) for calibrated
          probabilities. Benefits: handles heterogeneous features, missingness, non-linearities.
        </li>
        <li>
          <strong>Training:</strong> early stopping on validation AUC/logloss; class weight
          balancing if needed (slight pass skew).
        </li>
        <li>
          <strong>Hyperparameters (typical v1.0):</strong> depth 4–8, 500–1500 trees, learning rate
          0.02–0.1, subsample/colsample ~0.7–0.9, L2 regularization.
        </li>
        <li>
          <strong>Outputs:</strong> probability of PASS (<code>p(pass)</code>) and argmax label
          (PASS/RUSH) at 0.5 threshold (threshold can be tuned to user objective).
        </li>
      </ul>

      <h2>5) Evaluation</h2>
      <ul>
        <li>
          <strong>Temporal CV:</strong> rolling-origin evaluation by week or by game to mimic
          deployment (train ≤ week <em>t</em>, test on week <em>t+1</em>).
        </li>
        <li>
          <strong>Metrics:</strong> AUC, log loss, Brier score, accuracy, precision/recall at chosen
          threshold, calibration (reliability curve, ECE/MCE).
        </li>
        <li>
          <strong>Slices:</strong> down (1/2/3/4), distance buckets, field zone (own side/midfield/
          red zone), clock buckets, shotgun vs under-center, personnel groups, and per-team.
        </li>
        <li>
          <strong>Leakage checks:</strong> confirm no target-leaking columns; re-run without any
          “post-snap” fields; sanity-check SHAP/feature importance.
        </li>
      </ul>

      {/* CALIBRATION SECTION */}
      <CalibrationExplainer />

      {/* GLOSSARY */}
      <MetricsGlossary />

      <h2>Limitations</h2>
      <ul>
        <li>
          <strong>Data drift:</strong> tendencies change across seasons, coordinators, and rule
          updates; retraining is required.
        </li>
        <li>
          <strong>Coverage:</strong> some formations/personnel strings can be noisy; rare edge cases
          are under-represented.
        </li>
        <li>
          <strong>Scope:</strong> this is a rush/pass predictor only; it does not predict play
          success or yardage (that would be a separate model).
        </li>
        <li>
          <strong>Ethics:</strong> only uses publicly available data; no identification of
          individuals beyond team-level tendencies for research/education.
        </li>
      </ul>

      <h2>Roadmap</h2>
      <ul>
        <li>Add v2.0 assets and a side-by-side compare view (metrics + calibration drift).</li>
        <li>
          Add interactive <em>Predict</em> page once the FastAPI backend is live (Option B growth
          path).
        </li>
        <li>Expand slice analysis: per-team confusion matrices and calibration; down–distance heatmaps.</li>
      </ul>
    </article>
  );
}
