import "../css/Article.css";

export default function ObservabilityHealthChecksArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A health check is a small endpoint an orchestrator polls to decide what to do with an
          instance &mdash; but "healthy" actually hides two different questions, and answering them
          with the same check causes real, avoidable incidents.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Liveness</h3>
            <p>Is the process still running and able to respond at all? Failing this means "restart it" &mdash; it's deadlocked or crashed internally.</p>
          </div>
          <div>
            <h3>Readiness</h3>
            <p>Is this instance ready for real traffic right now? Failing this means "stop routing to it, but leave it running" &mdash; it may just be warming up.</p>
          </div>
        </div>
        <p>
          An instance can be alive but not ready at the same time &mdash; the process is perfectly
          healthy, just not finished starting up &mdash; and the orchestrator needs to treat those
          two failures completely differently.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> takes 8 seconds at startup to warm an in-memory product cache.
          During that window, its liveness check returns <span className="badge">200</span>
          immediately (the process is fine), while its readiness check returns
          <span className="badge">503</span> until the cache finishes warming &mdash; so the load
          balancer withholds real traffic without the orchestrator ever restarting a perfectly
          healthy process.
        </p>
        <span className="codeLabel">TWO SEPARATE ENDPOINTS</span>
        <div className="codeBlock">
          <pre>{`app.get("/healthz", (req, res) => res.status(200).send("alive"))

app.get("/readyz", (req, res) => {
  if (!cache.isWarm()) return res.status(503).send("warming up")
  res.status(200).send("ready")
})`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Timeline over an 8 second startup window showing the liveness check returning OK the entire time, while the readiness check returns not-ready for the first 8 seconds and then switches to ready once the cache finishes warming.">
          <text x="20" y="20" className="figHint" style={{fontSize:"6px"}}>Liveness (/healthz)</text>
          <rect className="box" x="150" y="10" width="230" height="18" rx="4" />
          <text x="265" y="23" className="boxText" style={{fontSize:"6px"}}>OK &mdash; the whole time</text>
          <text x="20" y="60" className="figHint" style={{fontSize:"6px"}}>Readiness (/readyz)</text>
          <rect className="boxWarn" x="150" y="50" width="110" height="18" rx="4" />
          <text x="205" y="63" className="boxText" style={{fontSize:"5.5px"}}>503 (warming)</text>
          <rect className="boxAccent" x="260" y="50" width="120" height="18" rx="4" />
          <text x="320" y="63" className="boxText" style={{fontSize:"5.5px"}}>200 (ready)</text>
          <line className="flowMuted" x1="260" y1="45" x2="260" y2="95" />
          <text x="260" y="108" className="figHint" style={{fontSize:"5.5px"}} textAnchor="middle">cache finishes warming (~8s)</text>
        </svg>
        <figcaption>Liveness stays OK throughout startup; readiness withholds traffic until the cache is actually warm &mdash; two different signals, two different orchestrator responses.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using the same check for both liveness and readiness means a slow-but-recoverable
          condition at startup &mdash; a database not reachable yet &mdash; causes the orchestrator
          to repeatedly kill and restart an instance that would have become healthy on its own in a
          few seconds, a classic crash loop caused entirely by conflating the two questions. A
          liveness check that itself calls downstream dependencies is the other common mistake: one
          unrelated dependency outage then causes every instance to be killed and restarted at once,
          when liveness should only ask whether the process itself is still functioning.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>OrderService's liveness check calls out to verify its database connection. The database goes down briefly. What happens to every running instance of OrderService, and why is this a design mistake?</p>
        </div>
      </section>
      <p className="takeaway">
        Liveness asks whether to restart; readiness asks whether to route traffic right now &mdash;
        conflating the two turns a temporary, recoverable condition into unnecessary restarts.
      </p>
    </div>
  );
}
