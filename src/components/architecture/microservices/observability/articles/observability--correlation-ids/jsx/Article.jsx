import "../css/Article.css";

export default function ObservabilityCorrelationIdsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A correlation ID is a single value generated once, at the very first hop of a request, and
          carried through every subsequent call &mdash; without it, one user-facing request that
          touches five services produces five sets of logs with no way to tell they all belong to
          the same story.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The gateway (or the first service to handle a request) generates a unique ID and attaches
          it as a header on every downstream call it makes. Every service that receives a request
          reads that header, includes it in every log line it writes, and forwards it unchanged to
          any service it calls in turn. The ID itself carries no meaning beyond "these log lines all
          belong to the same original request."
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A checkout request gets correlation ID <code>req_a83f2c</code> at the gateway. As it flows
          through <code>CheckoutService &rarr; PaymentService &rarr; NotificationService</code>,
          every log line from all three carries that same ID:
        </p>
        <span className="codeLabel">SAME ID, THREE SERVICES</span>
        <div className="codeBlock">
          <pre>{`{ "service": "checkout",     "correlationId": "req_a83f2c", "message": "order placed" }
{ "service": "payment",      "correlationId": "req_a83f2c", "message": "charge succeeded" }
{ "service": "notification", "correlationId": "req_a83f2c", "message": "email queued" }`}</pre>
        </div>
        <p>
          One search for <code>req_a83f2c</code> reconstructs the entire request's path across all
          three services, in order, without needing to correlate timestamps by hand.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a correlation ID generated at the gateway and forwarded unchanged through CheckoutService, PaymentService, and NotificationService, appearing in every log line each of them writes." >
          {["Gateway","Checkout","Payment","Notification"].map((t,i) => (
            <g key={t}>
              <rect className={i===0 ? "boxAccent" : "box"} x={15 + i*100} y="30" width="85" height="28" rx="6" />
              <text x={57 + i*100} y="48" className="boxText" style={{fontSize:"6.5px"}}>{t}</text>
              {i < 3 && <line className="flow" x1={100 + i*100} y1="44" x2={113 + i*100} y2="44" />}
            </g>
          ))}
          <text x="210" y="75" className="figHint" style={{fontSize:"6.5px"}}>req_a83f2c forwarded unchanged at every hop</text>
        </svg>
        <figcaption>The same ID rides along through all four hops &mdash; every log line any of them write can be tied back to the same original request.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          A service that generates its own new ID instead of forwarding the one it received breaks
          the chain at exactly that hop &mdash; everything downstream of it becomes untraceable back
          to the original request. Forgetting to include the correlation ID in error logs
          specifically (only adding it to routine info-level logs) is the other common gap &mdash;
          it's the error logs, during an actual incident, where tracing the full request path
          matters most.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>PaymentService receives a request with correlation ID req_a83f2c but generates a new ID for its own logs instead of forwarding it. What becomes impossible to do across the full request afterward?</p>
        </div>
      </section>
      <p className="takeaway">
        A correlation ID is only useful if every hop forwards the exact same value &mdash; one
        service that generates its own breaks the trail for everything downstream of it.
      </p>
    </div>
  );
}
