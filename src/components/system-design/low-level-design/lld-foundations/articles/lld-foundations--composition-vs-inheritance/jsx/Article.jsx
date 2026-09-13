import "../css/Article.css";

export default function LldFoundationsCompositionVsInheritanceArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Inheritance models &ldquo;is-a&rdquo; and gives you polymorphism for free, but it can
          quietly lock a class into behavior it can&rsquo;t escape as requirements change &mdash;
          which is exactly why &ldquo;favor composition over inheritance&rdquo; is one of the most
          repeated pieces of design advice.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Inheritance couples a subclass tightly to its superclass&rsquo;s implementation, and deep
          hierarchies become fragile as new cases appear that don&rsquo;t cleanly fit the existing
          tree. Composition builds behavior by holding a reference to another object instead
          &mdash; it&rsquo;s more flexible because the referenced piece can be swapped at runtime,
          not fixed at compile time by which class you extended.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A classic failure: a <code>Duck</code> base class with a <code>fly()</code> method,
          extended by <code>RubberDuck</code>. Every duck subclass now inherits
          <code>fly()</code> whether it makes sense or not &mdash; a rubber duck can&rsquo;t fly,
          so the method has to be awkwardly overridden to do nothing, or the hierarchy has to be
          restructured every time a new kind of duck breaks the assumption. The fix is composition:
          give <code>Duck</code> a <code>FlyBehavior</code> field instead of a fixed
          <code>fly()</code> method &mdash; a real duck is composed with a
          <code>FlyWithWings</code> behavior, a rubber duck with a <code>CannotFly</code> behavior,
          and new duck types just get assigned whichever behavior actually fits, with no
          restructuring required.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of a broken inheritance tree where a rubber duck subclass must override a fly method it can't honestly implement, next to a composed alternative where each duck holds a swappable fly-behavior object instead." >
          <rect className="box" x="20" y="15" width="90" height="26" rx="5" /><text x="65" y="32" className="boxText" style={{fontSize:"7px"}}>Duck.fly()</text>
          <line className="flowMuted" x1="65" y1="41" x2="65" y2="65" />
          <rect className="boxWarn" x="20" y="70" width="90" height="30" rx="5" /><text x="65" y="88" className="boxText" style={{fontSize:"6.5px"}}>RubberDuck</text>
          <text x="65" y="112" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>overrides fly() to do nothing</text>
          <line className="divider" x1="220" y1="10" x2="220" y2="120" />
          <rect className="box" x="250" y="30" width="90" height="26" rx="5" /><text x="295" y="47" className="boxText" style={{fontSize:"7px"}}>Duck</text>
          <line className="flow" x1="340" y1="43" x2="380" y2="43" />
          <rect className="boxAccent" x="385" y="15" width="55" height="24" rx="4" /><text x="412" y="30" className="boxText" style={{fontSize:"6.5px"}}>FlyWithWings</text>
          <rect className="boxAccent" x="385" y="55" width="55" height="24" rx="4" /><text x="412" y="70" className="boxText" style={{fontSize:"6.5px"}}>CannotFly</text>
        </svg>
        <figcaption>Inheritance forces every duck through the same fly() method; composition lets each duck hold whichever fly-behavior actually fits.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using inheritance purely for code reuse, with no genuine is-a relationship behind it, is
          the single most common source of fragile hierarchies. Building four or five levels of
          inheritance deep is the other &mdash; each additional level makes it harder to reason
          about what a given subclass actually inherits and why.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does giving Duck a swappable FlyBehavior field fix the RubberDuck problem that subclassing couldn't?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for inheritance only for a genuine, stable is-a relationship; reach for composition
        when behavior needs to vary or swap at runtime &mdash; which, in practice, is most of the time.
      </p>
    </div>
  );
}
