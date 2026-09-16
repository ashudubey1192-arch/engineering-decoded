export default function TacticalModelingDomainServicesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A domain service holds a piece of business logic that genuinely does not belong to any
          single entity or value object &mdash; usually because it operates across several of
          them. Cargoflow's <code>RouteOptimizer</code> is a domain service: choosing a route
          involves a <code>ShipmentRequest</code>, a list of <code>CarrierCapacity</code> objects,
          and pricing rules, and no single one of those objects should own that decision.
        </p>
        <p>
          Domain services are a deliberate exception, not a default. Most behavior belongs on an
          entity or value object; a domain service exists only when forcing the logic onto one of
          them would be artificial.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Deciding: method on an object, or a domain service?</h2>
        <ol className="stepList">
          <li>
            <b>Try the entity or value object first.</b> "Can this shipment be delivered?" belongs
            on <code>Shipment</code> itself &mdash; it needs no other object's data.
          </li>
          <li>
            <b>Check whether the logic naturally spans multiple objects with no clear owner.</b>{" "}
            "Which carrier should handle this shipment?" needs a <code>ShipmentRequest</code> and
            a whole list of carriers &mdash; no single carrier or shipment can decide this alone.
          </li>
          <li>
            <b>If step 2 is true, and forcing it onto one object would mean that object reaching
            into unrelated data, use a domain service.</b> Making <code>Carrier</code> respond to
            "pick yourself if you're the best fit" would make every carrier aware of every other
            carrier &mdash; a clear sign the logic belongs elsewhere.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 580 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="30" width="130" height="50" rx="8" />
            <text className="boxText" x="95" y="60">ShipmentRequest</text>
            <rect className="box" x="30" y="100" width="130" height="50" rx="8" />
            <text className="boxText" x="95" y="130">CarrierCapacity[]</text>
            <rect className="boxAccent" x="250" y="60" width="180" height="60" rx="10" />
            <text className="boxText" x="340" y="85">RouteOptimizer</text>
            <text className="figHint" x="340" y="103">domain service</text>
            <line className="flow" x1="160" y1="55" x2="250" y2="80" />
            <line className="flow" x1="160" y1="125" x2="250" y2="100" />
            <rect className="box" x="470" y="60" width="100" height="60" rx="8" />
            <text className="boxText" x="520" y="95">RouteOption</text>
            <line className="flow" x1="430" y1="90" x2="470" y2="90" />
          </svg>
          <figcaption>A domain service coordinates several objects toward one decision that no single object should own alone.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A domain service, stateless and focused</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class RouteOptimizer {
    // Stateless: no fields, no identity -- just a named piece of domain logic.
    public RouteOption optimize(ShipmentRequest request, List<CarrierCapacity> available) {
        return available.stream()
            .flatMap(capacity -> candidateRoutes(request, capacity))
            .filter(route -> route.meetsDeadline(request.deadline()))
            .min(Comparator.comparing(RouteOption::totalCost))
            .orElseThrow(() -> new NoViableRouteException(request));
    }
}`}</pre>
        </div>
        <p>
          Note what is absent: no mutable fields, no identity, no persistence. A domain service is
          a pure operation named after a verb phrase from the ubiquitous language &mdash; "optimize
          a route" &mdash; not a data holder.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for a domain service as the default home for new logic.</b> Overused, this
            produces an anemic model where entities are just data and all behavior lives in
            services &mdash; the exact pattern DDD's tactical modeling exists to avoid.
          </li>
          <li>
            <b>Giving a domain service mutable state.</b> If it needs state, it is probably an
            entity or aggregate in disguise, not a stateless service.
          </li>
          <li>
            <b>Confusing a domain service with an application service.</b> An application service
            coordinates a use case (handle an HTTP request, start a transaction); a domain service
            holds business logic. <code>RouteOptimizer</code> knows nothing about HTTP or
            transactions.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why isn't "choose the best carrier" a method on the Carrier class?</p>
          <p>
            <b>Answer:</b> It requires comparing multiple carriers against one shipment request,
            which no single Carrier instance has the data to do on its own. Forcing it there would
            make each carrier artificially aware of every other carrier.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for a domain service only when logic genuinely spans multiple objects with no
        natural owner &mdash; keep it stateless, and try the entity or value object first.
      </p>
    </div>
  );
}
