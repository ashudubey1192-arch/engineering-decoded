import "../css/Article.css";

export default function ApiPlatformDeveloperPortalsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A developer portal is where documentation stops being a page you read and becomes a
          place partners actually do things &mdash; get a key, try a real call, watch their own
          usage &mdash; the operational front door to an API, distinct from the docs' explanatory
          front door covered earlier in this section.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Self-service key management</h3>
            <p>Generate, rotate, and revoke API keys without filing a support ticket or waiting on a human.</p>
          </div>
          <div>
            <h3>Interactive explorer</h3>
            <p>Make a real call against sandbox data, using your own key, directly from the documentation page.</p>
          </div>
          <div>
            <h3>Usage dashboard</h3>
            <p>See your own call volume, error rate, and how close you are to your rate limit.</p>
          </div>
          <div>
            <h3>Status page</h3>
            <p>Know whether the API is healthy right now, independent of your own integration's behavior.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A new partner signs up on Parcelly's portal, generates a sandbox key, and makes a
          successful test-mode shipment-creation call from the portal's in-browser API explorer
          &mdash; all within about ten minutes, with zero involvement from anyone on Parcelly's
          team. That speed is the entire point of a portal: it turns "email support and wait" into
          "self-serve and start building today."
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a partner's self-service journey through the developer portal: sign up, generate a key, try a call, then watch usage on the dashboard.">
          {["Sign up","Generate key","Try a call","Watch usage"].map((t,i) => (
            <g key={t}>
              <rect className={i===3 ? "boxAccent" : "box"} x={10 + i*103} y="25" width="90" height="40" rx="6" />
              <text x={55 + i*103} y="49" className="boxText" style={{fontSize:"6px"}}>{t}</text>
              {i < 3 && <line className="flow" x1={100 + i*103} y1="45" x2={112 + i*103} y2="45" />}
            </g>
          ))}
        </svg>
        <figcaption>All four steps happen with zero human involvement from Parcelly's side &mdash; that speed is the entire point of a portal.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Making key provisioning a manual, ticket-based process is a common mistake that directly
          slows down how fast new partners can start integrating, and simply doesn't scale once
          there are more than a handful of them. Shipping documentation with no self-service
          tooling behind it &mdash; a partner can read about the API in detail but can't actually
          touch it without contacting a human first &mdash; is the other common gap, and it
          undermines the "try it yourself" experience that makes documentation actually stick.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does self-service key generation matter more as an API's partner count grows from a handful to hundreds?</p>
        </div>
      </section>
      <p className="takeaway">
        Good documentation explains the API; a good portal lets someone act on that explanation
        immediately &mdash; both matter, and a portal without self-service tooling is missing the
        half that actually gets partners moving.
      </p>
    </div>
  );
}
