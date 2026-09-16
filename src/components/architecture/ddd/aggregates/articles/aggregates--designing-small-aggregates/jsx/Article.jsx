export default function AggregatesDesigningSmallAggregatesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Given a choice between a larger aggregate and a smaller one that still protects the same
          invariants, choose smaller every time. This closing article in the section is the
          practical bias that ties the previous five together: default to the smallest aggregate
          that can still enforce its real invariants atomically.
        </p>
        <p>
          Cargoflow's early <code>Shipment</code> aggregate briefly included pricing details
          before the Quoting split (covered in the Splitting Contexts article) &mdash; shrinking
          it measurably reduced write contention during peak booking hours.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A step-by-step shrink-test for an existing aggregate</h2>
        <ol className="stepList">
          <li>
            <b>List every object currently inside the boundary.</b> For the early
            <code> Shipment</code>: <code>Leg</code>, <code>PricingDetail</code>,
            <code> DiscountApplication</code>.
          </li>
          <li>
            <b>For each one, ask: does removing it break a real invariant?</b> Removing
            <code> Leg</code> breaks the distance and contiguity invariants. Removing
            <code> PricingDetail</code> breaks nothing inside <code>Shipment</code> itself &mdash;
            no invariant in <code>Shipment</code> ever reads pricing data.
          </li>
          <li>
            <b>Move anything that survives the test to its own aggregate or context.</b>{" "}
            <code>PricingDetail</code> and <code>DiscountApplication</code> became the seed of the
            new Quoting context.
          </li>
          <li>
            <b>Re-verify the remaining aggregate's invariants still hold with the smaller
            membership.</b>
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 580 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="20" width="520" height="60" rx="8" />
            <text className="figLabel" x="290" y="45">BEFORE: Shipment, Leg, PricingDetail, DiscountApplication</text>
            <text className="figHint" x="290" y="65">large, high write contention</text>
            <line className="flow" x1="290" y1="80" x2="290" y2="105" />
            <rect className="boxAccent" x="30" y="115" width="220" height="55" rx="8" />
            <text className="boxText" x="140" y="148">Shipment, Leg</text>
            <text className="figHint" x="140" y="163">smaller, less contention</text>
            <rect className="boxAccent" x="330" y="115" width="220" height="55" rx="8" />
            <text className="boxText" x="440" y="148">Quote, PricingDetail</text>
            <text className="figHint" x="440" y="163">new, independent aggregate</text>
          </svg>
          <figcaption>Shrinking the aggregate to only what its own invariants need reduced contention and clarified two separate concerns.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The measurable effect of shrinking</h2>
        <span className="codeLabel">JAVA &mdash; BEFORE: ONE LARGE, CONTENDED AGGREGATE</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private final List<Leg> legs = new ArrayList<>();
    private PricingDetail pricing;       // no Shipment invariant ever reads this
    private DiscountApplication discount; // neither does this
    // every write to pricing or discount locks the whole Shipment row
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; AFTER: SMALLER, LESS CONTENDED</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private final List<Leg> legs = new ArrayList<>();
    private CarrierId assignedCarrierId; // referenced by id, per the earlier article
    // pricing changes no longer lock this aggregate at all
}`}</pre>
        </div>
        <p>
          Pricing updates and shipment updates can now proceed concurrently with no lock
          contention between them, because they are no longer the same row.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Shrinking an aggregate past the point where its own invariants can still be
            enforced.</b> <code>Leg</code> cannot be pulled out of <code>Shipment</code> without
            breaking the contiguity invariant &mdash; the shrink-test in step 2 exists specifically
            to catch this.
          </li>
          <li>
            <b>Optimizing for "small" as a goal in itself, disconnected from invariants.</b> The
            target is not minimalism for its own sake; it is the smallest boundary that still
            protects what actually needs protecting.
          </li>
          <li>
            <b>Never revisiting an aggregate's size as the domain evolves.</b> The Cargoflow
            example only surfaced once pricing rules grew complex enough to notice the contention
            &mdash; the shrink-test is worth rerunning periodically.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why was <code>PricingDetail</code> safe to remove from the Shipment aggregate, but <code>Leg</code> was not?</p>
          <p>
            <b>Answer:</b> No invariant inside Shipment ever read pricing data, so removing it
            broke nothing. Leg, in contrast, is required by both the contiguity and total-distance
            invariants &mdash; removing it would make those invariants impossible to enforce
            atomically.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Default to the smallest aggregate that still enforces its real invariants &mdash; every
        object that survives a shrink-test earns a smaller, less-contended write path.
      </p>
    </div>
  );
}
