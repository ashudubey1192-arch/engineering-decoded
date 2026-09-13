import "../css/Article.css";

export default function TestingEndToEndTestingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An end-to-end test exercises a complete real user journey across every real, running
          service involved &mdash; the most realistic test there is, and, for exactly the same
          reason, the slowest, most expensive, and most brittle.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Nothing is mocked; a real request flows through real, deployed instances of every service a
          journey touches, exactly the way a real user's request would. This catches integration
          problems invisible to any smaller-scoped test &mdash; but a failure can originate in any of
          the services involved, and a shared test environment makes failures noisy and hard to
          attribute to one specific cause.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A single e2e test places a real order through
          <code>Gateway &rarr; Checkout &rarr; Payment &rarr; Inventory &rarr; Notification</code>,
          deployed together in a shared staging environment, and verifies a confirmation email
          actually arrives &mdash; the only kind of test that would catch a subtle serialization
          mismatch between two specific services that each pass their own contract tests
          individually.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of an end-to-end test flowing through five real, deployed services in sequence: Gateway, Checkout, Payment, Inventory, and Notification, with nothing mocked anywhere along the chain.">
          {["Gateway","Checkout","Payment","Inventory","Notification"].map((t,i) => (
            <g key={t}>
              <rect className="boxAccent" x={10 + i*82} y="35" width="70" height="28" rx="5" />
              <text x={45 + i*82} y="53" className="boxText" style={{fontSize:"5.5px"}}>{t}</text>
              {i < 4 && <line className="flow" x1={80 + i*82} y1="49" x2={92 + i*82} y2="49" />}
            </g>
          ))}
          <text x="210" y="85" className="figHint" style={{fontSize:"6px"}}>every hop real &mdash; nothing mocked, nothing stubbed</text>
        </svg>
        <figcaption>All five services are real and deployed together &mdash; the test only knows the journey worked if a real email actually arrives at the end.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Relying on end-to-end tests as the primary safety net, with few or no unit and integration
          tests underneath, produces a suite that's slow, flaky, and only tells you something is
          broken somewhere across five services &mdash; rarely which one, or why. Running a large e2e
          suite on every single commit, given how slow and resource-intensive each run is, makes
          feedback loops painfully slow; most teams run a small, critical-path e2e suite and leave
          broader coverage to faster test types underneath it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>An end-to-end test fails partway through the Gateway-to-Notification chain. Why is it often harder to tell which of the five services actually caused the failure, compared to a failing component or contract test?</p>
        </div>
      </section>
      <p className="takeaway">
        End-to-end tests are the most realistic test you can write, and the most expensive &mdash;
        which is why they sit at the top of the testing pyramid, covering only the handful of
        journeys that matter most, not everything.
      </p>
    </div>
  );
}
