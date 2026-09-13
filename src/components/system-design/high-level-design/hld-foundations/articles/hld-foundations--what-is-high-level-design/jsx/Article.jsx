import "../css/Article.css";

export default function HldFoundationsWhatIsHighLevelDesignArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          High Level Design answers &ldquo;what are the major pieces, and how do they talk to each
          other&rdquo; &mdash; nothing about exact classes, and nothing about isolated theory
          without a specific problem attached.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          HLD output is a small number of <b>components</b> (services, databases, caches, queues),
          the <b>APIs</b> between them, and the <b>data</b> each one owns &mdash; typically drawn
          as boxes and arrows. It deliberately stops before class diagrams, method signatures, or
          specific concurrency handling inside one box &mdash; that detail is Low Level Design&rsquo;s
          job. It also goes beyond naming a concept in isolation (that&rsquo;s the Fundamentals
          course); HLD always answers <i>for this specific system</i>.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>For the prompt &ldquo;design a rate limiter,&rdquo; contrast the three layers:</p>
        <div className="twoCol">
          <div>
            <h3>HLD-level answer</h3>
            <p>A rate-limiting service sits in front of the API gateway, backed by Redis, using a
              token-bucket counter keyed by user ID.</p>
          </div>
          <div>
            <h3>LLD-level answer</h3>
            <p>The exact <code>TokenBucket</code> class, its fields, its thread-safety strategy,
              and the interface it exposes to the gateway.</p>
          </div>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 130" role="img" aria-label="Diagram of three concentric boxes: Fundamentals as isolated concepts, High Level Design as those concepts applied to one system's components, and Low Level Design as the detail inside one component." >
          <rect className="box" x="20" y="20" width="420" height="95" rx="10" />
          <text x="40" y="38" className="figLabel" style={{textAnchor:"start"}}>FUNDAMENTALS: isolated concepts</text>
          <rect className="boxAccent" x="45" y="48" width="370" height="55" rx="8" />
          <text x="65" y="65" className="figLabel" style={{textAnchor:"start", fill:"var(--text)"}}>HLD: components + APIs for THIS system</text>
          <rect className="box" x="70" y="75" width="150" height="20" rx="5" /><text x="145" y="89" className="boxText" style={{fontSize:"8px"}}>LLD: inside one box</text>
        </svg>
        <figcaption>HLD applies isolated concepts to one system's components; LLD zooms into just one of those boxes.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Answering an HLD prompt by reciting facts about a concept (&ldquo;consistent hashing
          distributes keys evenly&rdquo;) without connecting it to the system at hand doesn&rsquo;t
          demonstrate HLD skill &mdash; it demonstrates Fundamentals recall. The opposite error,
          drifting into exact class structure when asked for a component diagram, is just as common.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What distinguishes an HLD-level answer from both a Fundamentals-level answer and an LLD-level answer?</p>
        </div>
      </section>
      <p className="takeaway">
        HLD is theory applied to one specific system, stopping at the boundary of components and
        their contracts &mdash; one level more concrete than Fundamentals, one level less detailed
        than LLD.
      </p>
    </div>
  );
}
