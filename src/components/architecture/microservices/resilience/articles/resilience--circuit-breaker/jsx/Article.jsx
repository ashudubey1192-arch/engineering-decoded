import "../css/Article.css";

export default function ResilienceCircuitBreakerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A circuit breaker wraps a call to a dependency and starts failing fast, without even
          attempting the call, once that dependency has been failing enough to suggest it's down
          &mdash; trading a slow pile-up of timeouts for an instant, predictable failure that gives
          the dependency room to recover.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The breaker sits in front of every call to a specific dependency and tracks recent
          successes and failures. It moves through three states, and the state alone decides what
          happens to the next call &mdash; the caller never has to know why:
        </p>
        <table className="miniTable">
          <caption>THE THREE BREAKER STATES</caption>
          <thead>
            <tr>
              <th>State</th>
              <th>What happens to a call</th>
              <th>How it leaves this state</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge">CLOSED</span></td>
              <td>Passes through to the dependency normally</td>
              <td>Failure rate crosses the threshold &rarr; trips to Open</td>
            </tr>
            <tr>
              <td><span className="badge">OPEN</span></td>
              <td>Fails immediately; the dependency is never called</td>
              <td>Reset timeout elapses &rarr; moves to Half-Open</td>
            </tr>
            <tr>
              <td><span className="badge">HALF-OPEN</span></td>
              <td>Lets exactly one trial call through</td>
              <td>Trial succeeds &rarr; Closed. Trial fails &rarr; back to Open</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> calls <code>PaymentService</code> on every checkout. The
          breaker is configured to trip after 5 failures within a 10-second window, and to wait 30
          seconds before trying again:
        </p>
        <span className="codeLabel">PSEUDOCODE &mdash; WRAPPING THE CALL</span>
        <div className="codeBlock">
          <pre>{`breaker = CircuitBreaker(
  failureThreshold: 5,      // trips after 5 failures...
  window: 10_000,           // ...within a 10s window
  resetTimeout: 30_000,     // waits 30s before a trial call
)

function chargeCustomer(order) {
  return breaker.call(() => paymentService.charge(order))
    .catch(err => {
      if (err instanceof CircuitOpenError) {
        return queueForRetryLater(order)   // fail fast, don't block checkout
      }
      throw err
    })
}`}</pre>
        </div>
        <p>
          While the breaker is open, checkout never waits on a doomed call to
          <code>PaymentService</code> &mdash; it queues the charge for later and confirms the
          order immediately. That single fallback line is what actually protects the rest of the
          system from a slow, failing dependency.
        </p>
      </section>
      <figure className="fig">
        <svg
          viewBox="0 0 440 210"
          role="img"
          aria-label="State diagram of a circuit breaker: Closed moves to Open once failures cross a threshold, Open moves to Half-Open after a reset timeout, and Half-Open moves back to Closed on a successful trial call or back to Open on a failed one."
        >
          <defs>
            <marker id="cbArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--course-accent)" }} />
            </marker>
            <marker id="cbArrowMuted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--muted)" }} />
            </marker>
          </defs>

          <circle className="boxAccent" cx="75" cy="58" r="40" />
          <text x="75" y="54" className="boxText" style={{ fontSize: "9.5px", fontWeight: 700 }}>Closed</text>
          <text x="75" y="67" className="figHint" style={{ fontSize: "6.5px" }}>calls pass through</text>

          <circle className="boxWarn" cx="365" cy="58" r="40" />
          <text x="365" y="54" className="boxText" style={{ fontSize: "9.5px", fontWeight: 700 }}>Open</text>
          <text x="365" y="67" className="figHint" style={{ fontSize: "6.5px" }}>calls fail fast</text>

          <circle className="box" cx="220" cy="165" r="40" />
          <text x="220" y="161" className="boxText" style={{ fontSize: "9.5px", fontWeight: 700 }}>Half-Open</text>
          <text x="220" y="174" className="figHint" style={{ fontSize: "6.5px" }}>one trial call</text>

          <line className="flow" x1="117" y1="52" x2="323" y2="52" markerEnd="url(#cbArrow)" />
          <text x="220" y="36" className="figHint" style={{ fontSize: "7px" }}>failures &#8805; threshold</text>

          <line className="flow" x1="351" y1="94" x2="257" y2="141" markerEnd="url(#cbArrow)" />
          <text x="345" y="128" className="figHint" style={{ fontSize: "7px" }}>reset timeout elapses</text>

          <line className="flow" x1="184" y1="141" x2="103" y2="93" markerEnd="url(#cbArrow)" />
          <text x="95" y="128" className="figHint" style={{ fontSize: "7px" }}>trial call succeeds</text>

          <line className="flowMuted" x1="252" y1="134" x2="338" y2="92" markerEnd="url(#cbArrowMuted)" />
          <text x="345" y="165" className="figHint" style={{ fontSize: "7px" }}>trial call fails</text>
        </svg>
        <figcaption>
          Closed lets calls through until failures cross the threshold; Open blocks every call
          until the reset timeout expires; Half-Open risks exactly one trial call to decide whether
          to reopen or fully close again.
        </figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Giving every dependency the same breaker configuration is a common shortcut that backfires
          &mdash; a payment provider with a strict SLA and a best-effort recommendations service
          fail at very different rates and should trip at different thresholds. Just as common: a
          breaker with no fallback beyond re-throwing the error, which only converts a slow failure
          into a fast one instead of protecting the caller. And a breaker instantiated per-request
          instead of shared across requests to the same dependency never accumulates enough failures
          to trip at all &mdash; it resets its counters before it ever sees the pattern.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does the breaker allow only one trial call in the Half-Open state instead of simply going straight back to Closed once the reset timeout elapses?</p>
        </div>
      </section>
      <p className="takeaway">
        A circuit breaker doesn't make the dependency more reliable &mdash; it stops a failing
        dependency from making everything that calls it slow and unreliable too, and it only
        pays off once you pair it with a real fallback for the open state.
      </p>
    </div>
  );
}
