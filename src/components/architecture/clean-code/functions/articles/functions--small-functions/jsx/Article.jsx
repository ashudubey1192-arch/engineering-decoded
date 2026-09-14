import "../css/Article.css";

export default function FunctionsSmallFunctionsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A function that fits on one screen is not automatically clean, but a function that
          does not fit on one screen is almost never clean. Size is not the goal &mdash; but it is a
          reliable symptom of whether a function is doing one thing or several.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Small is a consequence, not a rule</b> &mdash; a function shrinks naturally once it does exactly one job; chopping an unrelated function into arbitrary pieces just to hit a line count does not count.</li>
          <li><b>One reason to change</b> &mdash; if you can describe a function's job with "and," it likely has two reasons to change and should likely be two functions.</li>
          <li><b>Extract until it hurts to extract further</b> &mdash; a useful heuristic: keep pulling logic into named sub-functions until doing so would separate things that must stay together to make sense.</li>
          <li><b>Depth of nesting as a signal</b> &mdash; a function with three or four levels of nested conditionals is usually a function that has not been broken up yet.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          The <code>calc()</code> function from the course introduction, broken into functions
          that each do one job:
        </p>
        <span className="codeLabel">BEFORE: ONE FUNCTION, THREE JOBS</span>
        <div className="codeBlock">
          <pre>{`function calc(inv) {
  let t = 0;
  for (let i = 0; i < inv.li.length; i++) {
    if (inv.li[i].q > 0) t = t + inv.li[i].q * inv.li[i].p;
  }
  if (inv.c.reg == "EU" || inv.c.reg == "UK") t = t * 1.20;
  if (inv.disc) t = t - (t * inv.disc);
  return t;
}`}</pre>
        </div>
        <span className="codeLabel">AFTER: THREE FUNCTIONS, THREE JOBS</span>
        <div className="codeBlock">
          <pre>{`function sumLineItems(lineItems) {
  return lineItems
    .filter((item) => item.quantity > 0)
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
function applyTax(subtotal, taxRegion) {
  const taxableRegions = ["EU", "UK"];
  return taxableRegions.includes(taxRegion) ? subtotal * VAT_RATE : subtotal;
}
function applyDiscount(amount, discountRate) {
  return discountRate ? amount - amount * discountRate : amount;
}
function calculateInvoiceTotal(invoice) {
  const subtotal = sumLineItems(invoice.lineItems);
  const taxed = applyTax(subtotal, invoice.customer.taxRegion);
  return applyDiscount(taxed, invoice.discountRate);
}`}</pre>
        </div>
        <p>
          Each of the three helper functions can now be understood, tested, and reused on its
          own &mdash; and <code>calculateInvoiceTotal()</code> reads as a short summary of the whole
          process instead of an implementation of it.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of one large function containing three mixed responsibilities splitting into four small functions: three single-purpose helpers and one top level function that calls them in sequence.">
          <rect className="boxWarn" x="140" y="10" width="140" height="30" rx="5" /><text x="210" y="29" className="boxText" style={{fontSize:"5.5px"}}>calc() &mdash; 3 jobs in 1</text>
          <rect className="box" x="20" y="75" width="90" height="28" rx="4" /><text x="65" y="93" className="boxText" style={{fontSize:"5px"}}>sumLineItems</text>
          <rect className="box" x="130" y="75" width="90" height="28" rx="4" /><text x="175" y="93" className="boxText" style={{fontSize:"5px"}}>applyTax</text>
          <rect className="box" x="240" y="75" width="90" height="28" rx="4" /><text x="285" y="93" className="boxText" style={{fontSize:"5px"}}>applyDiscount</text>
          <rect className="boxAccent" x="350" y="75" width="60" height="28" rx="4" /><text x="380" y="88" className="boxText" style={{fontSize:"4.5px"}}>calculate</text><text x="380" y="97" className="boxText" style={{fontSize:"4.5px"}}>Total</text>
          <line className="flow" x1="180" y1="40" x2="65" y2="73" />
          <line className="flow" x1="200" y1="40" x2="175" y2="73" />
          <line className="flow" x1="220" y1="40" x2="285" y2="73" />
          <line className="flowMuted" x1="65" y1="103" x2="370" y2="103" />
          <line className="flowMuted" x1="175" y1="103" x2="370" y2="110" />
          <line className="flowMuted" x1="285" y1="103" x2="365" y2="103" />
        </svg>
        <figcaption>Splitting by responsibility, not by line count, produces functions that are individually understandable and a top-level function that reads like an outline.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Extracting functions purely to satisfy a line-count rule, without regard for whether
          the extracted piece makes sense on its own, produces the opposite of clarity: a maze
          of tiny functions each named vaguely (<code>doPart1()</code>, <code>doPart2()</code>)
          that the reader has to jump between to reconstruct what was one coherent idea.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is "does this function do exactly one job" a better test for whether to split it than "is this function under N lines"?</p>
        </div>
      </section>
      <p className="takeaway">
        Small functions are a byproduct of single-purpose functions, not a goal on their own &mdash;
        split by responsibility, and the size takes care of itself.
      </p>

    </div>
  );
}
