import "../css/Article.css";

export default function ClassesAndModulesSmallClassesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Class size is not about line count. A 40-line class that handles PDF rendering, email
          delivery, database writes, and tax math is not small just because it fits on one
          screen &mdash; it has four separate reasons to change, wearing one name.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Count responsibilities, not lines</b> &mdash; measure a class by how many distinct jobs it does, not by how many characters it takes to do them.</li>
          <li><b>A vague or compound name is a warning</b> &mdash; a class named <code>InvoiceManager</code> or <code>DataProcessor</code> is often hiding several unrelated responsibilities behind one non-committal name.</li>
          <li><b>Small classes are easier to name precisely</b> &mdash; once a class does one job, a specific, accurate name usually falls out naturally.</li>
          <li><b>Splitting only pays off along real boundaries</b> &mdash; see Common mistakes for what happens when a split ignores where the actual responsibilities lie.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's original <code>InvoiceManager</code> did four unrelated jobs in one class:
        </p>
        <span className="codeLabel">ONE CLASS, FOUR RESPONSIBILITIES</span>
        <div className="codeBlock">
          <pre>{`class InvoiceManager {
  renderToPdf(invoice) {
    const doc = new PdfDocument();
    doc.addHeader(invoice.customer.name);
    invoice.lineItems.forEach((item) => doc.addLine(item.description, item.total));
    return doc.render();
  }
  sendEmail(invoice, address) {
    return smtpClient.send(address, "Your invoice", this.renderToPdf(invoice));
  }
  save(invoice) {
    return db.query("INSERT INTO invoices ...", invoice.toRow());
  }
  calculateTax(invoice) {
    return invoice.subtotal * TAX_BRACKETS[invoice.customer.region];
  }
}
// a tax-law change, an SMTP provider switch, and a PDF layout redesign
// all require editing this same class`}</pre>
        </div>
        <span className="codeLabel">FOUR SMALL CLASSES, ONE JOB EACH</span>
        <div className="codeBlock">
          <pre>{`class InvoiceRenderer {
  renderToPdf(invoice) { /* only PDF layout */ }
}
class InvoiceMailer {
  send(invoice, address, pdf) { return smtpClient.send(address, "Your invoice", pdf); }
}
class InvoiceRepository {
  save(invoice) { return db.query("INSERT INTO invoices ...", invoice.toRow()); }
}
class TaxCalculator {
  calculate(invoice) { return invoice.subtotal * TAX_BRACKETS[invoice.customer.region]; }
}
// a tax-law change now touches only TaxCalculator &mdash;
// the other three classes stay untouched, and don't even need retesting`}</pre>
        </div>
        <p>
          None of the four new classes is longer than the single method it replaced. What
          changed is not the total amount of code, but how much of it moves when one thing
          changes.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of one class holding four unrelated responsibilities, all affected by any single change, versus four small classes each holding one responsibility, where a change to one leaves the other three untouched.">
          <rect className="boxWarn" x="140" y="10" width="140" height="30" rx="4" /><text x="210" y="24" className="boxText" style={{fontSize:"4.5px"}}>InvoiceManager</text><text x="210" y="34" className="boxText" style={{fontSize:"3.8px"}}>render + mail + save + tax</text>
          <text x="210" y="55" className="figHint" style={{fontSize:"4.5px"}}>any one change risks all four jobs</text>
          <rect className="boxAccent" x="20" y="80" width="90" height="26" rx="4" /><text x="65" y="97" className="boxText" style={{fontSize:"4.2px"}}>InvoiceRenderer</text>
          <rect className="boxAccent" x="120" y="80" width="90" height="26" rx="4" /><text x="165" y="97" className="boxText" style={{fontSize:"4.2px"}}>InvoiceMailer</text>
          <rect className="boxAccent" x="220" y="80" width="90" height="26" rx="4" /><text x="265" y="97" className="boxText" style={{fontSize:"4.2px"}}>InvoiceRepository</text>
          <rect className="boxAccent" x="320" y="80" width="90" height="26" rx="4" /><text x="365" y="97" className="boxText" style={{fontSize:"4.2px"}}>TaxCalculator</text>
        </svg>
        <figcaption>One class with four reasons to change versus four small classes, each with exactly one.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Splitting a class along an arbitrary line &mdash; alphabetically by method name, or into
          "part one" and "part two" by line count &mdash; produces two classes that still change
          together for the same reasons the original one did. A split only pays off when it
          separates genuinely independent responsibilities.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did splitting InvoiceManager by responsibility mean a tax-law change no longer required retesting the email and PDF code?</p>
        </div>
      </section>
      <p className="takeaway">
        Judge a class by how many reasons it has to change, not by its line count &mdash; a small
        class with one clear job is easier to name, test, and change safely than a compact class
        secretly juggling four.
      </p>

    </div>
  );
}
