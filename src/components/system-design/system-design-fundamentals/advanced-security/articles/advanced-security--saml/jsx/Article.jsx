import "../css/Article.css";

export default function AdvancedSecuritySamlArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          SAML (Security Assertion Markup Language) is a standard that lets a user log in once with
          an identity provider (like their company's Okta or Azure AD) and be securely recognized
          by many different applications — the backbone of enterprise single sign-on (SSO).
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          SAML involves three parties: the <b>user</b>, the <b>identity provider (IdP)</b> — who
          actually verifies who the user is — and the <b>service provider (SP)</b> — the
          application the user wants to use. When a user tries to access an application, it
          redirects them to the IdP to log in (if not already). The IdP authenticates the user and
          sends back a digitally-signed <b>assertion</b> — a cryptographically verifiable statement
          confirming the user's identity and attributes. The application (SP) checks the
          assertion's signature and, if valid, trusts it and logs the user in — without ever
          handling that user's actual password itself.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>User opens a work application</b> (the SP) and isn't logged in yet.</li>
          <li><b>SP redirects to the IdP</b> (the company's central login system).</li>
          <li><b>User logs in at the IdP</b> — often with multi-factor authentication — and the
            IdP creates a signed SAML assertion confirming their identity.</li>
          <li><b>Browser carries the assertion back to the SP,</b> which verifies its signature
            and logs the user in — the application never saw or handled the user's actual
            password at any point.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a user redirected from a service provider to an identity provider to log in, receiving a signed assertion that is carried back to the service provider, which verifies it and grants access." >
          <rect className="box" x="20" y="50" width="80" height="30" rx="5" /><text x="60" y="70" className="boxText">user</text>
          <line className="flow" x1="100" y1="60" x2="150" y2="35" /><text x="125" y="30" className="figHint">redirect</text>
          <rect className="box" x="160" y="15" width="110" height="30" rx="5" /><text x="215" y="35" className="boxText">identity provider</text>
          <line className="flow" x1="270" y1="30" x2="330" y2="30" style={{opacity:0}} />
          <line className="flow" x1="215" y1="45" x2="100" y2="90" /><text x="150" y="90" className="figHint">signed assertion</text>
          <rect className="boxAccent" x="160" y="95" width="140" height="30" rx="5" /><text x="230" y="115" className="boxText">service provider</text>
          <line className="flow" x1="100" y1="70" x2="160" y2="105" />
        </svg>
        <figcaption>The identity provider authenticates once and vouches for the user via a signed assertion the application trusts.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Failing to properly verify a SAML assertion's digital signature is a critical
          vulnerability — it's exactly what stops an attacker from forging their own fake
          assertion claiming to be someone else. Not validating the assertion's expiration and
          intended audience (which application it was actually issued for) can also allow a valid
          assertion to be replayed somewhere it was never meant to be used.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does the application (service provider) never need to see or handle the user's actual password in a SAML login flow?</p>
        </div>
      </section>
      <p className="takeaway">
        SAML lets one trusted identity provider vouch for a user's identity to many applications
        via signed assertions — centralizing authentication so individual applications never
        handle passwords directly.
      </p>
    </div>
  );
}
