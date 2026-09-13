import "../css/Article.css";

export default function ServiceDecompositionIdentifyingServiceBoundariesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Finding a real service boundary is less about drawing a box on a whiteboard and more about
          looking for existing seams &mdash; in the language people use, in what changes together, and
          in where transactions naturally end.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>Three concrete signals tend to agree with each other when a boundary is right:</p>
        <ul className="stepList">
          <li><b>Linguistic seams</b> &mdash; the same word means something subtly different on either side (a strong bounded-context signal).</li>
          <li><b>Change seams</b> &mdash; look at commit history; code that's almost always changed together belongs together, code that's rarely touched in the same commit is a candidate for a split.</li>
          <li><b>Transactional seams</b> &mdash; where does "must happen together, right now" naturally stop? That's often exactly where a service boundary can safely go.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Looking at eighteen months of commit history for a retail platform's monolith, the
          "catalog browsing" code and "search indexing" code are almost always changed in the same
          pull requests &mdash; a strong signal they belong in one service. "Catalog browsing" and
          "returns processing," meanwhile, haven't appeared in the same pull request in over a year,
          and a return doesn't need to happen in the same transaction as a catalog update &mdash; both
          signals point to a clean boundary between them.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a change-coupling analysis: catalog browsing and search indexing frequently appear in the same commits and cluster together, while returns processing rarely appears alongside either and sits separately.">
          <rect className="boxAccent" x="30" y="35" width="110" height="30" rx="6" />
          <text x="85" y="54" className="boxText" style={{fontSize:"6.5px"}}>Catalog browsing</text>
          <rect className="boxAccent" x="30" y="75" width="110" height="30" rx="6" />
          <text x="85" y="94" className="boxText" style={{fontSize:"6.5px"}}>Search indexing</text>
          <line className="flow" x1="140" y1="50" x2="140" y2="90" />
          <text x="160" y="72" className="figHint" style={{fontSize:"6px"}}>changed together often</text>
          <rect className="box" x="290" y="55" width="110" height="30" rx="6" />
          <text x="345" y="74" className="boxText" style={{fontSize:"6.5px"}}>Returns processing</text>
          <text x="345" y="98" className="figHint" style={{fontSize:"6px"}}>rarely changed with either</text>
        </svg>
        <figcaption>Commit-history clustering makes the boundary visible: two modules changed together constantly, a third almost never touched alongside them.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Relying only on a static diagram of today's code structure misses this signal entirely
          &mdash; two modules can look cleanly separated in a class diagram while still being changed
          together in nearly every pull request, which is the truer indicator of coupling. Ignoring
          the transactional seam is the other common mistake: a proposed boundary that would split a
          "must happen together right now" operation across two services usually means the boundary
          needs to move, not that a distributed transaction needs to be invented to paper over it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Two modules look cleanly separated in the current class diagram, but a year of commit history shows they're almost always changed in the same pull requests. Which signal should you trust more when deciding where the service boundary goes?</p>
        </div>
      </section>
      <p className="takeaway">
        Look for boundaries that already exist in how the system actually changes and transacts
        &mdash; don't invent one from a diagram that doesn't reflect real coupling.
      </p>
    </div>
  );
}
