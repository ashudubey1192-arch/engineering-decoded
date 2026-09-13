import "../css/Article.css";

export default function ReliabilityRetriesAndBackoffArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Not every failure is permanent &mdash; a lot of them are brief blips that succeed on a
          second attempt. Retrying is simple; retrying <i>safely</i>, without making an overloaded
          system worse, takes real care.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A naive retry (try again immediately, forever) can turn a brief blip into an outage, by
          piling even more load onto an already-struggling dependency at the exact moment it can
          least handle it. <b>Exponential backoff</b> waits progressively longer between attempts
          (1s, 2s, 4s...), and <b>jitter</b> randomizes that wait slightly so many clients
          retrying at once don&rsquo;t all hit the dependency in synchronized waves. A retry policy
          also needs a cap &mdash; a maximum number of attempts, after which the caller gives up
          and surfaces the failure instead of retrying forever.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A call to the inventory service fails</b> due to a brief network blip.</li>
          <li><b>Wait ~1 second (plus a small random jitter),</b> then retry.</li>
          <li><b>It fails again</b> &mdash; wait ~2 seconds, then retry; then ~4 seconds if needed.</li>
          <li><b>After 4 attempts,</b> give up and surface a clear error, rather than retrying
            indefinitely and leaving the user staring at a spinner.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of retry attempts spaced with exponentially increasing delays plus jitter, ending in a capped final attempt before giving up." >
          {[0,25,60,110].map((x,i) => (<rect key={i} className={i===3?"boxWarn":"box"} x={20+x} y="30" width="26" height="26" rx="5" />))}
          {[0,25,60,110].map((x,i) => (<text key={i} x={33+x} y="47" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>{i+1}</text>))}
          <text x="220" y="20" className="figHint" textAnchor="middle" style={{fontSize:"8px"}}>gaps grow: ~1s, ~2s, ~4s, then give up</text>
        </svg>
        <figcaption>Each retry waits longer than the last, with a hard cap before the caller gives up and surfaces the error.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Retrying immediately and indefinitely, with no backoff and no cap, is the classic
          &ldquo;retry storm&rdquo; that turns a small hiccup into a full outage by amplifying load
          on an already-struggling dependency. Retrying non-idempotent operations (like &ldquo;charge
          this card&rdquo;) without safeguards can also cause a customer to be charged twice.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does adding random jitter to a backoff delay help, when every client is already waiting progressively longer between retries?</p>
        </div>
      </section>
      <p className="takeaway">
        Retries help with transient failures only when they back off, add jitter, and eventually
        give up &mdash; an uncapped, immediate retry loop is a self-inflicted outage waiting to happen.
      </p>
    </div>
  );
}
