import "../css/Article.css";

export default function QueryingResourcesSparseFieldsetsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Sparse fieldsets let a caller ask for only the fields it actually needs, trimming payload
          size and parsing cost without standing up a whole new endpoint or a different API style
          just to solve over-fetching.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Field selection parameter</b> &mdash; a convention like <code>?fields=id,status,carrier</code> restricts the response to just those top-level fields.</li>
          <li><b>Always include identifying fields</b> &mdash; a response an app can't key by ID is worse than one that's slightly too large; <code>id</code> is usually returned regardless of the selection.</li>
          <li><b>A REST answer to part of over-fetching</b> &mdash; it solves "too many fields" simply; it doesn't solve "data from multiple different resources in one response," which is what GraphQL is built for.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's mobile app, often on a slow connection, only needs three fields to render a
          shipment list row, out of the twenty-plus a full shipment resource carries:
        </p>
        <span className="codeLabel">FULL VS. SPARSE</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments/shp_9f8a
# returns all 20+ fields: id, status, carrier, packages, addresses, timestamps, ...

GET /v1/shipments/shp_9f8a?fields=id,status,estimated_delivery
# returns exactly those 3 fields (plus id, always included)`}</pre>
        </div>
        <p>
          For a list of 50 shipments on a slow connection, that's the difference between parsing a
          few hundred bytes per row and parsing several kilobytes of fields the list screen never
          renders.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a full shipment resource with many fields next to a sparse response containing only the three fields a mobile list screen actually requested.">
          <rect className="box" x="20" y="15" width="150" height="90" rx="6" />
          <text x="95" y="33" className="figLabel" style={{fontSize:"6px"}}>FULL RESOURCE</text>
          {Array.from({length:6}).map((_,i) => (
            <rect key={i} className="box" x="35" y={42 + i*10} width="120" height="7" rx="2" />
          ))}
          <rect className="boxAccent" x="250" y="35" width="150" height="50" rx="6" />
          <text x="325" y="53" className="figLabel" style={{fontSize:"6px"}}>?fields=id,status,eta</text>
          <text x="325" y="70" className="boxText" style={{fontSize:"6px"}}>3 fields only</text>
          <line className="flow" x1="170" y1="60" x2="248" y2="60" />
        </svg>
        <figcaption>The same resource, trimmed to exactly the fields one screen actually renders &mdash; nothing else crosses the wire.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Supporting <code>?fields</code> on some endpoints but not others is the most common
          mistake &mdash; a consumer that learns the pattern on one endpoint reasonably expects it
          to work everywhere, and a silent full response instead of an error when it's unsupported
          is confusing. Trying to extend field selection to reach into nested relationships (like
          selecting specific fields of a nested carrier object several levels deep) is the other
          common mistake: past one level, the parameter syntax gets complicated fast, and it's
          usually a sign the actual need is better served by GraphQL, covered later in this course.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does sparse fieldsets solve a mobile app's "too many fields" problem, but not a problem like "I need this shipment and its carrier's contact details in one response"?</p>
        </div>
      </section>
      <p className="takeaway">
        Sparse fieldsets are a cheap, incremental fix for over-fetching one resource at a time.
        Once consumers start needing data from multiple related resources shaped differently per
        client, that's usually the signal to reach for a different style, not a more elaborate
        <code>?fields</code> syntax.
      </p>
    </div>
  );
}
