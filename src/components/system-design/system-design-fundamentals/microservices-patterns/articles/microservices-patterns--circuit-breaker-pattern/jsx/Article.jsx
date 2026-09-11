import "../css/Article.css";

export default function MicroservicesPatternsCircuitBreakerPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A circuit breaker stops a service from repeatedly calling another service that's already
          failing — like an electrical circuit breaker, it "trips" open after too many failures,
          giving the failing service room to recover instead of getting hammered further.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The breaker wraps calls to a dependency and tracks recent failures. In the{" "}
          <b>closed</b> state, calls go through normally. If failures cross a threshold, it trips
          to <b>open</b> — calls fail immediately without even attempting the network call, both
          protecting the caller from wasting time on doomed requests and giving the struggling
          service breathing room. After a cooldown, it moves to <b>half-open</b>, letting a
          trickle of real requests through to test whether the dependency has recovered, before
          fully closing again.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Dependency starts failing.</b> The payments service starts timing out under load.</li>
          <li><b>Breaker trips open.</b> After, say, 10 consecutive failures, the calling
            service's breaker opens — further calls fail instantly with a fallback, no network
            call attempted.</li>
          <li><b>Payments service recovers.</b> With the flood of retries stopped, it has room to
            catch up.</li>
          <li><b>Breaker tests recovery.</b> After a cooldown, it goes half-open, letting a few
            real requests through — if they succeed, it closes fully again.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of a circuit breaker's three states: closed allowing calls through, open blocking calls immediately after too many failures, and half-open testing recovery with a trickle of requests.">
          <rect className="box" x="20" y="55" width="110" height="34" rx="6" /><text x="75" y="76" className="boxText">CLOSED</text>
          <line className="flow" x1="130" y1="72" x2="180" y2="72" /><text x="155" y="60" className="figHint">too many fails</text>
          <rect className="boxWarn" x="190" y="55" width="110" height="34" rx="6" /><text x="245" y="76" className="boxText">OPEN</text>
          <line className="flow" x1="300" y1="72" x2="350" y2="72" /><text x="325" y="60" className="figHint">cooldown</text>
          <rect className="boxAccent" x="360" y="55" width="90" height="34" rx="6" /><text x="405" y="76" className="boxText">HALF-OPEN</text>
          <line className="flowMuted" x1="405" y1="89" x2="245" y2="120" /><line className="flowMuted" x1="245" y1="120" x2="75" y2="89" />
          <text x="245" y="135" className="figHint" textAnchor="middle">success → closed again · failure → open again</text>
        </svg>
        <figcaption>The breaker moves between three states so a failing dependency gets room to recover.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping a fallback behavior for the open state (returning cached data, a default value,
          or a clear error) just turns a slow failure into a fast, confusing one for the end user.
          Setting thresholds too sensitively can also trip the breaker on brief, normal blips
          rather than genuine sustained failure.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a circuit breaker fail fast instead of letting every request attempt the network call once it's open?</p>
        </div>
      </section>
      <p className="takeaway">
        A circuit breaker protects both the caller (fast, predictable failure) and the failing
        dependency (relief from a flood of doomed retries) — and tests recovery safely before
        going back to normal.
      </p>
    </div>
  );
}
