import "../css/Article.css";

export default function RequestsAndResponsesRequestBodyDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A request body is a form the caller has to fill out correctly on the first try &mdash;
          every field you require, every name you choose, and every assumption you bake in either
          makes that form easy to fill out or a constant source of integration bugs.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Only accept writable fields</b> &mdash; never accept id, created_at, or other server-controlled fields from the client; ignore or reject them if present.</li>
          <li><b>Require only what the client can actually know</b> &mdash; don't require a field the client would have to guess or fetch just to fill in.</li>
          <li><b>Pick one naming convention and hold it everywhere</b> &mdash; snake_case or camelCase, consistently, across every endpoint in the API.</li>
          <li><b>Keep nesting shallow</b> &mdash; two levels of nested objects is usually the practical limit before a body becomes hard to construct and validate.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>Parcelly's shipment-creation body asks for exactly what a caller can know at creation time, nothing the server will compute:</p>
        <span className="codeLabel">POST /v1/shipments</span>
        <div className="codeBlock">
          <pre>{`{
  "carrier": "fedex",
  "origin_address_id": "addr_1a2b",
  "destination_address_id": "addr_3c4d",
  "packages": [
    { "weight_kg": 1.2, "sku": "TSHIRT-BLK-M" }
  ]
}`}</pre>
        </div>
        <p>
          Notice what's missing: no <code>id</code> (Parcelly generates it), no <code>status</code>
          (every new shipment starts as <code>created</code>, the caller doesn't get to pick), and
          no <code>estimated_delivery</code> (Parcelly computes that from the carrier and route,
          the caller can't know it yet). Any of those fields sent by a client are silently ignored,
          documented as such, rather than either erroring confusingly or letting a client
          accidentally control a server-owned value.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram splitting a shipment's fields into client-writable fields that belong in the request body, and server-controlled fields that never appear there.">
          <rect className="boxAccent" x="30" y="25" width="160" height="70" rx="7" />
          <text x="110" y="42" className="figLabel" style={{fontSize:"6px"}}>CLIENT PROVIDES</text>
          <text x="110" y="60" className="boxText" style={{fontSize:"6px"}}>carrier, addresses,</text>
          <text x="110" y="74" className="boxText" style={{fontSize:"6px"}}>packages</text>
          <rect className="box" x="230" y="25" width="160" height="70" rx="7" />
          <text x="310" y="42" className="figLabel" style={{fontSize:"6px"}}>SERVER CONTROLS</text>
          <text x="310" y="60" className="boxText" style={{fontSize:"6px"}}>id, status,</text>
          <text x="310" y="74" className="boxText" style={{fontSize:"6px"}}>estimated_delivery</text>
        </svg>
        <figcaption>A request body should only ever contain the left column &mdash; anything in the right column is computed, not accepted.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Accepting a client-supplied <code>id</code> or <code>status</code> "just in case" is the
          most damaging mistake &mdash; it looks harmless until a buggy client sends a delivered
          status on a brand-new shipment and the server trusts it. Requiring a field the client has
          no natural way to know, like an internal routing-hub identifier, is the other common one;
          it forces every integration to make an extra lookup call just to satisfy a field your own
          server could derive.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is it safer to silently ignore a client-supplied status field on creation than to accept it and just document that new shipments should start as "created"?</p>
        </div>
      </section>
      <p className="takeaway">
        A request body should contain exactly what the caller can know and is allowed to control
        &mdash; nothing the server computes, and nothing the server alone should own.
      </p>
    </div>
  );
}
