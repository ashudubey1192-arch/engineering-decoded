export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Domain-Driven Design (DDD) is a way of building software where the code is shaped
          around the business it serves, not the other way around. This course teaches DDD as a
          practical discipline: how to talk to domain experts, how to draw boundaries around a
          large system, and how to write Java that reads like the business itself.
        </p>
        <p>
          Every article in this course follows one running story so the ideas connect instead of
          floating as isolated definitions. That story is Cargoflow, a freight-booking platform
          that lets shippers book cargo space on trucks and containers, track shipments in transit,
          and get billed when a delivery completes.
        </p>
        <div className="scenarioBox">
          <small>THE RUNNING EXAMPLE</small>
          <p>
            Cargoflow started as a single Java monolith. One <code>Shipment</code> table held
            pricing, routing, billing status, and customer support notes side by side. Order
            deadlines and refund rules were duplicated across a dozen services, each with a
            slightly different definition of "delivered." By the end of this course you will have
            watched Cargoflow's domain get untangled: a clear ubiquitous language, bounded
            contexts with honest boundaries, aggregates that protect real business rules, and a
            layered architecture that keeps the domain model free of framework noise.
          </p>
        </div>
      </section>
      <section id="concepts">
        <h2>1. What this course actually teaches</h2>
        <p>
          DDD is not a framework and it does not ship a library. It is a set of patterns for
          thinking, organized in two halves that this course follows in order.
        </p>
        <div className="twoCol">
          <div>
            <h3>Strategic design</h3>
            <p>
              How to carve a large, messy business into bounded contexts, decide which context is
              the core differentiator worth real investment, and define how contexts talk to each
              other without becoming tangled.
            </p>
          </div>
          <div>
            <h3>Tactical design</h3>
            <p>
              The building blocks inside one bounded context &mdash; entities, value objects,
              aggregates, domain services, repositories &mdash; used to express business rules
              directly in code instead of burying them in service classes.
            </p>
          </div>
        </div>
        <p>
          Strategic design answers "where are the seams?" Tactical design answers "what do I write
          inside one seam?" Skipping straight to tactical patterns is the most common way teams
          adopt DDD badly: they get rich domain objects inside a system that is still one giant,
          tangled context.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 620 220" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="20" y="30" width="270" height="160" rx="10" />
            <text className="figLabel" x="155" y="55">STRATEGIC DESIGN</text>
            <text className="boxText" x="155" y="90">Bounded contexts</text>
            <text className="boxText" x="155" y="112">Context maps</text>
            <text className="boxText" x="155" y="134">Core vs. supporting domains</text>
            <text className="figHint" x="155" y="165">"Where are the seams?"</text>
            <rect className="box" x="330" y="30" width="270" height="160" rx="10" />
            <text className="figLabel" x="465" y="55">TACTICAL DESIGN</text>
            <text className="boxText" x="465" y="90">Entities &amp; value objects</text>
            <text className="boxText" x="465" y="112">Aggregates &amp; repositories</text>
            <text className="boxText" x="465" y="134">Domain services &amp; events</text>
            <text className="figHint" x="465" y="165">"What goes inside one seam?"</text>
            <line className="flow" x1="290" y1="110" x2="330" y2="110" markerEnd="url(#arrow)" />
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="ringKey" />
              </marker>
            </defs>
          </svg>
          <figcaption>
            Strategic design decides where the boundaries live; tactical design fills in the
            model inside each boundary. This course covers both, always through Cargoflow.
          </figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A first look at Cargoflow's code</h2>
        <p>
          Here is the kind of Java this course moves toward &mdash; not a getter/setter bag, but a
          small object that refuses to exist in an invalid state and exposes behavior instead of
          raw fields.
        </p>
        <span className="codeLabel">JAVA &mdash; A TASTE OF WHERE WE'RE HEADED</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private final ShipmentId id;
    private final Route route;
    private ShipmentStatus status;

    public Shipment(ShipmentId id, Route route) {
        this.id = Objects.requireNonNull(id);
        this.route = Objects.requireNonNull(route);
        this.status = ShipmentStatus.BOOKED;
    }

    public void markPickedUp(Instant when) {
        if (status != ShipmentStatus.BOOKED) {
            throw new IllegalStateException("Only a booked shipment can be picked up");
        }
        this.status = ShipmentStatus.IN_TRANSIT;
        DomainEvents.publish(new ShipmentPickedUp(id, when));
    }
}`}</pre>
        </div>
        <p>
          Notice what is missing: no setters, no public constructor that accepts a raw status
          string, no way to build a <code>Shipment</code> that is picked up before it is booked.
          The invariant lives inside the object. You will build this class piece by piece across
          the tactical modeling and aggregates sections.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes when starting DDD</h2>
        <ul>
          <li>
            <b>Treating DDD as "add a domain layer."</b> Wrapping anemic getters/setters in a
            folder called <code>domain</code> without changing how the objects behave is not DDD;
            it is renaming.
          </li>
          <li>
            <b>Applying full tactical DDD everywhere.</b> A generic subdomain like email
            notifications rarely needs aggregates and domain events. Save the heavy tooling for
            the core domain, covered in the next section.
          </li>
          <li>
            <b>Skipping the domain experts.</b> DDD without direct, repeated conversation with the
            people who understand the business decays into a diagram nobody trusts.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does this course teach strategic design before tactical design?</p>
          <p>
            <b>Answer:</b> Tactical patterns like aggregates and repositories only pay off inside
            a boundary that is already well-drawn. Applying them before the boundaries are clear
            just produces well-organized code for the wrong boundaries.
          </p>
        </div>
      </section>
      <p className="takeaway">
        DDD is strategic boundary-drawing plus tactical modeling, always grounded in a real
        conversation with the business &mdash; and every article ahead uses Cargoflow to make that
        concrete.
      </p>
    </div>
  );
}
