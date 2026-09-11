import "../css/Article.css";

export default function DistributedTransactionsOutboxPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The outbox pattern solves a specific, sneaky problem: how do you atomically update your
          database <i>and</i> reliably publish an event about that change, when a crash between
          those two steps would otherwise lose the event or send a false one?
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Writing to your database and publishing to a message broker are two separate systems —
          you can't atomically do both in one operation the way you could with two tables in the
          same database. The outbox pattern's trick: write the event into an{" "}
          <b>outbox table</b> in the <i>same local transaction</i> as the actual data change — that
          part <i>is</i> atomic, since it's one database. A separate process then reads unpublished
          rows from the outbox table and publishes them to the message broker, marking them
          published once confirmed — decoupling "did the write happen" from "did the event get
          published" while keeping both eventually consistent with each other.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Single local transaction.</b> The orders service inserts the new order row{" "}
            <i>and</i> an <code>OrderPlaced</code> row into its outbox table — both commit
            together, atomically, since they're in the same database.</li>
          <li><b>A relay process polls the outbox table</b> for unpublished rows.</li>
          <li><b>It publishes each row</b> to the message broker.</li>
          <li><b>It marks the row published</b> only after the broker confirms — if the relay
            crashes before marking it, the row is simply republished later; consumers handle
            occasional duplicates using an idempotency key.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of an order row and an outbox event row being inserted together in one atomic local transaction, with a separate relay process later reading the outbox and publishing the event to a message broker.">
          <rect className="boxAccent" x="30" y="20" width="180" height="50" rx="6" />
          <text x="120" y="40" className="boxText" textAnchor="middle">one local transaction</text>
          <rect className="box" x="45" y="48" width="70" height="16" rx="3" /><text x="80" y="60" className="figHint" textAnchor="middle">order row</text>
          <rect className="box" x="125" y="48" width="70" height="16" rx="3" /><text x="160" y="60" className="figHint" textAnchor="middle">outbox row</text>
          <line className="flow" x1="195" y1="70" x2="280" y2="100" />
          <rect className="box" x="290" y="90" width="100" height="26" rx="4" /><text x="340" y="107" className="boxText">relay process</text>
          <line className="flow" x1="390" y1="103" x2="420" y2="103" style={{ opacity: 0 }} />
          <text x="340" y="130" className="figHint" textAnchor="middle">polls outbox, publishes to broker, marks sent</text>
        </svg>
        <figcaption>The data change and the event both commit atomically in one local transaction; publishing happens reliably afterward.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Publishing an event directly after committing the database write (as two separate steps,
          not one transaction) reintroduces exactly the problem the outbox pattern solves — a
          crash between them loses the event. Forgetting that the relay can occasionally deliver
          the same event more than once (if it crashes after publishing but before marking it
          sent) means consumers still need to handle duplicates idempotently.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does writing the event to an outbox table in the same local transaction as the data change guarantee the event is never silently lost?</p>
        </div>
      </section>
      <p className="takeaway">
        The outbox pattern gets atomicity between a database write and an event publish by
        keeping both inside one local transaction, then handling actual delivery as a separate,
        retryable step.
      </p>
    </div>
  );
}
