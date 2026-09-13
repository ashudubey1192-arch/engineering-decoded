import "../css/Article.css";

export default function ObservabilityMetricsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Logs describe individual events and traces follow one request end to end; metrics answer
          a different question entirely &mdash; not what happened to any one request, but how a
          service is behaving in aggregate, across all of them, right now.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Three metric types cover most needs: a <b>counter</b> only increases (total requests
          served), a <b>gauge</b> can go up or down (current open connections), and a
          <b>histogram</b> captures a distribution of values, from which percentiles like p50, p95,
          and p99 are derived (request latency). A common framework for what to track per service is
          <b>rate, errors, duration</b> &mdash; three numbers that between them catch most real
          problems early.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>PaymentService</code>'s dashboard shows 450 requests/sec, a 0.2% error rate, and
          latency of p50 45ms, p95 210ms, p99 890ms. The median looks perfectly healthy &mdash; but
          the p99 means roughly 1 in 100 requests, or over 4 every second at this volume, take
          almost a full second. That tail is invisible if you're only watching the average.
        </p>
        <span className="codeLabel">RECORDING A HISTOGRAM VALUE</span>
        <div className="codeBlock">
          <pre>{`metrics.increment("payment.requests.total", { status: "success" })
metrics.histogram("payment.request.duration_ms", elapsedMs)
// dashboard derives p50 / p95 / p99 from the recorded distribution`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 150" role="img" aria-label="Bar chart of PaymentService latency percentiles: p50 at 45 milliseconds is a short bar, p95 at 210 milliseconds is a taller bar, and p99 at 890 milliseconds is a much taller highlighted bar, showing a hidden tail invisible at the median.">
          <line className="flowMuted" x1="30" y1="120" x2="380" y2="120" />
          <rect className="box" x="70" y="110" width="60" height="10" />
          <text x="100" y="105" className="figHint" style={{fontSize:"6px"}}>45ms</text>
          <text x="100" y="135" className="boxText" style={{fontSize:"6.5px"}}>p50</text>
          <rect className="box" x="170" y="75" width="60" height="45" />
          <text x="200" y="70" className="figHint" style={{fontSize:"6px"}}>210ms</text>
          <text x="200" y="135" className="boxText" style={{fontSize:"6.5px"}}>p95</text>
          <rect className="boxAccent" x="270" y="30" width="60" height="90" />
          <text x="300" y="25" className="figHint" style={{fontSize:"6px"}}>890ms</text>
          <text x="300" y="135" className="boxText" style={{fontSize:"6.5px"}}>p99</text>
        </svg>
        <figcaption>The median (p50) looks fine at 45ms &mdash; the p99 reveals a tail nearly 20x slower, hidden entirely if you only watch the average.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Watching only the average, or even just the median, hides exactly the tail latency that a
          meaningful fraction of real users actually experience &mdash; a service can look perfectly
          healthy on a dashboard while a real slice of requests wait nearly a second. Emitting
          metrics with no dimensions (no endpoint, status code, or region tag) collapses everything
          into one aggregate number that can't be broken down later, right when you need to isolate
          which endpoint is actually causing a spike.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>PaymentService's p50 latency is a healthy 45ms, but its p99 is 890ms. Why does watching only the average risk missing a real problem here?</p>
        </div>
      </section>
      <p className="takeaway">
        Averages and medians describe the typical case; percentiles like p95 and p99 describe the
        tail &mdash; and it's the tail that a meaningful number of real users actually feel.
      </p>
    </div>
  );
}
