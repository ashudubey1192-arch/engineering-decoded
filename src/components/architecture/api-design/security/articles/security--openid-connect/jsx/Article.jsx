import "../css/Article.css";

export default function SecurityOpenidConnectArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          OpenID Connect is a thin, standardized identity layer built on top of OAuth 2.0. OAuth
          answers "what is this app allowed to do"; OIDC adds "who is the actual person," in a
          standard, verifiable format instead of every API inventing its own.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Access token</h3>
            <p>For calling APIs on the user's behalf. Its format and contents are an implementation detail the client isn't meant to rely on.</p>
          </div>
          <div>
            <h3>ID token</h3>
            <p>A JWT specifically for the client to learn who the user is &mdash; standard claims like <code>sub</code>, <code>email</code>, and <code>name</code>, signed so the client can verify it wasn't tampered with.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's "Sign in with Parcelly" flow returns both tokens together. The partner app uses
          the ID token immediately, without an extra API call, to show "Signed in as
          ops@partner-logistics.com" &mdash; it just decodes and verifies the JWT's signature and
          reads the <code>email</code> claim. It uses the separate access token only when it
          actually needs to call a Parcelly API on the user's behalf, like fetching their
          shipments.
        </p>
        <span className="codeLabel">DECODED ID TOKEN CLAIMS</span>
        <div className="codeBlock">
          <pre>{`{
  "sub": "usr_6a1f",
  "email": "ops@partner-logistics.com",
  "iss": "https://auth.parcelly.com",
  "aud": "partner_app_id",
  "exp": 1758160200
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of two tokens used for two different purposes: the ID token is decoded locally to learn who the user is, while the access token is sent to the API to fetch their data.">
          <rect className="box" x="20" y="45" width="90" height="34" rx="6" />
          <text x="65" y="66" className="boxText" style={{fontSize:"6px"}}>ID token</text>
          <rect className="boxAccent" x="310" y="45" width="90" height="34" rx="6" />
          <text x="355" y="66" className="boxText" style={{fontSize:"6px"}}>Access token</text>
          <rect className="box" x="150" y="10" width="120" height="26" rx="5" />
          <text x="210" y="27" className="figHint" style={{fontSize:"5.5px"}}>decode locally: who is this?</text>
          <rect className="box" x="150" y="85" width="120" height="26" rx="5" />
          <text x="210" y="102" className="figHint" style={{fontSize:"5.5px"}}>call the API with this</text>
          <line className="flow" x1="110" y1="55" x2="150" y2="25" />
          <line className="flow" x1="310" y1="70" x2="270" y2="98" />
        </svg>
        <figcaption>Two tokens, two jobs &mdash; one tells you who's signed in, the other lets you actually call the API on their behalf.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating a plain OAuth access token as proof of identity is the classic, well-documented
          mistake this standard exists to prevent &mdash; an access token is meant for calling
          APIs, its format isn't guaranteed to be inspectable or meaningful to the client, and using
          it as a login signal was a real source of vulnerabilities before OIDC standardized a
          proper identity token. The other common mistake is reading an ID token's claims without
          verifying its signature, issuer, and audience first &mdash; an unverified JWT is just a
          claim, not a fact.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is it unsafe for a partner app to treat a valid OAuth access token, by itself, as proof of who the user is?</p>
        </div>
      </section>
      <p className="takeaway">
        Use the access token to call APIs and the ID token to know who you're talking to &mdash;
        they answer different questions, and OIDC exists specifically so identity doesn't have to
        be reverse-engineered from a token meant for something else.
      </p>
    </div>
  );
}
