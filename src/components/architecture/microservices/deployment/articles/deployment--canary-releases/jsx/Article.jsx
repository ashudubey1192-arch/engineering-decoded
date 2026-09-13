import "../css/Article.css";

export default function DeploymentCanaryReleasesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A canary release routes a small slice of real traffic to the new version first &mdash; 5%,
          then 25%, then 100% &mdash; watching real production metrics at each step, rather than
          switching every user over in one move the way blue-green does.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Canary catches problems that only show up under real, varied production traffic, while
          limiting the damage to a small fraction of users if something's wrong. Blue-green catches
          nothing gradually &mdash; it's simpler, and its fallback is a single switch, but it commits
          every user to the new version the moment it cuts over. The two aren't competitors so much
          as different trade-offs between exposure and simplicity.
        </p>
        <div className="twoCol">
          <div>
            <h3>Blue-green</h3>
            <p>Instant, all-or-nothing cutover between two complete, separately verified environments.</p>
          </div>
          <div>
            <h3>Canary</h3>
            <p>Gradual, percentage-based traffic shift with an observation pause at each stage.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> v1.4.0 gets 5% of live traffic for 30 minutes. Error rate and
          latency stay within the SLO, so it's promoted to 25%, then, after another healthy window,
          to 100%. Had the 5% stage shown an elevated error rate, the rollout would halt and the
          canary would be pulled &mdash; at most 5% of users would ever have been affected.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 160" role="img" aria-label="Side-by-side comparison of blue-green deployment, an instant all-or-nothing switch between two complete environments, and canary release, a gradual traffic shift from 5 percent to 25 percent to 100 percent with observation at each stage.">
          <text x="105" y="18" className="figLabel">BLUE-GREEN</text>
          <rect className="box" x="20" y="35" width="80" height="45" rx="6" />
          <text x="60" y="55" className="boxText" style={{fontSize:"6px"}}>Blue</text>
          <text x="60" y="70" className="figHint" style={{fontSize:"5px"}}>100% &rarr; 0%</text>
          <rect className="boxAccent" x="115" y="35" width="80" height="45" rx="6" />
          <text x="155" y="55" className="boxText" style={{fontSize:"6px"}}>Green</text>
          <text x="155" y="70" className="figHint" style={{fontSize:"5px"}}>0% &rarr; 100%</text>
          <text x="105" y="95" className="figHint" style={{fontSize:"5.5px"}}>one instant switch</text>
          <line className="divider" x1="215" y1="10" x2="215" y2="150" />
          <text x="315" y="18" className="figLabel">CANARY</text>
          <rect className="box" x="240" y="35" width="35" height="24" rx="4" />
          <text x="257" y="51" className="boxText" style={{fontSize:"5px"}}>5%</text>
          <line className="flow" x1="278" y1="47" x2="298" y2="47" />
          <rect className="box" x="300" y="35" width="35" height="24" rx="4" />
          <text x="317" y="51" className="boxText" style={{fontSize:"5px"}}>25%</text>
          <line className="flow" x1="338" y1="47" x2="358" y2="47" />
          <rect className="boxAccent" x="360" y="35" width="40" height="24" rx="4" />
          <text x="380" y="51" className="boxText" style={{fontSize:"5px"}}>100%</text>
          <text x="315" y="95" className="figHint" style={{fontSize:"5.5px"}}>observe &amp; promote at each step</text>
        </svg>
        <figcaption>Blue-green commits all traffic in one switch; canary shifts traffic gradually, pausing to observe real metrics before each promotion.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Picking a canary percentage too small to produce a statistically meaningful signal &mdash;
          0.01% of a low-traffic service might mean zero requests during the entire observation
          window &mdash; makes that stage meaningless. Promoting a canary on a fixed timer without
          actually checking its metrics defeats the purpose entirely: the promotion decision needs to
          depend on the canary's real observed error rate and latency, not simply "it's been 10
          minutes with nothing on fire."
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A team wants to catch problems that only appear under real, varied production traffic, while limiting how many users are affected if something goes wrong. Would blue-green or canary serve that goal better, and why?</p>
        </div>
      </section>
      <p className="takeaway">
        Blue-green trades gradual exposure for a simple, instant switch; canary trades simplicity for
        limiting real damage to a small slice of traffic while still watching real production
        behavior directly.
      </p>
    </div>
  );
}
