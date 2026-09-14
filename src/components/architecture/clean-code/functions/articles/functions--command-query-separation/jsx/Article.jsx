import "../css/Article.css";

export default function FunctionsCommandQuerySeparationArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A function should either answer a question or perform an action &mdash; not both. Command
          Query Separation, a principle from Bertrand Meyer, keeps "asking" and "doing" from
          getting tangled together in ways that make code unpredictable to read.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Queries return, commands act</b> &mdash; a query (<code>isOverdue()</code>) returns information and changes nothing; a command (<code>markAsPaid()</code>) changes state and typically returns nothing meaningful.</li>
          <li><b>Mixing the two hides side effects</b> &mdash; a function that both returns a value and mutates state forces every caller to know its internals just to predict what calling it will do.</li>
          <li><b>Enables safe reordering</b> &mdash; if queries are guaranteed side-effect-free, a reader (and sometimes a compiler) can reorder or repeat calls to them without changing behavior.</li>
          <li><b>Not a universal law</b> &mdash; some well-known patterns violate it deliberately and safely (a stack's <code>pop()</code> both removes and returns); the principle is a strong default, not an absolute rule.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>applyDiscountIfEligible()</code> both checked eligibility and
          silently applied the discount as a side effect &mdash; a query name hiding a command:
        </p>
        <span className="codeLabel">MIXED COMMAND AND QUERY</span>
        <div className="codeBlock">
          <pre>{`function applyDiscountIfEligible(invoice) {
  const eligible = invoice.customer.loyaltyYears >= 2;
  if (eligible) invoice.discountRate = 0.1; // side effect inside a check
  return eligible;
}
// call site — looks like a harmless check:
if (applyDiscountIfEligible(invoice)) {
  showBadge("Loyalty discount applied!");
}`}</pre>
        </div>
        <span className="codeLabel">SEPARATED</span>
        <div className="codeBlock">
          <pre>{`function isEligibleForLoyaltyDiscount(invoice) {
  return invoice.customer.loyaltyYears >= 2; // query: no side effects
}
function applyLoyaltyDiscount(invoice) {
  invoice.discountRate = 0.1; // command: no return value to inspect
}
// call site — the side effect is now visible in the caller's own code
if (isEligibleForLoyaltyDiscount(invoice)) {
  applyLoyaltyDiscount(invoice);
  showBadge("Loyalty discount applied!");
}`}</pre>
        </div>
        <p>
          A reviewer reading only the call site of the mixed version would not know a discount
          was being applied inside what reads like a simple boolean check. The separated
          version makes the mutation visible exactly where it happens.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of one function that both answers a question and performs an action, versus two functions, a pure query and a pure command, called explicitly in sequence at the call site.">
          <rect className="boxWarn" x="140" y="10" width="140" height="30" rx="5" /><text x="210" y="24" className="boxText" style={{fontSize:"5px"}}>applyDiscountIfEligible</text><text x="210" y="34" className="boxText" style={{fontSize:"4.5px"}}>returns AND mutates</text>
          <rect className="box" x="30" y="70" width="150" height="28" rx="4" /><text x="105" y="84" className="boxText" style={{fontSize:"4.5px"}}>isEligibleForLoyaltyDiscount</text><text x="105" y="93" className="boxText" style={{fontSize:"4.5px"}}>(query, returns only)</text>
          <rect className="box" x="220" y="70" width="150" height="28" rx="4" /><text x="295" y="84" className="boxText" style={{fontSize:"4.5px"}}>applyLoyaltyDiscount</text><text x="295" y="93" className="boxText" style={{fontSize:"4.5px"}}>(command, mutates only)</text>
          <line className="flow" x1="180" y1="40" x2="105" y2="68" />
          <line className="flow" x1="240" y1="40" x2="295" y2="68" />
        </svg>
        <figcaption>Splitting a mixed function into a pure query and a pure command makes the side effect visible at the call site instead of hidden inside a check.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating this as an absolute law leads to awkward code in the handful of cases where
          a combined command-query genuinely reads better, such as a queue's
          <code>dequeue()</code>. The principle is about avoiding <i>surprise</i> side effects
          inside innocent-looking checks &mdash; not banning every function that both acts and returns.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why was it risky for applyDiscountIfEligible to look like a simple boolean check while silently mutating the invoice?</p>
        </div>
      </section>
      <p className="takeaway">
        When a function's name promises an answer, calling it should never quietly change
        anything &mdash; keep questions and actions in separate functions so a reader never has to
        guess which one they are calling.
      </p>

    </div>
  );
}
