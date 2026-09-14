import "../css/Article.css";

export default function ReliabilityRetriesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Retrying a failed request looks like simple defensive coding, but a retry with no
          strategy behind it can turn one brief hiccup into a self-inflicted overload &mdash; for
          the caller, and for the API on the receiving end of every retry arriving at once.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Only retry safe operations</b> &mdash; idempotent methods, or any request protected by an idempotency key.</li>
          <li><b>Back off, with jitter</b> &mdash; wait longer between each attempt, and randomize the exact delay so many clients that failed at the same instant don't all retry at the same instant again.</li>
          <li><b>Respect Retry-After</b> &mdash; when the server names a wait time, use it instead of a client-guessed delay.</li>
          <li><b>Cap it</b> &mdash; a maximum attempt count or total elapsed time, so a persistent outage doesn't retry forever.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's official SDKs retry <code>429</code> and <code>503</code> responses with
          exponential backoff plus jitter, capped at five attempts, and honor a
          <code>Retry-After</code> header whenever the server sends one instead of computing their
          own delay:
        </p>
        <span className="codeLabel">RETRY SCHEDULE (NO SERVER-SUPPLIED RETRY-AFTER)</span>
        <div className="codeBlock">
          <pre>{`attempt 1: fails
attempt 2: wait ~1s  (0.5-1.5s jittered)
attempt 3: wait ~2s  (1-3s jittered)
attempt 4: wait ~4s  (2-6s jittered)
attempt 5: wait ~8s  (4-12s jittered) -> give up, surface the error`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Side-by-side comparison: many clients retrying at the exact same instant without jitter, creating a synchronized spike, versus the same clients with randomized jitter, spreading their retries out over time.">
          <text x="105" y="18" className="figLabel">NO JITTER</text>
          {[0,1,2,3].map(i => (
            <rect key={i} className="boxWarn" x="95" y="70" width="20" height="30" rx="3" />
          ))}
          <text x="105" y="115" className="figHint" style={{fontSize:"5.5px"}}>all retries land at once</text>

          <line className="divider" x1="220" y1="10" x2="220" y2="120" />

          <text x="330" y="18" className="figLabel">WITH JITTER</text>
          {[0,1,2,3].map(i => (
            <rect key={i} className="box" x={260 + i*35} y={45 + i*10} width="20" height={55 - i*10} rx="3" />
          ))}
          <text x="330" y="115" className="figHint" style={{fontSize:"5.5px"}}>retries spread across a window</text>
        </svg>
        <figcaption>Randomizing the delay is what keeps a shared outage from becoming a synchronized retry storm the moment service recovers.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Retrying a <code>422</code> validation error as if it were transient is a common mistake
          &mdash; the request itself is wrong, so retrying it identically fails identically, and
          just wastes a call against the rate limit for no benefit. Retrying immediately with no
          backoff at all is the other common one: it turns one blip into a self-inflicted spike of
          traffic hitting the API at the worst possible moment, right as it's already struggling.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does retrying a 422 response provide no benefit, while retrying a 503 response usually does?</p>
        </div>
      </section>
      <p className="takeaway">
        A retry strategy is really three decisions: which failures are worth retrying, how long to
        wait between attempts, and when to stop &mdash; skip any one of them and retries stop being
        defensive and start being a liability.
      </p>
    </div>
  );
}
