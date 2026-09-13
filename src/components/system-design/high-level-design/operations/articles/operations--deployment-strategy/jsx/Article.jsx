import "../css/Article.css";

export default function OperationsDeploymentStrategyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Shipping a new version of a service is itself a moment of risk &mdash; deployment
          strategy is how a design rolls out change without exposing every user to a bad release
          at once.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A <b>rolling deployment</b> replaces old instances with new ones gradually, a few at a
          time. A <b>blue-green deployment</b> runs the new version fully alongside the old one and
          switches traffic over all at once, keeping the old version ready as an instant rollback.
          A <b>canary release</b> sends a small percentage of real traffic to the new version
          first, watching its metrics closely before rolling it out further. All three exist to
          answer the same question: how do we find out a release is bad before it affects everyone?
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A new version of the checkout service</b> is ready to deploy.</li>
          <li><b>Route 5% of real traffic</b> to the new version (a canary), leaving 95% on the
            current, known-good version.</li>
          <li><b>Watch the canary&rsquo;s error rate and latency</b> against the existing version&rsquo;s
            baseline for several minutes.</li>
          <li><b>Metrics look healthy</b> &mdash; gradually shift more traffic to the new version
            until it serves 100%, or roll back instantly if the canary had shown a regression.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a canary release routing a small percentage of traffic to a new version while most traffic stays on the current version, with metrics compared before rolling out further." >
          <rect className="box" x="20" y="20" width="90" height="30" rx="5" /><text x="65" y="39" className="boxText" style={{fontSize:"8px"}}>Load balancer</text>
          <line className="flow" x1="110" y1="30" x2="200" y2="20" /><text x="155" y="12" className="figHint" style={{fontSize:"7px"}}>95%</text>
          <rect className="box" x="205" y="8" width="100" height="26" rx="5" /><text x="255" y="25" className="boxText" style={{fontSize:"8px"}}>current version</text>
          <line className="flow" x1="110" y1="40" x2="200" y2="70" /><text x="155" y="65" className="figHint" style={{fontSize:"7px"}}>5%</text>
          <rect className="boxAccent" x="205" y="60" width="100" height="26" rx="5" /><text x="255" y="77" className="boxText" style={{fontSize:"8px"}}>canary (new)</text>
        </svg>
        <figcaption>A small slice of real traffic validates the new version before it takes over completely.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Deploying a new version to 100% of instances at once, with no gradual rollout, means the
          first sign of a problem is a full-scale incident, not an early warning. Watching a canary
          without a clear, pre-agreed threshold for what counts as &ldquo;bad enough to roll back&rdquo;
          also delays the decision when something does go wrong.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What question do rolling deployments, blue-green deployments, and canary releases all try to answer, despite working differently?</p>
        </div>
      </section>
      <p className="takeaway">
        A good deployment strategy limits how many users a bad release can reach before it&rsquo;s
        caught &mdash; the goal is always an early, cheap warning instead of a late, expensive one.
      </p>
    </div>
  );
}
