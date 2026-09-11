import "../css/Article.css";

export default function DatabaseScalingTechniquesMaterializedViewsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A materialized view stores the result of a query physically on disk, so reading it is a
          plain table read instead of re-running the underlying query every time.
        </p>
        <p>
          A regular ("virtual") view is just a saved query — it still recomputes on every read. A
          materialized view runs that query once, saves the output, and serves reads from the
          saved copy until it's refreshed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          They're a natural fit for expensive aggregates that don't need to be perfectly
          up-to-the-second: daily revenue totals, a leaderboard, "top products this week." You
          choose a refresh strategy — on a schedule, on demand, or incrementally as underlying
          rows change — and trade some staleness for a much cheaper read.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>An analytics dashboard runs a five-table join with aggregates over 50M rows, taking 12 seconds to load every time someone opens it.</p>
        </div>
        <ol className="stepList">
          <li><b>Define the view.</b> <code>CREATE MATERIALIZED VIEW daily_revenue AS SELECT ...</code> — the same expensive query, saved as a view.</li>
          <li><b>Populate it.</b> The first <code>REFRESH</code> runs the full 12-second query once.</li>
          <li><b>Point the dashboard at the view.</b> Reads now hit the precomputed table: ~20ms.</li>
          <li><b>Schedule refreshes.</b> A nightly job re-runs <code>REFRESH MATERIALIZED VIEW</code>, accepting up-to-24-hours staleness for a dashboard that's reviewed each morning.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 480 150" role="img" aria-label="Diagram of an expensive five-table join being run once into a materialized view, which dashboard reads then hit directly instead of re-running the join.">
          <rect className="box" x="20" y="20" width="150" height="40" rx="6" />
          <text x="95" y="45" className="boxText">5-table join, 50M rows</text>
          <line className="flow" x1="170" y1="40" x2="230" y2="40" />
          <text x="200" y="32" className="figHint" textAnchor="middle">refresh</text>
          <rect className="boxAccent" x="240" y="20" width="150" height="40" rx="6" />
          <text x="315" y="45" className="boxText">materialized view</text>
          <line className="flow" x1="315" y1="60" x2="315" y2="100" />
          <line className="flow" x1="315" y1="100" x2="220" y2="100" />
          <line className="flow" x1="315" y1="100" x2="410" y2="100" />
          <rect className="box" x="160" y="105" width="120" height="24" rx="4" /><text x="220" y="121" className="boxText">dashboard read</text>
          <rect className="box" x="350" y="105" width="120" height="24" rx="4" /><text x="410" y="121" className="boxText">dashboard read</text>
        </svg>
        <figcaption>The expensive query runs once per refresh; every read after that is cheap.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating a materialized view as always-fresh is the main trap — someone eventually asks
          why the dashboard doesn't match a number from five minutes ago. Make the refresh cadence
          and last-refreshed timestamp visible. Also budget for refresh cost: a full refresh on a
          huge view can itself be heavy, which is why incremental refresh strategies exist.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>When would a materialized view be the wrong tool compared to caching the query result in an application-level cache?</p>
        </div>
      </section>
      <p className="takeaway">
        Materialized views move cost from every read to a controlled refresh — the right trade
        whenever "slightly stale" is an acceptable answer to "give me this expensive aggregate."
      </p>
    </div>
  );
}
