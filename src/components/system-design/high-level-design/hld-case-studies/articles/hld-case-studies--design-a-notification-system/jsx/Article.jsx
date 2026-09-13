import "../css/Article.css";

export default function HldCaseStudiesNotificationSystemArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          &ldquo;When something happens in the product, tell the affected user &mdash; by push,
          email, or text.&rdquo; The constraint that shapes this design is that whatever detects
          the event, say an order shipping, must never be slowed down or broken by a flaky
          third-party provider on the other end.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: many different internal events can trigger a notification, a user may
          receive one over several channels, users have preferences (which channels, quiet hours),
          and an outage in one channel's provider shouldn't touch the others or the service that
          triggered the notification in the first place.
        </p>
        <p>
          The core decision is to decouple &ldquo;something happened&rdquo; from &ldquo;a
          notification was delivered&rdquo; with a queue in between. The service that detects the
          event only publishes a small message describing what happened &mdash; it never calls a
          push, email, or SMS provider directly, and it never waits on one to respond. A separate
          notification service consumes those events, checks the recipient's preferences, and fans
          out one job per applicable channel to workers that each know how to talk to a single
          external provider.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>The orders service marks an order shipped</b> and publishes an
            &ldquo;order.shipped&rdquo; event to a queue &mdash; its own request finishes right
            away, regardless of what happens next.</li>
          <li><b>A notification service consumes the event,</b> loads the user's channel
            preferences, and decides this user gets a push notification and an email, but is
            inside a quiet-hours window for text messages.</li>
          <li><b>One job per applicable channel</b> lands on separate, channel-specific queues; a
            push worker and an email worker each call their own provider independently.</li>
          <li><b>The suppressed SMS job</b> is instead scheduled for once the quiet-hours window
            ends, rather than dropped.</li>
          <li><b>If the email provider is down,</b> its worker retries with backoff on its own
            queue &mdash; the push notification still goes out immediately, and the orders service
            was never aware any of this was happening.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 130" role="img" aria-label="Diagram of an order-shipped event passing through a queue to a notification service, which fans out independent jobs to separate push, email, and SMS workers, each calling its own external provider." >
          <rect className="box" x="15" y="35" width="100" height="32" rx="6" /><text x="65" y="55" className="boxText" style={{fontSize:"7.5px"}}>Order shipped</text>
          <line className="flow" x1="115" y1="51" x2="155" y2="51" />
          <rect className="boxAccent" x="160" y="35" width="80" height="32" rx="6" /><text x="200" y="55" className="boxText" style={{fontSize:"8px"}}>Queue</text>
          <line className="flow" x1="240" y1="51" x2="280" y2="51" />
          <rect className="box" x="285" y="35" width="130" height="32" rx="6" /><text x="350" y="55" className="boxText" style={{fontSize:"7px"}}>Notification service</text>
          {["Push","Email","SMS"].map((t,i) => (<line key={t} className="flowMuted" x1="350" y1="67" x2={350 - 60 + i*60} y2="100" />))}
          {["Push","Email","SMS"].map((t,i) => (<rect key={t} className="box" x={260 + i*60} y="100" width="50" height="24" rx="5" />))}
          {["Push","Email","SMS"].map((t,i) => (<text key={t} x={285 + i*60} y="116" className="boxText" textAnchor="middle" style={{fontSize:"7px"}}>{t}</text>))}
        </svg>
        <figcaption>The triggering event only ever reaches a queue; notification fan-out and each channel's provider call happen entirely downstream of it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Calling push, email, or SMS providers synchronously from the core application path means
          a slow or failing provider directly stalls or breaks a request that has nothing to do
          with it. Not deduplicating is another common gap &mdash; if the same event is correctly
          retried after a partial failure, a user can end up notified twice for one occurrence.
          Treating every channel and every notification as equally urgent, with user preferences
          and quiet hours bolted on as an afterthought, is the third.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why should the orders service publish an event rather than calling the push, email, and SMS providers directly when an order ships?</p>
        </div>
      </section>
      <p className="takeaway">
        The queue in the middle is what lets the rest of the product move on immediately, while
        notification delivery &mdash; with all its retries and third-party flakiness &mdash;
        happens entirely off to the side.
      </p>
    </div>
  );
}
