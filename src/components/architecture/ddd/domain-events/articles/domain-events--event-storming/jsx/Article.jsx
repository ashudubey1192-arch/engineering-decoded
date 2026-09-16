export default function DomainEventsEventStormingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Event storming is a workshop technique &mdash; a room, a long wall of paper or a virtual
          whiteboard, and orange sticky notes for every domain event &mdash; used to discover a
          domain's events, commands, and aggregate boundaries together with domain experts, in
          hours rather than weeks of separate meetings. Cargoflow's entire Booking model traces
          back to one two-hour event storming session.
        </p>
        <p>
          This closes the Domain Events section by tying everything back to knowledge crunching:
          event storming is knowledge crunching, structured specifically around events.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Running a session, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Flood the wall with orange event sticky notes, chaotically, in any order.</b>{" "}
            Domain experts and engineers both write down anything that happens: "shipment booked,"
            "carrier assigned," "customs hold placed." No structure yet, on purpose.
          </li>
          <li>
            <b>Sequence the events left to right along a rough timeline.</b> This is where gaps
            and conflicting understandings between participants first surface.
          </li>
          <li>
            <b>Add commands (blue notes) that trigger each event, and actors (yellow) who issue
            them.</b> "Ops assigns a carrier" (command) causes "CarrierAssigned" (event).
          </li>
          <li>
            <b>Cluster events that belong to one aggregate (purple/pink notes), revealing
            aggregate and bounded-context boundaries directly from the wall.</b>
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="30" y="30" width="90" height="35" rx="6" />
            <text className="boxText" x="75" y="52">ShipmentBooked</text>
            <rect className="boxWarn" x="150" y="30" width="90" height="35" rx="6" />
            <text className="boxText" x="195" y="52">CarrierAssigned</text>
            <rect className="boxWarn" x="270" y="30" width="90" height="35" rx="6" />
            <text className="boxText" x="315" y="52">PickedUp</text>
            <rect className="boxWarn" x="390" y="30" width="90" height="35" rx="6" />
            <text className="boxText" x="435" y="52">Delivered</text>
            <rect className="box" x="150" y="90" width="90" height="35" rx="6" />
            <text className="boxText" x="195" y="112">Assign carrier</text>
            <text className="figHint" x="195" y="80">command</text>
            <rect className="boxAccent" x="30" y="140" width="450" height="30" rx="6" />
            <text className="figLabel" x="255" y="160">clustered: Shipment aggregate boundary emerges</text>
          </svg>
          <figcaption>Events sequenced on a timeline, with commands added above and an aggregate boundary emerging as a cluster below.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. From sticky notes to code, directly</h2>
        <p>
          The wall's output translates almost mechanically into the event and command types this
          course has used throughout:
        </p>
        <span className="codeLabel">JAVA &mdash; DIRECTLY FROM THE WALL</span>
        <div className="codeBlock">
          <pre>{`// Orange notes become events (already used throughout this course):
public record ShipmentBooked(ShipmentId id, Instant bookedAt) {}
public record CarrierAssigned(ShipmentId id, CarrierId carrierId) {}

// Blue notes become the application-layer commands that trigger them:
public record AssignCarrierCommand(ShipmentId shipmentId, CarrierId carrierId) {}`}</pre>
        </div>
        <p>
          Because the vocabulary was pinned down live with the domain experts in the room, no
          separate translation step is needed between the workshop output and the class names.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Running the session without the actual domain experts present.</b> Engineers alone
            reliably produce a technically plausible but factually wrong event timeline.
          </li>
          <li>
            <b>Imposing structure too early.</b> The chaotic flooding step in step 1 is
            intentional &mdash; premature organization suppresses the disagreements worth
            surfacing.
          </li>
          <li>
            <b>Treating the wall as a one-time artifact instead of feeding it into the glossary.</b>{" "}
            The output should become part of the ubiquitous language and event catalog, not a
            photo that gets forgotten in a wiki.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does event storming start with unstructured, chaotic sticky-note flooding instead of an organized list?</p>
          <p>
            <b>Answer:</b> The chaos surfaces disagreements and gaps between participants'
            understanding early and visibly, which a pre-organized list would tend to paper over
            &mdash; those disagreements are exactly what the session needs to resolve.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Event storming is knowledge crunching structured around events &mdash; run it with real
        domain experts, let it stay chaotic at first, and let boundaries emerge from the wall.
      </p>
    </div>
  );
}
