import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiSecuritySessionVsTokenArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          After you log in, the server needs to remember it is you on every later request. Two
          approaches: <b>session-based</b> (the server keeps the state) and <b>token-based</b> (the
          client carries the state).
        </p>
        <p>
          Session: the server hands you a random ID and stores your details itself. Token: the server
          hands you a signed blob that contains your details.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A single web app on one server &mdash; sessions are perfect: log in, get a cookie, the
            server looks you up in its session store. Now that app grows to 20 servers behind a load
            balancer, plus a mobile app and a public API. Suddenly &quot;which server has my
            session?&quot; is a problem. A self-contained token that any server can verify without a
            lookup fits that world better.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. How each one works</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 190" role="img" aria-labelledby="svtTitle">
            <title id="svtTitle">
              Session auth stores state on the server and looks it up per request; token auth carries
              signed state in the request and just verifies the signature.
            </title>
            <text className="figLabel" x="160" y="18">
              SESSION
            </text>
            <rect className="box" x="30" y="35" width="80" height="30" />
            <text className="boxText" x="70" y="54">
              client
            </text>
            <line className="flow" x1="110" y1="50" x2="180" y2="50" />
            <text className="figHint" x="145" y="40">
              cookie: sid=abc
            </text>
            <rect className="boxAccent" x="180" y="30" width="90" height="40" />
            <text className="boxText" x="225" y="54">
              server
            </text>
            <line className="flow" x1="270" y1="50" x2="320" y2="50" />
            <rect className="box" x="320" y="30" width="110" height="40" />
            <text className="boxText" x="375" y="49">
              session store
            </text>
            <text className="boxText" x="375" y="64">
              abc &rarr; user 7
            </text>

            <line className="divider" x1="30" y1="90" x2="610" y2="90" />

            <text className="figLabel" x="160" y="112">
              TOKEN
            </text>
            <rect className="box" x="30" y="128" width="80" height="30" />
            <text className="boxText" x="70" y="147">
              client
            </text>
            <line className="flow" x1="110" y1="143" x2="200" y2="143" />
            <text className="figHint" x="155" y="133">
              Bearer eyJ... (user 7, exp)
            </text>
            <rect className="boxAccent" x="200" y="123" width="120" height="40" />
            <text className="boxText" x="260" y="142">
              server: verify
            </text>
            <text className="boxText" x="260" y="157">
              signature only
            </text>
            <text className="figHint" x="430" y="147">
              no lookup needed
            </text>
          </svg>
          <figcaption>
            Session = server remembers, small ID travels. Token = client remembers, signed payload
            travels.
          </figcaption>
        </figure>

        <h2>2. Trade-offs</h2>
        <table className="miniTable">
          <caption>SESSION VS TOKEN</caption>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Session</th>
              <th>Token (e.g. JWT)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>State</td>
              <td>On the server (store / DB / Redis)</td>
              <td>In the token, on the client</td>
            </tr>
            <tr>
              <td>Per-request cost</td>
              <td>A store lookup</td>
              <td>A signature check (no I/O)</td>
            </tr>
            <tr>
              <td>Scaling across servers</td>
              <td>Needs shared session store or sticky sessions</td>
              <td>Any server can verify independently</td>
            </tr>
            <tr>
              <td>Revoke / log out</td>
              <td>Instant &mdash; delete the session</td>
              <td>Hard &mdash; valid until it expires (need a blocklist)</td>
            </tr>
            <tr>
              <td>Best for</td>
              <td>Classic web apps, one domain</td>
              <td>APIs, mobile, multiple services, third parties</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>3. Step by step: the two login flows</h2>
        <ol className="stepList">
          <li>
            <b>Session &mdash; login:</b> verify credentials, create a session row{" "}
            <code>{`{sid: abc, userId: 7, expires}`}</code>, send{" "}
            <code>Set-Cookie: sid=abc; HttpOnly; Secure; SameSite</code>.
          </li>
          <li>
            <b>Session &mdash; each request:</b> browser auto-sends the cookie; server looks up{" "}
            <code>abc</code> in the store to get user 7.
          </li>
          <li>
            <b>Session &mdash; logout:</b> delete the row. The cookie is now useless immediately.
          </li>
          <li>
            <b>Token &mdash; login:</b> verify credentials, sign a short-lived <b>access token</b>{" "}
            (15 min) and a longer <b>refresh token</b>. Return both.
          </li>
          <li>
            <b>Token &mdash; each request:</b> client sends{" "}
            <code>Authorization: Bearer &lt;access&gt;</code>; server verifies the signature and
            expiry &mdash; no lookup.
          </li>
          <li>
            <b>Token &mdash; expiry:</b> when the access token dies, the client exchanges the refresh
            token for a new one. Logout = delete the refresh token server-side and drop the access
            token client-side.
          </li>
        </ol>
        <div className="takeaway">
          Short access token + refresh token is the common middle ground: you get token
          scalability and keep the blast radius of a leaked token small.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Long-lived access tokens</h3>
            <p>
              A 30-day token you cannot revoke is a 30-day breach if leaked. Keep access tokens to
              minutes and use refresh tokens.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Tokens in localStorage</h3>
            <p>
              Any XSS on the page can read <code>localStorage</code>. Prefer an{" "}
              <code>HttpOnly</code> cookie, or accept the risk deliberately.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Session cookie without flags</h3>
            <p>
              Missing <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code> opens the
              door to theft and CSRF.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your API runs on 30 stateless servers and also serves a mobile app. Which approach fits
            better, and what is the main thing you give up compared to server sessions?
          </p>
        </div>
      </section>
    </div>
  );
}
