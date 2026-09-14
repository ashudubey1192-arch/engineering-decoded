import "../css/Article.css";

export default function ApiFoundationsApiStylesOverviewArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          "API" describes the contract; it doesn't say which shape that contract takes. REST,
          RPC-style APIs like gRPC, GraphQL, and event-driven APIs are the main styles in use
          today, and each one optimizes for a different relationship between caller and data.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>REST</h3>
            <p>Resources identified by URLs, manipulated with a small fixed set of HTTP methods. Optimizes for cacheability, simplicity, and a uniform interface across many different resources.</p>
          </div>
          <div>
            <h3>RPC / gRPC</h3>
            <p>The API is a set of named functions you call directly, often over HTTP/2 with a binary format (protobuf). Optimizes for speed and strict typing between services you control.</p>
          </div>
          <div>
            <h3>GraphQL</h3>
            <p>One endpoint, and the caller specifies exactly which fields it needs across related resources in a single query. Optimizes for flexible, client-driven data shapes.</p>
          </div>
          <div>
            <h3>Event-driven / webhooks</h3>
            <p>The API pushes a notification when something happens, instead of waiting to be asked. Optimizes for reacting to change rather than polling for it.</p>
          </div>
        </div>
        <p>
          A fifth style, SOAP, still runs in plenty of enterprise and financial systems &mdash; a
          strict, XML-based RPC style with a formal contract language (WSDL) &mdash; but it's rarely
          the right choice for a new API today, and this course treats it as background, not a live
          option.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly actually runs three of these at once, for three different audiences. Partners
          integrating shipment creation use its public <code>REST</code> API, because partners are
          many, external, and need a stable, cacheable, well-documented surface. Internally,
          <code>ShipmentService</code> calls <code>RatingService</code> over <code>gRPC</code>,
          because both are owned by Parcelly, called extremely often, and benefit from strict
          typing and low latency more than they'd benefit from REST's cacheability. Partners who
          want to know the instant a package is delivered subscribe to <code>webhooks</code>,
          because polling a shipment's status every few seconds to catch a change would waste
          everyone's time.
        </p>
        <table className="miniTable">
          <caption>CHOOSING BY WHAT THE CALLER ACTUALLY NEEDS</caption>
          <thead><tr><th>Style</th><th>Best fit</th><th>Trade-off</th></tr></thead>
          <tbody>
            <tr><td>REST</td><td>Public/partner APIs, many independent resources</td><td>Can over- or under-fetch data per request</td></tr>
            <tr><td>gRPC</td><td>Internal, high-throughput service-to-service calls</td><td>Not browser-friendly; needs shared .proto contracts</td></tr>
            <tr><td>GraphQL</td><td>Clients with varied, nested data needs (e.g. mobile)</td><td>Harder to cache; query cost is less predictable</td></tr>
            <tr><td>Webhooks/events</td><td>Reacting to changes instead of polling for them</td><td>Delivery isn't instantaneous or 100% guaranteed</td></tr>
          </tbody>
        </table>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram of four API styles as different shapes of interaction: REST as multiple resource URLs, gRPC as direct function calls, GraphQL as one query endpoint, and webhooks as the server pushing to the client.">
          <text x="55" y="18" className="figLabel" style={{fontSize:"7px"}}>REST</text>
          {[0,1,2].map(i => (
            <rect key={i} className="box" x="20" y={30 + i*24} width="70" height="16" rx="4" />
          ))}
          <text x="55" y="42" className="figHint" style={{fontSize:"5px"}}>/shipments</text>
          <text x="55" y="66" className="figHint" style={{fontSize:"5px"}}>/carriers</text>
          <text x="55" y="90" className="figHint" style={{fontSize:"5px"}}>/rates</text>

          <text x="165" y="18" className="figLabel" style={{fontSize:"7px"}}>gRPC</text>
          <rect className="box" x="130" y="45" width="70" height="24" rx="4" />
          <text x="165" y="60" className="figHint" style={{fontSize:"5px"}}>GetRate()</text>
          <line className="flow" x1="130" y1="57" x2="115" y2="57" />

          <text x="275" y="18" className="figLabel" style={{fontSize:"7px"}}>GraphQL</text>
          <rect className="boxAccent" x="240" y="45" width="70" height="24" rx="4" />
          <text x="275" y="60" className="figHint" style={{fontSize:"5px"}}>one endpoint</text>

          <text x="385" y="18" className="figLabel" style={{fontSize:"7px"}}>Webhooks</text>
          <rect className="box" x="350" y="30" width="70" height="20" rx="4" />
          <text x="385" y="43" className="figHint" style={{fontSize:"5px"}}>Parcelly</text>
          <rect className="box" x="350" y="75" width="70" height="20" rx="4" />
          <text x="385" y="88" className="figHint" style={{fontSize:"5px"}}>Partner</text>
          <line className="flow" x1="385" y1="50" x2="385" y2="73" />
          <text x="385" y="110" className="figHint" style={{fontSize:"5px"}}>server pushes first</text>
        </svg>
        <figcaption>Four different shapes of interaction &mdash; many URLs, direct calls, one flexible query, and a push instead of a pull.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Picking a style because it's trendy, rather than because of who's calling the API, is the
          most common mistake &mdash; adopting GraphQL for a small internal admin tool with three
          fixed screens adds real complexity (schema, resolvers, query cost limits) to solve a
          flexibility problem that tool doesn't have. The opposite mistake is forcing every use
          case through REST out of habit, including cases &mdash; like two services on the same
          internal network calling each other thousands of times a second &mdash; where gRPC's
          lower overhead and strict contract would clearly serve better.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Parcelly's public partner API and its internal ShipmentService-to-RatingService call solve superficially similar problems ("get some data"), but Parcelly uses REST for one and gRPC for the other. What's different about the two situations that justifies the different choice?</p>
        </div>
      </section>
      <p className="takeaway">
        There's no universally "best" API style &mdash; only a best fit for who's calling, how
        often, and what they need back. The rest of this course focuses on REST because it's the
        default for public and partner APIs, but the later Alternative API Styles section returns
        to GraphQL, gRPC, and event-driven APIs in depth.
      </p>
    </div>
  );
}
