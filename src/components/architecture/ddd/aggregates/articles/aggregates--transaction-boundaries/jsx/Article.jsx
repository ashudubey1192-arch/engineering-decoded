export default function AggregatesTransactionBoundariesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The rule "one transaction should modify exactly one aggregate instance" is one of the
          most load-bearing guidelines in tactical DDD. Every business operation on Cargoflow's
          <code> Shipment</code> &mdash; adding a leg, reassigning a carrier, marking delivered
          &mdash; commits as a single transaction touching only that one aggregate instance.
        </p>
        <p>
          This article explains why the rule exists and what to do with operations that seem to
          need more than one aggregate at once.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Why one transaction, one aggregate</h2>
        <div className="twoCol">
          <div>
            <h3>Scalability</h3>
            <p>
              A transaction spanning two aggregates needs to lock both, increasing contention.
              Confined to one, aggregates can be modified concurrently without conflicting.
            </p>
          </div>
          <div>
            <h3>Consistency clarity</h3>
            <p>
              It forces an honest answer to "does this really need to be atomic?" Most
              cross-aggregate effects turn out to be fine as eventually consistent, coordinated
              through domain events instead.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>A CASE THAT LOOKS LIKE IT NEEDS TWO AGGREGATES</small>
          <p>
            "When a shipment is delivered, generate an invoice." Delivering the shipment and
            generating the invoice touch two different aggregates &mdash; <code>Shipment</code>{" "}
            and <code>Invoice</code>, in a different bounded context entirely. Forcing both into
            one transaction would violate the rule and reach across a context boundary at the same
            time. The correct approach: <code>Shipment.markDelivered()</code> commits alone and
            publishes <code>ShipmentDelivered</code>; Billing reacts to that event afterward, in
            its own separate transaction.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="45" width="180" height="55" rx="8" />
            <text className="boxText" x="120" y="70">Shipment.markDelivered()</text>
            <text className="figHint" x="120" y="88">transaction 1</text>
            <line className="flow" x1="210" y1="72" x2="290" y2="72" />
            <rect className="box" x="290" y="45" width="140" height="55" rx="8" />
            <text className="boxText" x="360" y="72">ShipmentDelivered</text>
            <line className="flow" x1="430" y1="72" x2="500" y2="72" />
            <rect className="boxAccent" x="500" y="45" width="80" height="55" rx="8" />
            <text className="boxText" x="540" y="65">Invoice</text>
            <text className="figHint" x="540" y="83">transaction 2</text>
          </svg>
          <figcaption>Two transactions, connected by an event, instead of one transaction spanning two aggregates.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One transaction per aggregate, in code</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`@Transactional
public void deliverShipment(ShipmentId id, ProofOfDelivery pod) {
    Shipment shipment = shipmentRepository.findById(id).orElseThrow();
    shipment.markDelivered(pod); // publishes ShipmentDelivered internally
    shipmentRepository.save(shipment);
} // transaction ends here -- Invoice is not touched in this method at all

@EventListener
@Transactional // a separate transaction, possibly a separate process entirely
public void onShipmentDelivered(ShipmentDelivered event) {
    Invoice invoice = Invoice.forDeliveredShipment(event.shipmentId(), event.deliveredAt());
    invoiceRepository.save(invoice);
}`}</pre>
        </div>
        <p>
          Each method has its own <code>@Transactional</code> boundary, touching exactly one
          aggregate &mdash; the event is what carries the effect across, asynchronously.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Loading and saving two aggregates inside one transactional method "for
            simplicity."</b> It is simpler to write, but it recreates cross-aggregate locking and
            usually crosses a bounded-context boundary too.
          </li>
          <li>
            <b>Assuming the rule means "never coordinate multiple aggregates at all."</b>{" "}
            Coordination is fine and common &mdash; it should just happen through events across
            separate transactions, not one shared transaction.
          </li>
          <li>
            <b>Skipping the rule for "just this one" operation under deadline pressure.</b> Each
            exception makes the next one easier to justify, and the scalability property erodes
            gradually rather than all at once.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why doesn't <code>deliverShipment()</code> also create the Invoice directly, in the same transaction?</p>
          <p>
            <b>Answer:</b> Invoice belongs to a different aggregate in a different bounded
            context. Combining them in one transaction would violate the one-transaction-per-
            aggregate rule and reach across a context boundary; publishing an event and letting
            Billing react separately keeps both rules intact.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Keep each transaction scoped to exactly one aggregate instance &mdash; coordinate
        everything beyond that through domain events and eventual consistency.
      </p>
    </div>
  );
}
