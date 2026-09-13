import "../css/Article.css";

export default function WelcomeMicroservicesLearningRoadmapArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The twelve sections ahead build on each other in a deliberate order: how to split a
          system, how the pieces talk, how they share data without one giant database, how they
          survive each other's failures, and how you actually run and test the result.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>The course moves through four phases, each answering a different question:</p>
        <table className="miniTable">
          <caption>THE FOUR PHASES OF THIS COURSE</caption>
          <thead><tr><th>Phase</th><th>Sections</th><th>Question it answers</th></tr></thead>
          <tbody>
            <tr><td><span className="badge">1</span></td><td>Foundations, Decomposition</td><td>Where do the service boundaries go?</td></tr>
            <tr><td><span className="badge">2</span></td><td>Communication, Data, Discovery</td><td>How do services talk, and share data, across a network?</td></tr>
            <tr><td><span className="badge">3</span></td><td>Resilience, Security, Observability</td><td>How do they survive and stay understandable in production?</td></tr>
            <tr><td><span className="badge">4</span></td><td>Deployment, Testing, Architecture Patterns</td><td>How do you actually ship and run this safely?</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          If you're short on time and already comfortable with the basics, the highest-leverage
          path is: <code>Service Decomposition</code> (getting the boundaries wrong is the most
          expensive mistake to fix later), then <code>Distributed Data Management</code> (this is
          where most real production incidents in this style of system actually originate), then
          <code>Resilience</code>. The remaining sections are easier to pick up individually once
          those three are solid.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 170" role="img" aria-label="Diagram of the course's four phases as a left-to-right flow: Foundations and Decomposition, then Communication Data and Discovery, then Resilience Security and Observability, then Deployment Testing and Architecture Patterns.">
          {["Foundations &\nDecomposition","Communication,\nData & Discovery","Resilience, Security\n& Observability","Deployment, Testing\n& Patterns"].map((t,i) => (
            <g key={i}>
              <rect className={i===0 ? "boxAccent" : "box"} x={15 + i*108} y="55" width="96" height="56" rx="7" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={63 + i*108} y={78 + li*13} className="boxText" style={{fontSize:"6.5px"}}>{line}</text>
              ))}
              {i < 3 && <line className="flow" x1={111 + i*108} y1="83" x2={123 + i*108} y2="83" />}
            </g>
          ))}
          <text x="220" y="30" className="figLabel">TWELVE SECTIONS, FOUR PHASES</text>
        </svg>
        <figcaption>Each phase assumes the one before it &mdash; boundaries first, then communication and data, then survivability, then operations.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Jumping straight to deployment topics &mdash; Kubernetes, canary releases &mdash; before
          the boundaries and data-ownership questions are settled is the single most common
          misstep; you'll just end up deploying a distributed monolith faster. Skipping
          <code>Resilience</code> because "we'll add error handling later" is the second: in a
          system with a network between every component, failure handling isn't an add-on, it's a
          load-bearing part of the design from the start.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does this course cover Service Decomposition and Distributed Data Management before Deployment and Testing, rather than in the order you might actually build a team's roadmap?</p>
        </div>
      </section>
      <p className="takeaway">
        Boundaries and data ownership are the hardest things to change after the fact &mdash; get
        those right first, and the communication, resilience, and operational concerns that follow
        have a solid foundation to attach to.
      </p>
    </div>
  );
}
