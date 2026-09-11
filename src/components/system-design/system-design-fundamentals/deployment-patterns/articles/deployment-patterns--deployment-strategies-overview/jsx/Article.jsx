import "../css/Article.css";

export default function DeploymentPatternsDeploymentStrategiesOverviewArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A deployment strategy is the answer to one question: how do you replace an old version
          of running software with a new one, safely, while it's actively serving traffic?
          Different strategies trade off risk, speed, and infrastructure cost differently.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Every strategy in this section is really a variation on the same core question: how much
          of your traffic is exposed to the new version, how fast, and how easily can you back out
          if something's wrong. Rolling deployments replace instances gradually in place.
          Blue-green keeps two full environments and switches traffic all at once. Canary releases
          expose the new version to a small slice of real traffic before a full rollout. Feature
          flags decouple "deployed" from "turned on" entirely. Each is a different point on the
          same risk/speed/cost spectrum, covered one at a time in the rest of this section.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Old approach: big-bang deploy.</b> Stop the old version, start the new one —
            simple, but every user hits the new code at once, and any bug affects everyone
            immediately.</li>
          <li><b>Modern approach: controlled exposure.</b> New code reaches a small fraction of
            traffic first, with monitoring watching for errors.</li>
          <li><b>Problem detected early,</b> affecting only that small fraction — the rollout is
            halted before most users are ever affected.</li>
          <li><b>Gradually increase exposure</b> once confidence is high, until the new version
            fully replaces the old one.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a spectrum of deployment strategies from a big bang release exposing all traffic at once to a controlled, gradual rollout exposing traffic incrementally." >
          <line x1="30" y1="60" x2="390" y2="60" stroke="var(--muted)" />
          <circle className="boxWarn" cx="60" cy="60" r="10" /><text x="60" y="90" className="figHint" textAnchor="middle">big-bang</text>
          <circle className="box" cx="200" cy="60" r="10" /><text x="200" y="90" className="figHint" textAnchor="middle">rolling / blue-green</text>
          <circle className="boxAccent" cx="360" cy="60" r="10" /><text x="360" y="90" className="figHint" textAnchor="middle">canary + flags</text>
          <text x="200" y="25" className="figHint" textAnchor="middle">more control, more gradual exposure →</text>
        </svg>
        <figcaption>Deployment strategies sit on a spectrum from all-at-once to gradually and carefully controlled.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Picking a deployment strategy without considering the actual blast radius of a bad
          release (a low-traffic internal tool vs. a payment system) leads to either wasted
          engineering effort or too little caution. This section's patterns aren't mutually
          exclusive either — real systems often combine several, like canary releases running
          behind feature flags on top of a rolling deployment.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the common underlying question every deployment strategy in this section is answering differently?</p>
        </div>
      </section>
      <p className="takeaway">
        Every deployment strategy trades risk, speed, and cost differently — the rest of this
        section covers the specific mechanisms behind each point on that spectrum.
      </p>
    </div>
  );
}
