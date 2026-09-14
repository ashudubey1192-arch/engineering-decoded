import "../css/Article.css";

export default function ContractsAndDocsSchemaDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Inside an OpenAPI document, schemas are where a field's actual shape gets nailed down
          &mdash; and reusing one shared schema through <code>$ref</code> is what keeps a hundred
          endpoints from silently drifting into a hundred slightly different ideas of what "a
          shipment" is.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Define once, reference everywhere</b> &mdash; a resource's schema lives in <code>components/schemas</code>, referenced with <code>$ref</code> from every operation that uses it.</li>
          <li><b>Required vs. optional, stated explicitly</b> &mdash; the same distinction from earlier in this course, now expressed formally enough that tooling can validate it.</li>
          <li><b>Format annotations</b> &mdash; <code>date-time</code>, <code>email</code>, <code>uri</code> give validators and generators far more to work with than a bare <code>string</code> type.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's <code>Shipment</code> schema is defined once and referenced from the
          single-resource response, the list endpoint's array items, and the creation response
          &mdash; three very different places in the spec, one single definition behind all of
          them:
        </p>
        <span className="codeLabel">ONE SCHEMA, THREE REFERENCES</span>
        <div className="codeBlock">
          <pre>{`components:
  schemas:
    Shipment:
      type: object
      required: [id, status, carrier]
      properties:
        id: { type: string }
        status: { type: string, enum: [created, in_transit, delivered] }
        estimated_delivery: { type: string, format: date-time }

# referenced from:  GET /shipments/{id} response
#                    GET /shipments list response items
#                    POST /shipments response`}</pre>
        </div>
        <p>
          Renaming or adding a field to <code>Shipment</code> now happens in exactly one place in
          the spec, and every endpoint that returns a shipment picks up the change automatically.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of one Shipment schema referenced by three different OpenAPI operations: the single-resource response, the list response's items, and the creation response.">
          <rect className="boxAccent" x="165" y="15" width="90" height="34" rx="6" />
          <text x="210" y="36" className="boxText" style={{fontSize:"7px"}}>Shipment schema</text>
          {["GET single","GET list items","POST response"].map((t, i) => (
            <g key={t}>
              <rect className="box" x={20 + i*140} y="90" width="120" height="30" rx="5" />
              <text x={80 + i*140} y="109" className="boxText" style={{fontSize:"6px"}}>{t}</text>
              <line className="flowMuted" x1={80 + i*140} y1="88" x2="210" y2="50" />
            </g>
          ))}
        </svg>
        <figcaption>Three operations, one referenced schema &mdash; a field change in the schema reaches all three automatically.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Copy-pasting the same object shape inline into multiple operations, instead of extracting
          a shared schema, is the most common mistake &mdash; the three copies inevitably drift the
          first time one of them gets updated and the others don't. Declaring every field as a bare
          <code>string</code> with no format annotation is the other common one: it works, but it
          throws away validation and code-generation quality that the same spec could have provided
          for free.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does defining Shipment once in components/schemas and referencing it three times prevent the exact kind of drift that three inline copies would eventually suffer?</p>
        </div>
      </section>
      <p className="takeaway">
        A shared, referenced schema is what makes a large spec maintainable &mdash; every inline
        duplicate is a future inconsistency waiting for one endpoint to get updated without the
        others.
      </p>
    </div>
  );
}
