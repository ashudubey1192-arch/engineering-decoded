export default function DistributedPatternsIdempotentConsumerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Idempotent Consumer records which messages it has already processed and skips any
          repeat, so that a message delivered more than once &mdash; by a retry, a redelivery
          after a timeout, or an at-least-once message broker &mdash; only takes effect a single
          time, closing the gap that Retry with Backoff and message queues otherwise leave open.
        </p>
        <p>
          Intent: make processing a message safe to repeat, so duplicate delivery never causes a
          duplicate effect. Applicability: messages arrive over a channel that guarantees
          at-least-once delivery (most message brokers, most retry mechanisms), and processing
          the same message twice would cause a real problem &mdash; a duplicate charge, a
          duplicate email, a double-counted inventory decrement.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Recognizing repeats, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Give every message a unique, stable identifier.</b> A <code>messageId</code>{" "}
            assigned by the producer once, carried unchanged through every redelivery of that
            same logical message.
          </li>
          <li>
            <b>Record processed message IDs durably.</b> A <code>processed_messages</code> table
            (or equivalent store) holding every <code>messageId</code> that's already been
            handled.
          </li>
          <li>
            <b>Check before processing, not after.</b> On receiving a message, the consumer
            checks whether its ID is already recorded; if so, it acknowledges and skips it
            without reprocessing.
          </li>
          <li>
            <b>Record the ID and apply the effect atomically.</b> Marking a message processed and
            performing its side effect (crediting an account, say) happen in the same local
            transaction, so a crash between the two can't cause either a missed effect or an
            undetectable duplicate.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="40" width="100" height="35" rx="5" />
            <text className="boxText" x="70" y="62" fontSize="8">Message (id=42)</text>
            <line className="flow" x1="120" y1="57" x2="190" y2="57" />
            <rect className="boxAccent" x="190" y="30" width="130" height="55" rx="6" />
            <text className="boxText" x="255" y="52" fontSize="8">seen id=42 before?</text>
            <text className="boxText" x="255" y="70" fontSize="7">yes: skip / no: process + record</text>
            <line className="flow" x1="320" y1="57" x2="390" y2="57" />
            <text className="figHint" x="395" y="52">effect happens</text>
            <text className="figHint" x="395" y="66">at most once</text>
          </svg>
          <figcaption>Every delivery checks the message ID first; a repeat is recognized and skipped instead of reapplied.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Checking and recording message IDs atomically</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class PointsCreditConsumer {
    private final Connection connection;

    void handle(Message message) throws SQLException {
        connection.setAutoCommit(false);
        try {
            if (alreadyProcessed(connection, message.id())) {
                connection.commit(); // safe no-op: this exact message was already applied
                return;
            }
            creditPoints(connection, message.accountId(), message.points()); // the actual effect
            markProcessed(connection, message.id()); // same transaction as the effect above
            connection.commit();
        } catch (SQLException e) {
            connection.rollback();
            throw e;
        }
    }

    private boolean alreadyProcessed(Connection c, String messageId) {
        // SELECT 1 FROM processed_messages WHERE message_id = ?
        return false;
    }
    private void creditPoints(Connection c, String accountId, int points) {
        // UPDATE accounts SET points = points + ? WHERE id = ?
    }
    private void markProcessed(Connection c, String messageId) {
        // INSERT INTO processed_messages(message_id, processed_at) VALUES (?, now())
    }
}

// A broker redelivering message id=42 after a slow ack still only credits the account once,
// because the second delivery finds it already recorded in processed_messages.`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Recording "processed" before the effect actually runs, or after, in a separate transaction.</b>{" "}
            A crash between the two steps either applies the effect twice (recorded second, crash
            before recording) or skips it forever (recorded first, crash before applying)
            &mdash; they must commit together.
          </li>
          <li>
            <b>Deriving a message ID from mutable content instead of a stable identifier assigned once.</b>{" "}
            An ID computed from the payload can differ across redeliveries if any field changes
            slightly, defeating the duplicate check entirely.
          </li>
          <li>
            <b>Assuming the message broker's own deduplication is enough.</b> Most brokers
            guarantee at-least-once delivery, not exactly-once; the consumer's own idempotency
            check is what actually closes the gap, not a broker setting.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why must <code>creditPoints()</code> and <code>markProcessed()</code> commit in the same local transaction rather than as two separate transactions?</p>
          <p>
            <b>Answer:</b> If they were separate transactions and the process crashed between
            them, one of two bad outcomes could happen: the credit could be applied but never
            recorded (so a redelivery would apply it again, double-crediting the account), or the
            message could be recorded as processed without the credit ever having happened (so
            the account permanently misses its points). Committing both in the same transaction
            guarantees they happen together or not at all, keeping the duplicate check accurate.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Idempotent Consumer closes the gap that at-least-once delivery leaves open &mdash; a
        stable message ID checked and recorded atomically with the effect it triggers is what
        turns "delivered more than once" into "applied exactly once."
      </p>
    </div>
  );
}
