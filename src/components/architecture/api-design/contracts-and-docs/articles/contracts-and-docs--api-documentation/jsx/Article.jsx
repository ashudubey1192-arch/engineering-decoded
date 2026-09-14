import "../css/Article.css";

export default function ContractsAndDocsApiDocumentationArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Documentation has its own job, distinct from the OpenAPI spec's job: getting someone from
          "I've never seen this API" to "I made a successful call" as fast as possible. A precise
          machine-readable contract and a good human onboarding experience are related but not the
          same thing.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Quickstart</h3>
            <p>The fastest path to one successful call &mdash; get an API key, make one request, see one real response. Minutes, not an exhaustive tour.</p>
          </div>
          <div>
            <h3>Reference</h3>
            <p>Complete and precise, generated directly from the OpenAPI spec. Every field, every endpoint, every status code.</p>
          </div>
          <div>
            <h3>Guides</h3>
            <p>Task-oriented, hand-written narrative for higher-level concerns &mdash; "how to handle a partial batch failure," "how idempotency keys work here."</p>
          </div>
          <div>
            <h3>Changelog</h3>
            <p>What changed and when, so an existing integrator can tell at a glance whether a recent update affects them.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's docs are structured around those four layers deliberately. A five-minute
          quickstart creates one test-mode shipment and shows it appearing in the dashboard. The
          reference is generated directly from the OpenAPI spec covered earlier in this section, so
          it can never silently drift from what the API actually does. Hand-written guides cover
          exactly the higher-level concerns a reference page can't, like how to think about
          idempotency keys or what to do with a partially failed bulk request.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of the four documentation layers side by side: quickstart, reference, guides, and changelog, each serving a different moment in a consumer's relationship with the API.">
          {["Quickstart","Reference","Guides","Changelog"].map((t,i) => (
            <g key={t}>
              <rect className={i===0 ? "boxAccent" : "box"} x={10 + i*103} y="20" width="90" height="50" rx="6" />
              <text x={55 + i*103} y="49" className="boxText" style={{fontSize:"6.5px"}}>{t}</text>
            </g>
          ))}
        </svg>
        <figcaption>Four layers, four different jobs &mdash; a first-time integrator and a long-time partner reach for different ones.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Shipping only an auto-generated reference, with no quickstart and no guides, is a common
          mistake &mdash; it's technically complete and practically unusable for a first-time
          integrator who doesn't yet know where to start or how the pieces fit together. Letting
          hand-written guide content drift out of sync with the generated reference, because the
          two are maintained on different schedules with nothing keeping them aligned, is the other
          common one; a guide contradicting the reference is worse than no guide at all.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a complete, auto-generated reference not enough on its own for someone integrating with an API for the very first time?</p>
        </div>
      </section>
      <p className="takeaway">
        The spec is the contract; documentation is the onboarding experience built around it. Both
        are necessary, and neither substitutes for the other.
      </p>
    </div>
  );
}
