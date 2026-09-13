import "../css/Article.css";

export default function ArchitecturePatternsMicroservicesCaseStudyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Pulling every idea from this course together, consider one realistic scenario end to end
          &mdash; taking a food delivery platform's monolith apart into microservices &mdash; using
          the same decisions, in the same order, that come up in almost any real decomposition.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The decisions happen in sequence, not all at once. First, identify bounded contexts
          &mdash; Ordering, Restaurant Catalog, Delivery Logistics, Payments &mdash; before writing a
          single line of new service code. Then give each its own database, chosen for that context's
          own access patterns. Then decide communication per interaction: synchronous where a caller
          needs an immediate answer (checking payment authorization), asynchronous and event-driven
          where it doesn't (notifying Delivery once payment clears). Only then design failure handling
          per dependency &mdash; a circuit breaker around the restaurant's own third-party menu API,
          which is far less reliable than anything internal.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          The resulting <code>OrderingService</code> calls <code>PaymentService</code>
          synchronously, since it needs an immediate approve-or-decline, but only publishes an
          <code>OrderPaid</code> event for <code>DeliveryService</code> and
          <code>NotificationService</code> to react to independently &mdash; the same sync-vs-async
          reasoning from earlier in this course, applied here to one specific pair of interactions.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 160" role="img" aria-label="Architecture diagram of a food delivery platform decomposed into Ordering, Catalog, Payment, Delivery, and Notification services, each with its own database, connected by a mix of solid synchronous call arrows and dashed asynchronous event arrows.">
          <rect className="boxAccent" x="150" y="15" width="120" height="26" rx="5" />
          <text x="210" y="32" className="boxText" style={{fontSize:"6px"}}>OrderingService</text>
          <rect className="box" x="20" y="70" width="100" height="26" rx="5" />
          <text x="70" y="87" className="boxText" style={{fontSize:"5.5px"}}>CatalogService</text>
          <rect className="box" x="300" y="70" width="100" height="26" rx="5" />
          <text x="350" y="87" className="boxText" style={{fontSize:"5.5px"}}>PaymentService</text>
          <rect className="box" x="20" y="120" width="100" height="26" rx="5" />
          <text x="70" y="137" className="boxText" style={{fontSize:"5.5px"}}>DeliveryService</text>
          <rect className="box" x="300" y="120" width="100" height="26" rx="5" />
          <text x="350" y="137" className="boxText" style={{fontSize:"5.5px"}}>NotificationService</text>
          <line className="flow" x1="150" y1="41" x2="90" y2="68" />
          <line className="flow" x1="270" y1="41" x2="330" y2="68" />
          <line className="flowMuted" x1="180" y1="41" x2="90" y2="118" />
          <line className="flowMuted" x1="240" y1="41" x2="330" y2="118" />
          <text x="210" y="150" className="figHint" style={{fontSize:"6px"}}>solid = synchronous call &middot; dashed = async event</text>
        </svg>
        <figcaption>Each edge's style is a deliberate choice &mdash; synchronous where an immediate answer is required, event-driven everywhere it isn't.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping the bounded-context step and decomposing along technical layers instead &mdash; a
          "database service," a "business logic service" &mdash; recreates a distributed monolith:
          every resilience and communication lesson in this course still applies, but the fundamental
          boundaries are wrong from the start, and everything built on top inherits that mistake.
          Making every interaction synchronous "to keep things simple" reintroduces the very
          cascading-failure risk that bounded contexts, circuit breakers, and event-driven
          communication were each separately designed to avoid.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>DeliveryService needs to notify a customer's app that their driver is two minutes away. Applying the same reasoning as OrderingService's call to PaymentService, should this be synchronous or event-driven, and why?</p>
        </div>
      </section>
      <p className="takeaway">
        Good microservices architecture isn't one clever trick &mdash; it's this same sequence of
        deliberate decisions, bounded contexts first, then data ownership, then communication style,
        then failure handling, applied consistently, one interaction at a time.
      </p>
    </div>
  );
}
