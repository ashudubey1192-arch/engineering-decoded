export default function BoundedContextsDefiningModelBoundariesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Strategic design told you bounded contexts exist and gave you Cargoflow's four:
          Booking, Fleet &amp; Routing, Billing, Support. This article is the step-by-step
          process for actually drawing one boundary, using Booking as the worked example.
        </p>
        <p>
          A model boundary is a line around a set of classes that are allowed to reference each
          other freely, and are not allowed to be referenced directly from outside it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A five-step process for drawing one boundary</h2>
        <ol className="stepList">
          <li>
            <b>List every noun currently in play.</b> For Booking: Shipment, Leg, Quote, Deadline,
            Customer (billing view), Carrier (routing view).
          </li>
          <li>
            <b>Group nouns that always change together.</b> Shipment, Leg, Quote, and Deadline
            change together &mdash; a booking rule change touches all four at once.
          </li>
          <li>
            <b>Flag nouns that are really someone else's concept, borrowed.</b> "Carrier" as
            Booking sees it is really Fleet &amp; Routing's concept, referenced read-only.
          </li>
          <li>
            <b>Draw the line around the group from step 2, excluding the borrowed nouns.</b> That
            line is the boundary; borrowed concepts get referenced through an interface, not a
            shared class.
          </li>
          <li>
            <b>Confirm the boundary against a concrete scenario.</b> "A shipment is booked with
            two legs and a deadline" should be expressible entirely inside the boundary you drew.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 600 210" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="40" y="30" width="340" height="150" rx="10" />
            <text className="figLabel" x="210" y="55">BOOKING BOUNDARY</text>
            <text className="boxText" x="130" y="90">Shipment</text>
            <text className="boxText" x="230" y="90">Leg</text>
            <text className="boxText" x="130" y="120">Quote</text>
            <text className="boxText" x="230" y="120">Deadline</text>
            <text className="figHint" x="210" y="155">all change together</text>
            <rect className="box" x="430" y="70" width="140" height="60" rx="8" />
            <text className="boxText" x="500" y="95">Carrier</text>
            <text className="figHint" x="500" y="113">borrowed, read-only</text>
            <line className="flowMuted" x1="380" y1="100" x2="430" y2="100" />
          </svg>
          <figcaption>Everything that changes together sits inside the line; borrowed concepts stay outside, referenced through an interface.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The boundary, enforced in Java package structure</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`package com.cargoflow.booking;      // everything from step 2 lives here
public final class Shipment { /* ... */ }
public final class Leg { /* ... */ }
public final class Quote { /* ... */ }

// The borrowed concept is referenced through Booking's own small interface,
// never Fleet & Routing's actual Carrier class.
public interface CarrierAvailability {
    boolean hasCapacity(String carrierId, Route route);
}`}</pre>
        </div>
        <p>
          Nothing in <code>com.cargoflow.booking</code> imports a class from
          <code> com.cargoflow.routing</code> directly &mdash; the interface is the only crossing
          point, matching the boundary drawn in step 4.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Drawing the boundary around a database table instead of "changes together."</b> A
            table join does not mean two concepts belong in the same model.
          </li>
          <li>
            <b>Skipping step 5, the concrete-scenario check.</b> A boundary that looks tidy on a
            whiteboard often fails the first time you try to narrate an actual booking through it.
          </li>
          <li>
            <b>Letting a borrowed concept's full class leak across the line.</b> Once
            <code> Carrier</code> itself is imported into Booking, the boundary has effectively
            stopped existing.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does "Carrier" get excluded from Booking's boundary in step 3 even though Booking needs carrier information?</p>
          <p>
            <b>Answer:</b> Booking needs carrier availability, but Carrier as a concept belongs to
            and changes with Fleet &amp; Routing. Referencing it through a narrow interface keeps
            Booking's boundary honest instead of merging two models that change independently.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Draw a boundary by grouping what changes together, excluding borrowed concepts, then
        stress-test the result against one concrete scenario before trusting it.
      </p>
    </div>
  );
}
