export default function DddFoundationsStrategicVsTacticalDddArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Strategic DDD decides where the boundaries between parts of a system live. Tactical DDD
          decides what goes on inside one of those boundaries. They are separate skill sets that
          solve different problems, and teams that only learn one of them tend to apply DDD badly.
        </p>
        <p>
          This article draws the line precisely, because later sections dive deep into each half
          separately and it helps to know which hat you are wearing.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Two different questions</h2>
        <table className="miniTable">
          <caption>STRATEGIC VS. TACTICAL</caption>
          <thead>
            <tr><th>Strategic DDD</th><th>Tactical DDD</th></tr>
          </thead>
          <tbody>
            <tr><td>Should Billing be its own bounded context, separate from Booking?</td><td>Should <code>Money</code> be a value object or a raw <code>BigDecimal</code>?</td></tr>
            <tr><td>How does Fleet &amp; Routing tell Booking that a carrier fell through?</td><td>What invariant does the <code>Shipment</code> aggregate protect?</td></tr>
            <tr><td>Which context is Cargoflow's core competitive differentiator?</td><td>Which method publishes the <code>ShipmentDelayed</code> event?</td></tr>
          </tbody>
        </table>
        <p>
          Strategic questions are answered with maps, conversations across team boundaries, and
          organizational decisions. Tactical questions are answered inside a single team's codebase
          with class design.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="30" width="230" height="140" rx="10" />
            <text className="figLabel" x="145" y="55">STRATEGIC</text>
            <text className="boxText" x="145" y="85">Context boundaries</text>
            <text className="boxText" x="145" y="107">Context maps</text>
            <text className="boxText" x="145" y="129">Core vs. supporting</text>
            <text className="figHint" x="145" y="155">cross-team scope</text>
            <rect className="boxAccent" x="340" y="30" width="230" height="140" rx="10" />
            <text className="figLabel" x="455" y="55">TACTICAL</text>
            <text className="boxText" x="455" y="85">Entities &amp; value objects</text>
            <text className="boxText" x="455" y="107">Aggregates</text>
            <text className="boxText" x="455" y="129">Domain services &amp; events</text>
            <text className="figHint" x="455" y="155">single-team scope</text>
          </svg>
          <figcaption>Strategic decisions are usually made once and revisited rarely; tactical decisions are made continuously during implementation.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The same rule, viewed strategically and tactically</h2>
        <p>
          "A shipment cannot be marked delivered until its final leg has a proof of delivery" is
          strategic when it defines what Booking exposes to Billing (a <code>DeliveryConfirmed</code>{" "}
          event Billing can trust) and tactical when it defines how the invariant is enforced
          inside <code>Shipment</code>:
        </p>
        <span className="codeLabel">JAVA &mdash; TACTICAL ENFORCEMENT</span>
        <div className="codeBlock">
          <pre>{`public void markDelivered(ProofOfDelivery pod) {
    Leg finalLeg = legs.get(legs.size() - 1);
    if (!finalLeg.hasProofOfDelivery()) {
        throw new IllegalStateException("Final leg has no proof of delivery");
    }
    this.status = ShipmentStatus.DELIVERED;
    DomainEvents.publish(new DeliveryConfirmed(id, pod, Instant.now()));
}`}</pre>
        </div>
        <p>
          The strategic decision (Billing only trusts a published <code>DeliveryConfirmed</code>{" "}
          event, never queries Booking's internal state directly) shaped what this method is even
          responsible for publishing.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Doing tactical DDD without strategic DDD.</b> Rich aggregates inside a system that
            is still one tangled context just produce well-modeled spaghetti.
          </li>
          <li>
            <b>Doing strategic DDD without tactical DDD.</b> Clean context boundaries with anemic
            models inside them still leave business rules scattered across service classes.
          </li>
          <li>
            <b>Assigning both to the same meeting.</b> Strategic conversations need people from
            multiple teams; tactical conversations are usually most productive with just the team
            that owns the code.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Is "should Billing trust Booking's database directly or only a published event?" a strategic or tactical question?</p>
          <p>
            <b>Answer:</b> Strategic &mdash; it defines how two bounded contexts relate to each
            other, which is a cross-team boundary decision, not a class-design decision inside one
            context.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Strategic DDD draws the boundaries; tactical DDD fills them in &mdash; both are required,
        and neither substitutes for the other.
      </p>
    </div>
  );
}
