import "../css/Article.css";

export default function ResilienceTimeoutsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A timeout is the caller's own decision about how long is too long to wait &mdash; without
          one, a single slow or hung dependency can tie up a caller's resources indefinitely, turning
          one dependency's problem into the caller's problem too.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Every outbound call needs an explicit maximum wait time, chosen deliberately: too short,
          and normal, slightly-slow responses get cut off and treated as failures; too long, and a
          hung dependency ties up the caller's threads or connections for an unacceptable amount of
          time, potentially exhausting a shared connection pool. A common starting point is basing
          the timeout on the dependency's own observed p99 latency plus a margin, not a round number
          picked without data.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>PricingService</code>'s p99 response time under normal load is 180ms.
          <code>CheckoutService</code> sets its timeout for calls to it at 400ms &mdash; comfortably
          above normal variance, but nowhere near long enough to let one hung call hold a connection
          for seconds while a queue of other checkout requests backs up behind it.
        </p>
        <span className="codeLabel">SETTING A DATA-INFORMED TIMEOUT</span>
        <div className="codeBlock">
          <pre>{`const pricingClient = new HttpClient({
  baseUrl: "http://pricing-service",
  timeoutMs: 400,   // p99 observed latency (180ms) + margin
})`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a timeout: most requests to PricingService complete within its normal 180ms range, but a 400ms timeout cuts off the rare request that goes far beyond that instead of letting it hang indefinitely.">
          <line className="divider" x1="30" y1="90" x2="400" y2="90" />
          <rect className="boxAccent" x="30" y="60" width="150" height="24" rx="5" />
          <text x="105" y="76" className="boxText" style={{fontSize:"6px"}}>normal responses, ~180ms p99</text>
          <rect className="boxWarn" x="190" y="60" width="180" height="24" rx="5" />
          <text x="280" y="76" className="boxText" style={{fontSize:"6px"}}>would hang far longer without a cap</text>
          <line className="flow" x1="235" y1="35" x2="235" y2="58" />
          <text x="235" y="25" className="figHint" style={{fontSize:"6.5px"}}>400ms timeout cuts off here</text>
        </svg>
        <figcaption>The timeout sits comfortably above normal latency but well short of "hang indefinitely" &mdash; it only affects the rare, abnormal request.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using the same default timeout (often whatever the HTTP client ships with) for every
          dependency, regardless of its actual latency profile, either cuts off perfectly healthy
          slow dependencies too aggressively or leaves genuinely hung ones unbounded for far too
          long. The other common mistake is setting a timeout without deciding what happens next when
          it fires &mdash; a timeout alone doesn't fix anything; it just turns an indefinite hang into
          a bounded failure that still needs a retry or fallback strategy.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>PricingService's p99 latency is 180ms. Why would setting CheckoutService's timeout to it at exactly 180ms likely cause problems, even though that's the "real" typical worst case?</p>
        </div>
      </section>
      <p className="takeaway">
        Base a timeout on the dependency's actual observed latency, not a guess &mdash; and always
        decide what happens after it fires, because the timeout itself is only half the fix.
      </p>
    </div>
  );
}
