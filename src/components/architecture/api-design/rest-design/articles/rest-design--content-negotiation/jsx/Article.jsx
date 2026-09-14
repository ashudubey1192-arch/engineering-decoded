import "../css/Article.css";

export default function RestDesignContentNegotiationArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Content negotiation is how a client and server agree on a representation format without
          baking that choice into the URI &mdash; the client states what it can accept, and the
          server picks the best match it can actually provide.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Accept header</b> &mdash; sent by the client, lists the formats it can handle, in preference order (e.g. <code>application/json</code>).</li>
          <li><b>Content-Type header</b> &mdash; sent by both sides, states the format of the body actually being sent right now.</li>
          <li><b>406 Not Acceptable</b> &mdash; the server's answer when it cannot produce any format the client says it will accept.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's bulk shipment export endpoint supports two representations from one URI,
          chosen by the <code>Accept</code> header:
        </p>
        <span className="codeLabel">REQUEST</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments/export HTTP/1.1
Accept: text/csv`}</pre>
        </div>
        <span className="codeLabel">RESPONSE</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 200 OK
Content-Type: text/csv

id,status,carrier,estimated_delivery
shp_9f8a,in_transit,fedex,2026-09-18`}</pre>
        </div>
        <p>
          Ask the same URI for <code>Accept: application/json</code> instead and it returns the
          identical data as a JSON array. Ask for a format Parcelly doesn't support, like
          <code>application/xml</code>, and it responds <code>406 Not Acceptable</code> rather than
          silently sending JSON anyway and letting the client's parser fail confusingly later.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of content negotiation: client sends an Accept header listing formats it can handle, server checks against what it can produce, and either returns a matching representation or a 406 response.">
          <rect className="box" x="20" y="45" width="90" height="30" rx="5" />
          <text x="65" y="64" className="boxText" style={{fontSize:"6.5px"}}>Client</text>
          <text x="65" y="35" className="figHint" style={{fontSize:"5.5px"}}>Accept: text/csv</text>
          <rect className="boxAccent" x="165" y="45" width="100" height="30" rx="5" />
          <text x="215" y="64" className="boxText" style={{fontSize:"6px"}}>Can it match?</text>
          <line className="flow" x1="110" y1="60" x2="163" y2="60" />
          <rect className="box" x="320" y="15" width="90" height="26" rx="5" />
          <text x="365" y="33" className="boxText" style={{fontSize:"6px"}}>200 + CSV body</text>
          <rect className="boxWarn" x="320" y="75" width="90" height="26" rx="5" />
          <text x="365" y="93" className="boxText" style={{fontSize:"6px"}}>406 Not Acceptable</text>
          <line className="flow" x1="265" y1="55" x2="318" y2="30" />
          <line className="flowMuted" x1="265" y1="65" x2="318" y2="88" />
          <text x="365" y="110" className="figHint" style={{fontSize:"5px"}}>no supported format matches</text>
        </svg>
        <figcaption>The server only ever sends a format it actually supports and the client actually asked for &mdash; never a silent default.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Ignoring the <code>Accept</code> header entirely and always returning JSON regardless of
          what was requested is the most common shortcut &mdash; it happens to work until a
          consumer genuinely needs a different format and gets silently wrong data instead of a
          clear <code>406</code>. Confusing <code>Accept</code> with <code>Content-Type</code> is
          the other frequent mix-up: <code>Accept</code> is the client asking "what can you send
          me," while <code>Content-Type</code> describes whatever body is actually attached to this
          specific request or response.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A client sends Accept: application/xml to an endpoint that only produces JSON and CSV. What should the server do instead of just returning JSON anyway?</p>
        </div>
      </section>
      <p className="takeaway">
        Content negotiation keeps one URI meaning one resource, even when different consumers want
        it in different shapes &mdash; let the Accept header do the choosing, and say so clearly
        with 406 when nothing on offer matches.
      </p>
    </div>
  );
}
