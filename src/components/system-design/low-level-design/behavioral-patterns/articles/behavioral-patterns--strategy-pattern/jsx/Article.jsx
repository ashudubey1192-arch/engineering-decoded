import "../css/Article.css";

export default function BehavioralPatternsStrategyPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Strategy encapsulates a family of interchangeable algorithms behind a common interface,
          so the algorithm a class uses can be swapped at runtime &mdash; this is the exact fix
          the earlier duck example reached for, now named and generalized.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A context object holds a reference to a strategy interface rather than a hardcoded
          algorithm, and delegates to whichever concrete strategy it currently holds. Swapping
          behavior means swapping which strategy instance the context holds &mdash; not editing the
          context's own code.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>PaymentStrategy</code> interface with <code>CreditCardStrategy</code>,
          <code>PayPalStrategy</code>, and <code>CryptoStrategy</code> implementations. A
          <code>ShoppingCart</code> holds whichever strategy the shopper selected at checkout and
          calls <code>strategy.pay(amount)</code> &mdash; there's no if/else on payment type
          anywhere inside <code>ShoppingCart</code> itself.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Diagram of a ShoppingCart holding a reference to a swappable PaymentStrategy interface, with three concrete strategies underneath it that can each be substituted in." >
          <rect className="box" x="30" y="40" width="110" height="30" rx="6" /><text x="85" y="59" className="boxText" style={{fontSize:"7px"}}>ShoppingCart</text>
          <line className="flow" x1="140" y1="55" x2="185" y2="55" />
          <rect className="boxAccent" x="190" y="40" width="120" height="30" rx="6" /><text x="250" y="59" className="boxText" style={{fontSize:"7px"}}>PaymentStrategy</text>
          {["CreditCard","PayPal","Crypto"].map((t,i) => (<rect key={t} className="box" x={330} y={5+i*35} width="60" height="24" rx="5" />))}
          {["CreditCard","PayPal","Crypto"].map((t,i) => (<text key={t} x="360" y={21+i*35} className="boxText" textAnchor="middle" style={{fontSize:"6px"}}>{t}</text>))}
          {[0,1,2].map(i => (<line key={i} className="flowMuted" x1="310" y1="55" x2="330" y2={17+i*35} />))}
        </svg>
        <figcaption>ShoppingCart delegates to whichever concrete strategy it currently holds, never checking payment type itself.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing Strategy but still hiding a big if/else inside the strategies themselves
          &mdash; rather than one clean class per algorithm &mdash; defeats the whole point.
          Introducing a strategy interface for behavior that never actually varies in practice adds
          indirection with no real flexibility gained.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>How does Strategy let ShoppingCart support new payment types without ever editing ShoppingCart's own code?</p>
        </div>
      </section>
      <p className="takeaway">
        Strategy turns "which algorithm" into an object you hand in, rather than a branch you edit
        &mdash; the same fix composition offered the duck example, now with a name.
      </p>
    </div>
  );
}
