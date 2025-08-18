export default function Page() {
    return (
      <article className="prose">
        <h1>About</h1>
        <p>
          I built this project to explore NFL play-calling tendencies. The site is static for now, but
          the codebase is designed to plug in a backend later for real-time predictions.
        </p>
        <h2>Roadmap</h2>
        <ul>
          <li>FastAPI backend with /predict</li>
          <li>Postgres for logs and analytics</li>
          <li>Auth for saving scenarios & feedback</li>
        </ul>
      </article>
    );
  }
  