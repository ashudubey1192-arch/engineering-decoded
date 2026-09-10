import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiSecurityJwtArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A JWT (JSON Web Token) is a compact, signed piece of JSON that proves a set of claims
          &mdash; typically &quot;this is user 7, and this token is valid until 3:45 PM&quot;.
        </p>
        <p>
          Any server holding the signing key (or its public half) can verify a JWT on its own,
          without calling a database or an auth server.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You log into a web app. It gives your browser a JWT. For the next 15 minutes, every API
            call carries that token. Each of the 20 backend servers can check the signature locally
            and instantly know &quot;user 7, role editor&quot; &mdash; no shared session store, no
            round trip to an auth service. That self-contained property is the whole point of a JWT.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The three parts</h2>
        <pre>
          <code>{`header.payload.signature

header  : { "alg": "RS256", "typ": "JWT" }
payload : { "sub": "user_7", "role": "editor",
            "iat": 1725950000, "exp": 1725950900 }
signature: sign( base64(header) + "." + base64(payload), key )`}</code>
        </pre>
        <p>
          Header and payload are just <b>base64url-encoded JSON &mdash; not encrypted</b>. Anyone can
          read them. The signature is what stops tampering: change one character of the payload and
          the signature no longer matches.
        </p>

        <h2>2. Common claims</h2>
        <table className="miniTable">
          <caption>STANDARD (REGISTERED) CLAIMS</caption>
          <thead>
            <tr>
              <th>Claim</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>sub</code>
              </td>
              <td>Subject &mdash; who the token is about (the user ID)</td>
            </tr>
            <tr>
              <td>
                <code>iss</code>
              </td>
              <td>Issuer &mdash; who created the token</td>
            </tr>
            <tr>
              <td>
                <code>aud</code>
              </td>
              <td>Audience &mdash; which service is allowed to accept it</td>
            </tr>
            <tr>
              <td>
                <code>exp</code>
              </td>
              <td>Expiry time &mdash; reject after this</td>
            </tr>
            <tr>
              <td>
                <code>iat</code>
              </td>
              <td>Issued-at time</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 120" role="img" aria-labelledby="jwtTitle">
            <title id="jwtTitle">
              A JWT is header, payload, and signature joined by dots; the server recomputes the
              signature to check it.
            </title>
            <rect className="box" x="30" y="45" width="130" height="30" />
            <text className="boxText" x="95" y="64">
              header
            </text>
            <rect className="box" x="175" y="45" width="200" height="30" />
            <text className="boxText" x="275" y="64">
              payload (claims)
            </text>
            <rect className="boxAccent" x="390" y="45" width="200" height="30" />
            <text className="boxText" x="490" y="64">
              signature
            </text>
            <text className="figHint" x="320" y="100">
              verify: re-sign header + payload, compare to signature, check exp
            </text>
          </svg>
          <figcaption>
            Verification is a hash/signature check plus an expiry check &mdash; fast, and needs no
            database.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: issuing and verifying</h2>
        <ol className="stepList">
          <li>
            <b>Login:</b> the auth server checks the password, then builds a payload{" "}
            <code>{`{sub, role, iss, aud, exp: now+15m}`}</code>.
          </li>
          <li>
            <b>Sign:</b> with <b>RS256</b> it signs using a private key; services verify with the
            matching public key (so only the auth server can mint tokens).
          </li>
          <li>
            <b>Client stores it</b> (cookie or memory) and sends it as{" "}
            <code>Authorization: Bearer &hellip;</code>.
          </li>
          <li>
            <b>Each service verifies:</b> signature valid? <code>exp</code> in the future?{" "}
            <code>aud</code> matches this service? <code>iss</code> is trusted? All yes &rarr; trust
            the claims.
          </li>
          <li>
            <b>Access expires in 15 min.</b> The client uses a refresh token to get a fresh JWT
            without re-entering the password.
          </li>
          <li>
            <b>Need instant revoke?</b> Keep a short deny-list of token IDs (<code>jti</code>) that
            services check &mdash; a small compromise on the &quot;no lookup&quot; ideal.
          </li>
        </ol>
        <div className="takeaway">
          A JWT is a bearer token: whoever holds it <i>is</i> the user until it expires. Keep the
          lifetime short and always send it over HTTPS.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Putting secrets in the payload</h3>
            <p>
              It is readable by anyone. No passwords, no PII beyond an ID, no internal flags you
              would not show the user.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Accepting <code>alg: none</code></h3>
            <p>
              A classic attack: strip the signature and set the algorithm to none. Pin the expected
              algorithm; never let the token choose.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Long expiry with no revocation</h3>
            <p>
              A 7-day JWT that leaks is valid for 7 days. Short <code>exp</code> + refresh tokens,
              and a deny-list for emergencies.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Since a JWT&apos;s payload is not encrypted, what actually stops a user from editing{" "}
            <code>{`"role": "user"`}</code> to <code>{`"role": "admin"`}</code> and using it? And why
            is instant logout hard with JWTs?
          </p>
        </div>
      </section>
    </div>
  );
}
