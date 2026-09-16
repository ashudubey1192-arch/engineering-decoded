export default function DistributedPatternsTransactionalOutboxArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Transactional Outbox writes an event to an "outbox" table in the same local database
          transaction as the business change it describes, then relies on a separate process to
          publish that event to a message broker &mdash; guaranteeing the event is never lost or
          published without the change actually having committed, which writing to the database
          and publishing to the broker as two separate steps cannot guarantee.
        </p>
        <p>
          Intent: atomically pair a database update with the reliable publication of an event
          describing it, without a distributed transaction spanning the database and the message
          broker. Applicability: a service needs to publish an event (order placed, user
          registered) whenever it commits a database change, and the two operations must
          succeed or fail together.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Writing the event where the data lives, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Add an outbox table to the same database as the business data.</b> An{" "}
            <code>outbox_events</code> table with columns for event type, payload, and a
            published flag.
          </li>
          <li>
            <b>Write the business change and the event in one local transaction.</b> Inserting
            the new <code>Order</code> row and inserting an <code>OrderPlaced</code> row into{" "}
            <code>outbox_events</code> happen inside the same database transaction, so both
            commit or neither does.
          </li>
          <li>
            <b>Run a separate process that reads unpublished events and sends them.</b> A poller
            or change-data-capture process reads rows from <code>outbox_events</code> where{" "}
            <code>published = false</code> and publishes each to the message broker.
          </li>
          <li>
            <b>Mark events published only after the broker confirms.</b> The poller updates the
            row's flag after a successful publish, and retries any row still marked unpublished.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="20" y="20" width="160" height="60" rx="6" />
            <text className="boxText" x="100" y="45" fontSize="8">orders table</text>
            <text className="boxText" x="100" y="65" fontSize="8">outbox_events table</text>
            <text className="figHint" x="30" y="95">one local transaction, both rows</text>
            <line className="flow" x1="180" y1="50" x2="260" y2="50" />
            <rect className="box" x="260" y="30" width="110" height="40" rx="6" />
            <text className="boxText" x="315" y="54" fontSize="8">Outbox poller</text>
            <line className="flow" x1="370" y1="50" x2="440" y2="50" />
            <text className="figHint" x="375" y="40">message</text>
            <text className="figHint" x="375" y="70">broker</text>
          </svg>
          <figcaption>The event commits atomically with the business row; a separate poller relays it to the broker afterward.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Writing order and event atomically, publishing separately</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class OrderService {
    void placeOrder(Connection connection, Order order) throws SQLException {
        connection.setAutoCommit(false);
        try {
            insertOrder(connection, order);                          // business row
            insertOutboxEvent(connection, "OrderPlaced", order.id()); // event row -- same transaction
            connection.commit(); // both succeed together, or neither does
        } catch (SQLException e) {
            connection.rollback();
            throw e;
        }
    }
    private void insertOrder(Connection c, Order order) { /* INSERT INTO orders ... */ }
    private void insertOutboxEvent(Connection c, String type, String orderId) {
        /* INSERT INTO outbox_events(type, payload, published) VALUES (?, ?, false) */
    }
}

class OutboxPoller implements Runnable { // separate process, polls independently
    private final Connection connection;
    private final MessageBroker broker;

    public void run() {
        while (true) {
            List<OutboxEvent> pending = fetchUnpublished(connection); // WHERE published = false
            for (OutboxEvent event : pending) {
                broker.publish(event.type(), event.payload());
                markPublished(connection, event.id()); // only after the broker confirms
            }
            sleep(1000);
        }
    }
    private List<OutboxEvent> fetchUnpublished(Connection c) { return List.of(); }
    private void markPublished(Connection c, String id) { /* UPDATE outbox_events SET published = true */ }
    private void sleep(long ms) { /* Thread.sleep */ }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Publishing to the broker directly inside the same code path as the database write, without an outbox.</b>{" "}
            If the database commit succeeds but the broker publish fails (or vice versa), the
            event and the data disagree permanently, with no record of the mismatch.
          </li>
          <li>
            <b>Deleting outbox rows immediately after publishing instead of marking them.</b>{" "}
            Keeping published rows (or moving them to an archive) preserves an audit trail and
            makes debugging a missed event possible.
          </li>
          <li>
            <b>Letting the poller mark an event published before the broker actually confirms it.</b>{" "}
            That reintroduces the risk of a lost event if the broker call itself fails silently
            or times out ambiguously.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does inserting the <code>OrderPlaced</code> row into <code>outbox_events</code> in the same transaction as the <code>orders</code> insert matter, rather than publishing to the broker directly right after the order commits?</p>
          <p>
            <b>Answer:</b> A local database transaction guarantees the order row and the outbox
            event row commit together or not at all. Publishing to the broker directly as a
            second, separate step has no such guarantee &mdash; if the process crashes between
            the database commit and the broker call, the order exists with no event ever
            published, and no record shows that it was missed. The outbox row is exactly that
            missing record, safely committed alongside the order itself.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Transactional Outbox pairs a database write with reliable event publication by writing
        the event into the same local transaction as the data, then relaying it separately
        &mdash; the local transaction is what makes the guarantee possible without a distributed
        transaction across two different systems.
      </p>
    </div>
  );
}
