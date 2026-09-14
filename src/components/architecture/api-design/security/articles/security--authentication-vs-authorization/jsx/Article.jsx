import "../css/Article.css";

export default function SecurityAuthenticationVsAuthorizationArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Authentication answers "who is this caller"; authorization answers "what is this caller
          allowed to do." They run in sequence, they fail with different status codes, and
          conflating them is how APIs end up either leaking access or confusingly re-checking
          identity for what's really a permissions question.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Authentication (AuthN)</h3>
            <p>Verifying identity: is this API key, token, or session actually valid, and who does it belong to? Failure here is a 401.</p>
          </div>
          <div>
            <h3>Authorization (AuthZ)</h3>
            <p>Given a known identity, deciding whether it's allowed to do this specific thing to this specific resource. Failure here is a 403.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A request to <code>GET /v1/shipments/shp_9f8a</code> with no API key, or an API key that
          doesn't exist, fails authentication &mdash; Parcelly has no idea who's asking, so it
          returns <code>401 Unauthorized</code>. A request with a perfectly valid API key belonging
          to a real partner, asking for a shipment that belongs to a <i>different</i> partner,
          passes authentication (Parcelly knows exactly who's asking) and fails authorization
          &mdash; it returns <code>403 Forbidden</code>.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram of a request passing through authentication, which checks who is calling and can fail with 401, then authorization, which checks what they can do and can fail with 403, before finally succeeding.">
          <rect className="box" x="10" y="55" width="80" height="30" rx="5" />
          <text x="50" y="74" className="boxText" style={{fontSize:"6px"}}>Request</text>
          <rect className="boxAccent" x="130" y="55" width="90" height="30" rx="5" />
          <text x="175" y="74" className="boxText" style={{fontSize:"6px"}}>Authenticate</text>
          <rect className="boxAccent" x="260" y="55" width="90" height="30" rx="5" />
          <text x="305" y="74" className="boxText" style={{fontSize:"6px"}}>Authorize</text>
          <rect className="box" x="380" y="55" width="50" height="30" rx="5" />
          <text x="405" y="74" className="boxText" style={{fontSize:"6px"}}>OK</text>
          <line className="flow" x1="90" y1="70" x2="128" y2="70" />
          <line className="flow" x1="220" y1="70" x2="258" y2="70" />
          <line className="flow" x1="350" y1="70" x2="378" y2="70" />
          <rect className="boxWarn" x="150" y="100" width="50" height="24" rx="4" />
          <text x="175" y="116" className="boxText" style={{fontSize:"6px"}}>401</text>
          <line className="flowMuted" x1="175" y1="85" x2="175" y2="98" />
          <rect className="boxWarn" x="280" y="100" width="50" height="24" rx="4" />
          <text x="305" y="116" className="boxText" style={{fontSize:"6px"}}>403</text>
          <line className="flowMuted" x1="305" y1="85" x2="305" y2="98" />
        </svg>
        <figcaption>Two distinct checks, in order &mdash; who you are, then what you're allowed to do &mdash; each with its own failure code.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Returning <code>401</code> for both cases is the most common mix-up, usually from
          treating "not allowed" as one big bucket instead of two distinct failures with different
          causes and different fixes for the caller. It's worth noting a related, legitimate design
          choice this isn't: some APIs deliberately return <code>404 Not Found</code> instead of
          <code>403</code> for a resource an authenticated caller isn't authorized to see, on
          purpose, specifically to avoid confirming that resource even exists. That's a considered
          trade-off for sensitive data; conflating 401 and 403 out of carelessness is not the same
          thing.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A request with a completely invalid API key and a request with a valid key for the wrong partner both currently return 401. What's misleading about that to the caller in the second case?</p>
        </div>
      </section>
      <p className="takeaway">
        Identity first, permission second &mdash; keep the two checks and their status codes
        distinct, and treat "obscure this resource's existence entirely" as a deliberate security
        decision, not a default.
      </p>
    </div>
  );
}
