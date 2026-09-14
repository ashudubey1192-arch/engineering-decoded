import "../css/Article.css";

export default function ObjectsAndDataDataTransferObjectsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A Data Transfer Object (DTO) is a deliberately dumb container: no behavior, just
          fields, used to move data across a boundary &mdash; between a service and its API, or
          between a database row and application code.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Shape for the boundary, not the domain</b> &mdash; a DTO's fields match what an API contract or a database schema needs, which is not always identical to how the domain object is structured internally.</li>
          <li><b>No business logic inside a DTO</b> &mdash; validation, calculation, or decision-making inside a DTO is a sign it has quietly become something else; keep DTOs as pure data.</li>
          <li><b>Explicit mapping at the boundary</b> &mdash; a small, visible function that converts a domain object to its DTO (and back) keeps the two shapes independently changeable.</li>
          <li><b>Prevents domain leakage</b> &mdash; without a DTO, it is tempting to serialize a domain object directly, which quietly makes every internal field part of a public API contract.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's public invoice API originally serialized the domain <code>Invoice</code>
          object directly &mdash; until an internal refactor accidentally became a breaking API change:
        </p>
        <span className="codeLabel">NO DTO: DOMAIN OBJECT SERIALIZED DIRECTLY</span>
        <div className="codeBlock">
          <pre>{`app.get("/api/invoices/:id", (req, res) => {
  const invoice = repository.find(req.params.id);
  res.json(invoice); // exposes every internal field, including #retryCount
});
// an internal refactor adds a private #retryCount field for payment retries —
// it leaks straight into the public API response overnight`}</pre>
        </div>
        <span className="codeLabel">DTO: EXPLICIT, STABLE BOUNDARY</span>
        <div className="codeBlock">
          <pre>{`function toInvoiceDto(invoice) {
  return {
    id: invoice.id,
    total: invoice.getTotal(),
    status: invoice.getStatus(),
    dueAt: invoice.dueAt.toISOString(),
  };
}
app.get("/api/invoices/:id", (req, res) => {
  const invoice = repository.find(req.params.id);
  res.json(toInvoiceDto(invoice)); // internal fields can change freely
});`}</pre>
        </div>
        <p>
          With the explicit DTO, the internal <code>#retryCount</code> field can be added,
          renamed, or removed at will &mdash; the public API shape only changes when someone
          deliberately updates <code>toInvoiceDto()</code>.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a domain object with internal fields, an explicit mapping function producing a stable DTO shape, and an external API client that only ever sees the DTO, insulated from internal domain changes.">
          <rect className="box" x="15" y="20" width="110" height="60" rx="5" /><text x="70" y="42" className="boxText" style={{fontSize:"5px"}}>Invoice</text><text x="70" y="58" className="figHint" style={{fontSize:"4px"}}>internal fields,</text><text x="70" y="68" className="figHint" style={{fontSize:"4px"}}>free to change</text>
          <rect className="boxAccent" x="160" y="30" width="110" height="40" rx="5" /><text x="215" y="53" className="boxText" style={{fontSize:"4.5px"}}>toInvoiceDto()</text>
          <rect className="box" x="305" y="20" width="100" height="60" rx="5" /><text x="355" y="42" className="boxText" style={{fontSize:"5px"}}>API client</text><text x="355" y="58" className="figHint" style={{fontSize:"4px"}}>sees only the</text><text x="355" y="68" className="figHint" style={{fontSize:"4px"}}>stable DTO shape</text>
          <line className="flow" x1="125" y1="50" x2="158" y2="50" />
          <line className="flow" x1="270" y1="50" x2="303" y2="50" />
        </svg>
        <figcaption>The mapping function is the only place that knows about both shapes &mdash; the domain object stays free to evolve, and the client sees a stable contract.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Letting a DTO accumulate methods over time &mdash; a formatting helper here, a validation
          check there &mdash; slowly turns it back into a domain object with an identity crisis. If
          a DTO needs behavior, that is usually a sign the behavior belongs in the domain layer,
          on the object being mapped from.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did serializing the Invoice domain object directly turn an internal refactor into an accidental breaking change for API clients?</p>
        </div>
      </section>
      <p className="takeaway">
        A DTO's whole job is to be a stable, deliberate boundary shape &mdash; keep it free of logic,
        map to and from it explicitly, and your internal domain model stays free to change
        without silently breaking everyone on the other side of the boundary.
      </p>

    </div>
  );
}
