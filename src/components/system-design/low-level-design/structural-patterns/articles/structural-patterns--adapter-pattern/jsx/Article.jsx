import "../css/Article.css";

export default function StructuralPatternsAdapterPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Adapter converts one class's interface into another interface a client expects, letting
          two incompatible interfaces work together without modifying either one.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          An adapter implements the interface the client already depends on, and internally holds
          a reference to the incompatible class, translating each call into whatever that class
          actually expects. Neither the client nor the wrapped class needs to change &mdash; the
          adapter is the only new piece.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          An application's <code>PaymentProcessor</code> interface expects
          <code>charge(amountInCents)</code>, but a newly integrated third-party
          <code>LegacyBillingSdk</code> only exposes <code>bill(amountInDollars, currency)</code>.
          A <code>LegacyBillingAdapter</code> implements <code>PaymentProcessor</code>, and inside
          <code>charge()</code> converts cents to dollars and calls
          <code>legacyBillingSdk.bill(dollars, "USD")</code> &mdash; the rest of the application
          never learns the legacy SDK's shape.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a client calling a PaymentProcessor interface, which an adapter implements by translating calls into the incompatible LegacyBillingSdk's own method signature." >
          <rect className="box" x="20" y="40" width="90" height="26" rx="5" /><text x="65" y="57" className="boxText" style={{fontSize:"7px"}}>Client</text>
          <line className="flow" x1="110" y1="53" x2="150" y2="53" /><text x="130" y="43" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>charge()</text>
          <rect className="boxAccent" x="155" y="40" width="100" height="26" rx="5" /><text x="205" y="57" className="boxText" style={{fontSize:"6.5px"}}>Adapter</text>
          <line className="flow" x1="255" y1="53" x2="300" y2="53" /><text x="278" y="43" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>bill()</text>
          <rect className="box" x="305" y="40" width="100" height="26" rx="5" /><text x="355" y="57" className="boxText" style={{fontSize:"6px"}}>LegacyBillingSdk</text>
        </svg>
        <figcaption>The adapter is the only new piece; the client and the wrapped class each keep their own interface unchanged.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Cramming too many unrelated methods into one adapter turns it into a tangled mini-API of
          its own, rather than a focused translation layer. Reaching for Adapter to paper over a
          genuinely bad interface everywhere it's used, instead of fixing that interface where you
          actually own the code, just spreads the workaround further.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an adapter let PaymentProcessor and LegacyBillingSdk work together without modifying either one?</p>
        </div>
      </section>
      <p className="takeaway">
        Adapter's whole job is translation between two interfaces that were never designed to
        match &mdash; keep it to just that, and fix interfaces you own instead of adapting around them.
      </p>
    </div>
  );
}
