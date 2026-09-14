import "../css/Article.css";

export default function ApiPlatformApiGatewaysArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          An API gateway is the single front door every external request passes through before
          reaching any backend service &mdash; centralizing concerns like authentication and rate
          limiting that would otherwise have to be reimplemented, and kept consistent, in every
          service behind it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Authentication and authorization</b> &mdash; validated once at the gateway, not reimplemented separately in every backend service.</li>
          <li><b>Rate limiting</b> &mdash; enforced at one chokepoint, so limits are consistent regardless of which backend service ultimately handles a request.</li>
          <li><b>Routing</b> &mdash; the gateway maps a public URL to whichever internal service actually owns it, letting that internal topology change freely.</li>
          <li><b>Infrastructure, not design</b> &mdash; a gateway doesn't fix bad resource modeling or inconsistent naming; it sits below those decisions, not in place of them.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A partner's request to <code>GET /v1/shipments/shp_9f8a</code> hits Parcelly's gateway
          first. The gateway validates the API key, checks the caller's rate limit, and only then
          routes the request to <code>ShipmentService</code>. <code>ShipmentService</code> itself
          never checks an API key at all &mdash; it trusts every request that reaches it, because
          the network is configured so only the gateway can reach it directly.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram of external traffic reaching one gateway that handles authentication, rate limiting, and routing, before forwarding to one of several internal backend services that are not directly reachable from outside.">
          <rect className="box" x="180" y="10" width="80" height="30" rx="5" />
          <text x="220" y="29" className="boxText" style={{fontSize:"6px"}}>Partner</text>
          <rect className="boxAccent" x="150" y="65" width="140" height="40" rx="7" />
          <text x="220" y="82" className="boxText" style={{fontSize:"6.5px"}}>Gateway</text>
          <text x="220" y="96" className="figHint" style={{fontSize:"5px"}}>auth, rate limit, route</text>
          <line className="flow" x1="220" y1="40" x2="220" y2="63" />
          {["ShipmentService","CarrierService","RatingService"].map((t,i) => (
            <g key={t}>
              <rect className="box" x={40 + i*130} y="120" width="100" height="28" rx="5" />
              <text x={90 + i*130} y="138" className="boxText" style={{fontSize:"5.5px"}}>{t}</text>
              <line className="flowMuted" x1="220" y1="105" x2={90 + i*130} y2="118" />
            </g>
          ))}
        </svg>
        <figcaption>Only the gateway is reachable from outside &mdash; every backend service trusts requests that arrive because nothing else can reach them directly.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Letting business logic creep into the gateway is a common mistake &mdash; routing,
          authentication, and rate limiting belong there; validating a shipment's business rules
          does not, and a gateway that grows that kind of logic becomes a second, hidden
          implementation of the API that's hard to reason about or test. Leaving individual
          backend services directly reachable, bypassing the gateway, is the more dangerous
          mistake: it defeats every centralized protection the gateway was supposed to provide, for
          any request that finds the bypass.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is it safe for ShipmentService to skip checking API keys entirely, given that the gateway already checks them?</p>
        </div>
      </section>
      <p className="takeaway">
        A gateway centralizes the concerns every service would otherwise duplicate inconsistently
        &mdash; keep it focused on cross-cutting infrastructure, and make sure it's genuinely the
        only way in.
      </p>
    </div>
  );
}
