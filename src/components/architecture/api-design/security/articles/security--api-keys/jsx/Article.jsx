import "../css/Article.css";

export default function SecurityApiKeysArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          An API key is the simplest form of authentication: a single static secret identifying
          which account is calling. It's a good fit for server-to-server traffic, where there's no
          individual human session to represent &mdash; just one system trusting another.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Send it in a header, never the URL</b> &mdash; a key in a query string ends up in server access logs, browser history, and referrer headers.</li>
          <li><b>Scope it</b> &mdash; a prefix or attribute distinguishing environment (test vs. live) and permissions, so a leaked test key can't touch real data.</li>
          <li><b>Support rotation</b> &mdash; allow more than one active key per account, so a partner can introduce a new key and retire the old one without a downtime cutover.</li>
          <li><b>Store a hash, never the plaintext</b> &mdash; verify incoming keys the same way you'd verify a password, by comparing hashes.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly issues prefixed keys &mdash; <code>sk_live_...</code> for production,
          <code>sk_test_...</code> for its sandbox &mdash; sent as a bearer token:
        </p>
        <span className="codeLabel">REQUEST</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments HTTP/1.1
Authorization: Bearer sk_live_4f8a2b91c7`}</pre>
        </div>
        <p>
          To rotate a key, a partner generates a second active key on their account, updates their
          systems to use it, confirms traffic has shifted by checking Parcelly's per-key usage
          dashboard, and only then revokes the original &mdash; at no point is there a window where
          the partner has zero working key.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of an API key's structure, prefixed by environment, and of rotation, where two keys are briefly active together so the old one can be retired without downtime.">
          <rect className="box" x="20" y="15" width="380" height="30" rx="5" />
          <text x="90" y="35" className="boxText" style={{fontSize:"6.5px"}}>sk_live_</text>
          <text x="260" y="35" className="figHint" style={{fontSize:"6px"}}>4f8a2b91c7... (random)</text>
          <text x="90" y="12" className="figHint" style={{fontSize:"5px"}}>env prefix</text>
          <rect className="boxAccent" x="20" y="75" width="180" height="24" rx="4" />
          <text x="110" y="91" className="boxText" style={{fontSize:"5.5px"}}>old key &mdash; still valid</text>
          <rect className="boxAccent" x="220" y="75" width="180" height="24" rx="4" />
          <text x="310" y="91" className="boxText" style={{fontSize:"5.5px"}}>new key &mdash; now in use</text>
          <text x="210" y="120" className="figHint" style={{fontSize:"5.5px"}}>both valid during rotation &mdash; no downtime window</text>
        </svg>
        <figcaption>A scoped prefix identifies environment at a glance; overlapping validity during rotation means there's never a moment with zero working key.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Passing the key as a query parameter &mdash; <code>?api_key=sk_live_...</code> &mdash; is
          the most damaging mistake; it ends up logged in plaintext by every server, proxy, and
          CDN the request passes through, none of which would have logged an <code>Authorization</code>
          header body by default. Issuing exactly one non-rotatable key per account is the second:
          it forces either downtime or a risky flag-day cutover the moment a key needs to be
          replaced, whether from routine hygiene or a suspected leak.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does putting an API key in the URL query string leak it more broadly than putting it in the Authorization header, even over HTTPS?</p>
        </div>
      </section>
      <p className="takeaway">
        A key is only as safe as everywhere it ends up logged &mdash; keep it in a header, scope it
        narrowly, hash it at rest, and always support having two valid keys at once so rotation is
        never an emergency.
      </p>
    </div>
  );
}
