import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiSecurityOauthArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          OAuth 2.0 is a protocol for <b>delegated access</b>: it lets you give App A permission to
          use some of your data on Service B &mdash; without giving App A your Service B password.
        </p>
        <p>
          The output is an <b>access token</b> scoped to specific permissions. OAuth is about
          authorization (&quot;this app may read your calendar&quot;), not about logging you in
          (that is OpenID Connect, built on top).
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A scheduling app wants to add events to your Google Calendar. The bad old way: you type
            your Google password into the scheduling app. The OAuth way: it redirects you to Google,
            Google asks &quot;allow this app to manage your calendar?&quot;, you approve, and the app
            receives a token that can <i>only</i> touch your calendar and can be revoked any time
            &mdash; your password never leaves Google.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The four roles</h2>
        <table className="miniTable">
          <caption>WHO IS WHO IN OAUTH</caption>
          <thead>
            <tr>
              <th>Role</th>
              <th>In the example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Resource owner</td>
              <td>You &mdash; the person who owns the calendar</td>
            </tr>
            <tr>
              <td>Client</td>
              <td>The scheduling app that wants access</td>
            </tr>
            <tr>
              <td>Authorization server</td>
              <td>Google&apos;s login + consent screen; issues tokens</td>
            </tr>
            <tr>
              <td>Resource server</td>
              <td>The Google Calendar API that holds your data</td>
            </tr>
          </tbody>
        </table>

        <h2>2. The Authorization Code flow (with PKCE)</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 200" role="img" aria-labelledby="oauthTitle">
            <title id="oauthTitle">
              The client redirects the user to the auth server, gets back a short code, then swaps
              the code for an access token on a back channel.
            </title>
            <rect className="box" x="20" y="30" width="90" height="34" />
            <text className="boxText" x="65" y="51">
              user
            </text>
            <rect className="box" x="20" y="120" width="90" height="34" />
            <text className="boxText" x="65" y="141">
              client app
            </text>
            <rect className="boxAccent" x="270" y="75" width="120" height="44" />
            <text className="boxText" x="330" y="93">
              auth server
            </text>
            <text className="boxText" x="330" y="109">
              (Google)
            </text>
            <rect className="box" x="520" y="120" width="100" height="34" />
            <text className="boxText" x="570" y="141">
              calendar API
            </text>

            <line className="flow" x1="110" y1="47" x2="270" y2="85" />
            <text className="figHint" x="180" y="40">
              1 redirect to log in + consent
            </text>
            <line className="flow" x1="270" y1="110" x2="110" y2="135" />
            <text className="figHint" x="180" y="128">
              2 redirect back with a code
            </text>
            <line className="flow" x1="110" y1="140" x2="270" y2="110" />
            <text className="figHint" x="185" y="165">
              3 code + verifier &rarr; access token
            </text>
            <line className="flow" x1="115" y1="150" x2="520" y2="140" />
            <text className="figHint" x="360" y="185">
              4 call API with the access token
            </text>
          </svg>
          <figcaption>
            The token is fetched on a server-to-server call (step 3), so it never appears in a URL or
            the browser history. PKCE stops a stolen code from being used by anyone else.
          </figcaption>
        </figure>

        <h2>3. Scopes, and the token pair</h2>
        <ul>
          <li>
            <b>Scopes</b> are the specific permissions requested:{" "}
            <code>calendar.events.write</code>, not &quot;full account&quot;. Ask for the least you
            need.
          </li>
          <li>
            <b>Access token:</b> short-lived, sent with each API call.
          </li>
          <li>
            <b>Refresh token:</b> long-lived, kept secret by the client, used to get new access
            tokens. Can be revoked to cut off the app entirely.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: &quot;Connect Google Calendar&quot;</h2>
        <ol className="stepList">
          <li>
            <b>Client redirects</b> you to Google&apos;s <code>/authorize</code> with its{" "}
            <code>client_id</code>, the <code>scope</code>, a <code>redirect_uri</code>, and a PKCE{" "}
            <code>code_challenge</code>.
          </li>
          <li>
            <b>You authenticate to Google</b> (not to the app) and approve the consent screen.
          </li>
          <li>
            <b>Google redirects back</b> to the app&apos;s <code>redirect_uri</code> with a
            one-time <code>code</code>.
          </li>
          <li>
            <b>The app&apos;s server</b> calls Google&apos;s <code>/token</code> with the{" "}
            <code>code</code>, its <code>client_secret</code>, and the PKCE{" "}
            <code>code_verifier</code>.
          </li>
          <li>
            <b>Google returns</b> an access token (1 hour) and a refresh token.
          </li>
          <li>
            <b>The app calls the Calendar API</b> with{" "}
            <code>Authorization: Bearer &lt;access&gt;</code>; when it expires, it uses the refresh
            token silently. You can revoke access in your Google account at any time.
          </li>
        </ol>
        <div className="takeaway">
          OAuth&apos;s core value: the third-party app gets a narrow, revocable token &mdash; never
          your password, and never more access than the scopes you approved.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Using OAuth as &quot;login&quot; directly</h3>
            <p>
              An access token means &quot;can call the API&quot;, not &quot;is authenticated now&quot;.
              For sign-in use OpenID Connect&apos;s ID token.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Requesting broad scopes</h3>
            <p>
              Asking for full account access when you need one calendar scares users and widens the
              damage if the app is breached.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Implicit flow / tokens in the URL</h3>
            <p>
              The old implicit flow puts tokens in the redirect URL where they leak via history and
              referrers. Use Authorization Code + PKCE.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            In the Authorization Code flow, why is the short-lived <code>code</code> exchanged for
            the token on a server-to-server request instead of being the token itself? What does PKCE
            add?
          </p>
        </div>
      </section>
    </div>
  );
}
