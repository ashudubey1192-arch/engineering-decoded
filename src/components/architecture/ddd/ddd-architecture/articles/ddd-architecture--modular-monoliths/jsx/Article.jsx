export default function DddArchitectureModularMonolithsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A modular monolith deploys as one process but is internally organized around bounded
          contexts, each in its own module with an enforced boundary. Cargoflow ships Booking,
          Billing, and Routing as one deployable, yet the module boundary between them is as real
          as if they were separate services &mdash; this closes the ddd-architecture section by
          asking whether a context actually needs its own deployment, or just its own boundary.
        </p>
        <p>
          The DDD in Microservices article, later in this course, covers when to actually split;
          this article is about getting the boundary right before that question even comes up.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building the boundary, step by step</h2>
        <ol className="stepList">
          <li>
            <b>One module per bounded context, matching the boundaries this course has already
            drawn.</b> A <code>booking</code> package, a <code>billing</code> package, a{" "}
            <code>routing</code> package &mdash; not by technical layer, but by context.
          </li>
          <li>
            <b>Each module exposes a small public API and keeps everything else package-private.</b>{" "}
            Only <code>BookingFacade</code> is public; <code>Shipment</code>,{" "}
            <code>ShipmentRepository</code>, and every domain class behind it are invisible
            outside the module.
          </li>
          <li>
            <b>Cross-module calls go through the public API or published events, never through
            direct entity access.</b> Billing calls <code>BookingFacade.findShipmentSummary()</code>{" "}
            or listens for <code>ShipmentDelivered</code> &mdash; it never imports{" "}
            <code>com.cargoflow.booking.Shipment</code> directly.
          </li>
          <li>
            <b>Enforce the boundary with a build-time check, not a naming convention.</b> A module
            boundary that only a linter or an architecture test enforces is the only kind that
            survives a deadline.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="150" height="130" rx="8" />
            <text className="boxText" x="95" y="45">booking</text>
            <rect className="boxAccent" x="35" y="60" width="120" height="30" rx="4" />
            <text className="boxText" x="95" y="80" fontSize="11">BookingFacade</text>
            <text className="figHint" x="95" y="115">Shipment, Leg</text>
            <text className="figHint" x="95" y="130">(package-private)</text>
            <rect className="box" x="205" y="20" width="150" height="130" rx="8" />
            <text className="boxText" x="280" y="45">billing</text>
            <rect className="boxAccent" x="220" y="60" width="120" height="30" rx="4" />
            <text className="boxText" x="280" y="80" fontSize="11">BillingFacade</text>
            <rect className="box" x="390" y="20" width="150" height="130" rx="8" />
            <text className="boxText" x="465" y="45">routing</text>
            <rect className="boxAccent" x="405" y="60" width="120" height="30" rx="4" />
            <text className="boxText" x="465" y="80" fontSize="11">RoutingFacade</text>
            <line className="flow" x1="155" y1="75" x2="220" y2="75" />
            <line className="flowMuted" x1="340" y1="75" x2="405" y2="75" />
          </svg>
          <figcaption>Three bounded contexts, three packages, one deployable &mdash; only the facade at each module's edge is visible to the others.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A facade as the only door into a module</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`package com.cargoflow.booking; // module boundary = package boundary

public class BookingFacade { // the only public class other modules may import
    private final ShipmentRepository shipmentRepository; // package-private, invisible outside

    public ShipmentSummary findShipmentSummary(ShipmentId id) {
        Shipment shipment = shipmentRepository.findById(id).orElseThrow();
        return new ShipmentSummary(shipment.id(), shipment.status()); // narrow, intentional surface
    }
}

// package com.cargoflow.billing -- cannot do this, ShipmentRepository is package-private:
// ShipmentRepository repo; // compile error from another module
// must instead depend only on:
// BookingFacade facade;`}</pre>
        </div>
        <p>
          Java's package-private visibility does the enforcement mechanically: Billing physically
          cannot compile a reference to <code>ShipmentRepository</code>, only to{" "}
          <code>BookingFacade</code>.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Organizing modules by technical layer instead of bounded context.</b> A{" "}
            <code>controllers</code> package and a <code>repositories</code> package spanning all
            contexts recreates the tangled dependency graph this pattern exists to prevent.
          </li>
          <li>
            <b>Making everything public "to keep things simple."</b> A module with no enforced
            boundary is not modular &mdash; it is one undifferentiated package that happens to
            have subfolders.
          </li>
          <li>
            <b>Treating "modular monolith" as a permanent verdict against microservices.</b> It is
            a starting point that keeps the option to split open later &mdash; the DDD in
            Microservices article covers exactly when splitting starts to pay off.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why can't the <code>billing</code> package reference <code>ShipmentRepository</code> directly, even though everything runs in one process?</p>
          <p>
            <b>Answer:</b> <code>ShipmentRepository</code> is package-private inside the{" "}
            <code>booking</code> module, so Java's compiler refuses the reference &mdash; only{" "}
            <code>BookingFacade</code>'s narrow public surface is visible outside the module. The
            boundary is enforced mechanically, not by convention, even though no network call is
            involved.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A modular monolith gets bounded-context boundaries right at the language level, with a
        facade as the only door into each module &mdash; earning the option to split into
        microservices later without having earned it by accident.
      </p>
    </div>
  );
}
