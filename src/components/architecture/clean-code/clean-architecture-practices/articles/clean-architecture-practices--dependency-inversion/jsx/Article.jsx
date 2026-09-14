import "../css/Article.css";

export default function CleanArchitecturePracticesDependencyInversionArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          The D in SOLID. High-level policy, the business rules, should not depend on low-level
          detail, like a specific database; instead, both should depend on an abstraction that
          the high-level side defines.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Traditionally, high-level calls low-level directly</b> &mdash; business logic imports and calls a database module, meaning business logic depends on infrastructure.</li>
          <li><b>Inverted, the abstraction belongs to the high-level side</b> &mdash; define the interface around what the business logic needs, and have the low-level detail implement it.</li>
          <li><b>Control flow doesn't change, only the dependency direction does</b> &mdash; execution still flows business logic to repository call to database; only which side owns and imports the abstraction flips.</li>
          <li><b>This is what makes business logic testable and swappable</b> &mdash; without a real database, and without ever touching the business rules when storage technology changes later.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>InvoiceService</code>, before and after the dependency direction
          inverts:
        </p>
        <span className="codeLabel">HIGH-LEVEL DEPENDS ON LOW-LEVEL DIRECTLY</span>
        <div className="codeBlock">
          <pre>{`// invoiceService.js (business logic)
import { PostgresInvoiceRepository } from "./postgresInvoiceRepository.js";
class InvoiceService {
  constructor() { this.repo = new PostgresInvoiceRepository(); } // depends on a concrete detail
  markPaid(id) { this.repo.updateStatus(id, "paid"); }
}`}</pre>
        </div>
        <span className="codeLabel">BOTH DEPEND ON AN ABSTRACTION</span>
        <div className="codeBlock">
          <pre>{`// invoiceRepository.js — the abstraction, defined by and for the business logic
class InvoiceRepository {
  updateStatus(id, status) { throw new Error("not implemented"); }
}
// invoiceService.js (business logic) — depends only on the abstraction
class InvoiceService {
  constructor(repo) { this.repo = repo; } // repo: InvoiceRepository
  markPaid(id) { this.repo.updateStatus(id, "paid"); }
}
// postgresInvoiceRepository.js (low-level detail) — implements the abstraction
class PostgresInvoiceRepository extends InvoiceRepository {
  updateStatus(id, status) { /* real SQL */ }
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 160" role="img" aria-label="Diagram of high-level business logic depending directly on a low-level concrete database class, versus both the high-level business logic and the low-level database class depending on a shared abstraction defined by the business logic's needs.">
          <rect className="box" x="150" y="8" width="120" height="24" rx="4" /><text x="210" y="24" className="boxText" style={{fontSize:"4px"}}>InvoiceService</text>
          <rect className="boxWarn" x="150" y="52" width="120" height="24" rx="4" /><text x="210" y="68" className="boxText" style={{fontSize:"3.6px"}}>PostgresRepository</text>
          <line className="flowMuted" x1="210" y1="32" x2="210" y2="50" />
          <line className="divider" x1="20" y1="88" x2="400" y2="88" />
          <rect className="boxAccent" x="145" y="98" width="150" height="24" rx="4" /><text x="220" y="114" className="boxText" style={{fontSize:"3.6px"}}>InvoiceRepository (abstraction)</text>
          <rect className="box" x="20" y="138" width="110" height="22" rx="4" /><text x="75" y="153" className="boxText" style={{fontSize:"3.8px"}}>InvoiceService</text>
          <rect className="box" x="290" y="138" width="110" height="22" rx="4" /><text x="345" y="153" className="boxText" style={{fontSize:"3.6px"}}>PostgresRepository</text>
          <line className="flow" x1="90" y1="138" x2="180" y2="122" />
          <line className="flow" x1="330" y1="138" x2="260" y2="122" />
        </svg>
        <figcaption>Traditionally the high-level service depends directly on the low-level detail; inverted, both depend on an abstraction the high-level side defines.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Introducing an abstraction shaped around the low-level detail &mdash; mirroring the
          database's schema, say &mdash; rather than around what the high-level business logic
          actually needs is an abstraction in name only; the dependency direction hasn't really
          inverted.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does InvoiceService importing PostgresInvoiceRepository directly make it harder to test than InvoiceService depending on an InvoiceRepository abstraction?</p>
        </div>
      </section>
      <p className="takeaway">
        Define the abstraction from the high-level side's perspective, and have the low-level
        detail implement it &mdash; the dependency direction flips even though control still flows
        the same way it always did.
      </p>

    </div>
  );
}
