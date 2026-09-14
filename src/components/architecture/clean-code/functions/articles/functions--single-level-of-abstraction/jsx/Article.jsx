import "../css/Article.css";

export default function FunctionsSingleLevelOfAbstractionArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Within one function, every line should operate at roughly the same level of detail.
          Mixing "what this does, conceptually" with "how this specific step is implemented"
          in the same function forces the reader to constantly zoom in and out.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>High level vs. low level</b> &mdash; <code>calculateInvoiceTotal()</code> calling <code>sumLineItems()</code> is high-level; a raw <code>for</code> loop with array index math inside that same function is low-level.</li>
          <li><b>The "one level below" rule</b> &mdash; a function's body should only ever call things one conceptual level below its own name, never mix in raw implementation detail directly.</li>
          <li><b>Reads top-to-bottom like an outline</b> &mdash; a well-layered function reads like a table of contents; you can understand the high-level flow without reading any helper's internals.</li>
          <li><b>A smell, not a hard rule</b> &mdash; occasionally a single low-level line embedded in a high-level function is the clearest option; the goal is to notice when mixing levels is making the function harder to scan.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A function that sends overdue reminders, before and after separating levels:
        </p>
        <span className="codeLabel">MIXED LEVELS</span>
        <div className="codeBlock">
          <pre>{`function sendOverdueReminders(invoices) {
  for (const invoice of invoices) {
    const daysPastDue = Math.floor((Date.now() - invoice.dueAt) / 86400000);
    if (daysPastDue > 0 && !invoice.reminderSent) {
      const subject = "Invoice #" + invoice.id + " is " + daysPastDue + " days overdue";
      const body = "Dear " + invoice.customer.name + ",\n\n" + "Please settle...";
      emailClient.send(invoice.customer.email, subject, body);
      invoice.reminderSent = true;
    }
  }
}`}</pre>
        </div>
        <span className="codeLabel">SINGLE LEVEL AT EACH FUNCTION</span>
        <div className="codeBlock">
          <pre>{`function sendOverdueReminders(invoices) {
  for (const invoice of invoices) {
    if (needsReminder(invoice)) sendReminderFor(invoice);
  }
}
function needsReminder(invoice) {
  return isOverdue(invoice) && !invoice.reminderSent;
}
function sendReminderFor(invoice) {
  const message = buildReminderMessage(invoice);
  emailClient.send(invoice.customer.email, message.subject, message.body);
  invoice.reminderSent = true;
}`}</pre>
        </div>
        <p>
          <code>sendOverdueReminders()</code> now reads purely as policy: for each invoice, if
          it needs a reminder, send one. The date-math and message-formatting details moved
          down to where they belong, one level below.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a function reading top to bottom as three levels: a high level policy statement at the top, calling mid level helpers, which call low level implementation details, versus a mixed function that jumps between all three levels on every line.">
          <rect className="boxAccent" x="30" y="10" width="360" height="20" rx="4" /><text x="210" y="24" className="boxText" style={{fontSize:"5px"}}>High level: "if needs reminder, send it"</text>
          <rect className="box" x="30" y="42" width="360" height="20" rx="4" /><text x="210" y="56" className="boxText" style={{fontSize:"5px"}}>Mid level: needsReminder(), sendReminderFor()</text>
          <rect className="box" x="30" y="74" width="360" height="20" rx="4" /><text x="210" y="88" className="boxText" style={{fontSize:"5px"}}>Low level: date math, string building</text>
          <line className="flow" x1="210" y1="30" x2="210" y2="40" />
          <line className="flow" x1="210" y1="62" x2="210" y2="72" />
        </svg>
        <figcaption>Each level calls the one below it; no line jumps from policy straight to raw implementation detail.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Over-applying this principle by extracting a level for every single line, even
          trivial ones, produces the same maze-of-indirection problem as over-splitting small
          functions. A one-line arithmetic expression does not always need its own named
          function &mdash; the goal is consistent altitude, not maximum indirection.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does mixing high-level policy and low-level implementation detail in the same function make it harder to scan, even if every individual line is easy to read?</p>
        </div>
      </section>
      <p className="takeaway">
        A function should read like one level of a table of contents &mdash; if a line forces the
        reader to suddenly think about raw date math in the middle of business policy, that
        line belongs one level down.
      </p>

    </div>
  );
}
