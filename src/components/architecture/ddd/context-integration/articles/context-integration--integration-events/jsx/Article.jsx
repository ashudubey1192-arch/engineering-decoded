export default function ContextIntegrationIntegrationEventsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An integration event is a domain event's public, cross-context counterpart &mdash;
          deliberately reshaped for external consumers rather than published as-is. This closes
          the context-integration section by answering the question the previous four articles
          all raised in different ways: what exactly should cross the wire, if not the internal
          domain event itself?
        </p>
        <p>
          Cargoflow's internal <code>ShipmentDelivered</code> domain event and its published{" "}
          <code>shipment.delivered</code> integration event look similar but are not the same
          type, and that difference is deliberate.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Separating domain events from integration events, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Start from the domain event, but do not publish it directly.</b>{" "}
            <code>ShipmentDelivered</code> (the domain event from the Publishing Events article)
            may carry internal identifiers or fields that make sense only inside Booking.
          </li>
          <li>
            <b>Map it explicitly to a public integration event shape.</b>{" "}
            <code>ShipmentDeliveredIntegrationEvent</code> carries only what external consumers
            were agreed to receive, per the Integration Contracts article.
          </li>
          <li>
            <b>Version the integration event independently of the domain event.</b> Booking can
            refactor its internal <code>ShipmentDelivered</code> freely; the integration event
            only changes when the public contract itself changes.
          </li>
          <li>
            <b>Publish integration events asynchronously, using the pattern from the previous
            article.</b> The mapping step is what's new here; the delivery mechanism is unchanged.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="55" width="150" height="50" rx="8" />
            <text className="boxText" x="95" y="78" fontSize="11">ShipmentDelivered</text>
            <text className="figHint" x="95" y="95">internal domain event</text>
            <rect className="boxAccent" x="200" y="55" width="120" height="50" rx="8" />
            <text className="boxText" x="260" y="82" fontSize="11">map / translate</text>
            <rect className="box" x="350" y="55" width="150" height="50" rx="8" />
            <text className="boxText" x="425" y="78" fontSize="11">shipment.delivered</text>
            <text className="figHint" x="425" y="95">public integration event</text>
            <line className="flow" x1="170" y1="80" x2="200" y2="80" />
            <line className="flow" x1="320" y1="80" x2="350" y2="80" />
          </svg>
          <figcaption>The public event is a deliberate, independently-versioned mapping of the internal one &mdash; never the same object published outward.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Mapping a domain event to its public shape</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// internal domain event, may evolve freely with Booking's internal needs
public record ShipmentDelivered(ShipmentId id, ProofOfDelivery pod, Instant deliveredAt) {}

// public integration event, its own versioned, independently-stable contract
public record ShipmentDeliveredIntegrationEvent(
    String shipmentId, Instant deliveredAt, String proofOfDeliveryUrl
) {
    static ShipmentDeliveredIntegrationEvent from(ShipmentDelivered domainEvent) {
        return new ShipmentDeliveredIntegrationEvent(
            domainEvent.id().value(),
            domainEvent.deliveredAt(),
            domainEvent.pod().documentUrl() // deliberately narrowed: only the URL, not the full POD
        );
    }
}

// published outward, never the raw domain event
eventPublisher.publishExternal(ShipmentDeliveredIntegrationEvent.from(domainEvent));`}</pre>
        </div>
        <p>
          If <code>ProofOfDelivery</code> later grows an internal-only field &mdash; an
          adjuster's case reference, say &mdash; nothing about the public{" "}
          <code>shipment.delivered</code> contract needs to change, because the mapping step
          already decides what crosses the boundary.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Publishing the domain event object directly, reusing it as the integration
            event.</b> Every future refactor of the internal event now risks breaking external
            consumers who were never meant to be coupled to it.
          </li>
          <li>
            <b>Forgetting the mapping step and letting internal-only fields leak outward.</b> An
            internal database ID or an implementation detail published by accident becomes a de
            facto part of the public contract the moment a consumer starts relying on it.
          </li>
          <li>
            <b>Versioning the domain event and the integration event together.</b> That
            reintroduces exactly the coupling this pattern exists to remove &mdash; an internal
            refactor should never force a public contract version bump.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>ShipmentDeliveredIntegrationEvent.from()</code> exist instead of publishing <code>ShipmentDelivered</code> directly?</p>
          <p>
            <b>Answer:</b> It keeps the internal domain event free to evolve for Booking's own
            needs without breaking external consumers, and it lets the team deliberately choose
            what crosses the boundary (only the proof-of-delivery URL, for example, not the whole
            internal object) &mdash; exactly the discipline an integration contract requires.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Never publish a domain event directly across a context boundary &mdash; map it to a
        deliberately-shaped, independently-versioned integration event, so internal refactoring
        and public contract changes stay two separate decisions.
      </p>
    </div>
  );
}
