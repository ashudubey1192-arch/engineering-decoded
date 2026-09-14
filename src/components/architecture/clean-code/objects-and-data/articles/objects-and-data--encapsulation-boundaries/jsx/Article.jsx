import "../css/Article.css";

export default function ObjectsAndDataEncapsulationBoundariesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Encapsulation is not just "make fields private." It is a decision about where an
          invariant &mdash; a rule that must always hold true &mdash; is enforced. Draw the boundary in
          the wrong place, and the rule can be silently broken from outside.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>An invariant is a promise</b> &mdash; "an invoice's line items always sum to its total" is a promise the <code>Invoice</code> class should guarantee, not something every caller has to remember to maintain by hand.</li>
          <li><b>Private fields enforce nothing by themselves</b> &mdash; a private field with a public setter that accepts any value offers no real protection; the invariant has to be checked inside the class, not just hidden.</li>
          <li><b>The boundary should own the rule, not just the data</b> &mdash; if adding a line item can break the total, the method that adds a line item is where that recalculation belongs.</li>
          <li><b>Widening the boundary later is easy; narrowing it is hard</b> &mdash; starting with a tight, well-enforced boundary and relaxing it if truly needed is safer than starting open and trying to lock things down after callers already depend on the looseness.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>Invoice.total</code> was, for a while, a mutable public field kept
          "in sync" by convention &mdash; a promise every caller had to remember to keep:
        </p>
        <span className="codeLabel">INVARIANT ENFORCED BY CONVENTION (FRAGILE)</span>
        <div className="codeBlock">
          <pre>{`class Invoice {
  lineItems = [];
  total = 0;
}
// every call site has to remember to do both steps:
invoice.lineItems.push(newItem);
invoice.total += newItem.quantity * newItem.unitPrice; // easy to forget`}</pre>
        </div>
        <span className="codeLabel">INVARIANT ENFORCED BY THE BOUNDARY</span>
        <div className="codeBlock">
          <pre>{`class Invoice {
  #lineItems = [];
  addLineItem(item) {
    this.#lineItems.push(item); // the only way in — recalculation is automatic
  }
  get total() {
    return this.#lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  }
}
invoice.addLineItem(newItem); // total is correct, structurally — no second step to forget`}</pre>
        </div>
        <p>
          The second design makes it impossible to add a line item without the total staying
          correct, because there is no other way to add one &mdash; the invariant is enforced by
          the boundary itself, not by every caller remembering a two-step ritual.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of an invariant enforced by convention, requiring every caller to remember two separate steps, versus an invariant enforced by a class boundary, where a single method call keeps the rule true automatically.">
          <rect className="boxWarn" x="20" y="20" width="170" height="60" rx="6" />
          <text x="105" y="38" className="boxText" style={{fontSize:"5px"}}>By convention</text>
          <text x="105" y="55" className="figHint" style={{fontSize:"4.5px"}}>push() + total += ...</text>
          <text x="105" y="68" className="figHint" style={{fontSize:"4.5px"}}>every caller must remember both</text>
          <rect className="boxAccent" x="230" y="20" width="170" height="60" rx="6" />
          <text x="315" y="38" className="boxText" style={{fontSize:"5px"}}>By boundary</text>
          <text x="315" y="55" className="figHint" style={{fontSize:"4.5px"}}>addLineItem() only</text>
          <text x="315" y="68" className="figHint" style={{fontSize:"4.5px"}}>total is always correct</text>
        </svg>
        <figcaption>Moving the invariant's enforcement into the class boundary removes the chance for any caller to forget it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Encapsulating data while leaving a "back door" &mdash; a public setter for the field an
          invariant depends on, or an escape hatch method that bypasses validation "just this
          once" &mdash; quietly reopens the exact hole encapsulation was meant to close. An
          invariant is only as strong as its narrowest bypass.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does making lineItems private and total a computed getter guarantee the invariant in a way that a public total field, kept "in sync" by convention, cannot?</p>
        </div>
      </section>
      <p className="takeaway">
        Encapsulation is about where you enforce a rule, not just where you hide a field &mdash; a
        boundary that makes an invariant impossible to violate is stronger than one that just
        asks callers nicely to maintain it themselves.
      </p>

    </div>
  );
}
