import "../css/Article.css";

export default function CreationalPatternsAbstractFactoryPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Abstract Factory produces a whole family of related objects through one interface,
          without specifying their concrete classes &mdash; one call gets you a matched set, not
          just one product.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Where Factory Method returns one product via subclassing, Abstract Factory returns
          several related products via composition &mdash; a single factory object exposes methods
          like <code>createButton()</code> and <code>createCheckbox()</code>, and a concrete
          factory implementation guarantees every product it returns belongs to the same family, so
          they're never accidentally mismatched.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>UIFactory</code> interface with <code>DarkUIFactory</code> and
          <code>LightUIFactory</code> implementations. Calling <code>createButton()</code> and
          <code>createCheckbox()</code> on a <code>DarkUIFactory</code> always returns a matching
          dark button and dark checkbox &mdash; there's no code path where a dark button ends up
          paired with a light checkbox, because both came from the same factory instance.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of one DarkUIFactory producing a matched set of a dark button and a dark checkbox, contrasted with Factory Method's single product per creator." >
          <rect className="boxAccent" x="30" y="45" width="120" height="30" rx="6" /><text x="90" y="64" className="boxText" style={{fontSize:"7.5px"}}>DarkUIFactory</text>
          <line className="flow" x1="150" y1="52" x2="200" y2="30" /><line className="flow" x1="150" y1="68" x2="200" y2="90" />
          <rect className="box" x="205" y="15" width="90" height="26" rx="5" /><text x="250" y="32" className="boxText" style={{fontSize:"7px"}}>Dark Button</text>
          <rect className="box" x="205" y="80" width="90" height="26" rx="5" /><text x="250" y="97" className="boxText" style={{fontSize:"7px"}}>Dark Checkbox</text>
          <text x="360" y="60" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>always a matched family</text>
        </svg>
        <figcaption>One factory call produces a guaranteed-matching family of related products, never a mismatched combination.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for Abstract Factory when there's only ever one product to create is unnecessary
          &mdash; Factory Method, or even a plain constructor, is simpler and sufficient. It's also
          worth naming the pattern's real cost directly: adding a new product to the family means
          touching every concrete factory to add the matching method, which is a genuine
          maintenance burden, not a hidden gotcha to discover later.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>How does Abstract Factory guarantee that a dark button never ends up paired with a light checkbox?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Abstract Factory when you need a guaranteed-matching family of products, not just
        one product whose exact type varies.
      </p>
    </div>
  );
}
