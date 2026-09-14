import "../css/Article.css";

export default function CleanArchitecturePracticesCleanCodeCaseStudyArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          This course opened with a cryptic <code>calc()</code> function. Here it is again, taken
          through every stage this course covered &mdash; naming, functions, error handling, and
          testing &mdash; to see how the individual lessons compound.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The stages, in order</h2>
        <ul className="stepList">
          <li><b>Meaningful Names</b> &mdash; <code>calc(a, b)</code> becomes <code>calculateInvoiceTotal(lineItems, itemCount)</code>; the cryptic <code>x</code> accumulator disappears entirely.</li>
          <li><b>Functions</b> &mdash; the one sprawling function splits into <code>calculateSubtotal()</code>, <code>applyVolumeDiscount()</code>, and <code>applySalesTax()</code>, each doing one thing at one level of abstraction.</li>
          <li><b>Error Handling</b> &mdash; the silent fallback that let bad input quietly produce a wrong number is replaced with an explicit thrown error at the boundary, carrying identifying context.</li>
          <li><b>Testing</b> &mdash; one large, hard-to-name test becomes several focused, independent tests, one per behavior.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          The full before, and the full after, side by side:
        </p>
        <span className="codeLabel">BEFORE: THE ORIGINAL calc()</span>
        <div className="codeBlock">
          <pre>{`function calc(a, b) {
  let x = 0;
  for (let i = 0; i < a.length; i++) {
    x = x + a[i].q * a[i].p;
  }
  if (b > 3) { x = x - (x * 0.1); }
  x = x + (x * 0.0825);
  return x;
}
// what are a and b? what does x become along the way? what happens if a isn't an array?`}</pre>
        </div>
        <span className="codeLabel">AFTER: ALL FOUR STAGES APPLIED</span>
        <div className="codeBlock">
          <pre>{`function calculateInvoiceTotal(lineItems, itemCount) {
  if (!Array.isArray(lineItems)) {
    throw new InvalidInvoiceError("lineItems must be an array, got " + typeof lineItems);
  }
  const subtotal = calculateSubtotal(lineItems);
  const discounted = applyVolumeDiscount(subtotal, itemCount);
  return applySalesTax(discounted);
}
function calculateSubtotal(lineItems) {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
function applyVolumeDiscount(subtotal, itemCount) {
  return itemCount > 3 ? subtotal * 0.9 : subtotal;
}
function applySalesTax(amount) {
  return amount * 1.0825;
}`}</pre>
        </div>
        <span className="codeLabel">AND A FOCUSED TEST FOR EACH PIECE</span>
        <div className="codeBlock">
          <pre>{`test("sums quantity times unit price across line items", () => {
  expect(calculateSubtotal([aLineItem({ quantity: 2, unitPrice: 500 })])).toBe(1000);
});
test("applies a 10% discount for orders over 3 items", () => {
  expect(applyVolumeDiscount(1000, 4)).toBe(900);
});
test("does not discount orders of 3 items or fewer", () => {
  expect(applyVolumeDiscount(1000, 3)).toBe(1000);
});
test("throws when lineItems is not an array", () => {
  expect(() => calculateInvoiceTotal(null, 1)).toThrow(InvalidInvoiceError);
});`}</pre>
        </div>
        <p>
          Both versions compute the exact same result for valid input. The difference is entirely
          in how much a reader can trust and verify about the second version at a glance, and how
          loudly the second version fails when something is wrong.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 90" role="img" aria-label="Diagram of a four-stage pipeline: calc, then Meaningful Names, then Functions, then Error Handling, ending at calculateInvoiceTotal with three helper functions and a focused test suite.">
          <rect className="boxWarn" x="10" y="35" width="60" height="26" rx="4" /><text x="40" y="52" className="boxText" style={{fontSize:"4.2px"}}>calc()</text>
          <line className="flow" x1="70" y1="48" x2="90" y2="48" />
          <rect className="box" x="92" y="35" width="62" height="26" rx="4" /><text x="123" y="49" className="boxText" style={{fontSize:"3.4px"}}>Names</text>
          <line className="flow" x1="154" y1="48" x2="174" y2="48" />
          <rect className="box" x="176" y="35" width="62" height="26" rx="4" /><text x="207" y="49" className="boxText" style={{fontSize:"3.4px"}}>Functions</text>
          <line className="flow" x1="238" y1="48" x2="258" y2="48" />
          <rect className="box" x="260" y="35" width="62" height="26" rx="4" /><text x="291" y="49" className="boxText" style={{fontSize:"3.4px"}}>Errors</text>
          <line className="flow" x1="322" y1="48" x2="342" y2="48" />
          <rect className="boxAccent" x="344" y="28" width="70" height="38" rx="4" /><text x="379" y="45" className="boxText" style={{fontSize:"3.4px"}}>calculateInvoiceTotal()</text><text x="379" y="58" className="boxText" style={{fontSize:"3px"}}>+ 3 helpers, 4 tests</text>
        </svg>
        <figcaption>Four lessons from this course, applied to the same function, in sequence.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Applying all four stages in one enormous rewrite commit, instead of the small,
          separately verified steps described in Safe Refactoring Workflow, is a mistake even for
          a well-understood, well-motivated cleanup like this one. It should land as a sequence of
          small, green, reviewable steps rather than one large diff.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Which single stage of this cleanup made calc()'s silent wrong-answer-on-bad-input behavior impossible, and why did that matter more than the renaming did?</p>
        </div>
      </section>
      <p className="takeaway">
        Every principle in this course traces back to the same question: what does the next
        person reading this code need in order to understand it quickly and change it safely?
        calc() and calculateInvoiceTotal() compute the same result &mdash; the difference is
        entirely in how much trust a reader can place in the second version at a glance.
      </p>

    </div>
  );
}
