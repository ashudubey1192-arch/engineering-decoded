export default function AppliedDddRefactoringTowardDddArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Most real DDD adoption starts inside an existing, non-DDD codebase, not a greenfield
          project like the Modeling a New Domain article assumed. Refactoring toward DDD is the
          disciplined process of introducing entities, value objects, and aggregate boundaries
          into code that currently has none &mdash; incrementally, behind passing tests, without a
          rewrite.
        </p>
        <p>
          Cargoflow's <code>Shipment</code> aggregate did not start that way: it began as a
          561-line <code>ShipmentService</code> class with a public setter for every field.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Refactoring toward a domain model, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Find the invariant currently enforced only by scattered service-layer checks.</b>{" "}
            The distance-limit rule from the Business Invariants article was originally three
            separate <code>if</code> checks in three different service methods.
          </li>
          <li>
            <b>Introduce the entity as a thin wrapper first, without moving logic yet.</b> Create{" "}
            <code>Shipment</code> holding the same fields <code>ShipmentService</code> already
            manipulated, initially with public setters &mdash; a safe, behavior-preserving step.
          </li>
          <li>
            <b>Move one invariant's logic into the entity at a time, deleting its service-layer
            duplicate.</b> Move the distance check into <code>Shipment.addLeg()</code>, then
            delete the three scattered checks, verified by the same tests passing before and
            after.
          </li>
          <li>
            <b>Tighten encapsulation only after logic has moved.</b> Public setters become private
            once nothing outside the entity needs them &mdash; encapsulation is the last step, not
            the first, so it never blocks an in-progress refactor.
          </li>
          <li>
            <b>Repeat per invariant until <code>ShipmentService</code> is left with only
            orchestration, no business rules.</b> Exactly the application-layer shape from the
            Layered Architecture article, arrived at by subtraction rather than upfront design.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="50" width="180" height="50" rx="8" />
            <text className="boxText" x="110" y="72" fontSize="11">ShipmentService</text>
            <text className="figHint" x="110" y="88">561 lines, all logic</text>
            <line className="flow" x1="200" y1="75" x2="260" y2="75" />
            <rect className="box" x="260" y="20" width="140" height="40" rx="6" />
            <text className="boxText" x="330" y="45" fontSize="11">Shipment entity</text>
            <line className="flow" x1="200" y1="90" x2="260" y2="105" />
            <rect className="box" x="260" y="90" width="140" height="40" rx="6" />
            <text className="boxText" x="330" y="115" fontSize="11">application layer</text>
          </svg>
          <figcaption>Logic migrates out of the service class one invariant at a time; nothing is rewritten from scratch.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One invariant, moved and verified by existing tests</h2>
        <span className="codeLabel">JAVA &mdash; BEFORE</span>
        <div className="codeBlock">
          <pre>{`// original: rule enforced inline in the service, duplicated in two other methods
public void addLegToShipment(Long shipmentId, LegDto legDto) {
    Shipment s = repository.find(shipmentId);
    double newTotal = s.getTotalDistance() + legDto.getDistance();
    if (newTotal > s.getContractedDistance()) throw new IllegalArgumentException("too far");
    s.getLegs().add(toLeg(legDto)); // public setter-style mutation
    repository.save(s);
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; AFTER</span>
        <div className="codeBlock">
          <pre>{`// refactored: rule now lives once, inside the entity itself
public void addLegToShipment(Long shipmentId, LegDto legDto) {
    Shipment s = repository.find(shipmentId);
    s.addLeg(toLeg(legDto)); // throws internally if the invariant would be violated
    repository.save(s);
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Attempting a big-bang rewrite instead of an incremental refactor.</b> A full rewrite
            loses test coverage's safety net and usually stalls halfway, leaving two half-finished
            models instead of one working one.
          </li>
          <li>
            <b>Encapsulating fields before moving the logic that depends on them.</b> This locks
            the refactor in a broken state where the entity has private fields but the service
            still needs to set them directly.
          </li>
          <li>
            <b>Refactoring without a test safety net at all.</b> Moving an invariant is only safe
            to verify when a test already exercises the boundary case the invariant protects.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the refactor introduce <code>Shipment</code> with public setters first, rather than encapsulating it immediately?</p>
          <p>
            <b>Answer:</b> Encapsulating immediately would break <code>ShipmentService</code>,
            which still needs direct field access until its logic has been moved into the entity.
            Introducing the entity first as a behavior-preserving step, then migrating logic, then
            tightening encapsulation last, keeps every intermediate step working and testable.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Refactor toward DDD incrementally: introduce the entity behind existing behavior, move one
        invariant at a time under test coverage, and encapsulate only once nothing outside still
        needs direct access.
      </p>
    </div>
  );
}
