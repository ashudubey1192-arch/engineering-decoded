import "../css/Article.css";

export default function SecurityTokenDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A token is a small piece of data doing a big job &mdash; proving who's calling without a
          database lookup on every request, if it's designed right, or creating a revocation
          headache if it isn't.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>OPAQUE VS. SELF-CONTAINED</caption>
          <thead><tr><th>Dimension</th><th>Opaque token</th><th>Self-contained (JWT)</th></tr></thead>
          <tbody>
            <tr><td>What it is</td><td>A random string, meaningless on its own</td><td>A signed payload of claims, verifiable without a lookup</td></tr>
            <tr><td>Verifying it</td><td>Requires a lookup in a server-side store</td><td>Local signature check, no lookup needed</td></tr>
            <tr><td>Revoking it early</td><td>Instant &mdash; delete it from the store</td><td>Hard &mdash; valid until it naturally expires, unless you add a lookup anyway</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly splits the difference deliberately: access tokens are short-lived JWTs, good for
          fifteen minutes, so a leaked one has a small blast radius even with no lookup on every
          call. Refresh tokens, used only occasionally to mint a new access token, are long-lived
          but opaque and stored server-side &mdash; so if a partner reports a compromise, Parcelly
          can revoke the refresh token instantly, and the worst case is waiting out the current
          access token's fifteen remaining minutes at most.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of Parcelly's token pair: a short-lived self-contained access token used on every call, and a long-lived opaque refresh token used occasionally and instantly revocable.">
          <rect className="boxAccent" x="20" y="30" width="170" height="50" rx="6" />
          <text x="105" y="50" className="figLabel" style={{fontSize:"6px"}}>ACCESS TOKEN (JWT)</text>
          <text x="105" y="68" className="figHint" style={{fontSize:"5.5px"}}>15 min, no lookup, small blast radius</text>
          <rect className="box" x="230" y="30" width="170" height="50" rx="6" />
          <text x="315" y="50" className="figLabel" style={{fontSize:"6px"}}>REFRESH TOKEN (opaque)</text>
          <text x="315" y="68" className="figHint" style={{fontSize:"5.5px"}}>long-lived, revocable instantly</text>
        </svg>
        <figcaption>Short-lived and self-contained for frequent use; long-lived and revocable for the token that actually needs a kill switch.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Putting sensitive data in a JWT payload, assuming it's private, is a common and dangerous
          mistake &mdash; a JWT is typically signed, not encrypted; its payload is just base64, and
          anyone holding the token can decode and read it trivially. Issuing long-lived JWTs with no
          revocation path at all is the other common one: a leaked token that's valid for thirty
          days stays valid for thirty days, with no way to cut that short if it's discovered early.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can Parcelly revoke a compromised refresh token instantly, but not a compromised access token that still has ten minutes left on its signature?</p>
        </div>
      </section>
      <p className="takeaway">
        Match the token's lifetime and revocability to how it's used &mdash; short-lived and
        self-contained for high-frequency calls, longer-lived and revocable for anything that needs
        a real kill switch.
      </p>
    </div>
  );
}
