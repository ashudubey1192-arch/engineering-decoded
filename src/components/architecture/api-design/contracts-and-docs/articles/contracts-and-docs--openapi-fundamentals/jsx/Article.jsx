import "../css/Article.css";

export default function ContractsAndDocsOpenapiFundamentalsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          OpenAPI is a machine-readable description of an entire HTTP API's contract &mdash; every
          endpoint, parameter, and request and response shape &mdash; written once and usable by
          humans and tooling alike, instead of scattered across hand-written docs that drift from
          reality.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Paths and operations</b> &mdash; each URL and the HTTP methods it supports, like <code>GET /shipments/{`{id}`}</code>.</li>
          <li><b>Parameters and request bodies</b> &mdash; what an operation accepts, and exactly what shape it takes.</li>
          <li><b>Responses</b> &mdash; every status code an operation can return, and the schema of each one's body.</li>
          <li><b>Components/schemas</b> &mdash; reusable type definitions, referenced from many operations instead of repeated inline.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>A minimal slice of Parcelly's spec for reading one shipment:</p>
        <span className="codeLabel">OPENAPI.YAML (EXCERPT)</span>
        <div className="codeBlock">
          <pre>{`paths:
  /shipments/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Shipment"`}</pre>
        </div>
        <p>
          One document like this drives an entire toolchain: generated reference docs, generated
          client SDKs in multiple languages, a mock server for partners to build against early, and
          automated tests that check real responses against it &mdash; all derived from one source
          instead of maintained by hand in five different places.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 160" role="img" aria-label="Diagram of one OpenAPI document at the center feeding four different outputs: generated documentation, generated client SDKs, a mock server, and automated contract tests.">
          <rect className="boxAccent" x="175" y="65" width="90" height="40" rx="7" />
          <text x="220" y="89" className="boxText" style={{fontSize:"7px"}}>openapi.yaml</text>
          {["Docs","SDKs","Mock server","Contract tests"].map((t,i) => (
            <g key={t}>
              <rect className="box" x={20 + i*105} y="10" width="90" height="30" rx="5" />
              <text x={65 + i*105} y="29" className="boxText" style={{fontSize:"6px"}}>{t}</text>
              <line className="flowMuted" x1="220" y1="65" x2={65 + i*105} y2="40" />
            </g>
          ))}
        </svg>
        <figcaption>One document, generated outward into every tool that needs to know the contract &mdash; nothing here is hand-maintained separately.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating the OpenAPI file as documentation busywork, written once after launch and never
          touched again, is the most common mistake &mdash; it drifts out of sync with the real
          implementation almost immediately and becomes actively misleading rather than merely
          incomplete. Hand-writing reference docs separately from the spec, instead of generating
          them from it, guarantees the same fate: two sources of truth that will eventually
          disagree.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does generating docs, SDKs, and tests from one OpenAPI file avoid a class of bugs that hand-maintaining each of them separately can't?</p>
        </div>
      </section>
      <p className="takeaway">
        Treat the OpenAPI document as the actual source of truth, not an afterthought written for
        documentation's sake &mdash; everything downstream of it stays trustworthy only as long as
        it stays current.
      </p>
    </div>
  );
}
