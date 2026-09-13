import "../css/Article.css";

export default function SolidPrinciplesOpenClosedPrincipleArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A class should be open for extension but closed for modification &mdash; you should be
          able to add new behavior without editing and re-testing code that already works.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The usual violation is an if/else or switch chain that branches on type, growing by one
          more branch every time a new case appears. The usual fix is polymorphism: define an
          interface for the varying behavior, put each case behind its own implementation, and have
          the calling code depend only on the interface &mdash; adding a case means adding a new
          class, never touching the ones that already shipped.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>DiscountCalculator</code> with an if/else chain checking
          <code>customer.type</code> against &ldquo;regular&rdquo;, &ldquo;premium&rdquo;, and
          &ldquo;vip&rdquo; means adding a new tier requires editing that method and re-testing
          every existing branch alongside it. Replacing it with a <code>Discount</code> interface
          &mdash; one implementation per tier &mdash; lets the calculator just call
          <code>discount.apply(order)</code> polymorphically; a new tier is a new class that
          implements the interface, and the calculator's code never changes again.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of an if-else chain that grows with every new discount tier, next to a single dispatch point calling a swappable discount interface instead." >
          <rect className="boxWarn" x="20" y="15" width="160" height="90" rx="8" /><text x="100" y="35" className="boxText" style={{fontSize:"7.5px"}}>if/else chain</text>
          {["regular","premium","vip","+ next tier"].map((t,i) => (<text key={t} x="35" y={50+i*16} className="figHint" style={{fontSize:"6.5px"}}>{t}</text>))}
          <line className="divider" x1="210" y1="10" x2="210" y2="110" />
          <rect className="box" x="230" y="45" width="90" height="26" rx="5" /><text x="275" y="62" className="boxText" style={{fontSize:"6.5px"}}>Calculator</text>
          <line className="flow" x1="320" y1="58" x2="360" y2="58" />
          <rect className="boxAccent" x="365" y="15" width="50" height="22" rx="4" /><text x="390" y="29" className="boxText" style={{fontSize:"6px"}}>Regular</text>
          <rect className="boxAccent" x="365" y="45" width="50" height="22" rx="4" /><text x="390" y="59" className="boxText" style={{fontSize:"6px"}}>Premium</text>
          <rect className="boxAccent" x="365" y="75" width="50" height="22" rx="4" /><text x="390" y="89" className="boxText" style={{fontSize:"6px"}}>+ new</text>
        </svg>
        <figcaption>A growing if/else chain versus one dispatch point to swappable, independently addable implementations.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Applying OCP preemptively everywhere &mdash; abstracting behavior that has never
          actually needed a second variant &mdash; adds indirection for change that may never come.
          &ldquo;Closed for modification&rdquo; is a response to a demonstrated pattern of change,
          not a mandate to abstract every class up front.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does replacing an if/else chain on customer type with a Discount interface make the calculator "closed for modification"?</p>
        </div>
      </section>
      <p className="takeaway">
        When a branch keeps growing with every new case, that's the signal to close it off behind
        an interface &mdash; not a reason to abstract everything else in anticipation.
      </p>
    </div>
  );
}
