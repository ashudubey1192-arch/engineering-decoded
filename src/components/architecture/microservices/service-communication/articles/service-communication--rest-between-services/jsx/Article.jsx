import "../css/Article.css";

export default function ServiceCommunicationRestBetweenServicesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          REST between services borrows the web's own vocabulary &mdash; resources, verbs, status
          codes &mdash; giving services a communication style that's human-readable, cacheable, and
          understood by essentially every tool and language without extra generated code.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A REST call names a resource (<code>/orders/7734</code>) and a verb describing what to do
          to it (<code>GET</code>, <code>POST</code>, <code>PATCH</code>, <code>DELETE</code>), and
          gets back an HTTP status code plus a body (usually JSON) describing the result. The status
          code alone carries a lot of meaning: callers can distinguish "worked", "you sent something
          wrong", and "something's broken on our end" without even parsing the body.
        </p>
        <table className="miniTable">
          <caption>STATUS CODES THAT MATTER MOST BETWEEN SERVICES</caption>
          <thead><tr><th>Code</th><th>Means</th></tr></thead>
          <tbody>
            <tr><td><span className="badge">200</span></td><td>Succeeded, body has the result</td></tr>
            <tr><td><span className="badge">404</span></td><td>That resource doesn't exist</td></tr>
            <tr><td><span className="badge">409</span></td><td>Conflict &mdash; e.g. someone else changed it first</td></tr>
            <tr><td><span className="badge">503</span></td><td>Temporarily unavailable &mdash; safe to retry later</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>ShippingService</code> asks <code>InventoryService</code> to reserve stock for an
          order:
        </p>
        <span className="codeLabel">HTTP REQUEST / RESPONSE</span>
        <div className="codeBlock">
          <pre>{`POST /reservations HTTP/1.1
Content-Type: application/json
{ "sku": "sku_1842", "quantity": 2, "orderId": "ord_7734" }

HTTP/1.1 409 Conflict
{ "error": "insufficient_stock", "available": 1 }`}</pre>
        </div>
        <p>
          The 409 tells <code>ShippingService</code>, without any special-case parsing, that this
          is a business conflict it can react to (offer partial fulfillment), not a transient
          failure worth blindly retrying.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 110" role="img" aria-label="Diagram of ShippingService sending a REST POST request to InventoryService's reservations resource and receiving a 409 Conflict status code back.">
          <rect className="box" x="20" y="35" width="110" height="30" rx="6" />
          <text x="75" y="54" className="boxText" style={{fontSize:"6.5px"}}>ShippingService</text>
          <rect className="boxAccent" x="270" y="35" width="110" height="30" rx="6" />
          <text x="325" y="54" className="boxText" style={{fontSize:"6.5px"}}>InventoryService</text>
          <line className="flow" x1="130" y1="45" x2="270" y2="45" />
          <text x="200" y="35" className="figHint" style={{fontSize:"6px"}}>POST /reservations</text>
          <line className="flowMuted" x1="270" y1="60" x2="130" y2="60" />
          <text x="200" y="78" className="figHint" style={{fontSize:"6px"}}>409 Conflict</text>
        </svg>
        <figcaption>The status code itself tells the caller how to react &mdash; no need to parse the body just to know this was a conflict, not a crash.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Returning <code>200 OK</code> for everything, with the real outcome buried in a body field
          like <code>{"{ success: false }"}</code>, throws away everything REST gives you for free
          &mdash; callers, proxies, and monitoring tools can no longer tell success from failure
          without custom parsing logic. Modeling an action as a verb in the URL
          (<code>/reserveStock</code>) instead of a resource (<code>POST /reservations</code>) is the
          other common drift &mdash; it works, but it gives up the consistency that makes REST APIs
          predictable across a whole organization.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>InventoryService always returns HTTP 200 and puts the real result in a JSON field called "success". What does ShippingService lose by not being able to rely on the actual HTTP status code?</p>
        </div>
      </section>
      <p className="takeaway">
        Let the status code carry real meaning and model actions as resources &mdash; that's what
        makes a REST API between services predictable to any caller without reading custom
        documentation first.
      </p>
    </div>
  );
}
