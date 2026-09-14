import "../css/Article.css";

export default function RequestsAndResponsesHeadersAndMetadataArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Headers carry information that isn't really part of the resource itself &mdash; who's
          asking, what format they want, how to trace this request later &mdash; and using the
          standard ones correctly means a huge amount of tooling already knows how to work with
          your API without being told anything extra.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>HEADERS THAT PULL THEIR WEIGHT</caption>
          <thead><tr><th>Header</th><th>Direction</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>Authorization</code></td><td>Request</td><td>Who is calling</td></tr>
            <tr><td><code>Content-Type</code></td><td>Both</td><td>Format of the body attached to this message</td></tr>
            <tr><td><code>Accept</code></td><td>Request</td><td>Formats the client can handle in the response</td></tr>
            <tr><td><code>Idempotency-Key</code></td><td>Request</td><td>Lets a retried request be recognized as a duplicate, not a new one</td></tr>
            <tr><td><code>X-Request-Id</code></td><td>Both</td><td>Correlates one request across logs, retries, and support tickets</td></tr>
            <tr><td><code>Retry-After</code></td><td>Response</td><td>How long to wait before retrying, on 429 or 503</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>A typical Parcelly request and response pair makes heavy use of headers rather than body fields for exactly this kind of metadata:</p>
        <span className="codeLabel">REQUEST</span>
        <div className="codeBlock">
          <pre>{`POST /v1/shipments HTTP/1.1
Authorization: Bearer sk_live_...
Content-Type: application/json
Idempotency-Key: 7b1e2c9a-req-42
X-Request-Id: req_c88f`}</pre>
        </div>
        <span className="codeLabel">RESPONSE</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/shipments/shp_9f8a
X-Request-Id: req_c88f`}</pre>
        </div>
        <p>
          Echoing <code>X-Request-Id</code> back unchanged means a partner's support ticket can
          quote one value that both sides can find instantly in their own logs, instead of
          reconstructing "the request that happened around 3:14pm."
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of three unrelated header concerns feeding into one request: identity via Authorization, tracing via X-Request-Id, and format via Content-Type and Accept.">
          <rect className="boxAccent" x="150" y="53" width="120" height="34" rx="6" />
          <text x="210" y="74" className="boxText" style={{fontSize:"6.5px"}}>Request</text>
          <rect className="box" x="10" y="10" width="120" height="30" rx="5" />
          <text x="70" y="29" className="figHint" style={{fontSize:"5.5px"}}>Identity: Authorization</text>
          <rect className="box" x="290" y="10" width="120" height="30" rx="5" />
          <text x="350" y="29" className="figHint" style={{fontSize:"5.5px"}}>Tracing: X-Request-Id</text>
          <rect className="box" x="145" y="100" width="130" height="30" rx="5" />
          <text x="210" y="119" className="figHint" style={{fontSize:"5.5px"}}>Format: Content-Type, Accept</text>
          <line className="flow" x1="90" y1="40" x2="175" y2="53" />
          <line className="flow" x1="350" y1="40" x2="255" y2="53" />
          <line className="flow" x1="210" y1="98" x2="210" y2="87" />
        </svg>
        <figcaption>Three unrelated concerns, three separate headers &mdash; none of them belong mixed into the request body.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Inventing a custom header for something that already has a standard one &mdash; a
          bespoke auth header instead of the standard <code>Authorization</code> header &mdash;
          throws away support from every HTTP client, proxy, and library that already understands
          the standard version. Putting request metadata that belongs in a header (like a trace ID)
          into the request body instead is the other common mistake: it means the metadata isn't
          available until the body is fully parsed, and can't be logged by infrastructure that only
          inspects headers.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is echoing back the same X-Request-Id a partner sent more useful for debugging than generating a new one on the server?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for a standard header before inventing a custom one, and use headers for information
        about the request rather than smuggling it into the body &mdash; both choices mean more
        existing tooling just works.
      </p>
    </div>
  );
}
