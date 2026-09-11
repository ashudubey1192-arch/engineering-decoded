import "../css/Article.css";

export default function DeploymentPatternsBlueGreenDeploymentsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Blue-green deployment keeps two complete, identical production environments — only one
          serving live traffic at a time — and releases a new version by switching traffic to the
          other environment all at once.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          "Blue" is the currently-live environment; "green" is an idle, fully-provisioned twin. To
          release, the new version is deployed entirely to green, tested there without any live
          traffic at risk, and once confident, a router or load balancer switches all traffic from
          blue to green instantly. If something's wrong, switching back to blue is just as fast —
          no waiting for a rollback deployment to run. The trade-off is cost: you're paying for two
          full production environments, even though only one serves traffic at any moment.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Blue serves 100% of live traffic,</b> running v1.</li>
          <li><b>Deploy v2 to green,</b> completely idle from a traffic perspective — run full
            smoke tests against it directly.</li>
          <li><b>Switch the router</b> to send all traffic to green — the cutover happens in
            seconds, all at once.</li>
          <li><b>A critical bug appears.</b> Switch the router back to blue immediately — an
            instant rollback, since blue was never torn down.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a router pointing to a live blue environment while an identical green environment runs the new version idle, ready for an instant traffic switch." >
          <rect className="box" x="20" y="60" width="150" height="40" rx="6" /><text x="95" y="84" className="boxText">blue (live, v1)</text>
          <rect className="box" x="250" y="60" width="150" height="40" rx="6" /><text x="325" y="84" className="boxText">green (idle, v2)</text>
          <rect className="boxAccent" x="150" y="10" width="90" height="30" rx="5" /><text x="195" y="29" className="boxText">router</text>
          <line className="flow" x1="180" y1="40" x2="110" y2="55" />
          <line className="flowMuted" x1="210" y1="40" x2="300" y2="55" />
          <text x="195" y="115" className="figHint" textAnchor="middle">switching the router flips live traffic instantly</text>
        </svg>
        <figcaption>Two complete environments; the router's switch is the entire release, and the entire rollback.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Underestimating the doubled infrastructure cost, especially for large or stateful
          systems, is the main practical limiter on blue-green. A shared database between blue and
          green is also a common complication — schema changes still need to stay compatible with
          whichever environment is momentarily live during the switch.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is rollback so much faster with blue-green deployment than with a rolling deployment?</p>
        </div>
      </section>
      <p className="takeaway">
        Blue-green trades double the infrastructure cost for an instant, low-risk release switch
        and an equally instant rollback — valuable when release risk matters more than
        infrastructure cost.
      </p>
    </div>
  );
}
