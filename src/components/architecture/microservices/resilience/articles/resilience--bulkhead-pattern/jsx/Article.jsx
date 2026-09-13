import "../css/Article.css";

export default function ResilienceBulkheadPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The bulkhead pattern borrows its name and its idea directly from ship design: partition
          resources so that one dependency exhausting its slice of a shared pool &mdash; threads,
          connections &mdash; can't sink capacity for every other dependency sharing that same pool.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Without bulkheads, calls to every dependency typically share one thread pool or connection
          pool. If one dependency starts responding slowly, calls to it pile up and consume more and
          more of that shared pool, leaving too few threads or connections free for calls to
          every <i>other</i>, perfectly healthy dependency. Bulkheads give each dependency (or group
          of dependencies) its own dedicated, limited slice of resources, so one dependency's
          slowdown can only ever exhaust its own slice.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>CheckoutService</code> calls both <code>RecommendationsService</code> (best-effort,
          non-critical) and <code>PaymentService</code> (critical). Without bulkheads, a slow
          <code>RecommendationsService</code> can exhaust the shared connection pool, starving
          <code>PaymentService</code> calls of connections too &mdash; even though payments have
          nothing to do with recommendations being slow.
        </p>
        <span className="codeLabel">SEPARATE POOLS PER DEPENDENCY</span>
        <div className="codeBlock">
          <pre>{`const paymentPool = new ConnectionPool({ maxConnections: 20 })
const recommendationsPool = new ConnectionPool({ maxConnections: 10 })
// RecommendationsService exhausting its 10 connections
// never touches PaymentService's separate 20`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting a shared connection pool, where a slow RecommendationsService can exhaust connections needed by PaymentService, against separate bulkheaded pools, where each dependency has its own isolated slice of connections.">
          <text x="105" y="20" className="figLabel">SHARED POOL</text>
          <rect className="boxWarn" x="30" y="35" width="150" height="26" rx="6" />
          <text x="105" y="52" className="boxText" style={{fontSize:"6px"}}>one shared connection pool</text>
          <text x="60" y="80" className="figHint" style={{fontSize:"6px"}}>Recs (slow)</text>
          <text x="150" y="80" className="figHint" style={{fontSize:"6px"}}>Payment (starved)</text>
          <line className="divider" x1="215" y1="10" x2="215" y2="115" />
          <text x="320" y="20" className="figLabel">BULKHEADED</text>
          <rect className="box" x="240" y="35" width="70" height="26" rx="6" />
          <text x="275" y="52" className="figHint" style={{fontSize:"5.5px"}}>Recs pool (10)</text>
          <rect className="boxAccent" x="320" y="35" width="80" height="26" rx="6" />
          <text x="360" y="52" className="figHint" style={{fontSize:"5.5px"}}>Payment pool (20)</text>
        </svg>
        <figcaption>A shared pool lets one slow dependency starve every other; separate pools contain that slowdown to its own slice.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Sizing every bulkhead identically regardless of actual traffic and criticality wastes
          capacity on low-volume dependencies while potentially under-provisioning genuinely
          high-traffic critical ones. The other common mistake is skipping bulkheads because "we
          already have circuit breakers" &mdash; a circuit breaker stops calling a failing dependency
          once it trips, but it doesn't prevent that dependency from exhausting shared resources in
          the time before it trips; the two patterns solve related but different problems.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>CheckoutService already has a circuit breaker on its call to RecommendationsService. Why might it still need a separate bulkhead for that same dependency?</p>
        </div>
      </section>
      <p className="takeaway">
        Give critical and non-critical dependencies their own isolated resource pools &mdash; a
        bulkhead's whole job is making sure one dependency's slowdown can only ever sink its own
        compartment.
      </p>
    </div>
  );
}
