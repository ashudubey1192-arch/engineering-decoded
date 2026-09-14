import "../css/Article.css";

export default function ClassesAndModulesSingleResponsibilityArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          The Single Responsibility Principle is often summarized as "a class should do one
          thing," which is close but not quite it. Its sharper form: a class should have only
          one reason to change &mdash; one stakeholder whose requests land on it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>One reason to change, tied to one actor</b> &mdash; SRP is about who asks for changes, not a literal count of methods.</li>
          <li><b>Symptom: two unrelated stakeholders touch the same class</b> &mdash; if finance's tax-rule changes and design's redesign requests both require editing the same class, it has two reasons to change.</li>
          <li><b>Not the same as "one method"</b> &mdash; a class can have several methods and still have a single responsibility, as long as they all serve the same reason to change.</li>
          <li><b>A different lens than cohesion</b> &mdash; SRP looks outward at stakeholders; High Cohesion, next, looks inward at how fields and methods relate to each other. They usually agree, but not always.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>Invoice</code> class mixed accounting logic with presentation logic:
        </p>
        <span className="codeLabel">TWO REASONS TO CHANGE, ONE CLASS</span>
        <div className="codeBlock">
          <pre>{`class Invoice {
  calculateTotal() {
    const subtotal = this.lineItems.reduce((sum, item) => sum + item.total, 0);
    return subtotal + this.taxCalculator.apply(subtotal, this.customer.region);
  }
  toHtml() {
    const rows = this.lineItems.map((item) => "<tr><td>" + item.description + "</td></tr>").join("");
    return "<table>" + rows + "</table>";
  }
}
// finance asks for a new tax bracket; design asks for a table redesign &mdash;
// both changes land in this same class`}</pre>
        </div>
        <span className="codeLabel">ONE REASON TO CHANGE, PER CLASS</span>
        <div className="codeBlock">
          <pre>{`class Invoice {
  calculateTotal() {
    const subtotal = this.lineItems.reduce((sum, item) => sum + item.total, 0);
    return subtotal + this.taxCalculator.apply(subtotal, this.customer.region);
  }
}
class InvoiceHtmlView {
  render(invoice) {
    const rows = invoice.lineItems.map((item) => "<tr><td>" + item.description + "</td></tr>").join("");
    return "<table>" + rows + "</table>";
  }
}
// finance's tax-bracket change now touches only Invoice;
// design's table redesign now touches only InvoiceHtmlView`}</pre>
        </div>
        <p>
          Nothing about the logic changed &mdash; only where each piece lives. Each class now
          answers to exactly one part of the business.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of two unrelated stakeholders, finance and design, both directing change requests at the same Invoice class, versus each stakeholder directing requests at its own separate class.">
          <rect className="box" x="20" y="10" width="90" height="22" rx="4" /><text x="65" y="25" className="boxText" style={{fontSize:"4.5px"}}>Finance</text>
          <rect className="box" x="20" y="45" width="90" height="22" rx="4" /><text x="65" y="60" className="boxText" style={{fontSize:"4.5px"}}>Design</text>
          <rect className="boxWarn" x="230" y="27" width="140" height="26" rx="4" /><text x="300" y="44" className="boxText" style={{fontSize:"4.5px"}}>Invoice (2 reasons)</text>
          <line className="flowMuted" x1="110" y1="21" x2="228" y2="36" />
          <line className="flowMuted" x1="110" y1="56" x2="228" y2="42" />
          <rect className="box" x="20" y="80" width="90" height="22" rx="4" /><text x="65" y="95" className="boxText" style={{fontSize:"4.5px"}}>Finance</text>
          <rect className="boxAccent" x="230" y="70" width="140" height="22" rx="4" /><text x="300" y="85" className="boxText" style={{fontSize:"4.2px"}}>Invoice</text>
          <line className="flow" x1="110" y1="91" x2="228" y2="81" />
        </svg>
        <figcaption>Two stakeholders converging on one class versus each stakeholder owning its own.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating SRP as a literal instruction to give every class exactly one method collapses
          genuinely cohesive behavior into needless fragments. A class can have several methods
          and still have a single responsibility, as long as every method serves the same actor
          and the same reason to change.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why do finance's tax-bracket changes and design's redesign requests both landing on the same Invoice class indicate it has more than one responsibility?</p>
        </div>
      </section>
      <p className="takeaway">
        Ask who would request a change, not how many methods a class has &mdash; a class with a
        single responsibility answers to exactly one stakeholder, no matter how many methods it
        takes to do it.
      </p>

    </div>
  );
}
