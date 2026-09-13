import "../css/Article.css";

export default function DistributedDataTransactionalOutboxArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The transactional outbox pattern solves a subtle but common bug: how do you update your
          own database and reliably publish an event about it, when a crash between those two steps
          would otherwise leave them out of sync forever?
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of writing to the database and then separately publishing to a broker &mdash; two
          operations that can't both be part of one atomic transaction &mdash; the service writes its
          data change and a row describing the event into an <code>outbox</code> table, in the same
          local database transaction. A separate relay process reads new outbox rows and actually
          publishes them to the broker, then marks them sent. Because the data change and the outbox
          row commit together or not at all, there's no window where one happened without the other.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> confirms an order:
        </p>
        <span className="codeLabel">ONE LOCAL TRANSACTION, TWO TABLES</span>
        <div className="codeBlock">
          <pre>{`BEGIN;
UPDATE orders SET status = 'confirmed' WHERE id = 'ord_7734';
INSERT INTO outbox (event_type, payload)
  VALUES ('OrderConfirmed', '{"orderId":"ord_7734"}');
COMMIT;
-- a separate relay process later reads outbox rows and publishes them`}</pre>
        </div>
        <p>
          If the service crashes right after <code>COMMIT</code>, both rows exist together; if it
          crashes before, neither does &mdash; the order is never confirmed without an outbox row
          also existing to tell the relay to publish the event.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of the transactional outbox pattern: OrderService writes both an order status update and an outbox row in one local database transaction, and a separate relay process later reads the outbox table and publishes the event to the broker.">
          <rect className="box" x="20" y="20" width="130" height="30" rx="6" />
          <text x="85" y="39" className="boxText" style={{fontSize:"6.5px"}}>OrderService</text>
          <rect className="boxAccent" x="20" y="70" width="130" height="50" rx="7" />
          <text x="85" y="88" className="figHint" style={{fontSize:"6px"}}>one local transaction:</text>
          <text x="85" y="101" className="figHint" style={{fontSize:"6px"}}>orders row + outbox row</text>
          <line className="flow" x1="85" y1="50" x2="85" y2="68" />
          <rect className="box" x="220" y="70" width="90" height="30" rx="6" />
          <text x="265" y="89" className="boxText" style={{fontSize:"6.5px"}}>Relay</text>
          <rect className="box" x="340" y="70" width="70" height="30" rx="6" />
          <text x="375" y="89" className="boxText" style={{fontSize:"6.5px"}}>Broker</text>
          <line className="flow" x1="150" y1="90" x2="218" y2="90" />
          <text x="185" y="80" className="figHint" style={{fontSize:"5px"}}>reads outbox</text>
          <line className="flow" x1="310" y1="85" x2="338" y2="85" />
        </svg>
        <figcaption>The order update and the outbox row commit together in one local transaction &mdash; the relay only publishes what actually committed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Publishing directly to the broker inside the same code path as the database write &mdash;
          without an outbox &mdash; is the exact bug this pattern fixes: if the process crashes
          between the two calls, you get a confirmed order with no event ever published, or an event
          published for an order update that then fails to commit. Forgetting to clean up or archive
          old, already-relayed outbox rows is the more mundane mistake &mdash; the table grows
          forever without a retention policy.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does writing the outbox row in the same local transaction as the orders update guarantee they're never out of sync, when publishing to the broker directly afterward would not?</p>
        </div>
      </section>
      <p className="takeaway">
        You can't atomically write to your database and publish to a broker in two separate systems
        &mdash; the outbox table is what lets you get the same effect using one atomic local
        transaction instead.
      </p>
    </div>
  );
}
