import "../css/Article.css";

export default function DeploymentPatternsFeatureFlagsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A feature flag is a runtime switch that turns a piece of functionality on or off without
          a new deployment — decoupling "the code is deployed" from "the feature is live," which
          unlocks a lot of flexibility deployment strategies alone can't offer.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Code for a new feature is wrapped in a conditional checking a flag's current value,
          looked up from a fast, centralized flag service. Because the flag's value can change
          instantly for some or all users without redeploying anything, teams can: deploy code
          dark (merged and running in production, but flagged off, with zero user-facing risk),
          gradually ramp a feature to a percentage of users, target it to specific user segments,
          and — critically — turn a problematic feature off instantly if it misbehaves, without
          waiting for a rollback deployment.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>New checkout flow is built</b> behind a flag, deployed to production, but the
            flag is off for everyone — the code exists but has zero effect.</li>
          <li><b>Enable for internal employees first,</b> by targeting the flag at that user
            segment — real production testing with essentially zero external risk.</li>
          <li><b>Ramp to 10% of real users,</b> monitoring conversion and error metrics.</li>
          <li><b>Problem detected.</b> Flip the flag off instantly for everyone — no deployment,
            no rollback, the fix is live within seconds.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of application code checking a feature flag service at runtime to decide whether to show old or new functionality, without requiring a new deployment to change that decision." >
          <rect className="box" x="20" y="40" width="140" height="34" rx="5" /><text x="90" y="62" className="boxText">app code</text>
          <line className="flow" x1="160" y1="57" x2="200" y2="57" /><text x="180" y="45" className="figHint">check flag</text>
          <rect className="boxAccent" x="210" y="40" width="140" height="34" rx="5" /><text x="280" y="62" className="boxText">flag service</text>
          <text x="185" y="95" className="figHint" textAnchor="middle">flag value changes instantly, no redeploy needed</text>
        </svg>
        <figcaption>A runtime lookup decides feature behavior — changing that decision needs no new deployment.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Letting old feature flags accumulate indefinitely after a feature has fully shipped
          creates "flag debt" — dead conditional branches that make the codebase harder to
          understand and test. Treating the flag service itself as unimportant infrastructure is
          another risk — if it becomes slow or unavailable, every flagged code path needs a
          sensible default behavior rather than failing outright.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a feature flag turn off a problematic feature faster than even a fast rollback deployment could?</p>
        </div>
      </section>
      <p className="takeaway">
        Feature flags separate deploying code from releasing it to users — enabling dark
        launches, gradual ramps, and instant kill switches that deployment strategies alone
        can't provide.
      </p>
    </div>
  );
}
