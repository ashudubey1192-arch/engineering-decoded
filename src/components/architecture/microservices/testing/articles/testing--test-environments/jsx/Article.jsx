import "../css/Article.css";

export default function TestingTestEnvironmentsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A test that behaves differently in its test environment than it would in production tells
          you almost nothing useful &mdash; so the environments tests run against matter just as much
          as the tests themselves.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Environments trade fidelity against cost along a real spectrum. A shared, persistent
          staging environment mirrors production closely but is expensive to keep in sync and prone
          to being left broken by someone else's in-flight change. Ephemeral, on-demand environments
          &mdash; spun up fresh per pull request, torn down after &mdash; trade a little realism for
          isolation, so one team's broken change can't block another team's tests at all.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A pull request against <code>OrderService</code> automatically spins up a fresh, isolated
          environment with a disposable database and stubbed neighbors, runs its full test suite
          against it, and tears the whole thing down when the PR closes &mdash; so a broken shared
          staging environment, left that way by an unrelated team's change, never blocks this PR's
          tests at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Side-by-side comparison of a shared persistent staging environment, which offers high fidelity to production but shared risk from other teams' changes, against an ephemeral per-pull-request environment, which is isolated and lower cost but slightly less realistic.">
          <text x="105" y="18" className="figLabel">SHARED STAGING</text>
          <rect className="box" x="20" y="35" width="170" height="70" rx="8" />
          <text x="105" y="58" className="boxText" style={{fontSize:"6px"}}>one persistent environment</text>
          <text x="105" y="75" className="figHint" style={{fontSize:"5.5px"}}>high fidelity, shared risk</text>
          <text x="105" y="90" className="figHint" style={{fontSize:"5.5px"}}>can be left broken by others</text>
          <line className="divider" x1="215" y1="10" x2="215" y2="140" />
          <text x="315" y="18" className="figLabel">EPHEMERAL PER-PR</text>
          <rect className="boxAccent" x="240" y="35" width="170" height="70" rx="8" />
          <text x="325" y="58" className="boxText" style={{fontSize:"6px"}}>fresh per PR, torn down after</text>
          <text x="325" y="75" className="figHint" style={{fontSize:"5.5px"}}>isolated, lower cost</text>
          <text x="325" y="90" className="figHint" style={{fontSize:"5.5px"}}>one PR's failures stay contained</text>
        </svg>
        <figcaption>Shared staging offers the highest fidelity but shared risk; an ephemeral per-PR environment isolates that risk at some cost to realism.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Testing against an environment that diverges meaningfully from production &mdash; a
          different database version, a missing network policy or resource limit &mdash; can pass
          tests that then fail for real once deployed; a test environment's value is entirely bounded
          by how closely it resembles the real thing on the dimensions that actually matter. Sharing
          one persistent staging environment across every team with no isolation means one team's
          broken, half-finished deploy can silently break every other team's tests running against it
          at the same time.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Two teams share one staging environment. Team A deploys a half-finished change that breaks a shared dependency. What happens to Team B's tests, and how would an ephemeral per-PR environment have avoided this?</p>
        </div>
      </section>
      <p className="takeaway">
        A test is only as trustworthy as the environment it runs in &mdash; choosing where on the
        fidelity-versus-isolation spectrum each test type runs is as much a design decision as the
        test itself.
      </p>
    </div>
  );
}
