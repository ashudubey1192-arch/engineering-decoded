export default function AggregatesReferencingAggregatesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          When one aggregate needs to relate to another, it should reference it by identifier
          only &mdash; never hold a direct object reference. Cargoflow's <code>Shipment</code>{" "}
          holds a <code>CarrierId</code>, never a live <code>Carrier</code> object, even though
          <code> Carrier</code> is itself an aggregate root in the Fleet &amp; Routing context.
        </p>
        <p>
          This single rule is what keeps aggregate boundaries from silently merging back into one
          giant object graph over time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Why identifier references, not object references</h2>
        <ol className="stepList">
          <li>
            <b>It keeps each aggregate independently loadable.</b> Loading a <code>Shipment</code>{" "}
            never requires also loading a <code>Carrier</code>, even transitively &mdash; the two
            can be fetched, cached, and locked independently.
          </li>
          <li>
            <b>It prevents one transaction from silently spanning two aggregates.</b> An object
            reference makes it easy to accidentally call a mutating method on the referenced
            aggregate from inside the referencing one; an id reference makes that impossible.
          </li>
          <li>
            <b>It is honest about consistency.</b> A <code>CarrierId</code> can point to a carrier
            that was reassigned a moment ago; an embedded object reference would misleadingly
            imply the data is always current.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 580 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="40" y="45" width="180" height="60" rx="8" />
            <text className="boxText" x="130" y="70">Shipment</text>
            <text className="figHint" x="130" y="90">assignedCarrierId: "CAR-88"</text>
            <rect className="boxAccent" x="380" y="45" width="180" height="60" rx="8" />
            <text className="boxText" x="470" y="70">Carrier</text>
            <text className="figHint" x="470" y="90">id: "CAR-88"</text>
            <line className="flowMuted" x1="220" y1="75" x2="380" y2="75" />
            <text className="figHint" x="300" y="65">id only, no object link</text>
          </svg>
          <figcaption>The two aggregates stay independently loadable and independently consistent &mdash; the id is the only connection.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Referencing by id, resolving only when needed</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private CarrierId assignedCarrierId; // reference by id, never Carrier itself

    public void assignCarrier(CarrierId carrierId) {
        this.assignedCarrierId = carrierId;
        DomainEvents.publish(new CarrierAssigned(id, carrierId));
    }
}

// Only application code that genuinely needs Carrier details resolves the id,
// through Fleet & Routing's own repository -- never inside Shipment itself.
Carrier carrier = carrierRepository.findById(shipment.assignedCarrierId());`}</pre>
        </div>
        <p>
          <code>Shipment</code> never calls a method on <code>Carrier</code> directly &mdash; it
          only ever holds and passes along the id, matching the Anti-Corruption Layer and
          Customer/Supplier patterns from the strategic design section.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Embedding the full object via an ORM's lazy-loaded relationship.</b> JPA's
            <code> @ManyToOne</code> makes it easy to accidentally hold a live object reference
            across an aggregate boundary without meaning to.
          </li>
          <li>
            <b>Calling a mutating method on the referenced aggregate from inside the referencing
            one.</b> Even with an id reference, resolving it and then mutating the result from
            the wrong context breaks the same rule in a different disguise.
          </li>
          <li>
            <b>Assuming the referenced id always points to current, valid data.</b> The Carrier a
            <code> CarrierId</code> points to can change or be reassigned; code that resolves the
            reference must handle that, not assume the snapshot never goes stale.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>Shipment</code> hold a <code>CarrierId</code> instead of a direct reference to a <code>Carrier</code> object?</p>
          <p>
            <b>Answer:</b> A direct reference would tie the two aggregates' loading, locking, and
            consistency together, and make it easy to accidentally mutate Carrier from inside
            Shipment's code &mdash; an id reference keeps both aggregates independently loadable
            and their boundaries honest.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Cross-aggregate relationships go through identifiers only &mdash; never a live object
        reference, even when an ORM makes the shortcut tempting.
      </p>
    </div>
  );
}
