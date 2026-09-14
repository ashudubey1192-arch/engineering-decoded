import "../css/Article.css";

export default function ReliabilityTimeoutsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Every client calling an API has to decide how long is too long to wait for a response
          &mdash; and an API that never documents its own expected latency leaves every consumer
          guessing at that number independently, usually wrong in one direction or the other.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Too short</b> &mdash; the client aborts a request that would have succeeded, and may retry it, risking a duplicate if it wasn't idempotent.</li>
          <li><b>Too long</b> &mdash; the client holds a connection or thread open far past the point of usefulness, tying up its own resources on a request that's effectively already lost.</li>
          <li><b>Publish real latency numbers</b> &mdash; a documented p99 per endpoint lets consumers set an informed timeout instead of copying an arbitrary default.</li>
        </ul>
        <p>
          Timeouts and idempotency are connected: a client that times out genuinely doesn't know
          whether the server finished the operation or not &mdash; which is exactly the ambiguity
          the idempotency-key pattern from earlier in this section exists to resolve safely.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <table className="miniTable">
          <caption>PARCELLY'S DOCUMENTED LATENCY BUDGETS</caption>
          <thead><tr><th>Endpoint</th><th>p50</th><th>p99</th><th>Suggested client timeout</th></tr></thead>
          <tbody>
            <tr><td>GET /shipments/:id</td><td>40ms</td><td>180ms</td><td>1s</td></tr>
            <tr><td>POST /shipments <i>(calls a carrier)</i></td><td>450ms</td><td>1.8s</td><td>5s</td></tr>
            <tr><td>POST /shipments/bulk <i>(up to 500 items)</i></td><td>2.1s</td><td>6s</td><td>15s</td></tr>
          </tbody>
        </table>
        <p>
          With these numbers published, a partner setting a 500ms timeout on shipment creation
          isn't guessing &mdash; they can see that's shorter than Parcelly's own documented p99,
          and expect a meaningful fraction of perfectly healthy requests to get aborted for no real
          reason.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a latency distribution with p50 and p99 marked, and a client timeout set shorter than p99, showing the tail of requests that would be aborted even though they were healthy.">
          <line className="divider" x1="20" y1="80" x2="400" y2="80" />
          <path className="flowMuted" d="M20,80 Q120,10 220,60 T400,78" fill="none" />
          <line className="flow" x1="90" y1="80" x2="90" y2="30" />
          <text x="90" y="20" className="figHint" style={{fontSize:"5.5px"}}>p50</text>
          <line className="flow" x1="260" y1="80" x2="260" y2="55" />
          <text x="260" y="45" className="figHint" style={{fontSize:"5.5px"}}>p99</text>
          <line className="flowMuted" x1="180" y1="80" x2="180" y2="20" />
          <text x="180" y="12" className="figHint" style={{fontSize:"5.5px"}}>500ms timeout</text>
          <text x="320" y="95" className="figHint" style={{fontSize:"5.5px"}}>this tail gets aborted even though it was healthy</text>
        </svg>
        <figcaption>A timeout set shorter than the documented p99 aborts a predictable slice of perfectly healthy requests.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Publishing no latency guidance at all is the most common gap &mdash; it leaves every
          partner to guess, and guesses cluster at either extreme, too aggressive or too generous.
          Setting a client-side timeout shorter than the server's own documented worst case is the
          direct consequence: it guarantees some percentage of perfectly healthy requests get
          aborted client-side, indistinguishable from real failures from the caller's point of
          view.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A partner sets a 500ms timeout on shipment creation, which has a documented p99 of 1.8 seconds. What happens to a meaningful fraction of their requests, and is it actually Parcelly's fault?</p>
        </div>
      </section>
      <p className="takeaway">
        A timeout is a bet about how long is too long &mdash; give consumers real numbers to bet
        with instead of leaving every integration to guess, and remember that a timeout is exactly
        the situation idempotency keys are designed for.
      </p>
    </div>
  );
}
