import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiInfrastructureApiGatewaysArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          An API gateway is a single entry point that sits in front of many backend services. Every
          client request goes through it, and it handles the concerns common to all APIs so the
          services do not have to.
        </p>
        <p>
          Think of it as a smart reverse proxy specialised for APIs: routing, auth, rate limiting,
          and request shaping in one place.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You have 12 microservices. Without a gateway, each one re-implements token validation,
            rate limiting, CORS, logging, and TLS &mdash; 12 times, slightly differently, with 12
            public addresses to secure. With a gateway, clients hit one URL, the gateway checks the
            token once, applies limits, and routes to the right service. The services become simple
            and private.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. What a gateway does</h2>
        <table className="miniTable">
          <caption>CROSS-CUTTING CONCERNS, HANDLED ONCE</caption>
          <thead>
            <tr>
              <th>Concern</th>
              <th>At the gateway</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Routing</td>
              <td>
                <code>/orders/*</code> &rarr; order service, <code>/users/*</code> &rarr; user
                service
              </td>
            </tr>
            <tr>
              <td>Authentication</td>
              <td>Validate the JWT / API key, reject before it reaches a service</td>
            </tr>
            <tr>
              <td>Rate limiting</td>
              <td>Per-client quotas, throttling, quota headers</td>
            </tr>
            <tr>
              <td>TLS termination</td>
              <td>One place to manage certificates</td>
            </tr>
            <tr>
              <td>Aggregation</td>
              <td>Combine 3 service calls into one client response</td>
            </tr>
            <tr>
              <td>Observability</td>
              <td>Uniform logs, metrics, tracing, and a correlation ID</td>
            </tr>
            <tr>
              <td>Transformation</td>
              <td>Protocol / version translation, response caching</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 180" role="img" aria-labelledby="gwTitle">
            <title id="gwTitle">
              Web, mobile, and partner clients all hit one gateway, which authenticates, limits, and
              routes to the right internal service.
            </title>
            <rect className="box" x="20" y="20" width="90" height="28" />
            <text className="boxText" x="65" y="39">
              web
            </text>
            <rect className="box" x="20" y="76" width="90" height="28" />
            <text className="boxText" x="65" y="95">
              mobile
            </text>
            <rect className="box" x="20" y="132" width="90" height="28" />
            <text className="boxText" x="65" y="151">
              partner
            </text>
            <line className="flow" x1="110" y1="34" x2="200" y2="85" />
            <line className="flow" x1="110" y1="90" x2="200" y2="90" />
            <line className="flow" x1="110" y1="146" x2="200" y2="95" />
            <rect className="boxAccent" x="200" y="65" width="120" height="50" />
            <text className="boxText" x="260" y="86">
              API gateway
            </text>
            <text className="boxText" x="260" y="102">
              auth &middot; limit &middot; route
            </text>
            <line className="flow" x1="320" y1="78" x2="410" y2="40" />
            <line className="flow" x1="320" y1="90" x2="410" y2="90" />
            <line className="flow" x1="320" y1="102" x2="410" y2="140" />
            <rect className="box" x="410" y="25" width="150" height="28" />
            <text className="boxText" x="485" y="44">
              order service
            </text>
            <rect className="box" x="410" y="76" width="150" height="28" />
            <text className="boxText" x="485" y="95">
              user service
            </text>
            <rect className="box" x="410" y="127" width="150" height="28" />
            <text className="boxText" x="485" y="146">
              catalog service
            </text>
          </svg>
          <figcaption>
            One public front door; the services behind it are private and focused on business logic.
          </figcaption>
        </figure>

        <h2>2. Gateway vs load balancer vs BFF</h2>
        <ul>
          <li>
            <b>Load balancer:</b> spreads traffic across identical copies of <i>one</i> service.
          </li>
          <li>
            <b>API gateway:</b> routes to <i>different</i> services and adds API concerns (auth,
            limits, aggregation).
          </li>
          <li>
            <b>Backend for Frontend (BFF):</b> a gateway tailored to one client type &mdash; e.g. a
            mobile BFF that returns exactly what the app screens need.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>3. Step by step: a request through the gateway</h2>
        <ol className="stepList">
          <li>
            <b>Client sends</b> <code>GET /v1/orders/42</code> with{" "}
            <code>Authorization: Bearer &hellip;</code> to <code>api.example.com</code>.
          </li>
          <li>
            <b>TLS terminates</b> at the gateway.
          </li>
          <li>
            <b>Auth:</b> the gateway verifies the JWT signature and expiry. Invalid &rarr; 401, the
            order service is never touched.
          </li>
          <li>
            <b>Rate limit:</b> check this client&apos;s counter. Over quota &rarr; 429 with{" "}
            <code>Retry-After</code>.
          </li>
          <li>
            <b>Route + enrich:</b> match <code>/v1/orders/*</code> &rarr; order service; add{" "}
            <code>X-User-Id</code> and <code>X-Correlation-Id</code> headers.
          </li>
          <li>
            <b>Forward, then respond:</b> relay the service&apos;s response, record latency and
            status for metrics.
          </li>
        </ol>
        <div className="takeaway">
          A gateway removes duplicated plumbing from every service &mdash; but it is also a critical
          shared component, so run it redundantly and keep its logic thin.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Business logic in the gateway</h3>
            <p>
              Pricing rules or workflow logic creeping into the gateway makes it a bottleneck and a
              deploy chokepoint. Keep it to cross-cutting concerns.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Backends still publicly reachable</h3>
            <p>
              If a service has a public IP, clients (and attackers) can bypass the gateway&apos;s
              auth and limits. Lock services to the gateway&apos;s network.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Single gateway instance</h3>
            <p>
              Now every service is only as available as one box. Run a redundant pair or a managed
              gateway.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Name three responsibilities you would move <i>out</i> of 10 microservices and into an API
            gateway, and one responsibility that should <i>not</i> live in the gateway.
          </p>
        </div>
      </section>
    </div>
  );
}
