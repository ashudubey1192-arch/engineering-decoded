import "../css/Article.css";

export default function DeploymentBlueGreenDeploymentsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A blue-green deployment keeps two complete environments running &mdash; the live "blue"
          version and an idle "green" version &mdash; and switches all traffic from one to the other
          in a single move, rather than gradually mixing versions the way a rolling deployment does.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Green is deployed in full and verified privately &mdash; smoke tests, internal traffic
          only &mdash; while blue keeps serving every real user, completely undisturbed. Once green
          is confirmed healthy, a router or load balancer flips 100% of live traffic to green in one
          step. Blue is left running, untouched, for a period afterward, so rolling back is just
          flipping the router back &mdash; not a redeploy.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> v1.4.0 (green) is deployed alongside the live v1.3.0 (blue) and
          fully smoke-tested with zero real traffic reaching it. At a chosen moment, the load
          balancer's target switches from blue to green instantly. If an issue surfaces minutes
          later, switching back to blue is immediate &mdash; it never stopped running in the
          meantime.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of blue-green deployment: a router currently points all live traffic at the blue environment while the fully deployed green environment sits idle, ready for the router to switch all traffic to it in one instant move.">
          <rect className="boxAccent" x="20" y="20" width="130" height="90" rx="8" />
          <text x="85" y="38" className="figLabel">BLUE (live)</text>
          <text x="85" y="65" className="boxText" style={{fontSize:"6.5px"}}>v1.3.0</text>
          <text x="85" y="82" className="figHint" style={{fontSize:"5.5px"}}>serving 100% traffic</text>
          <rect className="box" x="270" y="20" width="130" height="90" rx="8" />
          <text x="335" y="38" className="figLabel">GREEN (idle)</text>
          <text x="335" y="65" className="boxText" style={{fontSize:"6.5px"}}>v1.4.0</text>
          <text x="335" y="82" className="figHint" style={{fontSize:"5.5px"}}>verified, 0% traffic</text>
          <rect className="box" x="175" y="55" width="70" height="26" rx="5" />
          <text x="210" y="72" className="boxText" style={{fontSize:"6px"}}>Router</text>
          <line className="flow" x1="150" y1="65" x2="175" y2="68" />
          <line className="flowMuted" x1="245" y1="68" x2="270" y2="65" />
        </svg>
        <figcaption>The router points entirely at blue until the moment of cutover &mdash; then flips entirely to green, and back to blue instantly if needed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Tearing down blue immediately after switching to green removes the instant-rollback safety
          net that's the entire point of the pattern &mdash; blue should stay available, untouched,
          for a defined window after cutover. Underestimating the cost of running two complete
          environments at once (double the infrastructure, even if only temporarily) is the other
          common gap &mdash; a real trade-off against the instant, low-risk cutover and rollback it
          buys.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does tearing down the blue environment immediately after switching to green undo the main benefit of a blue-green deployment?</p>
        </div>
      </section>
      <p className="takeaway">
        Blue-green trades running double the infrastructure, temporarily, for an instant, low-risk
        cutover and an equally instant rollback &mdash; a trade that only pays off if blue stays
        alive after the switch.
      </p>
    </div>
  );
}
