import "../css/Article.css";

export default function DeploymentPatternsCiCdPipelinesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          CI/CD (Continuous Integration / Continuous Delivery or Deployment) automates the path
          from a code change to a running, verified release — catching problems early and making
          releases routine instead of risky, manual events.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Continuous Integration</b> means every code change is automatically built and tested
          the moment it's pushed, catching integration problems within minutes instead of at a
          painful merge weeks later. <b>Continuous Delivery</b> extends this so every change that
          passes CI is automatically packaged into a deployable artifact, ready to release at any
          time — a human still decides when. <b>Continuous Deployment</b> goes one step further and
          automatically deploys every change that passes all checks, with no human gate at all.
          The pipeline itself is a sequence of automated stages — build, test, security scan,
          deploy — where a failure at any stage stops the change from progressing further.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Developer pushes a code change.</b> The pipeline triggers automatically.</li>
          <li><b>Build and unit tests run.</b> If anything fails, the developer is notified
            immediately — no waiting for a human reviewer to notice.</li>
          <li><b>Integration tests and security scans run</b> against a real, deployed test
            environment.</li>
          <li><b>Deploy.</b> Under Continuous Delivery, the change waits for a person to click
            "release"; under Continuous Deployment, it goes live automatically once every stage
            passes.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of a CI/CD pipeline flowing through build, test, security scan, and deploy stages, with a failure at any stage stopping the change from progressing further." >
          {["build", "test", "scan", "deploy"].map((s, i) => (
            <g key={s}>
              <rect className={i === 3 ? "boxAccent" : "box"} x={20 + i * 105} y="40" width="85" height="34" rx="5" /><text x={62 + i * 105} y="61" className="boxText">{s}</text>
              {i < 3 && <line className="flow" x1={105 + i * 105} y1="57" x2={125 + i * 105} y2="57" />}
            </g>
          ))}
          <text x="220" y="95" className="figHint" textAnchor="middle">a failure at any stage stops the pipeline there</text>
        </svg>
        <figcaption>Each stage gates the next — a change only reaches deploy after passing everything before it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          A slow or flaky test suite defeats the purpose of fast feedback — developers start
          ignoring or re-running failures instead of trusting them, which erodes the whole
          practice's value. Jumping straight to full Continuous Deployment without solid automated
          test coverage and monitoring is also risky — the automation needs to be trustworthy
          before removing the human gate entirely.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the key difference between Continuous Delivery and Continuous Deployment?</p>
        </div>
      </section>
      <p className="takeaway">
        CI/CD turns releasing software from a risky, manual event into a routine, automated,
        continuously-verified process — the foundation every deployment strategy in this section
        builds on top of.
      </p>
    </div>
  );
}
