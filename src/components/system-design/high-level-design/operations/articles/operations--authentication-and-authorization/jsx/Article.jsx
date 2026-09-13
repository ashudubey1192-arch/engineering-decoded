import "../css/Article.css";

export default function OperationsAuthenticationAndAuthorizationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Authentication answers &ldquo;who is this?&rdquo;; authorization answers &ldquo;what are
          they allowed to do?&rdquo; &mdash; two separate questions that belong in almost every
          HLD diagram as soon as the system has more than one kind of user.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Authentication verifies identity &mdash; a password, a token, a session &mdash; and
          typically happens once per session at the edge of the system (an API gateway or an auth
          service). Authorization checks whether that already-verified identity is permitted to
          perform a specific action, and it can happen anywhere in the system, not just at the
          edge &mdash; a service deep in the call chain may still need to check permissions before
          acting. Conflating the two is a common source of both bugs and security gaps.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A user logs in.</b> The auth service verifies their credentials and issues a
            signed token identifying them &mdash; authentication, done once.</li>
          <li><b>The token is attached to every subsequent request</b> so downstream services know
            who&rsquo;s calling without re-checking credentials each time.</li>
          <li><b>The user tries to delete another user&rsquo;s post.</b> The posts service checks:
            is this identity authorized to delete this specific resource? &mdash; authorization,
            checked at the point of the action.</li>
          <li><b>The check fails</b> (they&rsquo;re not the post&rsquo;s author or an admin), and
            the request is rejected &mdash; independent of the fact that they were successfully
            authenticated.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of authentication happening once at login to issue an identity token, and authorization being checked separately at the point where a specific action is attempted." >
          <rect className="box" x="20" y="20" width="110" height="30" rx="5" /><text x="75" y="39" className="boxText" style={{fontSize:"8px"}}>Login (authN)</text>
          <line className="flow" x1="130" y1="35" x2="290" y2="35" /><text x="210" y="25" className="figHint" style={{fontSize:"7px"}}>identity token</text>
          <rect className="boxAccent" x="295" y="20" width="110" height="30" rx="5" /><text x="350" y="39" className="boxText" style={{fontSize:"8px"}}>every request</text>
          <line className="flow" x1="350" y1="50" x2="350" y2="75" />
          <rect className="box" x="280" y="80" width="130" height="30" rx="5" /><text x="345" y="99" className="boxText" style={{fontSize:"8px"}}>Action check (authZ)</text>
        </svg>
        <figcaption>Authentication happens once and travels with the request; authorization is checked at each specific action.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming that being authenticated is enough, without a separate authorization check,
          lets any logged-in user perform actions they shouldn&rsquo;t be able to. Checking
          authorization only at the API gateway, and trusting every internal service call
          afterward, leaves internal services with no defense if a request reaches them by an
          unexpected path.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why isn't verifying a user's identity once at login sufficient to protect every action they might later attempt?</p>
        </div>
      </section>
      <p className="takeaway">
        Treat authentication and authorization as two separate checks in the design &mdash; one
        established once per session, the other checked at every point an action is actually attempted.
      </p>
    </div>
  );
}
