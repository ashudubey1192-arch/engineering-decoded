import "../css/Article.css";

export default function CommentsAndFormattingVerticalFormattingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Vertical formatting is about the order and grouping of code from top to bottom in a
          file: how far apart related things sit, and whether the file reads like a newspaper
          &mdash; general context first, increasing detail as you scroll down.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>The newspaper metaphor</b> &mdash; a well-organized file leads with a high-level summary (like a headline) and gets into supporting detail further down, the way a news article does.</li>
          <li><b>Vertical distance signals relatedness</b> &mdash; closely related lines of code should sit close together; unrelated concepts should have a visible gap (a blank line) between them.</li>
          <li><b>Variable declarations near their use</b> &mdash; a variable declared at the top of a 100-line function and used only near line 90 forces the reader to keep scrolling back up.</li>
          <li><b>Caller above callee</b> &mdash; where practical, define a function above the helper functions it calls, so a top-to-bottom read encounters the big picture before the details.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Two ways to order the same three functions in a file &mdash; one buries the entry point,
          one leads with it:
        </p>
        <span className="codeLabel">DETAILS FIRST, ENTRY POINT BURIED</span>
        <div className="codeBlock">
          <pre>{`function formatCurrency(cents, currency) { /* ... */ }
function roundToTwoDecimals(amount) { /* ... */ }
function calculateLineTotal(item) { /* ... */ }
// the function a reader actually opened this file to find, last:
function generateInvoiceSummary(invoice) {
  return invoice.lineItems.map(calculateLineTotal)...
}`}</pre>
        </div>
        <span className="codeLabel">NEWSPAPER ORDER</span>
        <div className="codeBlock">
          <pre>{`// the headline — what this file is for, first:
function generateInvoiceSummary(invoice) {
  return invoice.lineItems.map(calculateLineTotal)...
}
// supporting detail, in the order it's used:
function calculateLineTotal(item) { /* ... */ }
function roundToTwoDecimals(amount) { /* ... */ }
function formatCurrency(cents, currency) { /* ... */ }`}</pre>
        </div>
        <p>
          A new engineer opening this file to understand invoice summaries now sees the answer
          in the first few lines, with supporting detail available immediately below if they
          need to go deeper &mdash; instead of scrolling past three unrelated-looking helpers first.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a file read top to bottom like a newspaper: a headline level summary function at the top, followed by supporting detail functions in decreasing order of abstraction below it.">
          <rect className="boxAccent" x="120" y="10" width="180" height="24" rx="4" /><text x="210" y="26" className="boxText" style={{fontSize:"5px"}}>generateInvoiceSummary (headline)</text>
          <rect className="box" x="120" y="45" width="180" height="20" rx="4" /><text x="210" y="58" className="boxText" style={{fontSize:"4.5px"}}>calculateLineTotal</text>
          <rect className="box" x="120" y="72" width="180" height="20" rx="4" /><text x="210" y="85" className="boxText" style={{fontSize:"4.5px"}}>roundToTwoDecimals</text>
          <rect className="box" x="120" y="99" width="180" height="20" rx="4" /><text x="210" y="112" className="boxText" style={{fontSize:"4.5px"}}>formatCurrency</text>
          <text x="330" y="30" className="figLabel" style={{fontSize:"5px"}}>read first</text>
          <text x="330" y="110" className="figLabel" style={{fontSize:"5px"}}>read if needed</text>
        </svg>
        <figcaption>Ordering a file like a newspaper puts the summary a reader is looking for at the top, with supporting detail available below.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Alphabetizing functions within a file is a common but counterproductive convention
          &mdash; it optimizes for finding a function by name (which an editor's search already
          does instantly) at the cost of destroying any narrative order that would help a
          reader unfamiliar with the file.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does placing the entry-point function first help a reader more than alphabetical ordering, even though both are consistent, predictable orderings?</p>
        </div>
      </section>
      <p className="takeaway">
        Order a file so the reader encounters the big picture before the details, and keep
        related lines physically close together &mdash; vertical position is itself a signal about
        what belongs with what.
      </p>

    </div>
  );
}
