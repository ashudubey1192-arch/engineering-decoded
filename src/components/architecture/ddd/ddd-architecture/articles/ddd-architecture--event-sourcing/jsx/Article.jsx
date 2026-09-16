export default function DddArchitectureEventSourcingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Event sourcing stores an aggregate as the full sequence of domain events that produced
          its current state, instead of storing only the current state. Rather than a{" "}
          <code>shipment</code> row holding <code>status = 'DELIVERED'</code>, the store holds
          <code> ShipmentBooked</code>, <code>CarrierAssigned</code>, <code>PickedUp</code>,{" "}
          <code>Delivered</code> &mdash; in order &mdash; and "delivered" is derived by replaying
          them.
        </p>
        <p>
          This is the most demanding pattern in this section: it pays for a genuine need (a full
          audit trail, or the ability to answer "what did this look like last Tuesday"), not for
          general appeal.
        </p>
      </section>
      <section id="concepts">
        <h2>1. How it works, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Every state change is appended as an event, never updated in place.</b> The event
            store is append-only; there is no <code>UPDATE shipment SET status = ...</code>{" "}
            anywhere.
          </li>
          <li>
            <b>Current state is derived by replaying events through the aggregate, on load.</b>{" "}
            Loading a <code>Shipment</code> means folding every one of its events, in order, into
            a fresh instance.
          </li>
          <li>
            <b>Snapshots make replay affordable for long-lived aggregates.</b> After 200 events,
            Cargoflow stores a snapshot at event 200 so a later load replays only newer events,
            not the full history from event 1.
          </li>
          <li>
            <b>The event stream is also the audit log, for free.</b> "Who changed the carrier, and
            when" is answered by reading the stream itself &mdash; no separate audit table to keep
            in sync.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="30" width="110" height="40" rx="6" />
            <text className="boxText" x="75" y="55">Booked</text>
            <rect className="boxWarn" x="150" y="30" width="110" height="40" rx="6" />
            <text className="boxText" x="205" y="55">CarrierAssigned</text>
            <rect className="boxWarn" x="280" y="30" width="110" height="40" rx="6" />
            <text className="boxText" x="335" y="55">PickedUp</text>
            <rect className="boxWarn" x="410" y="30" width="110" height="40" rx="6" />
            <text className="boxText" x="465" y="55">Delivered</text>
            <line className="flow" x1="20" y1="100" x2="520" y2="100" />
            <text className="figLabel" x="270" y="120">replay in order &rarr;</text>
            <text className="figHint" x="270" y="140">current state: DELIVERED</text>
          </svg>
          <figcaption>Nothing is stored except the ordered event stream; "current state" is a value computed by folding it, not a stored field.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Rebuilding an aggregate from its stream</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private ShipmentStatus status;
    private CarrierId carrierId;

    public static Shipment replay(List<Object> events) {
        Shipment shipment = new Shipment();
        events.forEach(shipment::apply); // fold every past event into state
        return shipment;
    }

    private void apply(Object event) {
        switch (event) {
            case ShipmentBooked e -> this.status = ShipmentStatus.BOOKED;
            case CarrierAssigned e -> this.carrierId = e.carrierId();
            case PickedUp e -> this.status = ShipmentStatus.IN_TRANSIT;
            case Delivered e -> this.status = ShipmentStatus.DELIVERED;
            default -> throw new IllegalStateException("Unknown event: " + event);
        }
    }
}`}</pre>
        </div>
        <p>
          Every command still validates against invariants and produces a new event, exactly as
          in the Publishing Events article; the difference is purely how state is persisted and
          reloaded &mdash; as a stream, folded on read, rather than a row, overwritten on write.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Adopting event sourcing for every aggregate because it sounds more "DDD."</b> It is
            a persistence strategy with real cost (replay complexity, event schema evolution,
            snapshotting); reserve it for aggregates where the history itself has business value.
          </li>
          <li>
            <b>Changing the shape of a past event instead of versioning it.</b> Old events in the
            store were valid at the time; a schema change needs an upcaster or a new event
            version, not a rewrite of history.
          </li>
          <li>
            <b>Forgetting snapshotting until replay is already slow in production.</b> Plan the
            snapshot strategy before an aggregate accumulates thousands of events, not after.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>Shipment.replay()</code> apply events in order rather than reading a single stored status field?</p>
          <p>
            <b>Answer:</b> In event sourcing, the event stream is the only source of truth; there
            is no stored "current state" row. The aggregate's present state is a derived value,
            computed by folding every past event through <code>apply()</code>, which is also what
            makes the full history available as an audit trail for free.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Event sourcing trades a stored current state for a stored history that current state is
        derived from &mdash; reach for it when the history itself is valuable, not as a default
        way to persist aggregates.
      </p>
    </div>
  );
}
