import "../css/Article.css";

export default function MicroservicesSecurityOauth20AndOpenidConnectArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          OAuth 2.0 and OpenID Connect solve two related but distinct problems: OAuth lets a user
          grant an application limited access to their data without sharing a password, and OpenID
          Connect (built on top of OAuth) actually tells that application who the user is.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>OAuth 2.0</h3>
            <p>Authorization: issues an access token scoped to specific permissions ("read this user's order history"), without the app ever seeing the user's password.</p>
          </div>
          <div>
            <h3>OpenID Connect</h3>
            <p>Authentication: adds an ID token, a signed statement of who the user actually is, on top of OAuth's access-token flow.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A user signs into a mobile app through the company's identity provider. The app receives
          two tokens: an <b>access token</b> it attaches to API calls (scoped to
          <code>read:orders</code>), and an <b>ID token</b> it decodes just once to display "Welcome
          back, Priya" &mdash; the ID token proves identity to the app itself; the access token
          proves authorization to whichever API it's presented to.
        </p>
        <span className="codeLabel">DECODED ID TOKEN CLAIMS</span>
        <div className="codeBlock">
          <pre>{`{ "sub": "user_5521", "name": "Priya Shah",
  "email": "priya@example.com", "iss": "https://idp.example.com",
  "exp": 1699999999 }`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of the token-issuing hop: after a user signs in, the identity provider issues both an access token used for API authorization and an ID token used by the app to know who signed in." >
          <rect className="box" x="20" y="45" width="90" height="28" rx="6" />
          <text x="65" y="63" className="boxText" style={{fontSize:"6.5px"}}>User</text>
          <rect className="boxAccent" x="165" y="45" width="100" height="28" rx="6" />
          <text x="215" y="63" className="boxText" style={{fontSize:"6.5px"}}>Identity provider</text>
          <line className="flow" x1="110" y1="58" x2="163" y2="58" />
          <text x="135" y="45" className="figHint" style={{fontSize:"5px"}}>signs in</text>
          <rect className="box" x="310" y="20" width="90" height="24" rx="5" />
          <text x="355" y="36" className="figHint" style={{fontSize:"5.5px"}}>ID token &rarr; app</text>
          <rect className="box" x="310" y="80" width="90" height="24" rx="5" />
          <text x="355" y="96" className="figHint" style={{fontSize:"5.5px"}}>access token &rarr; APIs</text>
          <line className="flow" x1="265" y1="52" x2="310" y2="32" />
          <line className="flow" x1="265" y1="64" x2="310" y2="88" />
        </svg>
        <figcaption>One sign-in, two tokens with two different jobs &mdash; the ID token says who signed in, the access token says what they're allowed to call.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using the access token to determine "who is this user" is a common confusion &mdash; an
          access token is meant to be opaque or scope-focused, not necessarily to carry identity
          claims; that's the ID token's job. The other common mistake is requesting broader OAuth
          scopes than the app actually needs ("just in case") &mdash; the whole point of scoped
          access tokens is limiting what a compromised token could be used for.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>An app wants to display the signed-in user's name. Should it read that from the access token or the ID token, and why?</p>
        </div>
      </section>
      <p className="takeaway">
        OAuth answers "what is this caller allowed to do"; OpenID Connect answers "who actually
        signed in" &mdash; keep the two tokens' jobs separate in your own mental model.
      </p>
    </div>
  );
}
