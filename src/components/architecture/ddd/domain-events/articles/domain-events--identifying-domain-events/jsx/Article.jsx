export default function DomainEventsIdentifyingDomainEventsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A domain event is a record of something that happened in the domain that other parts of
          the system need to know about. <code>ShipmentBooked</code>, <code>CarrierAssigned</code>,
          and <code>ShipmentDelivered</code> are all Cargoflow domain events already used in
          earlier articles &mdash; this article is about finding them systematically instead of
          adding them ad hoc.
        </p>
        <p>
          Not everything that happens deserves to be an event. This article's job is separating
          the state changes worth broadcasting from the ones that are purely internal.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A step-by-step test for "is this a domain event?"</h2>
        <ol className="stepList">
          <li>
            <b>Does a domain expert consider it a meaningful occurrence?</b> "The shipment was
            delivered" is something an ops manager would say happened. "The status field was
            updated" is not &mdash; that is implementation detail describing the same fact.
          </li>
          <li>
            <b>Does anything outside the aggregate that changed need to react to it?</b> Billing
            needs to know when a shipment is delivered, to generate an invoice. If nothing else in
            the system cares, it may not need to be a published event at all.
          </li>
          <li>
            <b>Is it something that happened, in the past tense, not a command?</b>{" "}
            <code>ShipmentDelivered</code> is a fact about the past; <code>DeliverShipment</code>{" "}
            would be a command &mdash; a request, not a record.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>APPLYING THE TEST TO CARGOFLOW</small>
          <p>
            "A shipment's internal cache of computed distance was recalculated" fails all three
            tests &mdash; no domain expert would mention it, nothing outside <code>Shipment</code>{" "}
            needs to react, and it is a technical side effect, not a business fact. It stays an
            internal detail, never an event.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="45" width="200" height="55" rx="8" />
            <text className="boxText" x="130" y="70">"Distance recalculated"</text>
            <text className="figHint" x="130" y="88">fails all 3 tests</text>
            <rect className="boxAccent" x="330" y="45" width="220" height="55" rx="8" />
            <text className="boxText" x="440" y="70">ShipmentDelivered</text>
            <text className="figHint" x="440" y="88">passes all 3 tests</text>
          </svg>
          <figcaption>Most internal state changes are not domain events &mdash; only the ones that pass all three questions are.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Finding events by scanning aggregate methods</h2>
        <p>
          A reliable technique: read every public method on an aggregate root and ask whether its
          name describes a business occurrence.
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    public static Shipment fromAcceptedQuote(/* ... */) { /* -> ShipmentBooked */ }
    public void assignCarrier(CarrierId id) { /* -> CarrierAssigned */ }
    public void markPickedUp(Instant when) { /* -> ShipmentPickedUp */ }
    public void markDelivered(ProofOfDelivery pod) { /* -> ShipmentDelivered */ }
    private void recalculateInternalDistanceCache() { /* no event -- private, technical */ }
}`}</pre>
        </div>
        <p>
          Every public, business-meaningful method is a candidate event; the private technical
          helper is not, because it fails test 1 and test 3 at once.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Publishing an event for every setter call.</b> That produces event noise nobody
            can usefully subscribe to and makes real business events harder to find.
          </li>
          <li>
            <b>Naming an event as a command instead of a fact.</b> <code>AssignCarrier</code>{" "}
            instead of <code>CarrierAssigned</code> confuses a request with a record of what
            already happened &mdash; covered in depth in the next article.
          </li>
          <li>
            <b>Skipping events for state changes that genuinely do have interested subscribers.</b>{" "}
            Under-identifying events forces other contexts back onto polling or direct queries,
            the coupling this pattern exists to avoid.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why doesn't "distance cache recalculated" qualify as a domain event even though it is a real state change?</p>
          <p>
            <b>Answer:</b> It fails all three tests: no domain expert would describe it as a
            business occurrence, nothing outside Shipment needs to react to it, and it is a
            technical detail rather than a fact about the business.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Identify domain events by testing for business meaning, external interest, and past-tense
        factuality &mdash; most internal state changes fail at least one test and stay internal.
      </p>
    </div>
  );
}
