import "../css/Article.css";

export default function SecurityOauth20Article() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          OAuth 2.0 solves a different problem than an API key: letting a third-party application
          act on a user's behalf, with the user's explicit, scoped, revocable consent &mdash;
          without that application ever seeing the user's actual password.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Resource owner</b> &mdash; the user, who owns the data and grants (or refuses) access to it.</li>
          <li><b>Client</b> &mdash; the third-party app requesting access, e.g. a partner tool integrating with Parcelly.</li>
          <li><b>Authorization server</b> &mdash; issues tokens after the user authenticates and consents; this is Parcelly, not the third-party app.</li>
          <li><b>Scopes</b> &mdash; the specific, narrow permissions being granted, like "read shipment status" rather than blanket access.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A logistics dashboard wants to show a user's Parcelly shipments. Clicking "Connect
          Parcelly" redirects the user to a login page hosted by Parcelly itself &mdash; the
          dashboard never sees the user's password. The user approves a specific scope,
          <code>shipments:read</code>, and Parcelly redirects back to the dashboard with an
          authorization code, which the dashboard exchanges server-to-server for an access token
          scoped to exactly that permission. The user can revoke that grant from their Parcelly
          account at any time, instantly cutting the dashboard's access, without changing their
          password at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Sequence diagram: user is redirected from the partner app to Parcelly to log in and approve a scope, then redirected back with a code, which the partner app exchanges for a scoped access token.">
          <rect className="box" x="10" y="60" width="90" height="30" rx="5" />
          <text x="55" y="79" className="boxText" style={{fontSize:"6px"}}>Partner app</text>
          <rect className="boxAccent" x="175" y="20" width="100" height="30" rx="5" />
          <text x="225" y="39" className="boxText" style={{fontSize:"6px"}}>Parcelly login</text>
          <rect className="box" x="345" y="60" width="90" height="30" rx="5" />
          <text x="390" y="79" className="boxText" style={{fontSize:"6px"}}>User</text>
          <line className="flow" x1="100" y1="70" x2="345" y2="70" />
          <text x="220" y="65" className="figHint" style={{fontSize:"5px"}}>redirect to consent</text>
          <line className="flowMuted" x1="345" y1="80" x2="100" y2="90" />
          <text x="220" y="105" className="figHint" style={{fontSize:"5px"}}>redirected back with a code, exchanged for a scoped token</text>
        </svg>
        <figcaption>The password stays on Parcelly's own login page; the partner app only ever receives a narrowly scoped, revocable token.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing "OAuth" as effectively just an API key handed to a third party &mdash;
          skipping real user consent and meaningful scoping &mdash; defeats the entire point while
          keeping the label. Requesting broad scopes "just in case a feature needs it later"
          instead of the minimum required today is the other common mistake; it asks users to trust
          an app with more access than it currently uses, and makes a future compromise of that app
          more damaging than it needed to be.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does redirecting the user to Parcelly's own login page, rather than asking them to type their password into the partner app, matter for security?</p>
        </div>
      </section>
      <p className="takeaway">
        OAuth's value isn't the redirect flow itself &mdash; it's that the password never leaves
        the authorization server, and every grant is scoped and revocable independently of the
        user's actual credentials.
      </p>
    </div>
  );
}
