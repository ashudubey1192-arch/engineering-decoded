export default function AppliedDddDddCaseStudyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          This course has built one running example, Cargoflow, article by article: a discovery
          workshop that produced three bounded contexts, a <code>Shipment</code> aggregate with a
          real invariant, domain events connecting Booking to Billing, and an architecture that
          protected all of it. This closing case study retraces that path end to end, as one
          story, and shows where it went next.
        </p>
        <p>
          Nothing here is a new pattern &mdash; it is the same system, seen as a whole.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Cargoflow's path through this course, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Strategic design.</b> A discovery workshop's event storming produced three
            bounded contexts &mdash; Booking, Billing, Routing &mdash; with Booking identified as
            the core domain, per the Core Domain Investment article, and a context map recording
            Billing as a Customer-Supplier consumer of Booking's events.
          </li>
          <li>
            <b>Tactical design.</b> Inside Booking, <code>Shipment</code> became the aggregate
            root protecting the contracted-distance invariant across its <code>Leg</code> value
            objects, with <code>ShipmentRepository</code> as its persistence port and{" "}
            <code>JpaShipmentRepository</code> as the adapter implementing it.
          </li>
          <li>
            <b>Domain events.</b> <code>ShipmentDelivered</code>, collected inside{" "}
            <code>markDelivered()</code> and published only after a successful save, let Billing
            react without Booking knowing Billing exists &mdash; eventually consistent by design,
            not by accident.
          </li>
          <li>
            <b>Architecture.</b> A layered, then hexagonal, structure kept the domain package free
            of framework imports, enforced by an architecture test; Booking, Billing, and Routing
            shipped for over a year as one modular monolith before Billing earned its own service.
          </li>
          <li>
            <b>Integration.</b> When Billing split out, its in-process facade call became an
            asynchronous <code>ShipmentDeliveredIntegrationEvent</code>, deliberately mapped from
            the internal domain event rather than published directly.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="15" width="140" height="35" rx="6" />
            <text className="boxText" x="90" y="37" fontSize="10">Discovery workshop</text>
            <line className="flow" x1="160" y1="32" x2="200" y2="32" />
            <rect className="boxWarn" x="200" y="15" width="140" height="35" rx="6" />
            <text className="boxText" x="270" y="37" fontSize="10">Context map</text>
            <line className="flow" x1="340" y1="32" x2="380" y2="32" />
            <rect className="boxWarn" x="380" y="15" width="160" height="35" rx="6" />
            <text className="boxText" x="460" y="37" fontSize="10">Shipment aggregate</text>
            <line className="flowMuted" x1="90" y1="50" x2="90" y2="90" />
            <rect className="box" x="20" y="90" width="140" height="35" rx="6" />
            <text className="boxText" x="90" y="112" fontSize="10">Domain events</text>
            <line className="flow" x1="160" y1="107" x2="200" y2="107" />
            <rect className="box" x="200" y="90" width="140" height="35" rx="6" />
            <text className="boxText" x="270" y="112" fontSize="10">Modular monolith</text>
            <line className="flow" x1="340" y1="107" x2="380" y2="107" />
            <rect className="boxAccent" x="380" y="90" width="160" height="35" rx="6" />
            <text className="boxText" x="460" y="112" fontSize="10">Microservice split</text>
          </svg>
          <figcaption>The full path, in order: strategic design, tactical design, events and architecture, then a deliberate, late split into services.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The whole flow, as one call</h2>
        <span className="codeLabel">JAVA &mdash; EVERY LAYER OF THIS COURSE, IN ONE REQUEST</span>
        <div className="codeBlock">
          <pre>{`// interface adapters ring: controller, per the Clean Architecture article
@PostMapping("/shipments/{id}/deliver")
public void deliver(@PathVariable String id, @RequestBody ProofOfDeliveryDto dto) {
    deliverShipmentUseCase.execute(new ShipmentId(id), dto.toDomain());
}

// application layer: orchestration only, per the Layered Architecture article
@Transactional
public void execute(ShipmentId id, ProofOfDelivery pod) {
    Shipment shipment = shipmentRepository.findById(id).orElseThrow(); // port
    shipment.markDelivered(pod); // tactical DDD: the invariant lives here
    shipmentRepository.save(shipment);
    shipment.pullPendingEvents().forEach(eventPublisher::publish); // domain event, post-commit
}

// Billing, a separate service by this point, reacting asynchronously
@KafkaListener(topics = "shipment-events")
public void onShipmentDelivered(ShipmentDeliveredIntegrationEvent event) {
    if (invoiceRepository.existsForShipment(event.shipmentId())) return; // idempotent
    invoiceRepository.save(Invoice.forDeliveredShipment(event.shipmentId(), event.deliveredAt()));
}`}</pre>
        </div>
        <p>
          Every line traces back to a specific article in this course &mdash; none of it is new
          here, only assembled.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. What Cargoflow would have gotten wrong without DDD</h2>
        <ul>
          <li>
            <b>No aggregate boundary.</b> Without <code>Shipment</code> enforcing its own
            invariant, the distance limit would have been three duplicated checks scattered
            across services, exactly the anemic pattern the Common DDD Mistakes article warned
            against.
          </li>
          <li>
            <b>No context boundary.</b> Without the discovery workshop's context map, Booking and
            Billing likely would have shared one database table, coupling their release schedules
            together indefinitely.
          </li>
          <li>
            <b>A premature microservice split.</b> Splitting Billing out on day one, before the
            module boundary had proven itself, would have paid a distributed-systems cost for a
            boundary that hadn't yet been validated.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Looking at Cargoflow's full path, why did the microservice split happen last, after strategic design, tactical modeling, and a year as a modular monolith &mdash; not first?</p>
          <p>
            <b>Answer:</b> Every earlier step de-risked the split: the discovery workshop
            established the context boundary, tactical modeling proved the aggregate's shape, and
            the modular monolith validated that the module boundary held under real development
            pressure. Splitting into services only pays off once that boundary is proven stable;
            doing it first would have meant paying distributed-systems costs for a guess.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Cargoflow is this course's argument made concrete: strategic design finds the boundaries,
        tactical design protects the rules inside them, and architecture and integration choices
        &mdash; including if and when to split into services &mdash; come last, earned rather than
        assumed.
      </p>
    </div>
  );
}
