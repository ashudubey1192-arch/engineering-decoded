export default function TacticalModelingEntitiesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An entity is a domain object defined by a persistent identity, not by its attributes.
          Two <code>Shipment</code> objects with identical origin, destination, and status are
          still different shipments if their identifiers differ &mdash; and one shipment stays
          "the same shipment" even after every one of its attributes changes over its lifetime.
        </p>
        <p>
          This is the first of tactical modeling's core building blocks. Getting entities right is
          foundational because aggregates, covered two sections from now, are built from them.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Identity, tracked through change</h2>
        <ol className="stepList">
          <li>
            <b>Assign identity at creation, never derive it from attributes.</b> A
            <code> ShipmentId</code> is generated once when a shipment is booked, independent of
            origin, destination, or anything else that might later change.
          </li>
          <li>
            <b>Define equality by identity, not by field comparison.</b> <code>Shipment.equals()</code>{" "}
            compares only <code>id</code>; two shipments with every other field identical but
            different ids are not equal.
          </li>
          <li>
            <b>Let attributes change freely across the entity's lifetime.</b> A shipment's status,
            carrier, and even its route can change after booking; its identity never does.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>THE TEST THAT SEPARATES ENTITY FROM VALUE OBJECT</small>
          <p>
            Ask: "if every attribute changed, would a domain expert still call it the same thing?"
            A shipment that gets rerouted, reassigned to a different carrier, and delayed is still
            "the same shipment" throughout &mdash; that continuity of identity is what makes it an
            entity. A <code>Money</code> amount that changes from $50 to $60 is not "the same
            money that changed" &mdash; it is simply a different amount, which is why Money is a
            value object instead, covered in the next article.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 170" xmlns="http://www.w3.org/2000/svg">
            <circle className="ringNode" cx="90" cy="90" r="10" />
            <text className="ringKey" x="90" y="115">id: SHP-4471</text>
            <rect className="box" x="180" y="40" width="130" height="45" rx="6" />
            <text className="boxText" x="245" y="67">status: BOOKED</text>
            <rect className="box" x="180" y="100" width="130" height="45" rx="6" />
            <text className="boxText" x="245" y="127">status: DELIVERED</text>
            <line className="flow" x1="100" y1="90" x2="180" y2="62" />
            <line className="flow" x1="100" y1="90" x2="180" y2="122" />
            <text className="figHint" x="420" y="90">same identity, different attribute states over time</text>
          </svg>
          <figcaption>The identity node stays fixed while the attributes it points to change across the entity's lifecycle.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Identity-based equality in Java</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private final ShipmentId id; // assigned once, never reassigned
    private ShipmentStatus status;
    private Carrier carrier;

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof Shipment that)) return false;
        return this.id.equals(that.id); // identity only, never attributes
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}`}</pre>
        </div>
        <p>
          <code>equals()</code> and <code>hashCode()</code> intentionally ignore
          <code> status</code> and <code>carrier</code> &mdash; identity is the only thing that
          defines sameness for an entity.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Generating <code>equals()</code>/<code>hashCode()</code> from all fields via an
            IDE or Lombok default.</b> That produces attribute-based equality, which is correct
            for value objects but wrong for entities.
          </li>
          <li>
            <b>Using a mutable database auto-increment id before the row is saved.</b> Identity
            should be assignable at creation, before persistence, so the entity is valid the
            moment it exists in memory.
          </li>
          <li>
            <b>Letting identity itself become mutable.</b> If <code>ShipmentId</code> could be
            reassigned, every downstream reference and repository lookup would silently break.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Two Shipment objects have the same origin, destination, and status, but different ShipmentId values. Are they equal?</p>
          <p>
            <b>Answer:</b> No. Entities are defined by identity, not attribute values &mdash; two
            shipments with identical attributes but different ids are two distinct shipments.
          </p>
        </div>
      </section>
      <p className="takeaway">
        An entity's defining feature is identity that persists through attribute change &mdash;
        base equality on identity alone, never on the fields that happen to hold it together.
      </p>
    </div>
  );
}
