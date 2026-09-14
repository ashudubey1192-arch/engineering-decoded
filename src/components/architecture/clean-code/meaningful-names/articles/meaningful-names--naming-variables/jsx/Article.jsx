import "../css/Article.css";

export default function MeaningfulNamesNamingVariablesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A variable name is the smallest possible comment &mdash; and unlike a comment, it cannot go
          stale without the code failing to compile. Choosing it well is the cheapest
          readability investment you can make.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Intention-revealing</b> &mdash; the name should answer why the variable exists, what it holds, and how it is used, without needing a comment.</li>
          <li><b>No mental mapping</b> &mdash; a reader should never have to privately translate <code>d</code> into "elapsed days" every time they see it; that translation should live in the name itself.</li>
          <li><b>Avoid encodings</b> &mdash; prefixes like Hungarian notation (<code>strName</code>, <code>iCount</code>) add noise that modern type systems and editors make unnecessary.</li>
          <li><b>Scope-proportional length</b> &mdash; a loop counter used for two lines can be <code>i</code>; a value referenced across a 40-line function needs a real name.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's original overdue-invoice filter, before and after naming cleanup:
        </p>
        <span className="codeLabel">BEFORE</span>
        <div className="codeBlock">
          <pre>{`function f(l) {
  const r = [];
  for (const x of l) {
    const d = (Date.now() - x.d) / 86400000;
    if (d > 30) r.push(x);
  }
  return r;
}`}</pre>
        </div>
        <span className="codeLabel">AFTER</span>
        <div className="codeBlock">
          <pre>{`function findInvoicesOverdueByMoreThan30Days(invoices) {
  const severelyOverdueInvoices = [];
  for (const invoice of invoices) {
    const daysSinceDue = (Date.now() - invoice.dueAt) / MILLISECONDS_PER_DAY;
    if (daysSinceDue > 30) severelyOverdueInvoices.push(invoice);
  }
  return severelyOverdueInvoices;
}`}</pre>
        </div>
        <p>
          Nothing about the logic changed. But <code>86400000</code> becoming
          <code>MILLISECONDS_PER_DAY</code> alone turns a number a reader would have to look up
          into one they can trust at a glance &mdash; and the function name now makes the "30 days"
          threshold discoverable without reading the body at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a reader encountering a poorly named variable, having to mentally map it to its real meaning, versus encountering a well named variable, which requires no translation step.">
          <rect className="box" x="15" y="20" width="90" height="26" rx="4" /><text x="60" y="37" className="boxText" style={{fontSize:"5px"}}>Reads "d"</text>
          <rect className="boxWarn" x="150" y="20" width="140" height="26" rx="4" /><text x="220" y="37" className="boxText" style={{fontSize:"5px"}}>Mentally maps to "days since due"</text>
          <rect className="box" x="330" y="20" width="75" height="26" rx="4" /><text x="367" y="37" className="boxText" style={{fontSize:"5px"}}>Understands</text>
          <line className="flow" x1="105" y1="33" x2="148" y2="33" />
          <line className="flow" x1="290" y1="33" x2="328" y2="33" />
          <rect className="box" x="15" y="65" width="90" height="26" rx="4" /><text x="60" y="82" className="boxText" style={{fontSize:"5px"}}>Reads "daysSinceDue"</text>
          <rect className="boxAccent" x="330" y="65" width="75" height="26" rx="4" /><text x="367" y="82" className="boxText" style={{fontSize:"5px"}}>Understands</text>
          <line className="flow" x1="105" y1="78" x2="328" y2="78" />
        </svg>
        <figcaption>A good name skips the reader's translation step entirely instead of just shortening it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Over-correcting into extremely long, redundant names (<code>theListOfAllInvoiceObjectsThatAreOverdue</code>)
          is as much a readability tax as an overly short one &mdash; it slows down scanning without
          adding real information beyond what <code>overdueInvoices</code> already conveys. The
          goal is precision, not length.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does turning the magic number 86400000 into MILLISECONDS_PER_DAY help even a reader who already knows how many milliseconds are in a day?</p>
        </div>
      </section>
      <p className="takeaway">
        A variable name should do the reader's translation work for them &mdash; if you find
        yourself explaining what a variable "really means" in a comment or in review, that
        explanation belongs in the name itself.
      </p>

    </div>
  );
}
