import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiDesignArchitecturalStylesArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          An API architectural style is the overall shape of how clients and servers talk. The big
          four today are <b>REST</b>, <b>GraphQL</b>, <b>gRPC</b>, and older <b>SOAP</b> &mdash; plus
          event styles like <b>webhooks</b>.
        </p>
        <p>
          There is no &quot;best&quot; one. Each optimises for something different: simplicity,
          flexible queries, raw speed, or strict contracts.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            One company might use all four: a <b>REST</b> API for third-party developers (familiar,
            cacheable), <b>GraphQL</b> for its mobile app (fetch exactly the fields the screen needs
            in one round trip), <b>gRPC</b> between internal microservices (fast, typed), and{" "}
            <b>webhooks</b> to notify partners when an order ships. The style follows the use case.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The styles compared</h2>
        <table className="miniTable">
          <caption>PICK BY WHAT YOU NEED MOST</caption>
          <thead>
            <tr>
              <th>Style</th>
              <th>Transport / format</th>
              <th>Strength</th>
              <th>Weak spot</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>REST</td>
              <td>HTTP + JSON</td>
              <td>Simple, cacheable, universal tooling</td>
              <td>Over/under-fetching; many round trips</td>
            </tr>
            <tr>
              <td>GraphQL</td>
              <td>HTTP + JSON, one endpoint</td>
              <td>Client asks for exactly what it needs</td>
              <td>Caching is hard; complex server; query cost</td>
            </tr>
            <tr>
              <td>gRPC</td>
              <td>HTTP/2 + Protobuf</td>
              <td>Fast, streaming, strict typed contract</td>
              <td>Not browser-native; binary, harder to debug</td>
            </tr>
            <tr>
              <td>SOAP</td>
              <td>HTTP/other + XML</td>
              <td>Formal contracts, built-in standards</td>
              <td>Heavy, verbose, dated tooling</td>
            </tr>
            <tr>
              <td>Webhooks</td>
              <td>HTTP callback</td>
              <td>Server pushes events, no polling</td>
              <td>You must expose an endpoint; retries/security</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 170" role="img" aria-labelledby="stylesTitle">
            <title id="stylesTitle">
              REST uses many resource URLs; GraphQL uses one endpoint with a query; gRPC calls typed
              methods.
            </title>
            <text className="figLabel" x="105" y="20">
              REST
            </text>
            <rect className="box" x="30" y="30" width="150" height="22" />
            <text className="boxText" x="105" y="46">
              GET /users/1
            </text>
            <rect className="box" x="30" y="58" width="150" height="22" />
            <text className="boxText" x="105" y="74">
              GET /users/1/orders
            </text>
            <rect className="box" x="30" y="86" width="150" height="22" />
            <text className="boxText" x="105" y="102">
              GET /orders/9/items
            </text>

            <text className="figLabel" x="320" y="20">
              GRAPHQL
            </text>
            <rect className="boxAccent" x="230" y="30" width="180" height="78" />
            <text className="boxText" x="320" y="52">
              POST /graphql
            </text>
            <text className="boxText" x="320" y="72">
              {"{ user(id:1){ name"}
            </text>
            <text className="boxText" x="320" y="90">
              {"orders{ items }}}"}
            </text>

            <text className="figLabel" x="530" y="20">
              GRPC
            </text>
            <rect className="box" x="450" y="30" width="160" height="22" />
            <text className="boxText" x="530" y="46">
              GetUser(id:1)
            </text>
            <rect className="box" x="450" y="58" width="160" height="22" />
            <text className="boxText" x="530" y="74">
              ListOrders(userId:1)
            </text>
          </svg>
          <figcaption>
            REST: three trips. GraphQL: one trip, exact fields. gRPC: typed method calls, tiny binary
            payloads.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>2. Step by step: choosing a style</h2>
        <ol className="stepList">
          <li>
            <b>Public API for outside developers?</b> &rarr; <b>REST</b>. Lowest learning curve,
            works with every HTTP tool, cache-friendly.
          </li>
          <li>
            <b>A mobile / SPA front-end with many screens needing different slices of data?</b>{" "}
            &rarr; <b>GraphQL</b> cuts round trips and over-fetching.
          </li>
          <li>
            <b>Internal service-to-service, latency-sensitive, same company?</b> &rarr; <b>gRPC</b>{" "}
            for speed, streaming, and generated typed clients.
          </li>
          <li>
            <b>Need to notify another system when something happens?</b> &rarr; <b>webhooks</b> (or a
            message queue) instead of making them poll.
          </li>
          <li>
            <b>Integrating with a bank / government system?</b> &rarr; you may be handed <b>SOAP</b>{" "}
            and a WSDL &mdash; wrap it, do not fight it.
          </li>
        </ol>
        <div className="takeaway">
          Default to REST for anything external. Reach for GraphQL to solve a real client
          data-fetching pain, and gRPC to solve a real internal performance pain.
        </div>
      </section>

      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>GraphQL for a simple CRUD API</h3>
            <p>
              You take on resolver complexity, query-cost analysis, and hard caching to solve a
              problem you did not have.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>gRPC straight to browsers</h3>
            <p>
              Browsers cannot speak raw gRPC. You need grpc-web plus a proxy &mdash; often REST or
              GraphQL at the edge is simpler.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Mixing styles with no reason</h3>
            <p>
              Five styles across a small system multiplies tooling, docs, and auth work. Standardise
              unless a use case truly demands otherwise.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your mobile app makes 6 REST calls to render one screen and still shows a spinner. Which
            style would likely fix this, and what new problem does it introduce that REST handled for
            free?
          </p>
        </div>
      </section>
    </div>
  );
}
