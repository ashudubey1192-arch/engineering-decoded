export default function DomainEventsPublishingEventsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Publishing is the mechanical half of domain events: how an event created inside an
          aggregate method actually reaches its subscribers, reliably, without coupling the
          aggregate to the messaging technology. This article covers the pattern Cargoflow uses:
          collect events during the transaction, publish only after it commits.
        </p>
        <p>
          Getting this step wrong is how systems end up with events published for changes that
          later roll back, or lost events for changes that succeeded.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Why publish-after-commit, step by step</h2>
        <ol className="stepList">
          <li>
            <b>The aggregate collects events, it does not publish them directly.</b>{" "}
            <code>Shipment.markDelivered()</code> adds a <code>ShipmentDelivered</code> to an
            internal list; it has no reference to a message broker at all.
          </li>
          <li>
            <b>The application layer flushes the collected events after the repository save
            succeeds.</b> If the save fails and the transaction rolls back, the events are simply
            discarded &mdash; they never described anything that actually happened.
          </li>
          <li>
            <b>The publishing mechanism itself is swappable infrastructure.</b> In-process
            listeners today, a message broker like Kafka tomorrow &mdash; the aggregate's code
            never changes either way.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>THE BUG THIS PATTERN PREVENTS</small>
          <p>
            An earlier Cargoflow version published <code>ShipmentDelivered</code> directly inside
            <code> markDelivered()</code>. When the subsequent database save failed due to a
            constraint violation, Billing had already generated an invoice for a delivery that,
            from the database's perspective, never happened. Moving to publish-after-commit
            eliminated this entire class of bug.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="150" height="55" rx="8" />
            <text className="boxText" x="95" y="70">Shipment.markDelivered()</text>
            <text className="figHint" x="95" y="88">collects event</text>
            <line className="flow" x1="170" y1="72" x2="240" y2="72" />
            <rect className="boxAccent" x="240" y="45" width="150" height="55" rx="8" />
            <text className="boxText" x="315" y="70">repository.save()</text>
            <line className="flow" x1="390" y1="72" x2="460" y2="72" />
            <rect className="boxWarn" x="460" y="45" width="120" height="55" rx="8" />
            <text className="boxText" x="520" y="70">Publish</text>
            <text className="figHint" x="520" y="88">only after commit</text>
          </svg>
          <figcaption>Events are collected during the method call but flushed to subscribers only once the save has actually succeeded.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Collect, save, then flush</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public abstract class AggregateRoot {
    private final List<Object> pendingEvents = new ArrayList<>();
    protected void recordEvent(Object event) { pendingEvents.add(event); }
    public List<Object> pullPendingEvents() {
        List<Object> events = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return events;
    }
}

public final class Shipment extends AggregateRoot {
    public void markDelivered(ProofOfDelivery pod) {
        this.status = ShipmentStatus.DELIVERED;
        recordEvent(new ShipmentDelivered(id, pod, Instant.now())); // collected, not published
    }
}

@Transactional
public void deliverShipment(ShipmentId id, ProofOfDelivery pod) {
    Shipment shipment = shipmentRepository.findById(id).orElseThrow();
    shipment.markDelivered(pod);
    shipmentRepository.save(shipment); // if this throws, nothing below runs
    shipment.pullPendingEvents().forEach(eventPublisher::publish); // only after success
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Publishing directly inside the aggregate method.</b> This is exactly the bug
            Cargoflow hit &mdash; it couples the domain model to infrastructure and publishes
            events for changes that might still roll back.
          </li>
          <li>
            <b>Forgetting to flush pending events after a successful save.</b> The event silently
            never reaches any subscriber, and the bug is invisible until someone asks why Billing
            never generated an invoice.
          </li>
          <li>
            <b>Injecting a message broker client directly into the aggregate.</b> The aggregate
            should stay ignorant of Kafka, RabbitMQ, or any other transport &mdash; that knowledge
            belongs in the application and infrastructure layers.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What specifically went wrong when Cargoflow published <code>ShipmentDelivered</code> directly inside <code>markDelivered()</code>?</p>
          <p>
            <b>Answer:</b> When the subsequent database save failed, the event had already been
            published and Billing had already reacted to it, even though the delivery was never
            actually persisted &mdash; the event described something that, from the database's
            view, never happened.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Collect events inside the aggregate, and publish them only after the transaction that
        produced them has actually succeeded &mdash; never publish from inside the aggregate itself.
      </p>
    </div>
  );
}
