import "../css/Article.css";

export default function AlternativeApiStylesGraphqlDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          GraphQL flips REST's model: instead of the server deciding exactly what shape each
          endpoint returns, the client specifies precisely which fields it wants, across related
          resources, in one query and one round trip.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Schema</b> &mdash; the server defines available types and how they relate; the client queries within that schema, not beyond it.</li>
          <li><b>Resolvers</b> &mdash; server-side functions that fetch each field's data, sometimes from entirely different underlying sources for different fields in the same query.</li>
          <li><b>The N+1 problem</b> &mdash; a naive resolver fetching a related field separately for each item in a list issues one query per item instead of one batched query; the classic GraphQL performance trap, usually solved with request batching.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's internal GraphQL layer, used by its own mobile app, answers in one round trip
          what would take three separate REST calls:
        </p>
        <span className="codeLabel">ONE QUERY, THREE SOURCES</span>
        <div className="codeBlock">
          <pre>{`query {
  shipment(id: "shp_9f8a") {
    status
    carrier { name, supportPhone }
    events(last: 3) { type, occurredAt }
  }
}`}</pre>
        </div>
        <p>
          <code>status</code> resolves from the shipment table, <code>carrier</code> from a
          separate carriers service, and <code>events</code> from an events log &mdash; three
          different sources, stitched together by resolvers into one response, in one request.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of one GraphQL query fanning out through three resolvers to fetch data from three different underlying sources: shipment status, carrier details, and recent events.">
          <rect className="boxAccent" x="170" y="10" width="100" height="30" rx="6" />
          <text x="220" y="29" className="boxText" style={{fontSize:"6.5px"}}>One query</text>
          {["Shipment table","Carriers service","Events log"].map((t,i) => (
            <g key={t}>
              <line className="flow" x1="220" y1="40" x2={65 + i*145} y2="75" />
              <rect className="box" x={20 + i*145} y="75" width="90" height="30" rx="5" />
              <text x={65 + i*145} y="94" className="boxText" style={{fontSize:"5.5px"}}>{t}</text>
            </g>
          ))}
        </svg>
        <figcaption>One request from the client, three resolvers fetching from three different sources &mdash; assembled into a single response.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Exposing GraphQL as a public, partner-facing API with no query cost limiting is a real
          risk unique to this style &mdash; an arbitrarily deep, nested query can be expensive to
          compute in ways a fixed set of REST endpoints simply can't be asked to do. Naive resolvers
          causing the N+1 problem are the more common everyday mistake: invisible in a small test
          with three items, catastrophic in production against a list of thousands.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a resolver that looks perfectly correct against a 3-item test list cause a serious performance problem against a 5,000-item production list?</p>
        </div>
      </section>
      <p className="takeaway">
        GraphQL trades REST's fixed, predictable response shapes for flexibility the client
        controls &mdash; and that flexibility is exactly what has to be guarded, with query cost
        limits and batched resolvers, once it's exposed beyond a trusted internal client.
      </p>
    </div>
  );
}
