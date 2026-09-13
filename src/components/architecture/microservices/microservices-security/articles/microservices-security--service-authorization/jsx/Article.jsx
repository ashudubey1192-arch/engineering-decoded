import "../css/Article.css";

export default function MicroservicesSecurityServiceAuthorizationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Authentication proves who's calling; authorization is the separate question of what that
          verified caller is actually allowed to do &mdash; a service can be genuinely, verifiably
          <code>ReportingService</code> and still have no business calling
          <code>PaymentService.refund()</code>.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Authorization checks a verified identity against an explicit policy: which actions, on
          which resources, is this specific caller permitted to perform? A common approach is
          per-service, per-action policy &mdash; not "any authenticated internal service can call
          anything," but "<code>ReportingService</code> may call
          <code>PaymentService.getTransactionHistory()</code>, and nothing else on that service."
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>ReportingService</code> authenticates successfully to <code>PaymentService</code>,
          proving its identity, then requests <code>POST /refunds</code>. The identity check passes
          &mdash; but the authorization policy for <code>svc-reporting</code> only grants
          <code>GET /transactions</code>, so the request is rejected with
          <code>403 Forbidden</code>, distinct from the <code>401 Unauthorized</code> it would have
          gotten for a failed identity check.
        </p>
        <span className="codeLabel">POLICY CHECK AFTER SUCCESSFUL AUTHENTICATION</span>
        <div className="codeBlock">
          <pre>{`policies["svc-reporting"] = ["GET /transactions"]

function authorize(serviceId, method, path) {
  const allowed = policies[serviceId] || []
  if (!allowed.includes(\`\${method} \${path}\`)) throw new ForbiddenError()
}
// svc-reporting calling POST /refunds -> 403, even though it's a verified caller`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of two sequential checks: ReportingService successfully authenticates to PaymentService, proving its identity, but then fails the separate authorization check when it requests an action, refunds, that its policy does not permit." >
          <rect className="box" x="20" y="20" width="110" height="26" rx="5" />
          <text x="75" y="37" className="boxText" style={{fontSize:"6.5px"}}>ReportingService</text>
          <rect className="boxAccent" x="20" y="60" width="230" height="24" rx="5" />
          <text x="135" y="76" className="boxText" style={{fontSize:"6px"}}>1. Authenticate &mdash; identity verified, OK</text>
          <rect className="boxWarn" x="20" y="94" width="230" height="24" rx="5" />
          <text x="135" y="110" className="boxText" style={{fontSize:"6px"}}>2. Authorize POST /refunds &mdash; 403 Forbidden</text>
          <line className="flow" x1="75" y1="46" x2="75" y2="58" />
        </svg>
        <figcaption>Passing authentication doesn't guarantee passing authorization &mdash; they're two separate checks answering two separate questions.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Conflating "authenticated" with "authorized to do anything" is the most common mistake
          &mdash; once a service proves who it is, it's tempting to let it call every endpoint
          freely, which undoes the whole point of having a separate authorization layer. Defining
          policy too coarsely (per-service instead of per-action) is the other common gap: granting
          <code>ReportingService</code> blanket access to all of <code>PaymentService</code> because
          it needs just one read endpoint is far more access than the actual need justifies.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>ReportingService is a verified, authenticated caller. Why isn't that enough on its own to let it call PaymentService's refund endpoint?</p>
        </div>
      </section>
      <p className="takeaway">
        Authentication and authorization are two separate checks answering two separate questions
        &mdash; a verified identity still needs an explicit policy before it's actually allowed to do
        anything.
      </p>
    </div>
  );
}
