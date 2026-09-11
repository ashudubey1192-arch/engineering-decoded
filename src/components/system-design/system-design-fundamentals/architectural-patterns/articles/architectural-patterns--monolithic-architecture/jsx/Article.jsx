import "../css/Article.css";

export default function ArchitecturalPatternsMonolithicArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A monolith is a single deployable application containing all of a system's functionality
          — one codebase, one build, one deployment. It's often unfairly maligned; for many
          products it's still the right starting point.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Everything runs in one process, sharing one codebase and usually one database. That
          makes local development, testing, and deployment simple — no network calls between
          internal components, no distributed transactions, no version-skew between services. The
          trade-off shows up at scale: the whole application scales as one unit, a bug in one
          module can take down the whole process, and many teams working in the same codebase can
          step on each other.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start as a monolith.</b> A new e-commerce app has one codebase with modules for
            catalog, cart, orders, and users, all calling each other as regular function calls.</li>
          <li><b>Deploy as one unit.</b> One build artifact, one deployment pipeline — simple to
            reason about.</li>
          <li><b>Scale it.</b> Under load, you run more copies of the whole application behind a
            load balancer — even if only the catalog module actually needs more capacity.</li>
          <li><b>Feel the seams later.</b> As the team and codebase grow, module boundaries
            blur and deploys get riskier — this is usually the point teams consider splitting out
            services.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of a single deployable application containing catalog, cart, orders, and users modules all within one process talking to one database.">
          <rect className="boxAccent" x="40" y="15" width="320" height="70" rx="8" />
          {["catalog", "cart", "orders", "users"].map((m, i) => (
            <g key={m}>
              <rect className="box" x={55 + i * 78} y="30" width="65" height="40" rx="4" />
              <text x={87 + i * 78} y="53" className="boxText">{m}</text>
            </g>
          ))}
          <text x="200" y="100" className="figHint" textAnchor="middle">one process, one deploy</text>
          <line className="flow" x1="200" y1="85" x2="200" y2="110" />
          <rect className="box" x="150" y="110" width="100" height="20" rx="3" /><text x="200" y="124" className="boxText">one database</text>
        </svg>
        <figcaption>All modules live and deploy together as a single unit.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Splitting a monolith into microservices before hitting real organizational or scaling
          pain adds distributed-systems complexity for no proven benefit. A well-structured
          monolith with clean internal module boundaries can comfortably serve a large product for
          a long time.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What specific pain points typically signal that a monolith should start being split into separate services?</p>
        </div>
      </section>
      <p className="takeaway">
        A monolith trades independent scaling and deployment for simplicity — a genuinely good
        default until a specific, felt pain justifies the complexity of splitting it up.
      </p>
    </div>
  );
}
