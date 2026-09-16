export default function AggregatesAggregateBoundariesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An aggregate is a cluster of entities and value objects treated as one unit for the
          purpose of data changes, with one member designated the aggregate root (next article)
          as its single entry point. The aggregate boundary decides exactly which objects are
          inside that cluster. Cargoflow's <code>Shipment</code> aggregate contains
          <code> Shipment</code> itself and its <code>Leg</code> objects &mdash; nothing else.
        </p>
        <p>
          This is tactical modeling's most consequential boundary decision: too large, and every
          change contends for the same lock; too small, and invariants that should be atomic
          become impossible to enforce.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A step-by-step process for drawing an aggregate boundary</h2>
        <ol className="stepList">
          <li>
            <b>Start from a true invariant, not a data relationship.</b> "The sum of all Legs'
            distances must not exceed the shipment's contracted maximum" is a real invariant that
            spans <code>Shipment</code> and <code>Leg</code> together.
          </li>
          <li>
            <b>Include only what that invariant needs to check atomically.</b> <code>Leg</code>{" "}
            must be inside the boundary because the invariant needs every leg's distance at once;
            <code> Carrier</code> does not, because the invariant never inspects carrier data.
          </li>
          <li>
            <b>Exclude anything that can be referenced by identifier instead.</b> The assigned
            <code> Carrier</code> is referenced by <code>CarrierId</code>, not embedded &mdash;
            covered in the Referencing Aggregates article.
          </li>
          <li>
            <b>Check the result against the "one transaction, one aggregate" rule</b> from the
            Transaction Boundaries article later in this section.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 580 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="60" y="30" width="300" height="130" rx="12" />
            <text className="figLabel" x="210" y="55">SHIPMENT AGGREGATE</text>
            <text className="boxText" x="150" y="90">Shipment (root)</text>
            <text className="boxText" x="150" y="115">Leg</text>
            <text className="boxText" x="270" y="115">Leg</text>
            <text className="figHint" x="210" y="145">everything the distance invariant needs</text>
            <rect className="box" x="420" y="70" width="140" height="50" rx="8" />
            <text className="boxText" x="490" y="100">Carrier (by id only)</text>
            <line className="flowMuted" x1="360" y1="95" x2="420" y2="95" />
          </svg>
          <figcaption>The boundary is drawn exactly wide enough to enforce the invariant, referencing everything else by identifier.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The boundary, expressed as Java field visibility</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment { // the aggregate root
    private final ShipmentId id;
    private final List<Leg> legs = new ArrayList<>(); // inside the boundary
    private CarrierId assignedCarrierId; // outside the boundary, referenced by id

    void addLeg(Leg leg) { // package-private: only reachable through Shipment's own methods
        legs.add(leg);
        enforceDistanceInvariant();
    }
}`}</pre>
        </div>
        <p>
          <code>Leg</code> objects are never returned as a mutable list to outside callers, and
          <code> Carrier</code> never appears as an embedded object at all &mdash; the boundary
          drawn on paper is enforced directly by what the class exposes.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Drawing the boundary around a foreign-key relationship instead of an invariant.</b>{" "}
            Just because <code>Shipment</code> and <code>Carrier</code> are related in the
            database does not mean they belong in one aggregate.
          </li>
          <li>
            <b>Making the aggregate too large "to be safe."</b> Every additional object inside the
            boundary is one more thing contending for the same lock on every write.
          </li>
          <li>
            <b>Making it too small and splitting an invariant across two aggregates.</b> That
            leaves the invariant either unenforceable atomically or enforced through unreliable
            cross-aggregate coordination.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is <code>Leg</code> inside the Shipment aggregate boundary but <code>Carrier</code> is not?</p>
          <p>
            <b>Answer:</b> The distance invariant needs every Leg's data at once to be checked
            atomically, so Legs must be inside. The invariant never inspects Carrier data, so
            Carrier can safely live outside, referenced only by id.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Draw an aggregate boundary from a genuine invariant that must hold atomically &mdash;
        include only what that invariant needs, and reference everything else by identifier.
      </p>
    </div>
  );
}
