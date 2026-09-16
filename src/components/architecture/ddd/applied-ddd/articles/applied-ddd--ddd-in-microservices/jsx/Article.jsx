export default function AppliedDddDddInMicroservicesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A microservice should map to a bounded context, not the other way around. The Modular
          Monoliths article asked whether a context needs its own deployment; this article covers
          what changes when the answer becomes yes, and why letting a bounded context drive the
          service boundary &mdash; rather than picking service boundaries first and forcing
          contexts to fit &mdash; is what makes microservices tractable at all.
        </p>
        <p>
          Cargoflow split Billing out of its modular monolith into its own service only after
          the facade boundary from that article had held cleanly for over a year.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Deciding to split, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Confirm the module boundary is already clean before considering a network
            boundary.</b> If <code>BillingFacade</code> is still leaking implementation details or
            frequently changing alongside Booking's internals, splitting only turns a code smell
            into a network problem.
          </li>
          <li>
            <b>Split along the existing bounded context, never across it.</b> Billing becomes one
            service because it was already one bounded context with one team and one ubiquitous
            language &mdash; not split further into "billing-reads" and "billing-writes" services
            for purely technical reasons.
          </li>
          <li>
            <b>Replace the in-process facade call with the integration patterns from the
            context-integration section.</b> <code>BillingFacade.generateInvoice()</code> becomes
            an asynchronous <code>ShipmentDeliveredIntegrationEvent</code> handler, per the
            Integration Events and Asynchronous Integration articles &mdash; no new concepts, just
            a new transport.
          </li>
          <li>
            <b>Accept that each service now needs its own aggregate persistence and its own
            deployment, and budget for that cost explicitly.</b> The Modular Monolith article's
            single deployable becomes two, each independently versioned and operated.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="30" width="200" height="100" rx="8" />
            <text className="figLabel" x="120" y="20">modular monolith</text>
            <text className="boxText" x="120" y="70" fontSize="11">Booking | Billing</text>
            <text className="figHint" x="120" y="90">in-process facade call</text>
            <line className="flow" x1="240" y1="80" x2="300" y2="80" />
            <rect className="boxAccent" x="300" y="20" width="90" height="45" rx="6" />
            <text className="boxText" x="345" y="47" fontSize="10">Booking svc</text>
            <rect className="boxAccent" x="300" y="95" width="90" height="45" rx="6" />
            <text className="boxText" x="345" y="122" fontSize="10">Billing svc</text>
            <text className="figHint" x="345" y="80">async event</text>
          </svg>
          <figcaption>The context boundary doesn't move when it becomes a service boundary &mdash; only the transport between the two sides changes.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The facade call becomes an event handler, same contract</h2>
        <span className="codeLabel">JAVA &mdash; BEFORE (MODULAR MONOLITH)</span>
        <div className="codeBlock">
          <pre>{`// in-process, same deployable
public void deliverShipment(ShipmentId id, ProofOfDelivery pod) {
    shipment.markDelivered(pod);
    shipmentRepository.save(shipment);
    billingFacade.generateInvoiceFor(shipment.id(), shipment.deliveredAt()); // direct call
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; AFTER (SEPARATE SERVICES)</span>
        <div className="codeBlock">
          <pre>{`// Booking service: unchanged except the last line
public void deliverShipment(ShipmentId id, ProofOfDelivery pod) {
    shipment.markDelivered(pod);
    shipmentRepository.save(shipment);
    eventPublisher.publishExternal(ShipmentDeliveredIntegrationEvent.from(shipment)); // async now
}

// Billing service: its own deployable, its own database, consuming the same event shape
@KafkaListener(topics = "shipment-events")
public void onShipmentDelivered(ShipmentDeliveredIntegrationEvent event) { /* unchanged logic */ }`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Splitting services before the bounded context boundary is actually stable.</b> A
            boundary that still moves monthly inside a monolith will be far more expensive to
            move across a network.
          </li>
          <li>
            <b>Creating microservices around technical layers instead of bounded contexts.</b> A
            "shipment-database service" and a "shipment-api service" recreate a distributed
            monolith with none of DDD's boundary benefits.
          </li>
          <li>
            <b>Underestimating the operational cost of the split.</b> Two deployables mean two
            on-call rotations, two release pipelines, and the eventual consistency this course
            covered &mdash; real costs that must be worth paying, not assumed away.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why did Cargoflow wait until <code>BillingFacade</code>'s module boundary had held cleanly for over a year before splitting Billing into its own service?</p>
          <p>
            <b>Answer:</b> A module boundary that is still leaking or shifting means the bounded
            context itself hasn't stabilized yet. Splitting an unstable boundary into a network
            service turns a cheap-to-fix code problem into an expensive-to-fix distributed-systems
            problem.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Let a bounded context earn its own service by staying stable as a module first &mdash;
        the split then changes only the transport between contexts, reusing the same integration
        patterns and the same tactical model on each side.
      </p>
    </div>
  );
}
