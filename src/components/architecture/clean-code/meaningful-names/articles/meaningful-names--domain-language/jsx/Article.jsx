import "../css/Article.css";

export default function MeaningfulNamesDomainLanguageArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Code should speak the language of the business it serves, not the language of its
          own implementation details. When an accountant says "ledger entry" and the code says
          <code>recordRow</code>, every conversation between them requires translation &mdash; and
          translation is where misunderstandings hide.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Ubiquitous language</b> &mdash; a term from Domain-Driven Design: the same words used by domain experts, product managers, and code, with no separate "engineering dialect."</li>
          <li><b>Business concepts, not storage details</b> &mdash; <code>Invoice</code> and <code>LineItem</code>, not <code>InvoiceRow</code> and <code>InvoiceRowChild</code>, which describe a database table shape rather than a business idea.</li>
          <li><b>Consistency across the whole system</b> &mdash; if the product calls something a "credit note," the code, the API, and the database column should all use that exact term, not a mix of "credit note," "refund record," and "adjustment."</li>
          <li><b>Precision reduces cross-team bugs</b> &mdash; when engineering and product use identical vocabulary, requirements translate into code with fewer misunderstandings.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's finance team used the term "credit note" for a document that reduces what
          a customer owes. The original code called the same concept an <code>adjustment</code>,
          a name it picked up from an unrelated internal accounting spreadsheet:
        </p>
        <span className="codeLabel">ENGINEERING DIALECT</span>
        <div className="codeBlock">
          <pre>{`class Adjustment {
  applyTo(invoice) { invoice.balance -= this.amount; }
}
// support ticket: "customer wants a credit note issued"
// engineer searches codebase for "credit note" — finds nothing`}</pre>
        </div>
        <span className="codeLabel">DOMAIN LANGUAGE</span>
        <div className="codeBlock">
          <pre>{`class CreditNote {
  applyTo(invoice) { invoice.balance -= this.amount; }
}
// support ticket: "customer wants a credit note issued"
// engineer searches codebase for "CreditNote" — finds it immediately`}</pre>
        </div>
        <p>
          The behavior is identical. What changed is that a support engineer, a product
          manager, and a backend engineer can now all use the same word in the same meeting
          and be certain they mean the same thing.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of two separate vocabularies, business language and engineering dialect, requiring translation between them, versus one shared ubiquitous language used consistently across product, code, and conversation.">
          <rect className="box" x="20" y="15" width="120" height="26" rx="4" /><text x="80" y="32" className="boxText" style={{fontSize:"5px"}}>Business: "credit note"</text>
          <rect className="boxWarn" x="270" y="15" width="120" height="26" rx="4" /><text x="330" y="32" className="boxText" style={{fontSize:"5px"}}>Code: "Adjustment"</text>
          <text x="205" y="32" className="figHint" style={{fontSize:"8px"}}>&#8800;</text>
          <rect className="boxAccent" x="130" y="70" width="160" height="30" rx="5" /><text x="210" y="88" className="boxText" style={{fontSize:"5.5px"}}>Shared: "CreditNote"</text>
          <line className="flow" x1="80" y1="41" x2="180" y2="70" />
          <line className="flow" x1="330" y1="41" x2="240" y2="70" />
        </svg>
        <figcaption>Two vocabularies for one concept force a translation step every time; one shared name removes it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Letting implementation details leak into domain names is the usual failure &mdash;
          naming a class <code>CreditNoteRow</code> because it maps to a database row, or
          <code>CreditNoteDTO</code> everywhere including business logic that has nothing to do
          with data transfer. Reserve those suffixes for the specific layer where the
          distinction (a database record, a wire-format object) actually matters.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did renaming Adjustment to CreditNote reduce the risk of miscommunication between support, product, and engineering, beyond just being a cosmetic change?</p>
        </div>
      </section>
      <p className="takeaway">
        Code that mirrors the vocabulary domain experts already use removes a hidden
        translation layer &mdash; and every place that translation was needed was a place a
        misunderstanding could hide.
      </p>

    </div>
  );
}
