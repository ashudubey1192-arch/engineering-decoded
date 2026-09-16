export default function AppliedDddModelingANewDomainArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Modeling a new domain is the iterative process that turns a discovery workshop's rough
          context map into working tactical models &mdash; entities, aggregates, and repositories
          &mdash; through repeated small cycles, not one upfront design phase. This article walks
          through how Cargoflow's Booking context went from workshop output to its first working
          <code> Shipment</code> aggregate.
        </p>
        <p>
          The key discipline is treating the first model as deliberately wrong in places, and
          fixing it fast rather than defending it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The modeling cycle, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Pick the smallest real scenario from the workshop and model just that.</b>{" "}
            Cargoflow started with "a single shipment gets booked and delivered," ignoring
            multi-leg routing entirely at first.
          </li>
          <li>
            <b>Write the model in code immediately, not in a diagram first.</b> A quick{" "}
            <code>Shipment</code> class with <code>book()</code> and <code>markDelivered()</code>{" "}
            methods, built the same day as the workshop, following the Model-Driven Design
            article's principle that the code is the model.
          </li>
          <li>
            <b>Test the model against a domain expert immediately, in plain language.</b> Walking
            a dispatch operator through <code>Shipment.markDelivered()</code>'s behavior in
            conversation, not just in a code review.
          </li>
          <li>
            <b>Let a wrong assumption break the model on purpose, then fix it.</b> The first
            version had no <code>Leg</code> concept at all; the moment multi-leg shipments came up
            in a real scenario, the aggregate boundary from that article's later design was added.
          </li>
          <li>
            <b>Repeat with the next-smallest scenario, expanding the model incrementally.</b>{" "}
            Carrier assignment, then delays, then the full lifecycle &mdash; each cycle adding
            only what the next real scenario required.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <circle className="ringKey" cx="250" cy="75" r="55" />
            <text className="boxText" x="250" y="70">model</text>
            <text className="figHint" x="250" y="88">in code</text>
            <text className="figLabel" x="90" y="35">scenario</text>
            <text className="figLabel" x="410" y="35">expert check</text>
            <text className="figLabel" x="90" y="120">fix</text>
            <text className="figLabel" x="410" y="120">next scenario</text>
            <path className="flowMuted" d="M250,20 A55,55 0 1,1 249,20" />
          </svg>
          <figcaption>A short, repeating cycle &mdash; scenario, code, expert check, fix &mdash; not a single upfront design phase.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The first model, deliberately minimal</h2>
        <span className="codeLabel">JAVA &mdash; CYCLE 1: SINGLE-LEG ONLY</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private ShipmentId id;
    private ShipmentStatus status;
    // no Leg collection yet -- deliberately deferred to the next modeling cycle

    public void book() { this.status = ShipmentStatus.BOOKED; }
    public void markDelivered() { this.status = ShipmentStatus.DELIVERED; }
}

// cycle 2, after a real multi-leg scenario surfaced:
public final class Shipment {
    private ShipmentId id;
    private ShipmentStatus status;
    private List<Leg> legs = new ArrayList<>(); // added only once a real scenario needed it
}`}</pre>
        </div>
        <p>
          Nothing about cycle 1 was "wrong" &mdash; it was an honest, minimal model of the
          scenario in hand, extended rather than rewritten once a new scenario demanded it.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Trying to model every future scenario before writing any code.</b> This produces a
            speculative, over-general model that hasn't actually been tested against a real
            scenario or a domain expert yet.
          </li>
          <li>
            <b>Treating the first cycle's model as sacred once it exists.</b> The whole point of
            small cycles is that early models are expected to change; resisting that defeats the
            process.
          </li>
          <li>
            <b>Modeling from a diagram or a requirements document instead of directly in code.</b>{" "}
            Per Model-Driven Design, a diagram that isn't the actual code drifts from it
            immediately.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why did Cargoflow's first <code>Shipment</code> model deliberately leave out the <code>Leg</code> collection?</p>
          <p>
            <b>Answer:</b> The first modeling cycle targeted the smallest real scenario (a
            single-leg shipment); adding multi-leg support before a real scenario required it
            would have been speculative design, not modeling driven by an actual case checked
            against a domain expert.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Model a new domain in small, code-first cycles &mdash; the smallest real scenario, checked
        with a domain expert, extended only when the next real scenario demands it.
      </p>
    </div>
  );
}
