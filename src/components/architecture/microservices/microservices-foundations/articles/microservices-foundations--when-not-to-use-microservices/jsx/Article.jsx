import "../css/Article.css";

export default function MicroservicesFoundationsWhenNotToUseMicroservicesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Microservices are a solution to organizational and scaling problems a small team usually
          doesn't have yet &mdash; adopting the style before those problems exist means paying its
          real operational costs for benefits that never materialize.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>SIGNALS YOU'RE NOT READY YET</caption>
          <thead><tr><th>Signal</th><th>Why it matters</th></tr></thead>
          <tbody>
            <tr><td>One small team owns the whole product</td><td>There's no cross-team coordination problem for independent deployability to solve</td></tr>
            <tr><td>The domain boundaries are still unclear</td><td>Splitting now bakes in guesses you'll have to undo through painful service merges later</td></tr>
            <tr><td>No shared observability or on-call tooling yet</td><td>A production incident across five services with no tracing is far harder to debug than one in a monolith</td></tr>
            <tr><td>Traffic and scaling needs are uniform</td><td>There's nothing to scale independently, so that benefit is unused</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A four-person startup building its first product splits into twelve services on day one
          &mdash; <code>UserService</code>, <code>ProfileService</code>, <code>NotificationService</code>,
          and nine more &mdash; before it has its first hundred customers or a settled data model.
          Every small feature now means opening pull requests across three or four repositories, and
          the same four engineers are now also on call for twelve independent deployments, twelve
          sets of logs, and twelve places a bug could be hiding.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of four engineers responsible for on-call coverage across twelve separate services, each service requiring its own monitoring, logs, and deploy pipeline.">
          <rect className="boxAccent" x="150" y="15" width="120" height="28" rx="6" />
          <text x="210" y="34" className="boxText" style={{fontSize:"7px"}}>4-person team</text>
          {Array.from({length: 12}).map((_,i) => {
            const col = i % 6, row = Math.floor(i/6);
            return (
              <g key={i}>
                <rect className="boxWarn" x={20 + col*66} y={80 + row*40} width="54" height="26" rx="5" />
                <text x={47 + col*66} y={97 + row*40} className="boxText" style={{fontSize:"6px"}}>Svc {i+1}</text>
              </g>
            );
          })}
          <line className="flowMuted" x1="210" y1="43" x2="210" y2="70" />
          <text x="210" y="65" className="figHint" style={{fontSize:"6px"}}>on call for all twelve</text>
        </svg>
        <figcaption>Twelve independent services, each with its own on-call surface, covered by the same four engineers who could have shipped one well-modularized monolith instead.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adopting microservices because of what a much larger company does, rather than because of
          a scaling or organizational pain the team is actually feeling, is the most common driver of
          premature adoption. A closely related mistake is treating the split as permanent and
          irreversible in either direction: starting as a well-modularized monolith and splitting out
          a service later, once a real boundary and a real scaling need are both clear, is usually
          cheaper than un-splitting twelve premature services back together.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A four-person team with one small product is deciding between one well-modularized monolith and twelve microservices. Which of the four readiness signals above would most directly argue against the twelve-service split?</p>
        </div>
      </section>
      <p className="takeaway">
        If you can't name the specific scaling or organizational pain that microservices would fix
        for your team today, that's a sign to stay with a well-modularized monolith a while longer.
      </p>
    </div>
  );
}
