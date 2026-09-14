import "../css/Article.css";

export default function ReliabilityRateLimitingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Rate limiting protects an API from any single caller &mdash; well-behaved or not &mdash;
          consuming more than its fair share of capacity. The real design questions are what unit
          you limit by, and how clearly you warn a caller before it actually gets throttled.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Limit by API key, not IP</b> &mdash; many partners share infrastructure behind one IP, and one partner can easily use several; the key identifies the actual account fairly.</li>
          <li><b>Token bucket is the friendliest algorithm</b> &mdash; it allows brief bursts while still capping sustained throughput, closer to how real traffic actually behaves than a rigid fixed window.</li>
          <li><b>Communicate proactively</b> &mdash; rate-limit headers on every response, not just on the error that finally trips the limit, let a well-behaved client self-throttle before being cut off.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>Parcelly reports rate-limit state on every response, successful or not:</p>
        <span className="codeLabel">EVERY RESPONSE, NOT JUST 429s</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 200 OK
X-RateLimit-Limit: 2000
X-RateLimit-Remaining: 143
X-RateLimit-Reset: 1758156000`}</pre>
        </div>
        <p>
          A partner's client sees <code>Remaining</code> dropping and can slow itself down well
          before hitting zero. Only once the limit is actually exceeded does Parcelly respond
          differently:
        </p>
        <span className="codeLabel">WHEN THE LIMIT IS EXCEEDED</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 429 Too Many Requests
Retry-After: 12`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a token bucket: tokens refill continuously up to a cap, each request consumes one token, and a request is rejected only once the bucket is empty, allowing short bursts while capping sustained rate.">
          <rect className="box" x="150" y="15" width="120" height="70" rx="10" />
          <text x="210" y="33" className="figLabel" style={{fontSize:"6px"}}>TOKEN BUCKET</text>
          {[0,1,2,3,4].map(i => (
            <circle key={i} className="ringNode" cx={170 + i*20} cy="60" r="6" />
          ))}
          <text x="210" y="100" className="figHint" style={{fontSize:"6px"}}>refills steadily &mdash; each request spends one token</text>
        </svg>
        <figcaption>Bursts are fine as long as tokens remain; sustained load beyond the refill rate eventually empties the bucket.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Rate limiting by IP address on a public API punishes every partner sharing a NAT gateway
          or corporate proxy as if they were one caller, and is trivially sidestepped by anyone
          rotating IPs. Only communicating the limit through the eventual <code>429</code> is the
          other common mistake: a well-behaved client has no signal to self-throttle proactively,
          so every integration eventually discovers the ceiling the hard way, usually during its
          highest-traffic moment.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does including rate-limit headers on successful responses, not just on 429s, help a well-behaved client avoid ever being throttled?</p>
        </div>
      </section>
      <p className="takeaway">
        A rate limit a caller only learns about after being throttled is a worse limit than one
        it's warned about on every response &mdash; give clients the information to govern
        themselves before you have to do it for them.
      </p>
    </div>
  );
}
