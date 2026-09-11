import "../css/Article.css";

export default function DeploymentPatternsRollingDeploymentsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A rolling deployment replaces old instances with new ones a few at a time, rather than
          all at once — keeping the service available throughout, without needing double the
          infrastructure of a full second environment.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of stopping every instance and starting new ones (causing downtime), a rolling
          deployment takes a small batch of old instances out of the load balancer, replaces them
          with new-version instances, waits for them to pass health checks, and then moves to the
          next batch — repeating until every instance runs the new version. Throughout, some mix of
          old and new versions is serving traffic simultaneously, which is a real constraint: the
          two versions need to be compatible with each other (same API contracts, compatible
          database schema) for the duration of the rollout.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>10 instances running v1.</b> A rolling deployment begins with a batch size of 2.</li>
          <li><b>Take 2 instances out</b> of the load balancer, deploy v2 to them, wait for health
            checks to pass.</li>
          <li><b>Add them back</b> to the load balancer — now 8 instances run v1, 2 run v2, both
            serving live traffic.</li>
          <li><b>Repeat in batches of 2</b> until all 10 instances run v2 — the service was never
            fully down, but briefly served a mix of both versions.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of ten instances being replaced from the old version to the new version in small batches, with the service remaining available throughout the gradual rollout." >
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} className={i < 6 ? "box" : "boxAccent"} x={20 + i * 38} y="40" width="30" height="30" rx="4" />
          ))}
          <text x="220" y="90" className="figHint" textAnchor="middle">6 old + 4 new, both serving traffic mid-rollout</text>
        </svg>
        <figcaption>Instances flip to the new version in small batches, with old and new coexisting during the rollout.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Deploying a breaking API or database schema change in a rolling deployment — where old
          and new code run simultaneously — can cause real errors during the transition window.
          Weak or missing health checks are another common gap: without them, a rolling deployment
          can happily route traffic to broken new instances before anyone notices.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why must the old and new versions of a service remain compatible with each other during a rolling deployment?</p>
        </div>
      </section>
      <p className="takeaway">
        Rolling deployments avoid downtime and extra infrastructure cost by replacing instances
        gradually — at the price of a transition window where two versions must coexist safely.
      </p>
    </div>
  );
}
