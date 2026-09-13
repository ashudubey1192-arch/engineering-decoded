import "../css/Article.css";

export default function MicroservicesSecurityZeroTrustArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Zero trust starts from the assumption that being inside the network perimeter proves
          nothing &mdash; every service-to-service call is authenticated and authorized on its own
          merits, whether it originates from outside the company entirely or from the service right
          next door.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The older model trusted anything already inside the corporate network or VPC by default
          &mdash; a real problem once a single compromised service or credential inside that
          perimeter could then call anything else with no further checks. Zero trust removes that
          assumption entirely: every call carries its own verifiable identity, every call is
          authorized against explicit policy, and "it came from inside the network" carries no
          special weight at all.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Under the old model, once <code>ReportingService</code> was inside the VPC, it could call
          <code>PaymentService</code>'s internal endpoints freely &mdash; no separate credential
          needed, just network reachability. Under zero trust, <code>ReportingService</code> must
          present its own verifiable service identity on every call, and <code>PaymentService</code>
          explicitly authorizes only the specific calls that identity is allowed to make &mdash;
          being on the same internal network grants it no special access at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting a perimeter-trust model, where anything inside the network boundary can call any internal service freely, against zero trust, where every call, internal or external, must present a verified identity and be explicitly authorized.">
          <text x="105" y="20" className="figLabel">PERIMETER TRUST</text>
          <rect className="box" x="20" y="35" width="170" height="70" rx="8" />
          <text x="105" y="53" className="figHint" style={{fontSize:"6px"}}>inside network boundary</text>
          <rect className="box" x="35" y="60" width="60" height="30" rx="5" />
          <text x="65" y="78" className="boxText" style={{fontSize:"5.5px"}}>Reporting</text>
          <rect className="boxWarn" x="115" y="60" width="60" height="30" rx="5" />
          <text x="145" y="78" className="boxText" style={{fontSize:"5.5px"}}>Payment</text>
          <line className="flow" x1="95" y1="75" x2="115" y2="75" />
          <text x="105" y="55" className="figHint" style={{fontSize:"5px"}}>free access, no per-call check</text>
          <line className="divider" x1="215" y1="10" x2="215" y2="115" />
          <text x="330" y="20" className="figLabel">ZERO TRUST</text>
          <rect className="box" x="240" y="60" width="70" height="30" rx="5" />
          <text x="275" y="78" className="boxText" style={{fontSize:"5.5px"}}>Reporting</text>
          <rect className="boxAccent" x="335" y="60" width="70" height="30" rx="5" />
          <text x="370" y="78" className="boxText" style={{fontSize:"5.5px"}}>Payment</text>
          <line className="flow" x1="310" y1="75" x2="335" y2="75" />
          <text x="320" y="50" className="figHint" style={{fontSize:"5px"}}>identity + policy check, every call</text>
        </svg>
        <figcaption>Being inside the network grants nothing under zero trust &mdash; every call, from anywhere, presents identity and is checked against explicit policy.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating zero trust as purely a network-layer concern (say, just adding mutual TLS between
          services) while leaving application-level authorization wide open misses half the model
          &mdash; encrypted transport with no policy check on who's allowed to call what still trusts
          anyone who can connect. The other mistake is granting a service identity broad,
          unrestricted access "to keep things simple," which quietly recreates perimeter-style trust
          at the identity level instead of the network level.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>ReportingService is inside the same VPC as PaymentService. Under a zero-trust model, why doesn't that alone grant it access to PaymentService's endpoints?</p>
        </div>
      </section>
      <p className="takeaway">
        Zero trust means no call gets a free pass for being "internal" &mdash; identity and explicit
        authorization are checked every time, regardless of where the call originates.
      </p>
    </div>
  );
}
