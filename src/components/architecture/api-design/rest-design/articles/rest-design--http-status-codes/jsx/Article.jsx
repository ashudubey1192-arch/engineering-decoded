import "../css/Article.css";

export default function RestDesignHttpStatusCodesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A status code is the single fastest piece of information in an HTTP response &mdash; a
          client, cache, or monitoring tool can often decide what to do next by reading three
          digits, before it's even parsed the body.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>2xx &mdash; Success</h3>
            <p>The request was understood and processed as intended. Different 2xx codes distinguish what exactly happened.</p>
          </div>
          <div>
            <h3>3xx &mdash; Redirection</h3>
            <p>The client needs to take one more step, usually following a different URL, to complete the request.</p>
          </div>
          <div>
            <h3>4xx &mdash; Client error</h3>
            <p>Something about the request itself is wrong. Retrying the exact same request will fail the same way.</p>
          </div>
          <div>
            <h3>5xx &mdash; Server error</h3>
            <p>The request was probably fine; the server failed to process it. Retrying later may succeed.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <table className="miniTable">
          <caption>CODES PARCELLY USES MOST</caption>
          <thead><tr><th>Code</th><th>Meaning</th><th>Parcelly example</th></tr></thead>
          <tbody>
            <tr><td><span className="badge">200</span></td><td>OK</td><td>GET a shipment successfully</td></tr>
            <tr><td><span className="badge">201</span></td><td>Created</td><td>POST created a new shipment; Location header points at it</td></tr>
            <tr><td><span className="badge">202</span></td><td>Accepted</td><td>Bulk shipment import queued for async processing</td></tr>
            <tr><td><span className="badge">204</span></td><td>No Content</td><td>DELETE succeeded; nothing to return</td></tr>
            <tr><td><span className="badge">400</span></td><td>Bad Request</td><td>Malformed JSON body</td></tr>
            <tr><td><span className="badge">401</span></td><td>Unauthorized</td><td>Missing or invalid API key</td></tr>
            <tr><td><span className="badge">404</span></td><td>Not Found</td><td>Shipment ID doesn't exist</td></tr>
            <tr><td><span className="badge">409</span></td><td>Conflict</td><td>Trying to cancel an already-delivered shipment</td></tr>
            <tr><td><span className="badge">422</span></td><td>Unprocessable Entity</td><td>Valid JSON, but a field fails validation</td></tr>
            <tr><td><span className="badge">429</span></td><td>Too Many Requests</td><td>Rate limit exceeded</td></tr>
            <tr><td><span className="badge">503</span></td><td>Service Unavailable</td><td>A downstream carrier integration is down</td></tr>
          </tbody>
        </table>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 90" role="img" aria-label="Diagram of the four HTTP status code families as a decision path: 2xx success, 3xx redirect, 4xx the client should not retry unchanged, 5xx the client may retry later.">
          {[
            {t:"2xx", h:"request succeeded", cls:"boxAccent"},
            {t:"3xx", h:"one more step needed", cls:"box"},
            {t:"4xx", h:"fix the request first", cls:"boxWarn"},
            {t:"5xx", h:"maybe retry later", cls:"box"},
          ].map((n,i) => (
            <g key={n.t}>
              <rect className={n.cls} x={15 + i*102} y="20" width="88" height="30" rx="6" />
              <text x={59 + i*102} y="39" className="boxText" style={{fontSize:"8px"}}>{n.t}</text>
              <text x={59 + i*102} y="65" className="figHint" style={{fontSize:"5.5px"}}>{n.h}</text>
            </g>
          ))}
        </svg>
        <figcaption>The first digit alone tells a caller whether to use the response, follow a link, fix its request, or try again later.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Always returning <code>200 OK</code> and putting the real outcome in an error field
          inside the body &mdash; sometimes called "the 200 OK lie" &mdash; defeats every cache,
          load balancer, and monitoring tool that reads status codes, and forces every client to
          parse the body just to know if a request worked. The opposite mistake is being too
          precise for no benefit: agonizing over <code>200</code> vs. <code>201</code> vs.
          <code>202</code> for a case where consumers genuinely don't care, while missing the
          actually important distinction between a client error that needs a different request
          (<code>4xx</code>) and a server error worth retrying (<code>5xx</code>).
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A client gets a 200 OK response, but the body says the operation actually failed. What does this design cost every cache and monitoring tool sitting between the client and Parcelly's servers?</p>
        </div>
      </section>
      <p className="takeaway">
        Status codes are the API talking to infrastructure, not just to your client code &mdash;
        get the family right (2xx/4xx/5xx) every time, and treat the specific code within it as a
        smaller, secondary decision.
      </p>
    </div>
  );
}
