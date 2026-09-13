import "../css/Article.css";

export default function SolidPrinciplesInterfaceSegregationPrincipleArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          No client should be forced to depend on methods it doesn't use &mdash; several small,
          focused interfaces beat one broad interface that tries to serve every implementer at once.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A &ldquo;fat&rdquo; interface bundles methods that make sense for some implementers but
          not others, forcing the ones that don&rsquo;t need a method to implement it anyway
          &mdash; usually as a no-op or a thrown exception, both of which are warning signs that
          the interface is doing too much. Splitting it by which clients actually need which
          methods keeps every implementer honest about what it really supports.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>Worker</code> interface with both <code>work()</code> and <code>eat()</code>
          forces a <code>Robot</code> implementing it to also implement <code>eat()</code>, which
          means nothing for a robot &mdash; it either does nothing or throws an exception, and
          either way it's lying about what a Robot can actually do. Splitting into
          <code>Workable</code> (just <code>work()</code>) and <code>Eatable</code> (just
          <code>eat()</code>) lets <code>Robot</code> implement only <code>Workable</code>, while a
          <code>HumanWorker</code> implements both.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a fat Worker interface forcing a Robot to implement an eat method it can't honestly support, versus two thin interfaces letting Robot implement only the one it needs." >
          <rect className="boxWarn" x="20" y="15" width="140" height="30" rx="6" /><text x="90" y="34" className="boxText" style={{fontSize:"7px"}}>Worker: work(), eat()</text>
          <line className="flowMuted" x1="90" y1="45" x2="90" y2="70" /><text x="105" y="58" className="figHint" style={{fontSize:"6.5px"}}>eat() no-op</text>
          <rect className="box" x="35" y="75" width="110" height="26" rx="5" /><text x="90" y="92" className="boxText" style={{fontSize:"7px"}}>Robot</text>
          <line className="divider" x1="200" y1="10" x2="200" y2="105" />
          <rect className="boxAccent" x="220" y="15" width="90" height="24" rx="5" /><text x="265" y="31" className="boxText" style={{fontSize:"6.5px"}}>Workable</text>
          <rect className="boxAccent" x="320" y="15" width="90" height="24" rx="5" /><text x="365" y="31" className="boxText" style={{fontSize:"6.5px"}}>Eatable</text>
          <line className="flow" x1="265" y1="39" x2="265" y2="70" />
          <rect className="box" x="220" y="75" width="90" height="26" rx="5" /><text x="265" y="92" className="boxText" style={{fontSize:"7px"}}>Robot</text>
        </svg>
        <figcaption>A fat interface forces an implementer to fake support for methods it doesn't need; thin interfaces let it depend on only what applies.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Designing one &ldquo;just in case&rdquo; interface covering every method any implementer
          in a family might ever need leads directly to the Worker/Robot problem. Overcorrecting
          into dozens of one-method interfaces, when a small cohesive group of methods always
          travels together anyway, trades one problem for a different kind of clutter.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does forcing Robot to implement eat() from a shared Worker interface violate ISP, and what does splitting the interface fix?</p>
        </div>
      </section>
      <p className="takeaway">
        If an implementer has to fake, ignore, or throw on part of an interface, that interface is
        bundling more than one client actually needs &mdash; split it along those lines.
      </p>
    </div>
  );
}
