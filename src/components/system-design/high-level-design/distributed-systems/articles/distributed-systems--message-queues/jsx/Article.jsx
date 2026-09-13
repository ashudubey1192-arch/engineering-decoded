import "../css/Article.css";

export default function DistributedSystemsMessageQueuesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A message queue sits between a producer and a consumer, holding work until the consumer
          is ready for it &mdash; the component that turns a fragile direct call into something
          that survives the receiving side being slow, overloaded, or briefly down.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A producer pushes messages onto the queue and moves on immediately; one or more
          consumers pull messages off at their own pace. This <b>decouples</b> the two sides in
          time (the consumer doesn&rsquo;t need to be up right now) and in load (a traffic spike
          piles up in the queue instead of overwhelming the consumer directly). Most queues also
          guarantee a message isn&rsquo;t lost if a consumer crashes mid-processing &mdash; it
          becomes visible to another consumer instead.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>An order is placed,</b> triggering an email confirmation, a receipt PDF, and an
            inventory update &mdash; three unrelated pieces of downstream work.</li>
          <li><b>The order service publishes one &ldquo;order placed&rdquo; message</b> to a queue
            and returns to the user immediately.</li>
          <li><b>Three independent consumers</b> (email, receipts, inventory) each process that
            message at their own pace.</li>
          <li><b>The receipts service goes down for five minutes.</b> Its messages simply wait in
            the queue and get processed once it&rsquo;s back &mdash; the order and the other two
            consumers are entirely unaffected.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of a producer pushing one message onto a queue, which three independent consumers pull from at their own pace, one of them temporarily down without affecting the others." >
          <rect className="box" x="15" y="45" width="80" height="30" rx="5" /><text x="55" y="64" className="boxText" style={{fontSize:"9px"}}>Producer</text>
          <line className="flow" x1="95" y1="60" x2="150" y2="60" />
          <rect className="boxAccent" x="155" y="45" width="70" height="30" rx="5" /><text x="190" y="64" className="boxText" style={{fontSize:"9px"}}>Queue</text>
          <line className="flow" x1="225" y1="50" x2="290" y2="20" />
          <line className="flow" x1="225" y1="60" x2="290" y2="60" />
          <line className="flowMuted" x1="225" y1="70" x2="290" y2="100" />
          <rect className="box" x="295" y="8" width="70" height="24" rx="5" /><text x="330" y="24" className="boxText" style={{fontSize:"7px"}}>Email</text>
          <rect className="box" x="295" y="48" width="70" height="24" rx="5" /><text x="330" y="64" className="boxText" style={{fontSize:"7px"}}>Inventory</text>
          <rect className="boxWarn" x="295" y="88" width="70" height="24" rx="5" /><text x="330" y="104" className="boxText" style={{fontSize:"7px"}}>Receipts (down)</text>
        </svg>
        <figcaption>One consumer being temporarily down doesn't affect the producer or the other consumers &mdash; its messages simply wait.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using a queue for work that genuinely needs an immediate response (the user is waiting
          on the result right now) reintroduces latency without a benefit. Assuming a consumer
          will only ever see a message once, without handling duplicate delivery, is the other
          common gap &mdash; most queues guarantee <i>at-least-once</i> delivery, not exactly-once.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the receipts service being down for five minutes not affect the order service or the other two consumers?</p>
        </div>
      </section>
      <p className="takeaway">
        A message queue decouples producers from consumers in both time and load &mdash; the
        default answer whenever downstream work doesn&rsquo;t need to finish before responding to
        the original request.
      </p>
    </div>
  );
}
