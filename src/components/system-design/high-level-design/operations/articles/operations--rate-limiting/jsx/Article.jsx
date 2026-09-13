import "../css/Article.css";

export default function OperationsRateLimitingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A rate limiter caps how many requests a single client can make in a given window &mdash;
          protecting the system from a single misbehaving or overly aggressive caller, whether
          malicious or accidental.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Rate limiting sits at the edge of the system (an API gateway or dedicated service),
          tracking request counts per client &mdash; usually keyed by API key, user ID, or IP
          address &mdash; and rejecting requests once a threshold is crossed within a time window.
          The <b>token bucket</b> algorithm is a common implementation: each client has a bucket of
          tokens that refills at a steady rate, and each request consumes one; an empty bucket
          means the request is rejected until it refills.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Each API key gets a bucket of 100 tokens,</b> refilling at 10 tokens per second.</li>
          <li><b>A well-behaved client</b> making a handful of requests per second never empties
            its bucket &mdash; it never notices the limiter exists.</li>
          <li><b>A buggy client retries in a tight loop,</b> burning through 100 tokens in under a
            second.</li>
          <li><b>Further requests are rejected</b> with a 429 status until the bucket refills
            &mdash; protecting the backend from the buggy client without needing a human to
            intervene.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a token bucket per client, refilling steadily over time, with each request consuming one token and requests rejected once the bucket is empty." >
          <rect className="box" x="150" y="20" width="120" height="50" rx="8" /><text x="210" y="50" className="boxText" style={{fontSize:"9px"}}>Token bucket</text>
          <line className="flow" x1="210" y1="10" x2="210" y2="20" /><text x="210" y="8" className="figHint" style={{fontSize:"7px"}}>refills steadily</text>
          <line className="flow" x1="150" y1="45" x2="90" y2="45" /><text x="120" y="35" className="figHint" style={{fontSize:"7px"}}>consume</text>
          <rect className="box" x="20" y="30" width="65" height="30" rx="5" /><text x="52" y="49" className="boxText" style={{fontSize:"8px"}}>Request</text>
          <line className="flow" x1="270" y1="45" x2="330" y2="45" /><text x="300" y="35" className="figHint" style={{fontSize:"7px"}}>empty</text>
          <rect className="boxWarn" x="335" y="30" width="65" height="30" rx="5" /><text x="367" y="49" className="boxText" style={{fontSize:"7px"}}>429</text>
        </svg>
        <figcaption>Every request consumes a token; once the bucket is empty, further requests are rejected until it refills.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Applying one global rate limit across all clients, instead of a per-client limit, lets a
          single bad actor exhaust the entire budget for everyone else. Not returning a clear,
          standard signal (a 429 status with a retry-after header) when a limit is hit also leaves
          well-behaved clients unsure whether to retry or how long to wait.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a per-client token bucket protect the system better than a single global rate limit shared by all clients?</p>
        </div>
      </section>
      <p className="takeaway">
        Rate limiting protects a system from any one client &mdash; well-meaning or not &mdash;
        consuming more than its fair share, without needing a human watching in real time.
      </p>
    </div>
  );
}
