import "../css/Article.css";

export default function ObservabilityMetricsInstrumentationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Metrics are numeric measurements collected over time — request counts, error rates,
          latency — and instrumentation is the practice of adding code that actually emits them.
          Together they answer "what's the health and behavior of my system right now," cheaply,
          at scale.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Metrics generally come in a few types: <b>counters</b> (a value that only goes up, like
          total requests served), <b>gauges</b> (a value that goes up or down, like current memory
          usage), and <b>histograms</b> (a distribution of values, like request latency, letting
          you compute percentiles like p50/p95/p99). Because metrics are pre-aggregated numbers
          rather than full event records, they're vastly cheaper to store and query than logs at
          the same volume — which is exactly why they're the right tool for continuous, real-time
          monitoring and alerting, while logs stay better for deep-dive detail on specific events.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Instrument the checkout endpoint.</b> Increment a{" "}
            <code>checkout_requests_total</code> counter on every call, and record each request's
            duration into a <code>checkout_duration_seconds</code> histogram.</li>
          <li><b>A metrics system scrapes or receives</b> these values continuously from every
            instance.</li>
          <li><b>Aggregate across instances.</b> Sum the counters and combine the histograms
            across all instances to get a fleet-wide view.</li>
          <li><b>Compute p99 latency</b> from the histogram — "99% of checkout requests complete
            within 340ms" — a single, cheap-to-query number summarizing millions of requests.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of three metric types: a counter that only increases, a gauge that moves up and down, and a histogram summarizing a distribution of values into percentiles." >
          <text x="70" y="18" className="figLabel" textAnchor="middle">COUNTER</text>
          <polyline points="20,80 40,70 60,65 80,50 100,30" fill="none" style={{ stroke: "var(--course-accent)", strokeWidth: 2 }} />
          <text x="220" y="18" className="figLabel" textAnchor="middle">GAUGE</text>
          <polyline points="160,55 180,40 200,60 220,35 240,50" fill="none" style={{ stroke: "var(--course-accent)", strokeWidth: 2 }} />
          <text x="360" y="18" className="figLabel" textAnchor="middle">HISTOGRAM</text>
          {[20, 45, 65, 35, 15].map((h, i) => (<rect key={i} className="box" x={310 + i * 20} y={90 - h} width="14" height={h} />))}
        </svg>
        <figcaption>Counters only rise, gauges move freely, and histograms summarize a distribution for percentiles.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adding a label with unbounded cardinality to a metric (like a raw user ID or request ID)
          can explode the number of distinct metric time series a monitoring system has to track,
          degrading performance or blowing past cost limits. Relying only on averages instead of
          percentiles is another common trap — an average latency can look fine while a meaningful
          slice of users experience much slower p99 latency.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a healthy-looking average latency hide a real problem that a p99 latency metric would reveal?</p>
        </div>
      </section>
      <p className="takeaway">
        Metrics give a cheap, continuous, aggregated view of system health — the right tool for
        "what's happening right now, at scale," with logs and traces stepping in for deeper detail
        when a metric signals something's wrong.
      </p>
    </div>
  );
}
