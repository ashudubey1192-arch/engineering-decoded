import "../css/Article.css";

export default function MeaningfulNamesNamingFunctionsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A function name is a promise about behavior. <code>getTotal()</code> promises to return
          a total and change nothing; <code>save()</code> promises to persist something.
          Breaking that promise &mdash; a getter with a side effect, a save that also emails &mdash; is one
          of the most common sources of confusing bugs.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Verb phrases for actions</b> &mdash; <code>calculateTax()</code>, <code>sendReminder()</code>, <code>markAsPaid()</code>: the verb tells you what happens when you call it.</li>
          <li><b>Consistent vocabulary</b> &mdash; pick one verb per concept across the codebase (always <code>fetch</code>, never a mix of <code>fetch</code>/<code>retrieve</code>/<code>get</code> for the same kind of operation) so readers can predict names instead of looking them up.</li>
          <li><b>Name matches side effects</b> &mdash; if a function mutates state, sends a network request, or writes to disk, the name should not read like a pure calculation.</li>
          <li><b>Boolean-returning functions read as questions</b> &mdash; <code>isOverdue()</code>, <code>hasDiscount()</code>, <code>canRefund()</code> make call sites read like plain sentences.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A bug report: invoices are occasionally emailed twice. The cause turns out to be a
          function name that hid a side effect:
        </p>
        <span className="codeLabel">MISLEADING NAME</span>
        <div className="codeBlock">
          <pre>{`function getInvoiceTotal(invoice) {
  const total = sumLineItems(invoice.lineItems);
  logInvoiceAccess(invoice.id); // side effect hidden in a "getter"
  return total;
}`}</pre>
        </div>
        <p>
          A second engineer, trusting the name, called <code>getInvoiceTotal()</code> inside a
          loop that displayed invoice previews &mdash; not realizing it was also writing an access
          log entry on every call, flooding the logs. Renaming forces the mismatch into the open:
        </p>
        <span className="codeLabel">HONEST NAME</span>
        <div className="codeBlock">
          <pre>{`function getInvoiceTotalAndLogAccess(invoice) {
  const total = sumLineItems(invoice.lineItems);
  logInvoiceAccess(invoice.id);
  return total;
}
// or, better: split into two functions with one job each`}</pre>
        </div>
        <p>
          The honest name is uglier &mdash; on purpose. Ugliness here is a signal that the function
          is doing two things and should probably be split, which is the real fix explored in
          the Functions section.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a function name making a promise to the caller: the name implies certain behavior, and the function body either keeps or breaks that promise.">
          <rect className="box" x="20" y="20" width="140" height="30" rx="5" /><text x="90" y="39" className="boxText" style={{fontSize:"5.5px"}}>Name: getInvoiceTotal</text>
          <rect className="boxAccent" x="240" y="20" width="160" height="30" rx="5" /><text x="320" y="34" className="boxText" style={{fontSize:"5px"}}>Promise: returns a number,</text><text x="320" y="43" className="boxText" style={{fontSize:"5px"}}>changes nothing</text>
          <line className="flow" x1="160" y1="35" x2="238" y2="35" />
          <rect className="boxWarn" x="130" y="70" width="160" height="30" rx="5" /><text x="210" y="84" className="boxText" style={{fontSize:"5px"}}>Reality: also writes a</text><text x="210" y="93" className="boxText" style={{fontSize:"5px"}}>log entry every call</text>
          <line className="flowMuted" x1="320" y1="50" x2="230" y2="70" />
        </svg>
        <figcaption>The name promises a pure read; the hidden log write breaks that promise, and callers who trust the name get surprised.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Mixing verb vocabulary across a codebase &mdash; some modules use <code>fetchX</code>, others
          <code>getX</code>, others <code>loadX</code>, for functionally identical operations &mdash; forces
          readers to memorize which module uses which word instead of building one reusable
          mental model. Pick a convention and enforce it, ideally with a linter.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did naming the log-writing side effect honestly (getInvoiceTotalAndLogAccess) count as progress, even though the function is still doing two jobs?</p>
        </div>
      </section>
      <p className="takeaway">
        A function's name is a contract with its callers &mdash; when the name and the behavior
        disagree, the bug is not really in the caller's misunderstanding, it is in the name.
      </p>

    </div>
  );
}
