import "../css/Article.css";

export default function DeploymentRollingDeploymentsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A rolling deployment replaces old instances with new ones a few at a time, keeping the
          service available throughout the rollout &mdash; instead of taking everything down at once
          and bringing it all back up on the new version.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The orchestrator brings up a small batch of new-version instances, waits for each to pass
          its readiness check, then terminates an equivalent number of old-version instances, and
          repeats until every instance runs the new version. At every point during the rollout, some
          mix of old and new versions is serving live traffic at the same time.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> runs 4 replicas on v1.3.0. A rolling deployment to v1.4.0 brings
          up 1 new replica, waits for it to become ready, then terminates 1 old replica &mdash;
          repeating this 4 times until all 4 run v1.4.0, with at least 3 replicas serving traffic at
          every moment along the way.
        </p>
        <span className="codeLabel">ROLLOUT STRATEGY</span>
        <div className="codeBlock">
          <pre>{`spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a rolling deployment midway through: two replicas still running the old version 1.3.0 alongside two replicas already running the new version 1.4.0, both versions serving live traffic simultaneously.">
          <text x="210" y="15" className="figLabel">MID-ROLLOUT: 4 REPLICAS</text>
          {[0,1].map(i => (
            <g key={"old"+i}>
              <rect className="box" x={30 + i*90} y="35" width="75" height="30" rx="5" />
              <text x={67 + i*90} y="54" className="boxText" style={{fontSize:"6px"}}>v1.3.0</text>
            </g>
          ))}
          {[0,1].map(i => (
            <g key={"new"+i}>
              <rect className="boxAccent" x={210 + i*90} y="35" width="75" height="30" rx="5" />
              <text x={247 + i*90} y="54" className="boxText" style={{fontSize:"6px"}}>v1.4.0</text>
            </g>
          ))}
          <text x="210" y="90" className="figHint" style={{fontSize:"6.5px"}}>both versions serve live traffic during the rollout</text>
        </svg>
        <figcaption>Halfway through, 2 old and 2 new replicas serve traffic side by side &mdash; the rollout only finishes once all 4 are on v1.4.0.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Not accounting for two versions running simultaneously is the most common mistake &mdash;
          if v1.4.0 changes an API contract that v1.3.0 peers can't handle, the mixed-version window
          itself causes errors, even though each version works correctly on its own. Setting
          <code>maxUnavailable</code> too high relative to the replica count reduces serving capacity
          too aggressively during the rollout, risking overload on whatever old instances remain.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>During a rolling deployment, 2 replicas run v1.3.0 and 2 run v1.4.0 at the same time. Why is this only safe if both versions can correctly interoperate with everything else during that window?</p>
        </div>
      </section>
      <p className="takeaway">
        A rolling deployment trades an instant full cutover for a longer window where old and new
        versions run side by side &mdash; which only works if both versions can coexist correctly for
        as long as that window lasts.
      </p>
    </div>
  );
}
