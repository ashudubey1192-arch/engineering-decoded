import "../css/Article.css";

export default function MeaningfulNamesAvoidingDisinformationArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A misleading name is worse than a vague one. A vague name forces the reader to look
          closer; a misleading name actively tells them something false, and they often believe
          it without checking.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Type-implying names on the wrong type</b> &mdash; a variable named <code>invoiceList</code> that is actually a <code>Set</code> or a <code>Map</code> misleads anyone who assumes list semantics (ordering, duplicates allowed).</li>
          <li><b>Near-identical names for different things</b> &mdash; <code>customerData</code> and <code>customerDTO</code> existing side by side, meaning different things, invites mix-ups that a compiler will not catch.</li>
          <li><b>Names that no longer match reality</b> &mdash; a function called <code>validateInvoice()</code> that used to only validate, but now also mutates the invoice, is disinformation left behind by an incomplete refactor.</li>
          <li><b>Noise words that imply distinction without creating any</b> &mdash; <code>invoiceData</code> vs. <code>invoiceInfo</code> vs. <code>invoiceObject</code> all sound different but carry no distinguishing meaning.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly stored a customer's overdue invoices in a variable named
          <code>overdueInvoiceList</code>. A later change switched its type to a <code>Set</code>
          to deduplicate entries &mdash; but nobody renamed the variable:
        </p>
        <span className="codeLabel">DISINFORMATION</span>
        <div className="codeBlock">
          <pre>{`const overdueInvoiceList = new Set(invoices.filter(isOverdue));
// a later engineer, trusting the name, writes:
const mostRecent = overdueInvoiceList[overdueInvoiceList.length - 1];
// TypeError: Sets have no length or index access`}</pre>
        </div>
        <p>
          The bug is not really about <code>Set</code> vs. array semantics &mdash; it is that the
          variable's name actively asserted a type it no longer had. Renaming when the type
          changes closes exactly this gap:
        </p>
        <span className="codeLabel">HONEST</span>
        <div className="codeBlock">
          <pre>{`const uniqueOverdueInvoices = new Set(invoices.filter(isOverdue));`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a variable's name asserting list semantics while its actual type is a set, creating a mismatch that misleads a second developer into writing code that fails.">
          <rect className="box" x="20" y="15" width="150" height="28" rx="5" /><text x="95" y="33" className="boxText" style={{fontSize:"5px"}}>Name: overdueInvoiceList</text>
          <rect className="boxWarn" x="220" y="15" width="150" height="28" rx="5" /><text x="295" y="33" className="boxText" style={{fontSize:"5px"}}>Actual type: Set</text>
          <text x="200" y="30" className="figHint" style={{fontSize:"9px"}}>&#8800;</text>
          <rect className="boxWarn" x="120" y="65" width="180" height="26" rx="5" /><text x="210" y="82" className="boxText" style={{fontSize:"5px"}}>Second dev assumes list, breaks</text>
          <line className="flowMuted" x1="95" y1="43" x2="180" y2="65" />
          <line className="flowMuted" x1="295" y1="43" x2="250" y2="65" />
        </svg>
        <figcaption>The name and the type disagree; a reader who trusts the name inherits the mismatch as a runtime error.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Leaving a name unchanged "to minimize the diff" during a refactor is a common
          rationalization that trades a one-line rename now for a confusing bug later. If a
          variable's type, contents, or meaning changes, its name should change with it, even
          if that touches more lines than the core fix.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a misleading name considered more dangerous than a vague one like "data" or "temp"?</p>
        </div>
      </section>
      <p className="takeaway">
        A name that asserts something false &mdash; a wrong type, an outdated behavior, a
        near-duplicate of another name &mdash; actively misleads readers who have no reason to
        doubt it. When a variable's nature changes, its name must change too.
      </p>

    </div>
  );
}
