export default function DomainEventsEventNamingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A domain event's name should read as a completed fact, in the ubiquitous language,
          using past tense. <code>ShipmentDelivered</code> is correctly named;
          <code> DeliverShipment</code>, <code>ShipmentDeliveryUpdate</code>, and
          <code> ShipmentStatusChanged</code> are all naming mistakes this article explains how
          to avoid.
        </p>
        <p>
          Naming discipline matters more for events than almost anything else in tactical DDD,
          because an event's name is a contract other bounded contexts subscribe to directly.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Three naming rules, applied step by step</h2>
        <ol className="stepList">
          <li>
            <b>Use past tense, always.</b> An event describes something that has already
            happened. <code>ShipmentDelivered</code>, not <code>ShipmentDelivery</code> or
            <code> DeliverShipment</code>.
          </li>
          <li>
            <b>Be specific about what happened, not generic.</b>{" "}
            <code>ShipmentStatusChanged</code> forces every subscriber to inspect a payload to
            figure out which change occurred; <code>ShipmentDelivered</code> and
            <code> ShipmentCancelled</code> as separate, specific events let subscribers pick
            exactly what they care about.
          </li>
          <li>
            <b>Name it from the perspective of the aggregate that raised it, using its own
            ubiquitous language.</b> The Cancellation resolution work from the Ubiquitous
            Language section directly determined that Cargoflow needed three distinct event
            names, not one.
          </li>
        </ol>
        <div className="twoCol">
          <div>
            <h3>Good names</h3>
            <p><code>ShipmentBooked</code>, <code>CarrierAssigned</code>, <code>ShipmentDelivered</code>, <code>ShipperCancelled</code></p>
          </div>
          <div>
            <h3>Bad names</h3>
            <p><code>ShipmentUpdate</code>, <code>UpdateShipmentStatus</code>, <code>ShipmentEvent</code>, <code>OnShipmentChange</code></p>
          </div>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="30" y="45" width="200" height="55" rx="8" />
            <text className="boxText" x="130" y="70">ShipmentStatusChanged</text>
            <text className="figHint" x="130" y="88">generic, needs a payload lookup</text>
            <line className="flow" x1="230" y1="72" x2="290" y2="72" />
            <rect className="boxAccent" x="290" y="20" width="200" height="45" rx="8" />
            <text className="boxText" x="390" y="47">ShipmentDelivered</text>
            <rect className="boxAccent" x="290" y="75" width="200" height="45" rx="8" />
            <text className="boxText" x="390" y="102">ShipmentCancelled</text>
          </svg>
          <figcaption>Splitting a generic event into specific, precisely named ones lets subscribers filter without inspecting payloads.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Specific events, subscribed to selectively</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public record ShipmentDelivered(ShipmentId id, ProofOfDelivery pod, Instant deliveredAt) {}
public record ShipmentCancelled(ShipmentId id, CancellationReason reason, Instant cancelledAt) {}

// Billing only cares about deliveries -- it subscribes to exactly one event type.
@EventListener
public void onShipmentDelivered(ShipmentDelivered event) {
    invoiceRepository.save(Invoice.forDeliveredShipment(event.id(), event.deliveredAt()));
}`}</pre>
        </div>
        <p>
          Because the event is named and typed specifically, Billing never needs a switch
          statement inspecting a generic payload to figure out whether it cares &mdash; the event
          type itself is the filter.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Naming events after the technical trigger instead of the business fact.</b>{" "}
            <code>DatabaseRowUpdated</code> describes a mechanism, not something a domain expert
            would recognize.
          </li>
          <li>
            <b>Using present or imperative tense.</b> <code>CancelShipment</code> reads as a
            command someone could reject; an event has already happened and cannot be refused.
          </li>
          <li>
            <b>Renaming an already-published event casually.</b> Once other contexts subscribe to
            an event name, renaming it is a breaking contract change, not a local refactor.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is <code>ShipmentStatusChanged</code> a worse name than three separate events like <code>ShipmentDelivered</code> and <code>ShipmentCancelled</code>?</p>
          <p>
            <b>Answer:</b> A generic event forces every subscriber to inspect the payload to
            determine which specific thing happened. Specific event names let subscribers declare
            exactly what they care about and ignore the rest without any payload inspection.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Name events as specific, past-tense business facts in the ubiquitous language &mdash;
        the name is a contract, so precision here pays off every place the event is consumed.
      </p>
    </div>
  );
}
