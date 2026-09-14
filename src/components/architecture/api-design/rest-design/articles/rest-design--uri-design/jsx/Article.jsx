import "../css/Article.css";

export default function RestDesignUriDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A URI names a resource, so it should read like a noun phrase you could say out loud
          &mdash; not a function call. A handful of consistent conventions make an entire API's
          worth of URLs predictable after seeing just two or three of them.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Nouns, not verbs</b> &mdash; the path names the resource; the HTTP method supplies the verb.</li>
          <li><b>Plural collection names</b> &mdash; <code>/shipments</code>, not <code>/shipment</code>, so both "the collection" and "one member of it" read naturally.</li>
          <li><b>Lowercase, hyphen-separated segments</b> &mdash; <code>/return-labels</code>, not <code>/returnLabels</code> or <code>/Return_Labels</code>.</li>
          <li><b>Hierarchy reflects real containment</b> &mdash; stop nesting once you're past direct ownership; two or three levels deep is usually the practical ceiling.</li>
          <li><b>Query strings filter and control, they don't identify</b> &mdash; <code>?status=in_transit</code> narrows a collection; it doesn't name a different resource.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <table className="miniTable">
          <caption>BEFORE AND AFTER</caption>
          <thead><tr><th>Avoid</th><th>Prefer</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td><code>/getShipment?id=9f8a</code></td><td><code>/shipments/shp_9f8a</code></td><td>The path names the resource; no verb, no ID in the query string.</td></tr>
            <tr><td><code>/shipment/9f8a</code></td><td><code>/shipments/shp_9f8a</code></td><td>Plural collection name, consistent whether one or many.</td></tr>
            <tr><td><code>/shipments/9f8a/cancelShipment</code></td><td><code>/shipments/shp_9f8a/cancellation</code></td><td>The action becomes a resource the client creates, not a verb in the path.</td></tr>
            <tr><td><code>/shipments/9f8a/packages/3/events/7/details</code></td><td><code>/events/evt_7</code> <i>(flat ID)</i></td><td>Four levels deep is a sign the resource deserves its own addressable identity.</td></tr>
          </tbody>
        </table>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Anatomy of a URI: scheme and host, then path segments naming a collection and a resource ID, then a query string used only for filtering.">
          <text x="220" y="20" className="figHint" style={{fontSize:"6.5px"}}>https://api.parcelly.com/v1/shipments/shp_9f8a?status=in_transit</text>
          <rect className="box" x="10" y="35" width="150" height="24" rx="4" />
          <text x="85" y="51" className="boxText" style={{fontSize:"6px"}}>scheme + host</text>
          <rect className="boxAccent" x="170" y="35" width="150" height="24" rx="4" />
          <text x="245" y="51" className="boxText" style={{fontSize:"6px"}}>path &mdash; names the resource</text>
          <rect className="box" x="330" y="35" width="100" height="24" rx="4" />
          <text x="380" y="51" className="boxText" style={{fontSize:"5.5px"}}>query &mdash; filters it</text>
          <line className="divider" x1="10" y1="70" x2="430" y2="70" />
          <text x="245" y="90" className="figHint" style={{fontSize:"6px"}}>same resource, any filter &mdash; the path never changes because of a query parameter</text>
        </svg>
        <figcaption>The path identifies which resource; the query string only ever narrows or sorts, never renames.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Putting a verb in the path &mdash; <code>/shipments/cancel/shp_9f8a</code> &mdash; is the
          most common mistake, usually a sign the design started from "what function do I need to
          call" instead of "what resource am I changing the state of." Mixing singular and plural
          across an API (<code>/shipment</code> here, <code>/carriers</code> there) is smaller but
          still costly: it turns "guess the next URL" from a reliable skill into a coin flip.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does turning "cancel a shipment" into POST /shipments/shp_9f8a/cancellation fit REST's resource-oriented style better than POST /shipments/cancel/shp_9f8a?</p>
        </div>
      </section>
      <p className="takeaway">
        A consistent, noun-based URI scheme is a small investment that pays off every single time
        someone has to guess a URL they haven't seen yet &mdash; and in a large API, that's
        constantly.
      </p>
    </div>
  );
}
