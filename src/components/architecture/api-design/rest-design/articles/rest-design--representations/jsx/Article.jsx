import "../css/Article.css";

export default function RestDesignRepresentationsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A resource and its representation are two different things &mdash; the resource is the
          conceptual "shipment shp_9f8a"; the representation is the specific bytes sent over the
          wire to describe it right now, in one particular format.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Resource</b> &mdash; the stable, addressable concept: "shipment shp_9f8a," identified by its URI, regardless of format.</li>
          <li><b>Representation</b> &mdash; one serialized snapshot of that resource: JSON today, maybe CSV for a bulk export, maybe a PDF for a shipping label.</li>
          <li><b>Same URI, different representations</b> &mdash; the client asks for the representation it wants; the identity of the resource doesn't change because the format did.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's <code>/v1/shipments/shp_9f8a</code> resource has exactly one canonical
          identity but two representations partners actually use: a JSON representation for normal
          API calls, and a PDF representation for the printable shipping label at
          <code>/v1/shipments/shp_9f8a/label</code>. Notice that the label is modeled as its own
          sub-resource, not as a format switch on the shipment itself &mdash; a label has its own
          meaningful identity (it can be regenerated, it expires, it has its own content type)
          distinct from "the shipment, but as a PDF."
        </p>
        <span className="codeLabel">SAME SHIPMENT, TWO CONTEXTS</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments/shp_9f8a          -> JSON representation of the shipment
GET /v1/shipments/shp_9f8a/label    -> PDF representation of its label`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of one shipment resource producing two different representations: a JSON body for API calls, and a PDF for the printable label, each reached through a different request.">
          <rect className="boxAccent" x="165" y="15" width="100" height="34" rx="6" />
          <text x="215" y="36" className="boxText" style={{fontSize:"7px"}}>Shipment shp_9f8a</text>
          <rect className="box" x="60" y="90" width="100" height="30" rx="5" />
          <text x="110" y="109" className="boxText" style={{fontSize:"6.5px"}}>JSON body</text>
          <rect className="box" x="260" y="90" width="100" height="30" rx="5" />
          <text x="310" y="109" className="boxText" style={{fontSize:"6.5px"}}>PDF label</text>
          <line className="flow" x1="195" y1="49" x2="120" y2="88" />
          <line className="flow" x1="235" y1="49" x2="305" y2="88" />
          <text x="110" y="135" className="figHint" style={{fontSize:"6px"}}>GET /shipments/shp_9f8a</text>
          <text x="310" y="135" className="figHint" style={{fontSize:"6px"}}>GET .../shp_9f8a/label</text>
        </svg>
        <figcaption>One resource, reached two different ways, each returning a representation suited to that request.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Baking the format into every URI as a matter of habit &mdash; <code>/shipments.json</code>
          and <code>/shipments.xml</code> as separate paths &mdash; duplicates a resource's identity
          across multiple URIs for no real benefit when content negotiation could serve both from
          one URI. The opposite mistake is forcing content negotiation onto a case where a distinct
          URI is genuinely clearer, like the shipping label above: a partner linking directly to a
          downloadable PDF benefits from a stable, bookmarkable URL more than from an
          <code>Accept</code> header they'd have to remember to set.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does it make more sense to model a shipping label as its own sub-resource than as "the shipment resource, requested in PDF format"?</p>
        </div>
      </section>
      <p className="takeaway">
        A URI identifies a resource, not a file format. Reach for content negotiation when
        different consumers genuinely want the same resource in different formats, and reach for a
        distinct sub-resource when the "different format" is really a different, independently
        meaningful thing.
      </p>
    </div>
  );
}
