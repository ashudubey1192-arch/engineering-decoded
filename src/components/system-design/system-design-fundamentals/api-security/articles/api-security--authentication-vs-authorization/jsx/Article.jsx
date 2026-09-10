import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiSecurityAuthNVsAuthZArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          <b>Authentication (authn)</b> answers &quot;who are you?&quot;.{" "}
          <b>Authorization (authz)</b> answers &quot;are you allowed to do this?&quot;. Authentication
          always comes first.
        </p>
        <p>
          They are separate steps and often separate systems. You can be authenticated (we know it is
          you) and still not authorized (you cannot delete that document).
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You badge into your office building &mdash; that is <b>authentication</b>: the reader
            confirmed you are an employee. You then try to open the server room and the door stays
            shut &mdash; that is <b>authorization</b>: your badge is valid, but your role does not
            include that room. Same badge, two different checks.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Side by side</h2>
        <table className="miniTable">
          <caption>TWO DIFFERENT QUESTIONS</caption>
          <thead>
            <tr>
              <th></th>
              <th>Authentication</th>
              <th>Authorization</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Question</td>
              <td>Who are you?</td>
              <td>What can you do?</td>
            </tr>
            <tr>
              <td>Proof</td>
              <td>Password, OTP, passkey, token</td>
              <td>Roles, permissions, ownership, policies</td>
            </tr>
            <tr>
              <td>Result</td>
              <td>An identity (user 7)</td>
              <td>Allow or deny this action</td>
            </tr>
            <tr>
              <td>Failure code</td>
              <td>401 Unauthorized</td>
              <td>403 Forbidden</td>
            </tr>
            <tr>
              <td>Runs</td>
              <td>Once per request (verify the token)</td>
              <td>On every protected action</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="authTitle">
            <title id="authTitle">
              A request is first authenticated to an identity, then that identity is checked against
              the permission needed for the action.
            </title>
            <rect className="box" x="20" y="50" width="90" height="36" />
            <text className="boxText" x="65" y="72">
              request
            </text>
            <line className="flow" x1="110" y1="68" x2="160" y2="68" />
            <rect className="boxAccent" x="160" y="46" width="130" height="44" />
            <text className="boxText" x="225" y="63">
              authn: verify
            </text>
            <text className="boxText" x="225" y="79">
              &rarr; user 7
            </text>
            <line className="flow" x1="290" y1="68" x2="340" y2="68" />
            <rect className="boxAccent" x="340" y="46" width="150" height="44" />
            <text className="boxText" x="415" y="63">
              authz: user 7 may
            </text>
            <text className="boxText" x="415" y="79">
              DELETE /docs/9?
            </text>
            <line className="flow" x1="490" y1="68" x2="540" y2="68" />
            <rect className="box" x="540" y="50" width="90" height="36" />
            <text className="boxText" x="585" y="72">
              allow / 403
            </text>
          </svg>
          <figcaption>
            Authentication produces an identity once; authorization uses that identity to gate each
            action.
          </figcaption>
        </figure>

        <h2>2. Ways to model authorization</h2>
        <ul>
          <li>
            <b>RBAC (role-based):</b> users have roles (<code>admin</code>, <code>editor</code>);
            roles have permissions. Simple, most common.
          </li>
          <li>
            <b>ABAC (attribute-based):</b> rules over attributes &mdash; &quot;managers can view
            reports for their own region&quot;. Flexible, more complex.
          </li>
          <li>
            <b>Ownership / relationship:</b> &quot;you can edit a document you created&quot; or
            &quot;members of this workspace&quot;.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>3. Step by step: a protected API call</h2>
        <ol className="stepList">
          <li>
            <b>Client sends</b> <code>DELETE /projects/12</code> with{" "}
            <code>Authorization: Bearer &hellip;</code>.
          </li>
          <li>
            <b>Authn:</b> the gateway verifies the token. Bad or missing &rarr; <code>401</code>{" "}
            (&quot;log in first&quot;).
          </li>
          <li>
            <b>Identity established:</b> the token says <code>sub = user_7</code>, roles ={" "}
            <code>[member]</code>.
          </li>
          <li>
            <b>Authz:</b> the project service checks &mdash; is user 7 an <b>owner</b> or{" "}
            <b>admin</b> of project 12? They are only a member &rarr; <code>403</code> (&quot;you are
            known, but not allowed&quot;).
          </li>
          <li>
            <b>If allowed:</b> perform the delete, return <code>204</code>.
          </li>
          <li>
            <b>Log both outcomes</b> &mdash; repeated 403s from one user can signal an attack or a
            broken client.
          </li>
        </ol>
        <div className="takeaway">
          401 means &quot;I do not know who you are&quot;. 403 means &quot;I know who you are and the
          answer is no&quot;. Returning the wrong one confuses clients and leaks information.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Checking authn but not authz</h3>
            <p>
              &quot;They have a valid token&quot; is not &quot;they may do this&quot;. Every
              protected action needs its own permission check.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Trusting IDs from the client</h3>
            <p>
              <code>DELETE /docs/9?userId=7</code> &mdash; never take the identity from the request
              body or query. Derive it from the verified token.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Authz only in the UI</h3>
            <p>
              Hiding a button is not security. The API must reject the action too &mdash; attackers
              call the endpoint directly.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            A logged-in user calls <code>GET /admin/users</code> and gets <code>403</code>. Later,
            with an expired token, they call it and get <code>401</code>. Explain why each code is
            correct.
          </p>
        </div>
      </section>
    </div>
  );
}
