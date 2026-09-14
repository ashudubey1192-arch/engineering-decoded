import "../css/Article.css";

export default function RefactoringExtractMethodArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Extract Method is the most common refactoring: pulling a fragment of code out into its
          own well-named method. It turns "read this block and figure out what it does" into
          "read the name."
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>A comment is often a hint</b> &mdash; a comment explaining what a block of code does can frequently become the extracted method's name instead.</li>
          <li><b>Extract to one level of abstraction</b> &mdash; the new method should do one coherent thing, in the spirit of Single Level of Abstraction from the Functions section.</li>
          <li><b>Verify immediately</b> &mdash; extract, then run the tests right away; a good editor can perform the mechanical extraction as a single safe step.</li>
          <li><b>Often the first move that enables a bigger one</b> &mdash; isolating a fragment is frequently the step that makes a larger refactoring, like Replace Conditionals, possible.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's invoice-summary function, with its inline tax block pulled out:
        </p>
        <span className="codeLabel">INLINE, UNNAMED BLOCK</span>
        <div className="codeBlock">
          <pre>{`function printInvoiceSummary(invoice) {
  let output = "Invoice " + invoice.id + "\n";
  // calculate tax for this invoice's region
  let taxTotal = 0;
  for (const item of invoice.lineItems) {
    taxTotal += item.total * TAX_RATES[invoice.customer.region];
  }
  output += "Tax: " + taxTotal + "\n";
  output += "Total: " + (invoice.subtotal + taxTotal) + "\n";
  return output;
}`}</pre>
        </div>
        <span className="codeLabel">EXTRACTED INTO A NAMED METHOD</span>
        <div className="codeBlock">
          <pre>{`function printInvoiceSummary(invoice) {
  const taxTotal = calculateTax(invoice);
  return "Invoice " + invoice.id + "\n" +
    "Tax: " + taxTotal + "\n" +
    "Total: " + (invoice.subtotal + taxTotal) + "\n";
}
function calculateTax(invoice) {
  let taxTotal = 0;
  for (const item of invoice.lineItems) {
    taxTotal += item.total * TAX_RATES[invoice.customer.region];
  }
  return taxTotal;
}`}</pre>
        </div>
        <p>
          The comment above the loop disappeared &mdash; it wasn't needed anymore. The method name
          <code>calculateTax</code> says the same thing the comment used to say, and can't drift
          out of sync with the code the way a comment can.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a tax-calculation block embedded inline inside a larger printInvoiceSummary function, versus the same block extracted into its own named calculateTax function called from a shorter printInvoiceSummary.">
          <rect className="box" x="30" y="10" width="200" height="80" rx="4" /><text x="130" y="24" className="boxText" style={{fontSize:"4.2px"}}>printInvoiceSummary()</text>
          <rect className="boxWarn" x="45" y="35" width="170" height="40" rx="4" /><text x="130" y="52" className="boxText" style={{fontSize:"3.8px"}}>inline tax-calculation loop</text><text x="130" y="64" className="boxText" style={{fontSize:"3.8px"}}>(6 lines, unnamed)</text>
          <rect className="box" x="290" y="30" width="110" height="24" rx="4" /><text x="345" y="46" className="boxText" style={{fontSize:"4px"}}>printInvoiceSummary()</text>
          <rect className="boxAccent" x="290" y="65" width="110" height="24" rx="4" /><text x="345" y="81" className="boxText" style={{fontSize:"4px"}}>calculateTax()</text>
          <line className="flow" x1="345" y1="54" x2="345" y2="63" />
          <line className="flowMuted" x1="230" y1="50" x2="288" y2="42" />
        </svg>
        <figcaption>An unnamed inline block becomes a small, named method the caller simply calls.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Extracting a fragment that only makes sense together with five surrounding variables,
          forcing a five-parameter method just to preserve the extraction, is sometimes a sign
          the fragment isn't cohesive enough to stand alone yet &mdash; or that it belongs on a
          different object entirely.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the comment above the original tax-calculation loop become unnecessary once that loop was extracted into a function named calculateTax?</p>
        </div>
      </section>
      <p className="takeaway">
        When a comment explains what a block of code does, consider extracting that block into a
        method with the comment's explanation as its name &mdash; the name can't fall out of sync
        with the code the way a comment can.
      </p>

    </div>
  );
}
