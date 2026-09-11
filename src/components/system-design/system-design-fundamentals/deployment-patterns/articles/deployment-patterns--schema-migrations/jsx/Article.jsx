import "../css/Article.css";

export default function DeploymentPatternsSchemaMigrationsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A schema migration changes a database's structure — adding a column, renaming a table —
          and doing this safely alongside a rolling or canary deployment, where old and new code
          run simultaneously against the same database, needs real care.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The core technique is the <b>expand-contract</b> pattern (also called parallel change):
          rather than changing the schema and the code that depends on it in one atomic step,
          split it into safe stages. First <b>expand</b> — add the new column or table alongside
          the old one, so both old and new code still work unmodified. Then deploy code that
          writes to both old and new, then code that reads from the new field, gradually shifting
          over. Only once every instance is confirmed running the new code do you{" "}
          <b>contract</b> — remove the old column. This ensures that at every single point in the
          rollout, both old and new code find a schema they're compatible with.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>Renaming a column from <code>user_name</code> to <code>full_name</code> during a rolling deployment.</p>
        </div>
        <ol className="stepList">
          <li><b>Expand:</b> Add a new <code>full_name</code> column, alongside the existing{" "}
            <code>user_name</code> — both now exist.</li>
          <li><b>Dual-write:</b> Deploy code that writes every update to both columns — old
            instances still reading/writing <code>user_name</code> keep working unaffected.</li>
          <li><b>Migrate and switch reads:</b> Backfill <code>full_name</code> for existing rows,
            then roll out code that reads from <code>full_name</code> instead.</li>
          <li><b>Contract:</b> Once every instance runs the new code, stop writing to{" "}
            <code>user_name</code> and drop it — the migration is complete with zero downtime.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of the expand-contract migration pattern: adding a new column alongside the old one, dual-writing to both, migrating reads to the new column, then removing the old column." >
          {["expand", "dual-write", "migrate reads", "contract"].map((s, i) => (
            <g key={s}>
              <rect className={i === 3 ? "boxAccent" : "box"} x={15 + i * 108} y="40" width="92" height="34" rx="5" /><text x={61 + i * 108} y="61" className="boxText">{s}</text>
              {i < 3 && <line className="flow" x1={107 + i * 108} y1="57" x2={123 + i * 108} y2="57" />}
            </g>
          ))}
          <text x="220" y="95" className="figHint" textAnchor="middle">both schema shapes stay valid at every stage</text>
        </svg>
        <figcaption>Each stage keeps both old and new code working against the schema simultaneously.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Changing a schema and deploying dependent code in a single atomic step is the classic
          mistake during any gradual rollout — the moment old code and new schema (or vice versa)
          coexist, even briefly, something breaks. Forgetting the "contract" step also leaves
          permanent cruft — unused old columns lingering indefinitely because nobody circled back
          to remove them.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can't a schema change and the code that depends on it safely deploy together in a single step during a rolling deployment?</p>
        </div>
      </section>
      <p className="takeaway">
        The expand-contract pattern keeps a database schema compatible with both old and new code
        throughout a gradual rollout — splitting a risky atomic change into a sequence of safe ones.
      </p>
    </div>
  );
}
