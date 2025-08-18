export default function Page() {
    return (
      <article className="prose">
        <h1>Model Overview</h1>
        <p>
          This page describes the model at a high level. Since this is a static site, there is no live
          inference yet. You can add screenshots of ROC curves, feature importances, and calibration
          plots here.
        </p>
  
        <h2>Feature Set (example)</h2>
        <ul>
          <li>down, distance, yardline_100</li>
          <li>score_diff, time_remaining</li>
          <li>formation flags: shotgun, no_huddle</li>
        </ul>
  
        <h2>Performance (placeholder)</h2>
        <p>
          AUC: 0.XX · Accuracy: XX.X% · Precision/Recall: XX.X% / XX.X% · Brier: 0.XXX
        </p>
  
        <h2>Model Card</h2>
        <p>
          Intended use: educational demo and research. Limitations: trained on season(s) N, may not
          generalize to future seasons without retraining.
        </p>
      </article>
    );
  }
  