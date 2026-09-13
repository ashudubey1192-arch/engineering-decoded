import "../css/Article.css";

export default function MicroservicesSecurityServiceAuthenticationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Service authentication answers one narrow question &mdash; which service is actually
          making this call &mdash; and it needs answering reliably before any authorization decision
          about what that caller is allowed to do can mean anything at all.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Two common mechanisms prove a service's identity to another service: <b>mutual TLS</b>
          (mTLS), where both sides present certificates and verify each other during the connection
          itself, and <b>signed service tokens</b> (often JWTs), where the caller attaches a token
          signed by a trusted identity provider, naming which service it is. Either way, the callee
          needs to cryptographically verify the claim, not just read a header and trust it at face
          value.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>InventoryService</code> requires every caller to present a service token signed by
          the internal identity provider, naming the calling service:
        </p>
        <span className="codeLabel">VERIFYING A SERVICE TOKEN</span>
        <div className="codeBlock">
          <pre>{`Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
// decoded claims: { sub: "svc-checkout", iss: "internal-idp", exp: 1699999999 }

function authenticate(req) {
  const claims = verifySignature(req.token, idpPublicKey)  // cryptographic check
  if (claims.exp < now()) throw new AuthError("expired")
  return claims.sub   // "svc-checkout" -- verified, not just asserted
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of service authentication: CheckoutService presents a signed token identifying itself, and InventoryService cryptographically verifies the signature against the identity provider's public key before trusting the claimed identity.">
          <rect className="box" x="20" y="45" width="100" height="28" rx="6" />
          <text x="70" y="63" className="boxText" style={{fontSize:"6.5px"}}>CheckoutService</text>
          <rect className="boxAccent" x="270" y="45" width="110" height="28" rx="6" />
          <text x="325" y="63" className="boxText" style={{fontSize:"6.5px"}}>InventoryService</text>
          <line className="flow" x1="120" y1="58" x2="268" y2="58" />
          <text x="195" y="45" className="figHint" style={{fontSize:"5.5px"}}>signed token</text>
          <rect className="box" x="150" y="80" width="120" height="24" rx="5" />
          <text x="210" y="96" className="figHint" style={{fontSize:"6px"}}>verify against IdP public key</text>
          <line className="flowMuted" x1="325" y1="73" x2="270" y2="80" />
        </svg>
        <figcaption>InventoryService doesn't just read the claimed identity &mdash; it cryptographically verifies the token's signature before trusting it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Trusting a plain, unsigned header like <code>X-Service-Name: checkout</code> is not
          authentication at all &mdash; anything that can reach the network can set that header to
          whatever it likes. Skipping expiry checks on an otherwise-valid signed token is the other
          common gap: a correctly-signed but long-expired token should never be treated as proof of
          current identity.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a plain "X-Service-Name: checkout" header not real service authentication, while a cryptographically signed and verified token is?</p>
        </div>
      </section>
      <p className="takeaway">
        Authentication has to be verifiable, not just asserted &mdash; a claimed identity is only as
        trustworthy as the cryptographic check behind it.
      </p>
    </div>
  );
}
