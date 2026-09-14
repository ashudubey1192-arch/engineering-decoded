import "../css/Article.css";

export default function RestDesignHttpMethodsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          HTTP gives you a small, standard set of methods, each with a specific meaning around
          safety and idempotency &mdash; using them as intended is what lets browsers, caches,
          proxies, and client libraries all handle your API correctly without being told anything
          extra about it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>THE CORE METHODS</caption>
          <thead><tr><th>Method</th><th>Meaning</th><th>Safe?</th><th>Idempotent?</th></tr></thead>
          <tbody>
            <tr><td><span className="badge">GET</span></td><td>Read a resource or collection</td><td>Yes</td><td>Yes</td></tr>
            <tr><td><span className="badge">POST</span></td><td>Create a resource, or trigger a non-idempotent action</td><td>No</td><td>No</td></tr>
            <tr><td><span className="badge">PUT</span></td><td>Replace a resource entirely</td><td>No</td><td>Yes</td></tr>
            <tr><td><span className="badge">PATCH</span></td><td>Partially update a resource</td><td>No</td><td>Usually not</td></tr>
            <tr><td><span className="badge">DELETE</span></td><td>Remove a resource</td><td>No</td><td>Yes</td></tr>
          </tbody>
        </table>
        <p>
          "Safe" means the method never changes server state &mdash; a monitoring tool or crawler
          can call it freely. "Idempotent" means calling it once or five times in a row leaves the
          server in the same state as calling it once &mdash; exactly the property that makes
          automatic retries safe, covered in depth in the Reliability section.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>Parcelly's shipment endpoints map cleanly onto this set:</p>
        <span className="codeLabel">SHIPMENT OPERATIONS</span>
        <div className="codeBlock">
          <pre>{`GET    /v1/shipments            # list shipments
POST   /v1/shipments            # create a shipment
GET    /v1/shipments/shp_9f8a   # read one shipment
PUT    /v1/shipments/shp_9f8a   # replace it entirely
PATCH  /v1/shipments/shp_9f8a   # update just the fields sent
DELETE /v1/shipments/shp_9f8a   # cancel / remove it`}</pre>
        </div>
        <p>
          Calling <code>PUT</code> on the same shipment with the same body five times leaves it in
          exactly the state described by that body &mdash; that's idempotency at work. Calling
          <code>POST /v1/shipments</code> with the same body five times, without any additional
          protection, creates five separate shipments, because creation is not idempotent by
          default.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram of one shipment resource with four HTTP methods around it: GET and PUT shown as safe or idempotent with solid lines, POST and PATCH shown as not idempotent with dashed lines.">
          <rect className="boxAccent" x="160" y="55" width="100" height="40" rx="7" />
          <text x="210" y="79" className="boxText" style={{fontSize:"7px"}}>Shipment</text>
          {[
            {m:"GET", x:20, y:15, dash:false},
            {m:"POST", x:340, y:15, dash:true},
            {m:"PUT", x:20, y:120, dash:false},
            {m:"PATCH", x:340, y:120, dash:true},
          ].map((n) => (
            <g key={n.m}>
              <rect className="box" x={n.x} y={n.y} width="60" height="26" rx="5" />
              <text x={n.x+30} y={n.y+17} className="boxText" style={{fontSize:"6px"}}>{n.m}</text>
              <line className={n.dash ? "flowMuted" : "flow"} x1={n.x+30} y1={n.y+26} x2="200" y2="70" />
            </g>
          ))}
          <text x="210" y="132" className="figHint" style={{fontSize:"6px"}}>solid = idempotent, safe to retry &mdash; dashed = not</text>
        </svg>
        <figcaption>Four methods act on the same resource; whether the line is solid or dashed is exactly the idempotency distinction that decides if a retry is safe.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using <code>POST</code> for everything, including reads and updates, is the most common
          mistake &mdash; sometimes called "HTTP tunneling" &mdash; and it throws away caching,
          safe retries, and the self-descriptive value of the method entirely. A subtler mistake is
          treating <code>PATCH</code> as if it were idempotent by default: a <code>PATCH</code> that
          means "increment the retry count by one" rather than "set the retry count to this value"
          means calling it twice doesn't produce the same result as calling it once, which breaks
          the assumption most HTTP clients make about that method.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A client's request to PUT a shipment update times out, and the client doesn't know if it succeeded. Why is it safe for it to just retry the exact same PUT request?</p>
        </div>
      </section>
      <p className="takeaway">
        The method is a promise about behavior, not just routing syntax &mdash; GET never changes
        anything, PUT and DELETE are safe to retry blindly, POST is not. Break those promises and
        every cache, proxy, and retrying client downstream makes the wrong assumption.
      </p>
    </div>
  );
}
