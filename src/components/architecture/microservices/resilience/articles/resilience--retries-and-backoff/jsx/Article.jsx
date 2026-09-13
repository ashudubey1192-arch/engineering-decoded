import "../css/Article.css";

export default function ResilienceRetriesAndBackoffArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Retrying a failed call makes sense &mdash; transient blips genuinely do resolve themselves
          &mdash; but retrying instantly and repeatedly is exactly how a brief hiccup turns into a
          pile-up that keeps a struggling dependency from ever recovering.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Exponential backoff</b> waits longer between each successive retry (100ms, then 200ms,
          then 400ms...) instead of retrying immediately every time, giving a struggling dependency
          increasing room to recover. <b>Jitter</b> &mdash; adding a small random amount to each wait
          &mdash; prevents many callers who all failed at the same moment from retrying in lockstep
          and hitting the dependency with synchronized waves of load.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A thousand <code>CheckoutService</code> instances all get a timeout from
          <code>PricingService</code> within the same second, during a brief blip. Without jitter,
          all thousand retry at almost exactly the same moment 200ms later &mdash; recreating the
          exact overload that caused the blip in the first place. With jitter, each instance's retry
          lands at a slightly different, randomized moment, spreading the same thousand retries
          across a window instead of one instant.
        </p>
        <span className="codeLabel">EXPONENTIAL BACKOFF WITH JITTER</span>
        <div className="codeBlock">
          <pre>{`function delayForAttempt(attempt) {
  const base = 100 * Math.pow(2, attempt)   // 100, 200, 400, 800ms...
  const jitter = Math.random() * base * 0.5
  return base + jitter
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting retries without jitter, where many callers retry at the exact same instant and recreate a load spike, against retries with jitter, where the same retries are spread across a window of time.">
          <text x="105" y="20" className="figLabel">NO JITTER</text>
          {[0,1,2,3,4].map(i => (<line key={i} className="flowMuted" x1="105" y1="35" x2="105" y2="60" />))}
          <rect className="boxWarn" x="80" y="35" width="50" height="25" rx="5" />
          <text x="105" y="51" className="boxText" style={{fontSize:"6px"}}>spike</text>
          <text x="105" y="75" className="figHint" style={{fontSize:"6px"}}>all retry at once</text>
          <line className="divider" x1="215" y1="10" x2="215" y2="115" />
          <text x="320" y="20" className="figLabel">WITH JITTER</text>
          {[270,300,330,360,390].map((x,i) => (<rect key={i} className="box" x={x} y={35+i*4} width="20" height="14" rx="3" />))}
          <text x="330" y="90" className="figHint" style={{fontSize:"6px"}}>retries spread across a window</text>
        </svg>
        <figcaption>Without jitter, every failed caller retries in lockstep; with jitter, the same retries spread out and never recreate the original spike.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Retrying without any backoff at all &mdash; hammering a struggling dependency immediately
          and repeatedly &mdash; is the single most common way client code makes an existing outage
          worse. Retrying a non-idempotent operation (like charging a card) the same way you'd retry
          an idempotent one (like a read) risks duplicating the side effect; retries need an
          idempotency key or similar safeguard whenever the operation isn't naturally safe to repeat.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A thousand callers all get a timeout within the same second and all retry with the exact same fixed 200ms delay. What happens 200ms later, and how does jitter change that?</p>
        </div>
      </section>
      <p className="takeaway">
        Retries only help if they don't recreate the problem they're responding to &mdash;
        exponential backoff with jitter is what keeps a wave of retries from becoming its own
        outage.
      </p>
    </div>
  );
}
