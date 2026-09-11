import "../css/Article.css";

export default function MicroservicesPatternsApiGatewayPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An API gateway is a single entry point that sits in front of a set of microservices,
          routing each incoming request to the right backend service and handling cross-cutting
          concerns — auth, rate limiting, logging — in one place instead of in every service.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Without a gateway, clients would need to know about and call every individual service
          directly, and every service would need to reimplement authentication, rate limiting, and
          request logging. The gateway centralizes that: clients only ever talk to one address, and
          the gateway routes each request onward based on the path, handling shared concerns before
          the request ever reaches a backend service.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Client calls the gateway.</b> A single request goes to{" "}
            <code>api.example.com/orders/42</code> — the client doesn't know or care which
            internal service handles it.</li>
          <li><b>Gateway authenticates.</b> It validates the request's auth token once, centrally.</li>
          <li><b>Gateway routes.</b> Based on the path, it forwards the request to the internal
            orders service.</li>
          <li><b>Gateway can also aggregate.</b> A "dashboard" endpoint might have the gateway call
            three internal services and combine their responses into one payload for the client.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a client calling an API gateway which handles authentication and routing before forwarding requests to the appropriate backend microservice.">
          <rect className="box" x="20" y="50" width="80" height="30" rx="5" /><text x="60" y="70" className="boxText">client</text>
          <line className="flow" x1="100" y1="65" x2="150" y2="65" />
          <rect className="boxAccent" x="160" y="40" width="110" height="50" rx="6" /><text x="215" y="60" className="boxText">API gateway</text><text x="215" y="76" className="figHint">auth, rate limit</text>
          <line className="flow" x1="270" y1="55" x2="330" y2="25" /><line className="flow" x1="270" y1="65" x2="330" y2="65" /><line className="flow" x1="270" y1="75" x2="330" y2="105" />
          <rect className="box" x="335" y="12" width="90" height="26" rx="4" /><text x="380" y="30" className="boxText">orders svc</text>
          <rect className="box" x="335" y="52" width="90" height="26" rx="4" /><text x="380" y="70" className="boxText">users svc</text>
          <rect className="box" x="335" y="92" width="90" height="26" rx="4" /><text x="380" y="110" className="boxText">catalog svc</text>
        </svg>
        <figcaption>One entry point handles cross-cutting concerns once, then routes to the right internal service.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Piling business logic into the gateway turns it into a hidden monolith that every service
          secretly depends on — the gateway should stay focused on routing and cross-cutting
          concerns, not domain logic. It's also a single point of failure if not built for high
          availability, since every request now flows through it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does centralizing authentication in the API gateway avoid duplicating that logic across every microservice?</p>
        </div>
      </section>
      <p className="takeaway">
        An API gateway gives clients one stable entry point and centralizes cross-cutting concerns
        — but it must stay thin on business logic and highly available, since everything now
        flows through it.
      </p>
    </div>
  );
}
