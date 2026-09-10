import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiSecuritySsoArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Single Sign-On (SSO) lets a user log in once with one identity provider and then access
          many separate applications without logging in again to each.
        </p>
        <p>
          A central <b>Identity Provider (IdP)</b> handles authentication; each app (the{" "}
          <b>Service Provider</b>) trusts the IdP&apos;s word about who you are.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            At work you sign in to your company account in the morning. After that, Gmail, Slack,
            Jira, and the internal wiki all just open &mdash; no separate passwords. Behind the
            scenes each app redirected you to the company IdP, saw you already had a valid session
            there, and got back a signed assertion saying &quot;this is Priya, employee, verified&quot;.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The pieces</h2>
        <table className="miniTable">
          <caption>SSO ACTORS AND PROTOCOLS</caption>
          <thead>
            <tr>
              <th>Term</th>
              <th>What it is</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Identity Provider (IdP)</td>
              <td>Holds accounts, does the actual login (Okta, Azure AD, Google)</td>
            </tr>
            <tr>
              <td>Service Provider (SP)</td>
              <td>An app the user wants to use; trusts the IdP</td>
            </tr>
            <tr>
              <td>SAML</td>
              <td>Older XML-based SSO protocol, common in enterprise</td>
            </tr>
            <tr>
              <td>OpenID Connect (OIDC)</td>
              <td>Modern SSO on top of OAuth 2.0; uses a JSON ID token</td>
            </tr>
            <tr>
              <td>Assertion / ID token</td>
              <td>The signed &quot;this is who logged in&quot; message from the IdP</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 170" role="img" aria-labelledby="ssoTitle">
            <title id="ssoTitle">
              The user logs in once at the identity provider; each app redirects there and receives a
              signed identity assertion.
            </title>
            <rect className="boxAccent" x="250" y="20" width="140" height="40" />
            <text className="boxText" x="320" y="38">
              Identity Provider
            </text>
            <text className="boxText" x="320" y="53">
              (one login)
            </text>
            <line className="flow" x1="270" y1="60" x2="120" y2="120" />
            <line className="flow" x1="320" y1="60" x2="320" y2="120" />
            <line className="flow" x1="370" y1="60" x2="520" y2="120" />
            <rect className="box" x="60" y="120" width="110" height="34" />
            <text className="boxText" x="115" y="141">
              Slack
            </text>
            <rect className="box" x="265" y="120" width="110" height="34" />
            <text className="boxText" x="320" y="141">
              Jira
            </text>
            <rect className="box" x="470" y="120" width="110" height="34" />
            <text className="boxText" x="525" y="141">
              Wiki
            </text>
            <text className="figHint" x="320" y="95">
              each app trusts the IdP&apos;s signed assertion
            </text>
          </svg>
          <figcaption>
            The apps never see your password. They only see a signed statement from an IdP they were
            configured to trust.
          </figcaption>
        </figure>

        <h2>2. SSO vs OAuth vs a password manager</h2>
        <ul>
          <li>
            <b>SSO</b> &mdash; one login, many apps, one identity. The apps delegate{" "}
            <i>authentication</i>.
          </li>
          <li>
            <b>OAuth</b> &mdash; delegate <i>authorization</i> (API access) to a third-party app. SSO
            for web login is usually OIDC, which is OAuth plus an identity layer.
          </li>
          <li>
            <b>Password manager</b> &mdash; still separate accounts and passwords, just autofilled.
            Not SSO.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>3. Step by step: opening Jira after logging in to the IdP</h2>
        <ol className="stepList">
          <li>
            <b>You visit Jira.</b> It has no session for you, so it redirects your browser to the
            company IdP with an authentication request.
          </li>
          <li>
            <b>The IdP checks its own session.</b> You logged in this morning, so it already knows
            you &mdash; no password prompt.
          </li>
          <li>
            <b>The IdP builds a signed assertion / ID token</b>: <code>sub</code>, name, email,
            groups, expiry.
          </li>
          <li>
            <b>Browser posts it back to Jira.</b> Jira verifies the signature against the IdP&apos;s
            public key and checks it has not expired.
          </li>
          <li>
            <b>Jira creates a local session</b> for you and maps your IdP groups to Jira roles.
          </li>
          <li>
            <b>Single logout:</b> logging out at the IdP can notify each app to end its session too,
            so one click signs you out everywhere.
          </li>
        </ol>
        <div className="takeaway">
          SSO centralises authentication: one place to enforce MFA, one place to disable a leaving
          employee, and far fewer passwords for users to reuse or lose.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>The IdP is now a SPOF</h3>
            <p>
              If the identity provider is down, nobody can log in to anything. It must be highly
              available with its own redundancy.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Not validating the assertion properly</h3>
            <p>
              Skipping signature, audience, issuer, or expiry checks lets an attacker forge an
              identity. Use a vetted library.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No deprovisioning path</h3>
            <p>
              Disabling the IdP account must cascade. If apps keep long local sessions, a fired
              employee still has access for hours.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            With SSO, what does an app receive instead of a password, and how does it know to trust
            it? Name one big operational risk SSO introduces.
          </p>
        </div>
      </section>
    </div>
  );
}
