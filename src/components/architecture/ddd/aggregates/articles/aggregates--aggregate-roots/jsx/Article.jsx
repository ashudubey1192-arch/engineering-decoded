export default function AggregatesAggregateRootsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The aggregate root is the one entity inside an aggregate that the outside world is
          allowed to reference and call methods on directly. <code>Shipment</code> is the root of
          its aggregate; <code>Leg</code> is not &mdash; nothing outside the aggregate ever holds
          a direct reference to a <code>Leg</code> or calls a method on one.
        </p>
        <p>
          Every rule in this article exists to enforce one guarantee: the only way to change
          anything inside the aggregate is through the root.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The three rules that make something a root</h2>
        <ol className="stepList">
          <li>
            <b>It is the only member with global identity.</b> A <code>ShipmentId</code> is
            meaningful and lookup-able system-wide; a <code>Leg</code>'s identity is only
            meaningful inside its own <code>Shipment</code>.
          </li>
          <li>
            <b>It is the only thing repositories return.</b> As covered in the Repositories
            article, <code>ShipmentRepository</code> exists; <code>LegRepository</code> does not.
          </li>
          <li>
            <b>Every method that changes an internal member goes through it.</b> There is no
            <code> Leg.reschedule()</code> called directly by outside code &mdash; only
            <code> Shipment.rescheduleLeg(legId, newDeadline)</code>.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>WHY THIS MATTERS FOR THE DISTANCE INVARIANT</small>
          <p>
            If outside code could call <code>leg.setDistance(9999)</code> directly, the aggregate
            boundary's whole reason for existing &mdash; enforcing the total-distance invariant
            atomically &mdash; would be bypassed instantly. Routing every change through the root
            is what makes the invariant from the previous article actually hold.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="60" y="60" width="140" height="55" rx="8" />
            <text className="boxText" x="130" y="93">Outside code</text>
            <rect className="boxAccent" x="260" y="60" width="140" height="55" rx="8" />
            <text className="boxText" x="330" y="93">Shipment (root)</text>
            <rect className="box" x="460" y="30" width="100" height="45" rx="8" />
            <text className="boxText" x="510" y="57">Leg</text>
            <rect className="box" x="460" y="95" width="100" height="45" rx="8" />
            <text className="boxText" x="510" y="122">Leg</text>
            <line className="flow" x1="200" y1="87" x2="260" y2="87" />
            <line className="flow" x1="400" y1="75" x2="460" y2="52" />
            <line className="flow" x1="400" y1="100" x2="460" y2="117" />
            <line className="flowMuted" x1="130" y1="115" x2="510" y2="52" />
            <text className="figHint" x="320" y="145">the muted diagonal line is forbidden</text>
          </svg>
          <figcaption>Every path into the aggregate's internals goes through the root; a direct line to a Leg is not allowed to exist.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Routing every change through the root</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private final List<Leg> legs = new ArrayList<>();

    public void rescheduleLeg(LegId legId, Instant newDeadline) {
        Leg leg = findLeg(legId);
        leg.reschedule(newDeadline); // package-private method, called only from here
        enforceDeadlineInvariant();  // re-checked after every internal change
    }

    public List<LegSummary> legSummaries() { // read-only view, never the mutable Leg objects
        return legs.stream().map(Leg::toSummary).toList();
    }
}`}</pre>
        </div>
        <p>
          Outside code calls <code>shipment.rescheduleLeg(id, deadline)</code>, never
          <code> leg.reschedule(deadline)</code> directly &mdash; and even read access returns an
          immutable <code>LegSummary</code>, not the mutable <code>Leg</code> itself.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Returning the internal mutable list directly from a getter.</b>{" "}
            <code>shipment.getLegs()</code> returning the live <code>List&lt;Leg&gt;</code> lets
            outside code add or remove legs without ever calling a root method.
          </li>
          <li>
            <b>Giving a non-root entity a public setter.</b> Any public mutator on <code>Leg</code>{" "}
            is a bypass of the root, whether or not it is ever actually called from outside.
          </li>
          <li>
            <b>Letting a non-root member hold a reference to something outside the aggregate.</b>{" "}
            That member could then reach outside the boundary on the root's behalf, without the
            root's knowledge.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>legSummaries()</code> return <code>LegSummary</code> objects instead of the actual <code>Leg</code> list?</p>
          <p>
            <b>Answer:</b> Returning the live, mutable <code>Leg</code> objects would let outside
            code call mutating methods on them directly, bypassing the root entirely and breaking
            the guarantee that every change goes through <code>Shipment</code>.
          </p>
        </div>
      </section>
      <p className="takeaway">
        The aggregate root is the single door into the aggregate &mdash; no getter, no method, and
        no reference should ever let outside code reach an internal member directly.
      </p>
    </div>
  );
}
