import "../css/Article.css";

export default function MeaningfulNamesNamingClassesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A class name should be a noun or noun phrase that describes what the object <i>is</i>,
          not what it does in general terms. Vague, catch-all class names are usually the
          first visible sign of a class that has taken on too many responsibilities.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Noun phrases, not verb phrases</b> &mdash; <code>Invoice</code>, <code>TaxCalculator</code>, <code>PaymentGateway</code>: what the thing is, not an action.</li>
          <li><b>Be wary of "Manager", "Processor", "Handler", "Data"</b> &mdash; these suffixes are sometimes unavoidable, but they often signal a class with no clear single responsibility &mdash; a bucket for whatever didn't fit elsewhere.</li>
          <li><b>Specific beats generic</b> &mdash; <code>InvoicePdfRenderer</code> tells you more than <code>InvoiceHelper</code>, and makes it obvious when unrelated logic has been added to the wrong place.</li>
          <li><b>The name should shrink as responsibility shrinks</b> &mdash; if you cannot name a class without using "and," it is very likely doing two things and should probably be two classes.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>InvoiceManager</code> grew, over several months, into a class that
          created invoices, calculated tax, sent reminder emails, and generated PDF exports.
          Its name never had to change to accommodate any of that growth &mdash; which was exactly
          the problem: "Manager" tolerates anything.
        </p>
        <span className="codeLabel">ONE VAGUE NAME, FOUR RESPONSIBILITIES</span>
        <div className="codeBlock">
          <pre>{`class InvoiceManager {
  createInvoice(customer, items) { /* ... */ }
  calculateTax(invoice) { /* ... */ }
  sendReminderEmail(invoice) { /* ... */ }
  renderPdf(invoice) { /* ... */ }
}`}</pre>
        </div>
        <span className="codeLabel">FOUR NAMES, FOUR RESPONSIBILITIES</span>
        <div className="codeBlock">
          <pre>{`class InvoiceFactory { createInvoice(customer, items) { /* ... */ } }
class TaxCalculator { calculate(invoice) { /* ... */ } }
class ReminderScheduler { sendReminderEmail(invoice) { /* ... */ } }
class InvoicePdfRenderer { render(invoice) { /* ... */ } }`}</pre>
        </div>
        <p>
          None of the underlying logic changed. But now each class's name accurately predicts
          everything it can do &mdash; and, just as importantly, everything it cannot.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of one vague class named InvoiceManager splitting into four specifically named classes, each with one clear responsibility.">
          <rect className="boxWarn" x="150" y="10" width="120" height="28" rx="5" /><text x="210" y="28" className="boxText" style={{fontSize:"5.5px"}}>InvoiceManager</text>
          <rect className="box" x="10" y="75" width="90" height="28" rx="4" /><text x="55" y="93" className="boxText" style={{fontSize:"5px"}}>InvoiceFactory</text>
          <rect className="box" x="115" y="75" width="90" height="28" rx="4" /><text x="160" y="93" className="boxText" style={{fontSize:"5px"}}>TaxCalculator</text>
          <rect className="box" x="220" y="75" width="95" height="28" rx="4" /><text x="267" y="93" className="boxText" style={{fontSize:"5px"}}>ReminderScheduler</text>
          <rect className="box" x="330" y="75" width="90" height="28" rx="4" /><text x="375" y="93" className="boxText" style={{fontSize:"5px"}}>InvoicePdfRenderer</text>
          <line className="flow" x1="180" y1="38" x2="60" y2="73" />
          <line className="flow" x1="200" y1="38" x2="160" y2="73" />
          <line className="flow" x1="220" y1="38" x2="267" y2="73" />
          <line className="flow" x1="240" y1="38" x2="375" y2="73" />
        </svg>
        <figcaption>A name that tolerates any responsibility is a warning sign; four specific names make the class boundaries self-documenting.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Renaming a bloated class without splitting it &mdash; changing <code>InvoiceManager</code> to
          <code>InvoiceService</code>, say &mdash; treats the symptom, not the cause. If a class still
          does four unrelated things, no name will make that honest; the fix is splitting the
          class, which the naming exercise is often what reveals the need for.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is difficulty naming a class precisely, without using "and" or a vague word like "Manager," often a useful diagnostic signal?</p>
        </div>
      </section>
      <p className="takeaway">
        A class name that stays accurate no matter what gets added to the class is a warning
        sign, not a convenience &mdash; precise names keep classes honest about what they do.
      </p>

    </div>
  );
}
