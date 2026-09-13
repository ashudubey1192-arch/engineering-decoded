import "../css/Article.css";

export default function LldFoundationsObjectsAndRelationshipsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Once you have candidate classes, the next question is how their instances relate to each
          other &mdash; and &ldquo;has-a&rdquo; hides at least three genuinely different
          relationships that behave differently when an object is destroyed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>Four ways objects relate</caption>
          <thead><tr><th>Relationship</th><th>Lifetime coupling</th><th>Example</th></tr></thead>
          <tbody>
            <tr><td>Association</td><td>None &mdash; just uses another object</td><td>A Driver uses a Car</td></tr>
            <tr><td>Aggregation</td><td>Has-a, but the part outlives the whole</td><td>A Library has Members</td></tr>
            <tr><td>Composition</td><td>Has-a, and the part dies with the whole</td><td>A Car has an Engine</td></tr>
            <tr><td>Dependency</td><td>Temporary, often just a method parameter</td><td>A method that takes a Logger</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A Library going out of business doesn&rsquo;t delete its Members &mdash; they existed
          before the library and continue to exist after (aggregation). A Car being scrapped does
          take its specific Engine instance with it &mdash; nobody reuses one car&rsquo;s physical
          engine object as another car&rsquo;s (composition). A Driver object simply calling
          <code>car.start()</code> is association &mdash; the Driver doesn&rsquo;t own the Car&rsquo;s
          lifetime at all. And a method signature like <code>process(Logger logger)</code> is a
          dependency &mdash; the class needs a Logger for this one call, not as a lasting part of
          its own structure.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of four relationship types, each drawn as a labeled connection between two boxes, showing which pairs share a lifetime and which don't." >
          <rect className="box" x="20" y="15" width="80" height="26" rx="5" /><text x="60" y="32" className="boxText" style={{fontSize:"7px"}}>Driver</text>
          <line className="flow" x1="100" y1="28" x2="140" y2="28" /><text x="120" y="18" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>uses</text>
          <rect className="box" x="145" y="15" width="70" height="26" rx="5" /><text x="180" y="32" className="boxText" style={{fontSize:"7px"}}>Car</text>
          <rect className="box" x="20" y="55" width="80" height="26" rx="5" /><text x="60" y="72" className="boxText" style={{fontSize:"7px"}}>Library</text>
          <line className="flowMuted" x1="100" y1="68" x2="140" y2="68" /><text x="120" y="58" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>has (outlives)</text>
          <rect className="box" x="145" y="55" width="70" height="26" rx="5" /><text x="180" y="72" className="boxText" style={{fontSize:"7px"}}>Member</text>
          <rect className="box" x="240" y="15" width="70" height="26" rx="5" /><text x="275" y="32" className="boxText" style={{fontSize:"7px"}}>Car</text>
          <line className="flow" x1="310" y1="28" x2="350" y2="28" /><text x="330" y="18" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>has (dies with)</text>
          <rect className="boxAccent" x="355" y="15" width="70" height="26" rx="5" /><text x="390" y="32" className="boxText" style={{fontSize:"7px"}}>Engine</text>
          <rect className="box" x="240" y="55" width="80" height="26" rx="5" /><text x="280" y="72" className="boxText" style={{fontSize:"7px"}}>process()</text>
          <line className="flowMuted" x1="320" y1="68" x2="360" y2="68" /><text x="340" y="58" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>needs briefly</text>
          <rect className="box" x="365" y="55" width="60" height="26" rx="5" /><text x="395" y="72" className="boxText" style={{fontSize:"7px"}}>Logger</text>
        </svg>
        <figcaption>Four relationships that all sound like "has-a" in English but differ in whether the parts share the whole's lifetime.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Confusing aggregation and composition &mdash; getting lifetime ownership backwards
          &mdash; leads to code that deletes objects it shouldn&rsquo;t, or leaks objects it should
          have cleaned up. Overusing inheritance where one of these has-a relationships would model
          reality more accurately is the other common misstep, and it's exactly what the next
          article addresses directly.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the practical difference between aggregation and composition, and why does it matter when an object is destroyed?</p>
        </div>
      </section>
      <p className="takeaway">
        "Has-a" isn't one relationship &mdash; whether the part shares the whole's lifetime is the
        detail that separates aggregation from composition, and getting it backwards causes real bugs.
      </p>
    </div>
  );
}
