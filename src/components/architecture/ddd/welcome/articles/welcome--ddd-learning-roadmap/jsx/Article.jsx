export default function WelcomeDddLearningRoadmapArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          This course has twelve sections that build on each other in a specific order. Skipping
          around works for reference lookups later, but the first pass should follow the sequence
          below &mdash; each section assumes the vocabulary of the ones before it.
        </p>
        <p>
          The shape mirrors how a real team actually adopts DDD on a system like Cargoflow: first
          you learn to think about the domain, then you draw boundaries around it, then you fill
          those boundaries with a tactical model, then you connect the pieces and put them into
          production.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The four phases of the roadmap</h2>
        <ol className="stepList">
          <li>
            <b>DDD Foundations &amp; Domains and Subdomains.</b> Learn the vocabulary &mdash; model-driven
            design, knowledge crunching, core vs. supporting vs. generic subdomains &mdash; before
            drawing a single box.
          </li>
          <li>
            <b>Strategic Design, Bounded Contexts &amp; Ubiquitous Language.</b> Carve Cargoflow into
            contexts (Booking, Fleet &amp; Routing, Billing, Support), map how they relate, and
            build the shared vocabulary inside each one.
          </li>
          <li>
            <b>Tactical Modeling, Aggregates, Domain Events &amp; DDD Architecture.</b> Fill one
            bounded context &mdash; Booking &mdash; with entities, value objects, aggregates,
            domain events, and the layered/hexagonal architecture that keeps the model clean.
          </li>
          <li>
            <b>Context Integration &amp; Applied DDD.</b> Connect Booking to Fleet &amp; Routing and
            Billing without letting their models leak into each other, then step back and cover
            workshops, refactoring, testing, and common failure modes.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="10" y="70" width="140" height="60" rx="8" />
            <text className="boxText" x="80" y="105">Foundations</text>
            <rect className="boxAccent" x="180" y="70" width="140" height="60" rx="8" />
            <text className="boxText" x="250" y="105">Strategic design</text>
            <rect className="boxAccent" x="350" y="70" width="140" height="60" rx="8" />
            <text className="boxText" x="420" y="105">Tactical modeling</text>
            <rect className="box" x="520" y="70" width="110" height="60" rx="8" />
            <text className="boxText" x="575" y="98">Integration</text>
            <text className="boxText" x="575" y="118">&amp; practice</text>
            <line className="flow" x1="150" y1="100" x2="180" y2="100" />
            <line className="flow" x1="320" y1="100" x2="350" y2="100" />
            <line className="flow" x1="490" y1="100" x2="520" y2="100" />
          </svg>
          <figcaption>The roadmap moves from vocabulary, to boundaries, to the model inside a boundary, to wiring boundaries together.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. What "applying the roadmap" looks like in code</h2>
        <p>
          By the time you reach Context Integration, a single interface will represent everything
          the Booking context is willing to publish about a shipment to other contexts &mdash;
          deliberately smaller than the internal model:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Published language: the public shape Booking exposes to other contexts.
public record ShipmentSummary(
        String shipmentId,
        String pickupCity,
        String dropoffCity,
        Instant bookedAt
) {}

public interface ShipmentLookup {
    Optional<ShipmentSummary> findSummary(String shipmentId);
}`}</pre>
        </div>
        <p>
          Nothing about routing internals, pricing, or carrier assignment leaks through. That
          restraint is the payoff of following strategic design before writing this interface.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes when planning the learning path</h2>
        <ul>
          <li>
            <b>Jumping to Aggregates first.</b> Aggregates only make sense once you already know
            what a bounded context and an invariant are; reading it out of order leaves the "why"
            missing.
          </li>
          <li>
            <b>Treating this as a reference manual on day one.</b> The sections are cumulative.
            Come back to any single article later, but read section-by-section the first time.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does Context Integration come after Tactical Modeling instead of before it?</p>
          <p>
            <b>Answer:</b> You cannot decide what a bounded context should expose to its neighbors
            until you know what its internal model looks like and which parts are implementation
            detail versus stable contract.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Follow the roadmap in order the first time: vocabulary, then boundaries, then the model
        inside one boundary, then wiring boundaries together.
      </p>
    </div>
  );
}
