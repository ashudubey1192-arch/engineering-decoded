export default function ContextIntegrationAsynchronousIntegrationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Asynchronous integration connects bounded contexts through messages delivered over
          time, instead of a synchronous call that blocks until the other context responds. The
          Domain Events section covered publishing and handling events inside one process;
          this article is about the same idea crossing a network boundary between contexts, with
          the failure modes that come with it.
        </p>
        <p>
          Cargoflow's Booking-to-Billing integration moved from a synchronous REST call to an
          asynchronous message after a Billing outage once took Booking down with it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Choosing async over sync, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Ask whether the caller genuinely needs an immediate answer.</b> Booking does not
            need to know Billing successfully generated an invoice before confirming a delivery to
            the driver &mdash; a synchronous call there was coupling two decisions that don't
            need to happen together.
          </li>
          <li>
            <b>Ask what should happen if the receiving context is down.</b> With a synchronous
            call, Booking's delivery confirmation fails when Billing is down. With an asynchronous
            message, the message queues and Billing catches up once it recovers &mdash; Booking's
            core flow is unaffected either way.
          </li>
          <li>
            <b>Choose the messaging guarantee deliberately: at-least-once is the common default.</b>{" "}
            This is exactly why the Event Handlers article made idempotency mandatory, not
            optional &mdash; asynchronous integration is where that requirement actually bites.
          </li>
          <li>
            <b>Design for message ordering explicitly, or explicitly decide it doesn't matter.</b>{" "}
            If <code>CarrierAssigned</code> could ever be processed after{" "}
            <code>Delivered</code> for the same shipment, that needs a deliberate answer, not an
            assumption.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="130" height="50" rx="8" />
            <text className="boxText" x="85" y="80" fontSize="12">Booking</text>
            <rect className="boxAccent" x="220" y="50" width="120" height="50" rx="8" />
            <text className="boxText" x="280" y="80" fontSize="11">Message queue</text>
            <rect className="box" x="410" y="50" width="130" height="50" rx="8" />
            <text className="boxText" x="475" y="80" fontSize="12">Billing</text>
            <line className="flow" x1="150" y1="75" x2="220" y2="75" />
            <line className="flowMuted" x1="340" y1="75" x2="410" y2="75" />
            <text className="figHint" x="280" y="35">Booking proceeds even if Billing is down</text>
          </svg>
          <figcaption>The queue absorbs the outage: Booking's write succeeds and completes regardless of Billing's availability.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Publishing without waiting for the consumer</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Booking side: publish and move on, no dependency on Billing's availability
@Transactional
public void deliverShipment(ShipmentId id, ProofOfDelivery pod) {
    Shipment shipment = shipmentRepository.findById(id).orElseThrow();
    shipment.markDelivered(pod);
    shipmentRepository.save(shipment);
    shipment.pullPendingEvents().forEach(messageBroker::publishAsync); // fire-and-forget
    // deliverShipment() returns successfully here, whether or not Billing is even running
}

// Billing side: consumes independently, whenever it is able to
@KafkaListener(topics = "shipment-events")
public void onShipmentDelivered(ShipmentDelivered event) {
    if (invoiceRepository.existsForShipment(event.id())) return; // idempotent, as always
    invoiceRepository.save(Invoice.forDeliveredShipment(event.id(), event.deliveredAt()));
}`}</pre>
        </div>
        <p>
          <code>deliverShipment()</code> never calls Billing directly or waits on it &mdash; the
          message broker is the only coupling between the two contexts, and it tolerates either
          side being temporarily unavailable.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for asynchronous integration everywhere, even where an immediate answer is
            actually required.</b> A payment authorization the customer is waiting on needs a
            synchronous answer; async here just adds unhelpful complexity.
          </li>
          <li>
            <b>Skipping idempotency because "the queue guarantees exactly-once."</b> Almost no
            production messaging system actually offers that guarantee end-to-end; assume
            at-least-once regardless of what the broker claims.
          </li>
          <li>
            <b>Treating the message queue as a database.</b> A consumer that is down for a day
            should catch up, not silently lose messages &mdash; but the queue is a transport, not
            a permanent system of record; Billing's own database remains the source of truth for
            invoices.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why did moving Booking-to-Billing integration from synchronous to asynchronous stop a Billing outage from taking Booking down too?</p>
          <p>
            <b>Answer:</b> With a synchronous call, Booking's delivery confirmation flow directly
            depended on Billing responding, so Billing being down broke Booking too. With
            asynchronous messaging, Booking publishes to a queue and completes its own
            transaction regardless of Billing's availability; Billing catches up once it recovers.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Choose asynchronous integration when the caller doesn't need an immediate answer and
        should survive the other context being down &mdash; and treat idempotency and ordering as
        required design decisions, not afterthoughts.
      </p>
    </div>
  );
}
