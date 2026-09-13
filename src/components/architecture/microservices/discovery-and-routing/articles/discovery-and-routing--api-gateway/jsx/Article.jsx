import "../css/Article.css";

export default function DiscoveryAndRoutingApiGatewayArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An API gateway is the single front door external clients call through &mdash; it takes on
          the cross-cutting work (authentication, rate limiting, routing to the right internal
          service) once, at the edge, instead of every service reimplementing it separately.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A client makes one request to the gateway; the gateway authenticates it, checks rate
          limits, and routes it to whichever internal service actually owns that resource &mdash;
          internal services never need to be reachable from outside the network directly at all.
          The gateway can also aggregate: combining data from several internal calls into one
          response, so the client doesn't need to know how many services were involved.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A mobile app requests <code>GET /api/orders/7734</code> from the gateway. The gateway
          validates the client's auth token once, then internally calls
          <code>OrderService</code> for the order and <code>ShippingService</code> for tracking
          status, and merges both into one JSON response &mdash; the mobile app never makes two
          separate calls or even knows two services were involved.
        </p>
        <span className="codeLabel">ONE CLIENT REQUEST, TWO INTERNAL CALLS</span>
        <div className="codeBlock">
          <pre>{`GET /api/orders/7734  (from mobile client, one auth token)
  gateway -> OrderService.getOrder(7734)
  gateway -> ShippingService.getTracking(7734)
  gateway merges both -> single JSON response to client`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of an API gateway: a mobile client sends one authenticated request to the gateway, which internally calls both OrderService and ShippingService and merges their responses into a single reply.">
          <rect className="box" x="20" y="45" width="90" height="28" rx="6" />
          <text x="65" y="63" className="boxText" style={{fontSize:"6.5px"}}>Mobile client</text>
          <rect className="boxAccent" x="160" y="45" width="100" height="28" rx="6" />
          <text x="210" y="63" className="boxText" style={{fontSize:"6.5px"}}>API Gateway</text>
          <line className="flow" x1="110" y1="59" x2="158" y2="59" />
          <rect className="box" x="320" y="20" width="90" height="26" rx="5" />
          <text x="365" y="36" className="boxText" style={{fontSize:"6px"}}>OrderService</text>
          <rect className="box" x="320" y="80" width="90" height="26" rx="5" />
          <text x="365" y="96" className="boxText" style={{fontSize:"6px"}}>ShippingService</text>
          <line className="flow" x1="260" y1="55" x2="318" y2="35" />
          <line className="flow" x1="260" y1="62" x2="318" y2="90" />
        </svg>
        <figcaption>The client sees one request and one response; the gateway is what fans that out to two internal services and merges the results.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Letting the gateway accumulate real business logic &mdash; beyond routing, auth, and
          aggregation &mdash; slowly turns it into a new kind of monolith that every team depends on
          and fears changing. The other common mistake is a single gateway serving every kind of
          client (mobile, web, partner APIs) with one shared response shape, which forces awkward
          compromises; the next lesson, Backend for Frontend, is the usual fix for that.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does putting authentication and rate limiting at the gateway, rather than in each internal service, reduce duplicated work across the system?</p>
        </div>
      </section>
      <p className="takeaway">
        A gateway centralizes cross-cutting concerns at the edge &mdash; keep it disciplined about
        staying out of business logic, or it quietly becomes the monolith you were trying to avoid.
      </p>
    </div>
  );
}
