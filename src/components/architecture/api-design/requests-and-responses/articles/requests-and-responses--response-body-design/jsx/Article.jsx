import "../css/Article.css";

export default function RequestsAndResponsesResponseBodyDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A response body has to serve two different needs at once: the resource's actual data,
          and metadata about the response itself, like pagination. How you separate the two shapes
          every consumer's parsing code for the life of the API.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Bare resource</h3>
            <p>The response body is the resource itself, with no wrapper. Simple, but has nowhere to put metadata like pagination without polluting the resource's own fields.</p>
          </div>
          <div>
            <h3>Enveloped resource</h3>
            <p>The resource sits inside a data field, alongside siblings like meta or links. Slightly more parsing, but a consistent, extensible shape everywhere.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly returns a single shipment bare, but wraps collections in an envelope, because
          collections are exactly the case where metadata (how many total, what page) doesn't
          belong mixed into the array itself:
        </p>
        <span className="codeLabel">GET /v1/shipments/shp_9f8a &mdash; BARE</span>
        <div className="codeBlock">
          <pre>{`{
  "id": "shp_9f8a",
  "status": "in_transit"
}`}</pre>
        </div>
        <span className="codeLabel">GET /v1/shipments &mdash; ENVELOPED</span>
        <div className="codeBlock">
          <pre>{`{
  "data": [
    { "id": "shp_9f8a", "status": "in_transit" },
    { "id": "shp_7c21", "status": "delivered" }
  ],
  "meta": { "total": 214, "page": 1, "per_page": 25 }
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram contrasting a bare single-resource response with an enveloped collection response that separates the data array from pagination metadata.">
          <rect className="boxAccent" x="20" y="35" width="140" height="50" rx="6" />
          <text x="90" y="55" className="figLabel" style={{fontSize:"6px"}}>SINGLE &mdash; BARE</text>
          <text x="90" y="72" className="boxText" style={{fontSize:"6px"}}>id, status</text>
          <rect className="box" x="220" y="20" width="180" height="80" rx="6" />
          <text x="310" y="38" className="figLabel" style={{fontSize:"6px"}}>COLLECTION &mdash; ENVELOPED</text>
          <rect className="box" x="235" y="46" width="150" height="20" rx="4" />
          <text x="310" y="60" className="figHint" style={{fontSize:"5.5px"}}>data: [ ...shipments ]</text>
          <rect className="box" x="235" y="72" width="150" height="20" rx="4" />
          <text x="310" y="86" className="figHint" style={{fontSize:"5.5px"}}>meta: total, page</text>
        </svg>
        <figcaption>A single resource needs no envelope; a collection almost always needs somewhere to put metadata that isn't part of any one item.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Mixing the two approaches inconsistently across an API &mdash; some endpoints bare, some
          enveloped, with no clear rule &mdash; is the most common mistake, and it means every new
          endpoint's shape has to be looked up rather than guessed. Cramming pagination metadata
          into the resource array itself, like appending a fake last "item" that's actually a
          page-count object, is worse: it breaks every consumer that assumes every array element is
          a real resource.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a collection response typically need an envelope even when a single-resource response doesn't?</p>
        </div>
      </section>
      <p className="takeaway">
        Pick bare-vs-enveloped per shape (single resource vs. collection), state the rule once, and
        apply it everywhere &mdash; the goal is that no consumer ever has to check per endpoint
        which one they're getting.
      </p>
    </div>
  );
}
