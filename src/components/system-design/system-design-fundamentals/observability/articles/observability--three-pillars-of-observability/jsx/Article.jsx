import "../css/Article.css";

export default function ObservabilityThreePillarsOfObservabilityArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Observability is the ability to understand what's happening inside a running system from
          its external outputs. Those outputs are conventionally grouped into three pillars: logs,
          metrics, and traces — each answering a different kind of question.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Logs</b> are discrete, timestamped records of specific events — great for "what
          exactly happened" detail on one occurrence. <b>Metrics</b> are numeric measurements
          aggregated over time (request rate, error count, latency percentiles) — great for
          "what's the overall trend or current state," and cheap to store and query at scale.{" "}
          <b>Traces</b> follow a single request's journey across multiple services — great for
          "where exactly did this specific slow or failed request spend its time." No single
          pillar answers every question; real incident response usually moves between all three,
          starting from whichever gives the fastest signal.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A metric alerts:</b> "p99 latency for the checkout API has doubled in the last 10
            minutes" — a trend, not a detail.</li>
          <li><b>Traces narrow it down.</b> Sampling slow requests' traces shows most of the extra
            time is spent in calls to the inventory service specifically.</li>
          <li><b>Logs give the detail.</b> The inventory service's logs around that time period
            show repeated database connection timeouts.</li>
          <li><b>Root cause found</b> — a database connection pool exhaustion — by moving from
            broad trend (metric) to specific path (trace) to exact detail (log).</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of the three observability pillars: metrics showing an overall trend, traces narrowing down which service is slow, and logs providing the exact detail of what happened there." >
          <rect className="box" x="20" y="20" width="110" height="30" rx="5" /><text x="75" y="40" className="boxText">metrics: trend</text>
          <line className="flow" x1="130" y1="35" x2="170" y2="35" />
          <rect className="box" x="180" y="20" width="110" height="30" rx="5" /><text x="235" y="40" className="boxText">traces: where</text>
          <line className="flow" x1="290" y1="35" x2="330" y2="35" />
          <rect className="boxAccent" x="340" y="20" width="90" height="30" rx="5" /><text x="385" y="40" className="boxText">logs: what</text>
          <text x="225" y="90" className="figHint" textAnchor="middle">broad signal narrows to exact detail across the three pillars</text>
        </svg>
        <figcaption>Each pillar answers a different question; incident response typically moves through all three.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Investing heavily in only one pillar (usually logs, since they're the easiest to start
          with) leaves real gaps — logs alone can't show you an overall trend or a
          cross-service request path efficiently. The three pillars work best when they can be
          correlated together (the next article, Correlation IDs, covers exactly this), not
          treated as three separate, disconnected tools.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might an engineer start debugging with a metric, then move to a trace, then finally to logs, rather than starting with logs directly?</p>
        </div>
      </section>
      <p className="takeaway">
        Logs, metrics, and traces each answer a different kind of question — real observability
        comes from having all three, and being able to move between them, not from any single
        pillar alone.
      </p>
    </div>
  );
}
