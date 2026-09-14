import "../css/Article.css";

export default function WelcomeApiDesignLearningRoadmapArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          The eleven sections ahead move from "what is an API and which shape should it take" to
          "how do you run one as a product that other teams depend on" &mdash; each phase assumes
          the one before it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>The course moves through five phases:</p>
        <table className="miniTable">
          <caption>FIVE PHASES, ELEVEN SECTIONS</caption>
          <thead><tr><th>Phase</th><th>Sections</th><th>Question it answers</th></tr></thead>
          <tbody>
            <tr><td><span className="badge">1</span></td><td>API Foundations</td><td>What is an API, and which style fits this problem?</td></tr>
            <tr><td><span className="badge">2</span></td><td>REST Design, Requests and Responses</td><td>How do I shape one resource and its payloads?</td></tr>
            <tr><td><span className="badge">3</span></td><td>Querying Resources, API Evolution</td><td>How do callers search a collection, and how do I change my mind later?</td></tr>
            <tr><td><span className="badge">4</span></td><td>Security, Reliability and Performance</td><td>How do I keep it safe, and predictable under load and failure?</td></tr>
            <tr><td><span className="badge">5</span></td><td>Contracts, Alternative Styles, Platform</td><td>How do I document, extend, and operate it as a product?</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          If you already ship REST endpoints day to day and want the highest-leverage path through
          this material, prioritize <code>API Evolution</code> (changing an API without breaking
          existing callers) and <code>Reliability and Performance</code> (idempotency and rate
          limiting) &mdash; these are the two areas where a wrong early decision is the most
          expensive to undo later, because by the time it hurts, external consumers are already
          depending on it.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 170" role="img" aria-label="Diagram of the course's five phases as a left-to-right flow: Foundations, then REST and payload design, then querying and evolution, then security and reliability, then contracts and platform.">
          {["Foundations","REST &\nPayloads","Querying &\nEvolution","Security &\nReliability","Contracts &\nPlatform"].map((t,i) => (
            <g key={i}>
              <rect className={i===0 ? "boxAccent" : "box"} x={10 + i*86} y="55" width="76" height="56" rx="7" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={48 + i*86} y={78 + li*13} className="boxText" style={{fontSize:"6px"}}>{line}</text>
              ))}
              {i < 4 && <line className="flow" x1={86 + i*86} y1="83" x2={96 + i*86} y2="83" />}
            </g>
          ))}
          <text x="220" y="30" className="figLabel">ELEVEN SECTIONS, FIVE PHASES</text>
        </svg>
        <figcaption>Each phase builds on the last &mdash; resource shape first, then how collections are queried and changed, then safety under load, then running it as a product.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping straight to <code>Alternative API Styles</code> or <code>API Gateways</code>
          before the core REST and evolution sections are solid is the most common shortcut &mdash;
          it produces a GraphQL or gRPC API with the exact same naming, versioning, and error-shape
          problems a poorly designed REST API would have had, just wrapped in a different transport.
          The fundamentals in the first three phases apply regardless of which wire format you
          eventually choose.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why would rushing ahead to gRPC or GraphQL without first working through resource modeling and evolution likely just reproduce the same design problems in a different format?</p>
        </div>
      </section>
      <p className="takeaway">
        The wire format changes; the underlying questions &mdash; what's a resource, how do you
        query it, how do you change it safely &mdash; don't. Get those right first and the later
        sections on specific styles and platform concerns go much faster.
      </p>
    </div>
  );
}
