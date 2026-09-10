import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiInfrastructureRateLimitingArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Rate limiting caps how many requests a client can make in a time window. Over the limit,
          the API replies <code>429 Too Many Requests</code> instead of doing the work.
        </p>
        <p>
          It protects the system from abuse, runaway scripts, and one noisy client starving everyone
          else &mdash; and it lets you sell tiered plans.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A partner&apos;s integration has a bug: a retry loop with no backoff. It hammers your{" "}
            <code>/search</code> endpoint 5,000 times a second. Without a rate limit, your database
            melts and <i>every</i> customer&apos;s API goes down. With a 100 req/s limit on that
            partner, they get a wall of <code>429</code>s, everyone else is fine, and your on-call
            engineer sleeps.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The common algorithms</h2>
        <table className="miniTable">
          <caption>HOW THE COUNTER WORKS</caption>
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Idea</th>
              <th>Trade-off</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fixed window</td>
              <td>N requests per clock minute</td>
              <td>Simple, but allows a 2N burst across a boundary</td>
            </tr>
            <tr>
              <td>Sliding window</td>
              <td>N requests per rolling 60s</td>
              <td>Smoother; a bit more state to track</td>
            </tr>
            <tr>
              <td>Token bucket</td>
              <td>Tokens refill at a rate; each request spends one</td>
              <td>Allows short bursts up to bucket size &mdash; most popular</td>
            </tr>
            <tr>
              <td>Leaky bucket</td>
              <td>Requests queue and drain at a fixed rate</td>
              <td>Very smooth output; adds latency, can drop</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="tbTitle">
            <title id="tbTitle">
              A token bucket refills at a steady rate; each request removes a token, and requests are
              rejected when the bucket is empty.
            </title>
            <text className="figHint" x="90" y="30">
              refill 10/sec
            </text>
            <line className="flow" x1="90" y1="38" x2="90" y2="60" />
            <rect className="boxAccent" x="40" y="60" width="100" height="60" />
            <text className="boxText" x="90" y="95">
              tokens: 6
            </text>
            <line className="flow" x1="140" y1="90" x2="210" y2="90" />
            <text className="figHint" x="175" y="80">
              request
            </text>
            <text className="figHint" x="175" y="108">
              spends 1
            </text>
            <rect className="box" x="210" y="72" width="120" height="36" />
            <text className="boxText" x="270" y="94">
              allowed (200)
            </text>
            <rect className="boxWarn" x="360" y="72" width="180" height="36" />
            <text className="boxText" x="450" y="94">
              bucket empty &rarr; 429
            </text>
          </svg>
          <figcaption>
            Bucket size sets the burst you tolerate; refill rate sets the sustained limit.
          </figcaption>
        </figure>

        <h2>2. What to limit by, and telling the client</h2>
        <ul>
          <li>
            <b>Key by:</b> API key or user ID (best), IP (rough &mdash; NAT groups users), or a mix.
          </li>
          <li>
            <b>Scope:</b> global, per endpoint, or per method (a cheap GET vs an expensive report).
          </li>
          <li>
            <b>Respond with headers:</b> <code>X-RateLimit-Limit</code>,{" "}
            <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>, and{" "}
            <code>Retry-After</code> on a 429 so well-behaved clients back off.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>3. Step by step: a distributed token bucket</h2>
        <ol className="stepList">
          <li>
            <b>Store per-key state in Redis:</b> <code>tokens</code> and <code>last_refill</code>{" "}
            time.
          </li>
          <li>
            <b>On each request,</b> compute how many tokens to add since <code>last_refill</code>
            (<code>elapsed &times; rate</code>), capped at bucket size.
          </li>
          <li>
            <b>If tokens &ge; 1:</b> subtract one, update state, allow the request.
          </li>
          <li>
            <b>If tokens &lt; 1:</b> return <code>429</code> with <code>Retry-After</code> = seconds
            until one token refills.
          </li>
          <li>
            <b>Make the check atomic</b> &mdash; a Redis Lua script &mdash; so two servers handling
            the same client cannot both pass on the last token.
          </li>
          <li>
            <b>Fail open or closed?</b> If Redis is down, decide deliberately: allow traffic (open,
            risk overload) or reject (closed, risk false 429s).
          </li>
        </ol>
        <div className="takeaway">
          Rate limiting usually lives at the API gateway so it is enforced once, before any backend
          work, and consistently across every service.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Limiting by IP only</h3>
            <p>
              Thousands of users behind one corporate NAT share a limit; a botnet with thousands of
              IPs dodges it. Prefer an authenticated key.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Per-server counters</h3>
            <p>
              With 5 gateway nodes and a &quot;100/min&quot; limit each, the real limit is 500/min
              and uneven. Use shared state.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No feedback to clients</h3>
            <p>
              A bare 429 with no <code>Retry-After</code> makes clients retry immediately and hammer
              harder. Always tell them when to come back.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            You want to allow a client to burst 50 requests but sustain only 10/second. Which
            algorithm fits, and what do the &quot;bucket size&quot; and &quot;refill rate&quot; map
            to?
          </p>
        </div>
      </section>
    </div>
  );
}
