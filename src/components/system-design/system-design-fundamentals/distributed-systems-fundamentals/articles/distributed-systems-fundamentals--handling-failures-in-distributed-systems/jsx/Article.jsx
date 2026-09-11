import "../css/Article.css";

export default function DistributedSystemsFundamentalsHandlingFailuresInDistributedSystemsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          In a system with enough machines, something is failing at almost any given moment — a
          disk, a process, a network link. Designing for that reality, rather than treating failure
          as exceptional, is the core discipline of distributed systems engineering.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A few recurring techniques handle most failure modes: <b>retries</b> for transient
          failures (paired with backoff, so retries don't pile onto an already-struggling system);{" "}
          <b>timeouts</b> so a caller doesn't wait forever for a response that may never come;{" "}
          <b>redundancy</b> (multiple replicas of data or service instances) so any single
          failure doesn't cause an outage; and <b>idempotency</b> (a retried operation has the same
          effect as doing it once) so a retry after an ambiguous failure doesn't double-apply a
          change like a duplicate charge.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A payment request times out — did it succeed on the server before the response was lost, or never happen at all?</p>
        </div>
        <ol className="stepList">
          <li><b>Client sends a request with an idempotency key.</b> A unique ID accompanies the
            payment request.</li>
          <li><b>Request times out.</b> The client doesn't know if the payment succeeded.</li>
          <li><b>Client retries with the same idempotency key.</b> The server checks: "have I seen
            this key before?" If the original request actually succeeded, the server returns that
            same result instead of charging twice.</li>
          <li><b>Combine with backoff.</b> The retry waits a bit (and longer on each subsequent
            failure) so retries from many clients don't all hit the server at once and make things
            worse.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a client retrying a timed-out request with the same idempotency key, so the server can safely detect and ignore the duplicate instead of applying the payment twice.">
          <rect className="box" x="20" y="20" width="100" height="28" rx="4" /><text x="70" y="38" className="boxText">request #1</text>
          <line className="flowMuted" x1="120" y1="34" x2="170" y2="34" /><text x="145" y="24" className="figHint">✕ lost</text>
          <rect className="boxAccent" x="20" y="60" width="140" height="28" rx="4" /><text x="90" y="78" className="boxText">retry, same key</text>
          <line className="flow" x1="160" y1="74" x2="220" y2="74" />
          <rect className="box" x="230" y="60" width="180" height="28" rx="4" /><text x="320" y="78" className="boxText">server: "seen this key" → same result</text>
          <text x="220" y="115" className="figHint" textAnchor="middle">idempotency turns "retry after ambiguous failure" into a safe no-op</text>
        </svg>
        <figcaption>An idempotency key lets a safe retry stand in for an operation that may have already happened.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Retrying blindly without backoff or idempotency is a common and dangerous combination —
          it can both overload an already-struggling dependency and double-apply non-idempotent
          operations. Treating redundancy as a substitute for monitoring is another gap: a
          replicated system can silently be running on its last healthy copy if failures aren't
          actively observed and alerted on.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is an idempotency key necessary for safely retrying a payment request after a timeout, specifically?</p>
        </div>
      </section>
      <p className="takeaway">
        Retries, timeouts, redundancy, and idempotency together are how distributed systems turn
        "failure is normal" from a liability into something the system is already built to
        absorb.
      </p>
    </div>
  );
}
