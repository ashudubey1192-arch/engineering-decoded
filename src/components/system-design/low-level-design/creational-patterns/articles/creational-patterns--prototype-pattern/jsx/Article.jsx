import "../css/Article.css";

export default function CreationalPatternsPrototypePatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Prototype creates new objects by cloning an existing instance rather than building from
          scratch &mdash; valuable when construction is expensive but a similar object already
          exists to copy.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A prototype object implements a <code>clone()</code> method that returns a copy of
          itself; instead of running the same expensive setup logic every time a similar object is
          needed, that setup runs once, and every subsequent instance comes from copying the
          already-configured prototype.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>GameCharacter</code> template pre-loaded with textures and animation data that
          took real time to set up. Spawning 100 enemies of the same type by constructing each one
          from scratch would repeat that expensive load 100 times; cloning the one already-loaded
          prototype 100 times instead skips the repeated setup entirely, at the cost of a much
          cheaper copy operation each time.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram contrasting building 100 enemies from scratch, each repeating expensive setup, against cloning one pre-configured prototype 100 times instead." >
          <rect className="boxWarn" x="20" y="20" width="170" height="28" rx="6" /><text x="105" y="39" className="boxText" style={{fontSize:"7px"}}>new Enemy() &times; 100</text>
          <text x="105" y="65" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>expensive setup repeated 100 times</text>
          <line className="divider" x1="220" y1="10" x2="220" y2="95" />
          <rect className="boxAccent" x="245" y="15" width="150" height="26" rx="5" /><text x="320" y="32" className="boxText" style={{fontSize:"7px"}}>Enemy prototype (loaded once)</text>
          <line className="flow" x1="320" y1="41" x2="320" y2="60" /><text x="320" y="75" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>clone() &times; 100 (cheap)</text>
        </svg>
        <figcaption>Expensive setup happens once on the prototype; every additional instance is a cheap clone of it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forgetting the shallow-versus-deep-copy distinction is the pattern's signature bug: a
          shallow clone that copies a reference to a mutable list, rather than the list itself,
          leaves the original and every clone silently sharing &mdash; and able to corrupt &mdash;
          the same underlying list. Using Prototype when construction is already cheap adds a
          cloning interface for savings that were never there.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a shallow clone cause the original object and its clone to silently share and corrupt the same data?</p>
        </div>
      </section>
      <p className="takeaway">
        Prototype trades expensive construction for a cheap clone &mdash; but only pays off once
        you've also gotten shallow-versus-deep copying right.
      </p>
    </div>
  );
}
