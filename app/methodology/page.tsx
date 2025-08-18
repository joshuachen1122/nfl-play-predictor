export default function Page() {
    return (
      <article className="prose">
        <h1>Methodology</h1>
        <h2>Data</h2>
        <p>Describe data sources (e.g., pbp data), cleaning steps, and exclusions.</p>
  
        <h2>Feature Engineering</h2>
        <ul>
          <li>Time-based (clock to seconds, half, two-minute warning)</li>
          <li>Field position transforms (yardline to distance-to-goal)</li>
          <li>Game context (score diff, possession changes)</li>
        </ul>
  
        <h2>Modeling</h2>
        <p>Baseline LightGBM with tuned hyperparameters; class weighting; early stopping.</p>
  
        <h2>Evaluation</h2>
        <p>Train/valid split by week to avoid leakage; AUC, logloss, calibration.</p>
      </article>
    );
  }
  