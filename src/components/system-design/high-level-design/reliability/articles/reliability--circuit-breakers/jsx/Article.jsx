import "../css/Article.css";

export default function ReliabilityCircuitBreakersArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          When a downstream service is struggling, continuing to hammer it with requests just makes
          things worse &mdash; a circuit breaker stops calling a failing dependency for a while,
          giving it room to recover.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A circuit breaker wraps a call to a dependency and tracks its recent failure rate. In the{" "}
          <b>closed</b> state, calls pass through normally. Once failures cross a threshold, it{" "}
          <b>opens</b>: further calls fail immediately, without even attempting the dependency,
          for a cooldown period. After that cooldown, it goes <b>half-open</b>, letting a small
          number of test calls through &mdash; closing again if they succeed, or re-opening if they
          don&rsquo;t. This protects both the struggling dependency (fewer requests to recover
          from) and the calling service (it stops burning resources on calls that were going to fail anyway).
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>The payments service starts timing out</b> under load, and the checkout service
            keeps calling it anyway.</li>
          <li><b>Without a circuit breaker,</b> checkout requests pile up waiting on timeouts,
            exhausting checkout&rsquo;s own thread pool and taking it down too.</li>
          <li><b>With a circuit breaker,</b> after enough failures it opens: checkout immediately
            returns &ldquo;payments temporarily unavailable&rdquo; instead of waiting on a timeout
            every time.</li>
          <li><b>After the cooldown,</b> a few test requests go through; once payments is healthy
            again, the breaker closes and normal traffic resumes.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="State diagram of a circuit breaker moving from closed to open after too many failures, then to half-open after a cooldown, closing again on success or reopening on failure." >
          <rect className="box" x="20" y="20" width="100" height="34" rx="6" /><text x="70" y="42" className="boxText" style={{fontSize:"9px"}}>Closed</text>
          <line className="flow" x1="120" y1="37" x2="190" y2="37" /><text x="155" y="27" className="figHint" style={{fontSize:"7px"}}>too many fails</text>
          <rect className="boxWarn" x="195" y="20" width="100" height="34" rx="6" /><text x="245" y="42" className="boxText" style={{fontSize:"9px"}}>Open</text>
          <line className="flow" x1="245" y1="54" x2="245" y2="90" /><text x="290" y="75" className="figHint" style={{fontSize:"7px"}}>cooldown</text>
          <rect className="boxAccent" x="195" y="95" width="100" height="34" rx="6" /><text x="245" y="117" className="boxText" style={{fontSize:"8px"}}>Half-open</text>
          <line className="flow" x1="195" y1="105" x2="120" y2="50" /><text x="140" y="85" className="figHint" style={{fontSize:"7px"}}>success &rarr; closed</text>
        </svg>
        <figcaption>The breaker cycles through closed, open, and half-open states based on the dependency's recent health.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping circuit breakers on calls to unreliable dependencies lets one struggling service
          cascade failures into every service that calls it. Setting the failure threshold or
          cooldown without testing them against real failure patterns is the other common gap
          &mdash; too sensitive, and the breaker trips on harmless blips; too lax, and it doesn&rsquo;t
          trip in time to help.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does calling a failing dependency without a circuit breaker risk taking down the calling service too, not just the dependency?</p>
        </div>
      </section>
      <p className="takeaway">
        A circuit breaker stops a struggling dependency from taking the rest of the system down
        with it &mdash; failing fast instead of failing slowly and expensively.
      </p>
    </div>
  );
}
