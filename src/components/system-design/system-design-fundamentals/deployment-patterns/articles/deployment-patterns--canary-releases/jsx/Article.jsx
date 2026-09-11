import "../css/Article.css";

export default function DeploymentPatternsCanaryReleasesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A canary release exposes a new version to a small slice of real production traffic
          first, watches closely for problems, and only expands to everyone once it's proven safe
          — named after canaries once used to detect danger in coal mines before it reached miners.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Unlike a rolling deployment (which eventually replaces everything regardless of health)
          or blue-green (an all-at-once switch), a canary release deliberately holds a portion of
          traffic on the new version — often as small as 1% — while automated monitoring compares
          error rates, latency, and other metrics between the canary and the stable version. Only
          if the canary's metrics look healthy does the rollout proceed to a larger percentage, and
          eventually 100%; if anything looks wrong, traffic is routed back to the stable version
          immediately, having affected only a tiny fraction of real users.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Deploy v2 as the canary,</b> receiving 1% of live traffic; 99% still goes to the
            stable v1.</li>
          <li><b>Monitor automatically.</b> Error rates and latency for the canary are compared
            against the stable version in real time.</li>
          <li><b>Canary looks healthy.</b> Traffic is gradually increased — 5%, 25%, 50% — with
            monitoring at each step.</li>
          <li><b>Canary shows elevated errors instead.</b> The rollout is automatically halted and
            traffic reverted to 0% on the canary — only the small fraction of users on it were
            ever affected.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of traffic split mostly to a stable version with a small percentage routed to a canary version, whose metrics are monitored before gradually increasing its traffic share." >
          <rect className="box" x="30" y="30" width="200" height="50" rx="6" /><text x="130" y="60" className="boxText">stable v1 — 99%</text>
          <rect className="boxAccent" x="250" y="45" width="140" height="24" rx="4" /><text x="320" y="61" className="boxText">canary v2 — 1%</text>
          <text x="210" y="100" className="figHint" textAnchor="middle">canary's metrics decide whether its share grows or drops to zero</text>
        </svg>
        <figcaption>A small, closely-watched slice of traffic decides whether the rollout proceeds.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Running a canary without solid automated metrics comparison defeats its purpose — someone
          has to actually be watching, ideally automatically, or problems go unnoticed just as
          they would in a big-bang release. Too small a canary traffic percentage can also mean
          real problems take a long time to generate enough signal to detect confidently.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a canary release limit the impact of a bad deployment more effectively than a rolling deployment does?</p>
        </div>
      </section>
      <p className="takeaway">
        Canary releases limit a bad release's blast radius to a small, monitored slice of real
        traffic before committing to a full rollout — the closest thing to testing in production
        safely.
      </p>
    </div>
  );
}
