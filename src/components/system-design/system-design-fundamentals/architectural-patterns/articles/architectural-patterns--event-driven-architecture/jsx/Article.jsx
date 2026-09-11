import "../css/Article.css";

export default function ArchitecturalPatternsEventDrivenArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          In an event-driven architecture, services communicate by publishing and reacting to
          events — facts about something that happened — rather than calling each other directly.
          Producers don't know or care who's listening.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A producer publishes an event ("OrderPlaced") to a broker (a message queue or event
          stream); any number of consumers can subscribe and react independently, without the
          producer knowing they exist. This decouples services in time (a consumer can be down
          temporarily and catch up later) and in knowledge (the producer never lists its
          consumers) — new consumers can be added later with zero changes to the producer.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>An order is placed.</b> The orders service publishes an{" "}
            <code>OrderPlaced</code> event to a broker — it doesn't call anyone directly.</li>
          <li><b>Multiple services react.</b> The inventory service decrements stock; the email
            service sends a confirmation; the analytics service logs it — all independently,
            all subscribed to the same event.</li>
          <li><b>Add a new consumer later.</b> A fraud-detection service starts subscribing to the
            same event stream, with zero changes needed in the orders service.</li>
          <li><b>A consumer goes down.</b> Events queue up in the broker and the consumer catches
            up once it's back — no events lost.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram of a producer publishing an event to a broker, with three independent consumers subscribing and reacting to the same event without the producer knowing about them.">
          <rect className="boxAccent" x="20" y="55" width="90" height="30" rx="5" /><text x="65" y="75" className="boxText">orders svc</text>
          <line className="flow" x1="110" y1="70" x2="160" y2="70" />
          <rect className="box" x="170" y="55" width="80" height="30" rx="5" /><text x="210" y="75" className="boxText">broker</text>
          <line className="flow" x1="250" y1="60" x2="330" y2="25" /><line className="flow" x1="250" y1="70" x2="330" y2="70" /><line className="flow" x1="250" y1="80" x2="330" y2="115" />
          <rect className="box" x="335" y="12" width="90" height="26" rx="4" /><text x="380" y="30" className="boxText">inventory</text>
          <rect className="box" x="335" y="57" width="90" height="26" rx="4" /><text x="380" y="75" className="boxText">email</text>
          <rect className="box" x="335" y="102" width="90" height="26" rx="4" /><text x="380" y="120" className="boxText">analytics</text>
        </svg>
        <figcaption>One event, many independent consumers — none known to the producer in advance.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Event-driven systems make the overall flow harder to trace — debugging "why didn't this
          happen" means following events across several independent consumers instead of reading
          one call stack, so investing in tracing and event logging early matters. Treating events
          as commands ("DoSomething") rather than facts ("SomethingHappened") also tends to
          re-couple producer and consumer in disguise.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does event-driven architecture make it easier to add a new consumer without changing the producer, compared to direct service-to-service calls?</p>
        </div>
      </section>
      <p className="takeaway">
        Publishing facts instead of calling consumers directly decouples services in both time and
        knowledge — at the cost of a flow that's harder to trace end to end.
      </p>
    </div>
  );
}
