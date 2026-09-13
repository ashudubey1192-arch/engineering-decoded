import "../css/Article.css";

export default function ServiceCommunicationApiContractsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An API contract is the explicit, versioned promise one service makes to every one of its
          callers about its requests and responses &mdash; the only thing standing between "we
          changed our API" and "we silently broke three other teams' services."
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A contract is usually written down in a schema &mdash; an OpenAPI spec for REST, a
          <code>.proto</code> file for gRPC, a JSON Schema for an event &mdash; and treated as a
          real deliverable, reviewed and versioned like code. The critical discipline is backward
          compatibility: additive changes (a new optional field) are safe for existing callers;
          removing or renaming a field, or making an optional field required, is a breaking change
          that needs its own plan.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>PricingService</code> wants to add a required <code>taxRegion</code> field to its
          quote response. Adding it as required immediately would break every existing caller that
          doesn't send one. Instead, the team ships it as optional first, updates every caller to
          start sending it, confirms via API telemetry that 100% of traffic now includes it, and only
          then makes it required in a new major version.
        </p>
        <span className="codeLabel">OPENAPI-STYLE CONTRACT SNIPPET</span>
        <div className="codeBlock">
          <pre>{`POST /pricing/quote
requestBody:
  itemIds: string[]        # required
  customerId: string        # required
  taxRegion: string          # optional (v1) -> required (v2)
responses:
  200: { total: number, currency: string }`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a three-stage safe contract change: taxRegion added as optional first, then callers migrated to send it, and only then made required in a new major version.">
          {["v1: taxRegion\noptional","migrate callers\nto send it","v2: taxRegion\nrequired"].map((t,i) => (
            <g key={i}>
              <rect className={i===2 ? "boxAccent" : "box"} x={15 + i*140} y="40" width="120" height="50" rx="7" />
              {t.split("\n").map((line,li) => (<text key={li} x={75 + i*140} y={62 + li*13} className="boxText" style={{fontSize:"6.5px"}}>{line}</text>))}
              {i < 2 && <line className="flow" x1={135 + i*140} y1="65" x2={155 + i*140} y2="65" />}
            </g>
          ))}
        </svg>
        <figcaption>The field becomes required only after every caller has already been migrated to send it &mdash; nothing breaks at any single step.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating a schema file as documentation instead of an enforced contract is the most common
          failure &mdash; without contract tests (covered in the Testing section) checking real
          requests and responses against it, the schema quietly drifts out of sync with what the
          service actually does. Making a breaking change and just telling other teams in a chat
          message is the other classic mistake: without a deprecation window and a way to verify
          every caller has migrated, someone always gets missed.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does adding taxRegion as optional first, then making it required later, avoid breaking any existing caller, when adding it as required immediately would not?</p>
        </div>
      </section>
      <p className="takeaway">
        Treat your API contract as a real, versioned promise &mdash; additive changes are free,
        anything else needs a migration plan with a way to confirm every caller actually moved.
      </p>
    </div>
  );
}
