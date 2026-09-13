import "../css/Article.css";

export default function MicroservicesSecurityTokenPropagationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Token propagation is the question of what happens to a user's identity after the first
          hop &mdash; when Service A calls Service B on the user's behalf, does B know which user
          this really is, or just that A is a trusted caller?
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Two approaches solve this differently. In <b>token forwarding</b>, the original user's
          token (or a re-signed version of it) is passed along through every internal hop, so every
          downstream service can see exactly which user is behind the request. In
          <b>service-identity-only</b> calls, downstream services only see "OrderService called me"
          and rely on the calling service to have already done its own authorization check on the
          user &mdash; simpler, but it loses the ability for a deep downstream service to make its
          own per-user decisions or produce a complete audit trail.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A user requests their order history through <code>ApiGateway &rarr; OrderService &rarr;
          AuditService</code>. With token propagation, the user's ID token (or a derived, internal
          equivalent) travels through all three hops, so <code>AuditService</code> can log "user
          <code>u_881</code> accessed order <code>ord_7734</code>," not just "OrderService accessed
          something."
        </p>
        <span className="codeLabel">FORWARDING THE USER CONTEXT INTERNALLY</span>
        <div className="codeBlock">
          <pre>{`// OrderService, calling AuditService
auditClient.log({
  action: "order.viewed",
  userId: req.userContext.sub,   // forwarded from the original token
  orderId: order.id,
})`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of token propagation: the user's identity context travels through ApiGateway to OrderService to AuditService across all three hops, so the deepest service still knows which user originated the request." >
          {["ApiGateway","OrderService","AuditService"].map((t,i) => (
            <g key={t}>
              <rect className="box" x={20 + i*140} y="30" width="110" height="30" rx="6" />
              <text x={75 + i*140} y="49" className="boxText" style={{fontSize:"6.5px"}}>{t}</text>
              {i < 2 && <line className="flow" x1={130 + i*140} y1="45" x2={160 + i*140} y2="45" />}
            </g>
          ))}
          <text x="210" y="80" className="figHint" style={{fontSize:"6.5px"}}>user context (u_881) carried through every hop</text>
        </svg>
        <figcaption>The user's identity travels all the way to AuditService, three hops deep &mdash; not just "OrderService made a call."</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forwarding the user's original, externally-issued token unchanged to every internal
          service is a common security gap &mdash; internal services should generally get a
          separate, internally-scoped token so a leak deep inside the system doesn't expose a token
          valid at the public-facing edge too. Losing user context partway through a call chain is
          the other common issue: if just one service in the chain drops the context instead of
          forwarding it, every service after that point loses the ability to attribute the request
          to a specific user.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might forwarding a user's original external ID token, completely unchanged, to every internal service be a worse idea than re-issuing a separate internal token that carries the same user identity?</p>
        </div>
      </section>
      <p className="takeaway">
        Deciding whether user identity travels all the way down the call chain is a deliberate
        design choice &mdash; drop it too early and deep services lose per-user authorization and
        auditability.
      </p>
    </div>
  );
}
