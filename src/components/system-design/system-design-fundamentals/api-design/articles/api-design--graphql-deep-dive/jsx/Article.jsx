import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiDesignGraphqlDeepDiveArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          GraphQL is a query language for APIs. The client sends one request describing exactly which
          fields it wants, and the server returns that shape &mdash; nothing more, nothing less.
        </p>
        <p>
          There is one endpoint (<code>/graphql</code>), one HTTP method (usually POST), and a{" "}
          <b>schema</b> that defines every type and field the API offers.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A profile screen needs the user&apos;s name, their last 3 orders, and each order&apos;s
            total. With REST that is <code>GET /users/7</code>, then{" "}
            <code>GET /users/7/orders</code>, then maybe a call per order &mdash; 3&ndash;5 round
            trips, and each returns dozens of fields the screen ignores. With GraphQL it is <b>one</b>{" "}
            request that asks for precisely those fields, and one response containing precisely them.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Query in, matching shape out</h2>
        <pre>
          <code>{`# request
query {
  user(id: 7) {
    name
    orders(last: 3) {
      total
      placedAt
    }
  }
}

# response
{
  "data": {
    "user": {
      "name": "Amy",
      "orders": [
        { "total": 780, "placedAt": "2026-09-01" }
      ]
    }
  }
}`}</code>
        </pre>

        <h2>2. The building blocks</h2>
        <table className="miniTable">
          <caption>GRAPHQL VOCABULARY</caption>
          <thead>
            <tr>
              <th>Term</th>
              <th>What it is</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Schema</td>
              <td>The typed contract: every type, field, and relationship</td>
            </tr>
            <tr>
              <td>Query</td>
              <td>A read. Returns the requested field tree.</td>
            </tr>
            <tr>
              <td>Mutation</td>
              <td>A write (create / update / delete)</td>
            </tr>
            <tr>
              <td>Subscription</td>
              <td>A live stream of updates over WebSocket</td>
            </tr>
            <tr>
              <td>Resolver</td>
              <td>The server function that fetches one field&apos;s data</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="gqlTitle">
            <title id="gqlTitle">
              One GraphQL request fans out to resolvers that pull from several data sources and comes
              back as one response.
            </title>
            <rect className="box" x="20" y="55" width="90" height="40" />
            <text className="boxText" x="65" y="79">
              Client
            </text>
            <line className="flow" x1="110" y1="75" x2="170" y2="75" />
            <rect className="boxAccent" x="170" y="50" width="120" height="50" />
            <text className="boxText" x="230" y="72">
              GraphQL
            </text>
            <text className="boxText" x="230" y="88">
              server
            </text>
            <line className="flow" x1="290" y1="62" x2="360" y2="40" />
            <line className="flow" x1="290" y1="75" x2="360" y2="75" />
            <line className="flow" x1="290" y1="88" x2="360" y2="110" />
            <rect className="box" x="360" y="25" width="120" height="28" />
            <text className="boxText" x="420" y="43">
              users DB
            </text>
            <rect className="box" x="360" y="61" width="120" height="28" />
            <text className="boxText" x="420" y="79">
              orders service
            </text>
            <rect className="box" x="360" y="97" width="120" height="28" />
            <text className="boxText" x="420" y="115">
              reviews API
            </text>
          </svg>
          <figcaption>
            The client sees one endpoint and one response; the server stitches together many sources
            behind the schema.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: a request&apos;s life</h2>
        <ol className="stepList">
          <li>
            <b>Client sends</b> the query string to <code>POST /graphql</code>.
          </li>
          <li>
            <b>Server parses and validates</b> it against the schema &mdash; unknown field or wrong
            type is rejected before any data is touched.
          </li>
          <li>
            <b>Resolvers run,</b> field by field. <code>user</code> hits the users DB;{" "}
            <code>user.orders</code> calls the orders service.
          </li>
          <li>
            <b>The N+1 trap:</b> asking for 50 users and each user&apos;s orders naively fires 51
            queries. A <b>DataLoader</b> batches them into 2.
          </li>
          <li>
            <b>Server assembles</b> the response in the exact shape of the query and returns it, with
            any partial errors in an <code>errors</code> array alongside <code>data</code>.
          </li>
        </ol>
        <div className="takeaway">
          GraphQL moves the &quot;what do I need?&quot; decision from the server to the client. That
          removes over-fetching but hands the server hard problems: caching, query cost, and the N+1
          pattern.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Ignoring the N+1 problem</h3>
            <p>
              Nested lists explode into hundreds of database calls. Batch with DataLoader or
              equivalent from day one.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>No query cost limits</h3>
            <p>
              A deeply nested query can ask for millions of rows in one request. Add depth limits,
              complexity scoring, and pagination.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Expecting HTTP caching to work</h3>
            <p>
              Everything is a POST to one URL, so CDN / browser caching does not apply. You cache at
              the resolver / entity level instead.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            A GraphQL query asks for 100 posts and, for each, its author and the author&apos;s
            follower count. Without care, how many database queries does this fire, and what tool
            reduces it?
          </p>
        </div>
      </section>
    </div>
  );
}
