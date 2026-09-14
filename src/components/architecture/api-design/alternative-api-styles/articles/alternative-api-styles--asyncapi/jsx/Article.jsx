import "../css/Article.css";

export default function AlternativeApiStylesAsyncapiArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          AsyncAPI does for event-driven and message-based APIs what OpenAPI does for REST &mdash;
          a standardized, machine-readable way to document channels, message schemas, and who
          publishes or subscribes to what, for the kind of API that doesn't fit a request/response
          shape at all.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>OPENAPI VS. ASYNCAPI</caption>
          <thead><tr><th>Concept</th><th>OpenAPI (request/response)</th><th>AsyncAPI (event-driven)</th></tr></thead>
          <tbody>
            <tr><td>Address</td><td>Path, like <code>/shipments</code></td><td>Channel, like <code>shipment-events</code></td></tr>
            <tr><td>Payload</td><td>Request/response schema</td><td>Message schema</td></tr>
            <tr><td>Direction</td><td>Implicit &mdash; client asks, server answers</td><td>Explicit &mdash; publish vs. subscribe, stated per channel</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly documents its shipment-events channel &mdash; the same feed from the Event APIs
          lesson &mdash; in AsyncAPI, giving partners the same kind of precise, tooling-friendly
          contract for the event stream that OpenAPI gives them for the REST API:
        </p>
        <span className="codeLabel">ASYNCAPI.YAML (EXCERPT)</span>
        <div className="codeBlock">
          <pre>{`channels:
  shipment-events:
    publish:
      summary: Parcelly publishes shipment lifecycle events
      message:
        payload:
          type: object
          properties:
            type: { type: string, enum: [created, picked_up, in_transit, delivered] }
            shipment_id: { type: string }
            occurred_at: { type: string, format: date-time }`}</pre>
        </div>
        <p>
          A partner's tooling can generate a typed consumer for this channel the same way it would
          generate a typed client from an OpenAPI spec &mdash; a kind of contract-driven tooling
          that event-driven APIs have historically had much weaker support for than REST.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Side-by-side comparison: OpenAPI describing a request-response path with a schema, against AsyncAPI describing a publish-subscribe channel with a message, each the machine-readable contract for a different shape of API.">
          <text x="105" y="18" className="figLabel">OPENAPI</text>
          <rect className="box" x="30" y="35" width="150" height="26" rx="5" />
          <text x="105" y="52" className="boxText" style={{fontSize:"6px"}}>path: /shipments</text>
          <rect className="box" x="30" y="70" width="150" height="26" rx="5" />
          <text x="105" y="87" className="boxText" style={{fontSize:"6px"}}>schema: Shipment</text>

          <line className="divider" x1="230" y1="10" x2="230" y2="110" />

          <text x="335" y="18" className="figLabel">ASYNCAPI</text>
          <rect className="box" x="260" y="35" width="150" height="26" rx="5" />
          <text x="335" y="52" className="boxText" style={{fontSize:"5.5px"}}>channel: shipment-events</text>
          <rect className="box" x="260" y="70" width="150" height="26" rx="5" />
          <text x="335" y="87" className="boxText" style={{fontSize:"5.5px"}}>message: ShipmentEvent</text>
        </svg>
        <figcaption>The same discipline &mdash; a precise machine-readable contract &mdash; applied to two different shapes of API.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Documenting an event-driven API only in prose or wiki pages, with no machine-readable
          format at all, forfeits the same generation and validation tooling benefits OpenAPI
          provides for REST &mdash; the exact gap AsyncAPI exists to close. Assuming OpenAPI itself
          can stretch to describe an event stream is the other common mistake: OpenAPI is built
          around request/response HTTP, and forcing an async, message-based system into that shape
          loses or distorts the pieces &mdash; channel direction, message topics &mdash; that don't
          map cleanly onto paths and operations.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why doesn't it work well to describe Parcelly's shipment-events channel using OpenAPI instead of AsyncAPI?</p>
        </div>
      </section>
      <p className="takeaway">
        The discipline is the same as OpenAPI's &mdash; one precise, machine-readable contract
        driving docs and tooling &mdash; applied to a shape of API, publish and subscribe, that
        request/response tooling was never built to describe.
      </p>
    </div>
  );
}
