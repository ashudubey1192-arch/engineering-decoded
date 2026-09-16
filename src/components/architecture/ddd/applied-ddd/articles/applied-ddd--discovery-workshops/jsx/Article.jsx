export default function AppliedDddDiscoveryWorkshopsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A discovery workshop is where strategic and tactical DDD actually get applied together,
          in a room, before a line of code is written: event storming to surface events (from the
          Domain Events section), then knowledge crunching and ubiquitous-language building (from
          earlier sections) to turn that raw output into bounded contexts and a first model. This
          section moves from individual patterns to running the whole process end to end.
        </p>
        <p>
          Cargoflow's original Booking/Billing/Routing split traces back to a single two-day
          discovery workshop, run before any of those services existed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Running a discovery workshop, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Get the right people in the room, especially domain experts.</b> Cargoflow's
            workshop included two dispatch operators and a billing specialist, not just engineers
            &mdash; the Domain Experts article's whole argument, applied.
          </li>
          <li>
            <b>Run event storming first, to flood the wall with what actually happens.</b> Exactly
            the technique from the Event Storming article, used here as the workshop's opening
            move rather than a standalone exercise.
          </li>
          <li>
            <b>Cluster events into candidate bounded contexts, and name them together.</b> The
            events clustered into three groups: shipment lifecycle, cost and payment, path and
            carrier logistics &mdash; which became Booking, Billing, and Routing.
          </li>
          <li>
            <b>Capture the vocabulary as it emerges, disagreements included.</b> When ops and
            billing used "shipment" differently, the workshop resolved it on the spot, per the
            Resolving Ambiguity article, rather than letting it surface later as a bug.
          </li>
          <li>
            <b>Leave with a rough context map, not a finished model.</b> The workshop's output is
            a starting hypothesis, refined by the Modeling a New Domain process that follows it.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="20" width="520" height="50" rx="6" />
            <text className="figLabel" x="280" y="50">event storming wall: events, commands, actors</text>
            <line className="flow" x1="280" y1="70" x2="280" y2="95" />
            <rect className="box" x="20" y="100" width="160" height="45" rx="6" />
            <text className="boxText" x="100" y="127" fontSize="11">Booking context</text>
            <rect className="box" x="200" y="100" width="160" height="45" rx="6" />
            <text className="boxText" x="280" y="127" fontSize="11">Billing context</text>
            <rect className="box" x="380" y="100" width="160" height="45" rx="6" />
            <text className="boxText" x="460" y="127" fontSize="11">Routing context</text>
          </svg>
          <figcaption>One workshop's wall, clustered, becomes the rough context map that later work refines.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Turning workshop output into a first cut of code</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// package names, chosen live in the workshop, straight from the clustered wall
package com.cargoflow.booking;
package com.cargoflow.billing;
package com.cargoflow.routing;

// the first event type written, transcribed directly from an orange sticky note
public record ShipmentBooked(ShipmentId id, Instant bookedAt) {}`}</pre>
        </div>
        <p>
          The package names are not an engineering decision made later in isolation &mdash; they
          are the workshop's own vocabulary, carried into the codebase unchanged.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Running the workshop with only engineers present.</b> Exactly the Event Storming
            article's warning, restated at the process level: no domain experts means a
            technically plausible but factually wrong result.
          </li>
          <li>
            <b>Treating the workshop's output as final and binding.</b> The context map from a
            two-day workshop is a hypothesis to test against real development, not a spec to
            freeze.
          </li>
          <li>
            <b>Skipping the workshop entirely and letting bounded contexts emerge accidentally
            from whichever team structure already exists.</b> That risks Conway's Law dictating
            the model instead of the domain dictating it.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why did Cargoflow's discovery workshop include dispatch operators and a billing specialist, not just engineers?</p>
          <p>
            <b>Answer:</b> Domain experts carry the real knowledge of how shipments, costs, and
            routing actually work; without them, event storming produces an event timeline that
            looks plausible to engineers but doesn't match reality, and the resulting context
            boundaries and vocabulary would be built on that wrong understanding.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A discovery workshop is where this course's individual techniques &mdash; event storming,
        knowledge crunching, ubiquitous language &mdash; run together in one session, producing a
        first, testable hypothesis for bounded contexts rather than a finished design.
      </p>
    </div>
  );
}
