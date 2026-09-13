import "../css/Article.css";

export default function SolidPrinciplesLiskovSubstitutionPrincipleArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A subclass must be usable anywhere its superclass is expected, without breaking the
          caller's assumptions &mdash; a subtype has to honor the parent's contract, not just
          match its method signatures.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Matching method names and signatures is necessary but not sufficient. LSP is about
          behavior: if code written against the superclass would break when handed a specific
          subclass instead, that subclass isn&rsquo;t a valid substitute &mdash; regardless of
          whether it compiles cleanly and looks like a reasonable &ldquo;is-a&rdquo; in English.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          The classic case: <code>Square extends Rectangle</code>. <code>Rectangle</code> has
          independent <code>setWidth()</code> and <code>setHeight()</code> methods, and any caller
          of Rectangle reasonably assumes setting one leaves the other unchanged. A
          <code>Square</code>, to stay a valid square, must override both setters to keep width and
          height equal &mdash; which means code that calls <code>setWidth(5)</code> expecting only
          the width to change silently gets the height changed too when handed a Square. Squares
          genuinely are rectangles geometrically, but <code>Square</code> is not a valid substitute
          for <code>Rectangle</code> in code.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of code written against Rectangle that assumes setWidth leaves height unchanged, breaking silently when a Square instance is substituted in." >
          <rect className="box" x="20" y="20" width="160" height="30" rx="6" /><text x="100" y="39" className="boxText" style={{fontSize:"7px"}}>caller: setWidth(5), expects height unchanged</text>
          <line className="flow" x1="180" y1="35" x2="220" y2="35" />
          <rect className="boxAccent" x="225" y="10" width="90" height="26" rx="5" /><text x="270" y="27" className="boxText" style={{fontSize:"7px"}}>Rectangle</text>
          <text x="270" y="50" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>works as expected</text>
          <line className="flowMuted" x1="180" y1="70" x2="220" y2="70" />
          <rect className="boxWarn" x="225" y="60" width="90" height="26" rx="5" /><text x="270" y="77" className="boxText" style={{fontSize:"7px"}}>Square</text>
          <text x="270" y="100" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>height silently changes too</text>
        </svg>
        <figcaption>Square honors Rectangle's method signatures but not its behavioral contract, breaking the caller's assumption silently.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming any &ldquo;is-a&rdquo; relationship that sounds correct in English automatically
          makes a valid subtype in code is the root of most LSP violations. Checking only that
          method signatures match, without checking that behavioral contracts and invariants still
          hold, misses exactly the class of bug LSP exists to catch.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is Square not a valid substitute for Rectangle in code, even though a square genuinely is a rectangle?</p>
        </div>
      </section>
      <p className="takeaway">
        A valid subtype honors its parent's behavioral contract, not just its method signatures
        &mdash; an "is-a" relationship in English doesn't guarantee that on its own.
      </p>
    </div>
  );
}
