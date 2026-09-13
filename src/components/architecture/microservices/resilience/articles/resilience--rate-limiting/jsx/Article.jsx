import "../css/Article.css";

export default function ResilienceRateLimitingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Rate limiting caps how many requests a caller can make in a given window &mdash; it
          protects a service from being overwhelmed by any single caller, whether that caller is
          buggy, malicious, or just unexpectedly popular all at once.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A common mechanism is the <b>token bucket</b>: each caller (or API key) has a bucket that
          refills with tokens at a steady rate, up to some maximum. Each request consumes one token;
          if the bucket is empty, the request is rejected (usually with an HTTP
          <code>429 Too Many Requests</code>) until it refills. This naturally allows short bursts
          (up to the bucket's size) while still enforcing a steady average rate over time.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>PartnerApiGateway</code> gives each partner a bucket of 100 tokens, refilling at 10
          per second. A partner's integration bug causes it to fire 500 requests in one burst; the
          first 100 succeed immediately, and the rest receive <code>429</code> responses with a
          <code>Retry-After</code> header, protecting the backend services entirely &mdash; no
          partner's bug can ever exceed its own bucket, regardless of how many requests it sends.
        </p>
        <span className="codeLabel">A REJECTED REQUEST</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 429 Too Many Requests
Retry-After: 3
{ "error": "rate_limit_exceeded", "retryAfterSeconds": 3 }`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of a token bucket: tokens refill steadily up to a maximum, each request consumes one token, and requests arriving after the bucket is empty are rejected with a 429 response until it refills.">
          <rect className="boxAccent" x="160" y="20" width="100" height="60" rx="8" />
          <text x="210" y="45" className="figLabel">BUCKET</text>
          <text x="210" y="65" className="boxText" style={{fontSize:"7px"}}>62 / 100 tokens</text>
          <line className="flowMuted" x1="210" y1="18" x2="210" y2="5" />
          <text x="210" y="12" className="figHint" style={{fontSize:"5.5px"}}>refills 10/sec</text>
          <rect className="box" x="20" y="95" width="90" height="24" rx="5" />
          <text x="65" y="111" className="boxText" style={{fontSize:"6px"}}>Request (allowed)</text>
          <line className="flow" x1="110" y1="105" x2="158" y2="60" />
          <rect className="boxWarn" x="300" y="95" width="90" height="24" rx="5" />
          <text x="345" y="111" className="boxText" style={{fontSize:"6px"}}>Request (429)</text>
          <line className="flowMuted" x1="262" y1="60" x2="300" y2="105" />
        </svg>
        <figcaption>Each allowed request spends a token; once the bucket is empty, further requests are rejected until it refills.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Rate limiting only at a global level, rather than per caller or per API key, means one
          misbehaving integration can still exhaust the shared limit and degrade service for every
          other well-behaved caller. Returning a bare error with no <code>Retry-After</code>
          guidance is the other common gap &mdash; callers are left guessing how long to back off,
          which often leads them to retry immediately and get rate-limited again in a loop.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A partner's buggy integration fires 500 requests in one burst against a 100-token bucket refilling at 10/sec. Roughly how many of those requests actually reach the backend, and what happens to the rest?</p>
        </div>
      </section>
      <p className="takeaway">
        Rate limiting per caller, with a clear signal for how long to wait, protects the system from
        any single caller's burst without needing to guess who's about to misbehave in advance.
      </p>
    </div>
  );
}
