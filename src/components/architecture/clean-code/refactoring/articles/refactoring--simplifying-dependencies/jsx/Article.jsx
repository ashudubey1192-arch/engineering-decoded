import "../css/Article.css";

export default function RefactoringSimplifyingDependenciesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Refactoring a class's dependencies &mdash; removing ones it doesn't need, and narrowing the
          ones it does &mdash; often reduces coupling more than any single line-level change inside
          the class.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Audit what's actually used</b> &mdash; a class that stores five dependencies but only calls methods on two of them is carrying dead weight.</li>
          <li><b>Introduce a narrower interface</b> &mdash; a large interface with fifteen methods, when a class only needs two, can be replaced with a smaller interface tailored to what's actually used.</li>
          <li><b>Break cycles by extracting the shared piece</b> &mdash; when two modules depend on each other, pulling out the part both need into a third, smaller module removes the cycle.</li>
          <li><b>Fewer, narrower dependencies reduce mental load</b> &mdash; a class with less to depend on can be understood, tested, and changed with less context held in your head at once.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>InvoiceService</code>, narrowed from a sprawling database interface to
          exactly what it uses:
        </p>
        <span className="codeLabel">DEPENDS ON A 40-METHOD INTERFACE, USES 2</span>
        <div className="codeBlock">
          <pre>{`class InvoiceService {
  constructor(database) { this.database = database; } // Database has 40+ methods
  save(invoice) { return this.database.insertInvoiceRow(invoice.toRow()); }
  find(id) { return this.database.selectInvoiceById(id); }
}
// a test double for InvoiceService's dependency must stub out an interface
// far larger than what InvoiceService actually uses`}</pre>
        </div>
        <span className="codeLabel">DEPENDS ON A 2-METHOD INTERFACE</span>
        <div className="codeBlock">
          <pre>{`class InvoiceService {
  constructor(repository) { this.repository = repository; } // 2-method interface
  save(invoice) { return this.repository.save(invoice); }
  find(id) { return this.repository.find(id); }
}
// a FakeInvoiceRepository test double now only needs to implement 2 methods`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of InvoiceService depending on a Database interface with over 40 methods while using only 2 of them, versus InvoiceService depending on a narrow InvoiceRepository interface with exactly the 2 methods it uses.">
          <rect className="box" x="30" y="15" width="110" height="24" rx="4" /><text x="85" y="31" className="boxText" style={{fontSize:"4.2px"}}>InvoiceService</text>
          <rect className="boxWarn" x="220" y="5" width="170" height="50" rx="4" /><text x="305" y="24" className="boxText" style={{fontSize:"3.8px"}}>Database (40+ methods)</text><text x="305" y="38" className="boxText" style={{fontSize:"3.5px"}}>only save() and find() used</text>
          <line className="flowMuted" x1="140" y1="27" x2="218" y2="27" />
          <rect className="box" x="30" y="80" width="110" height="24" rx="4" /><text x="85" y="96" className="boxText" style={{fontSize:"4.2px"}}>InvoiceService</text>
          <rect className="boxAccent" x="220" y="80" width="170" height="24" rx="4" /><text x="305" y="96" className="boxText" style={{fontSize:"3.8px"}}>InvoiceRepository (2 methods)</text>
          <line className="flow" x1="140" y1="92" x2="218" y2="92" />
        </svg>
        <figcaption>A dependency on a large, mostly-unused interface narrows to a dependency on exactly what's used.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Creating a new micro-interface for every single dependency, even ones a class
          genuinely uses in full, fragments a cohesive, fully-used interface into many pieces and
          adds files without reducing any real coupling.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a test double for InvoiceService's dependency become simpler to write once InvoiceService depends on a 2-method interface instead of a 40-method one?</p>
        </div>
      </section>
      <p className="takeaway">
        Depend on exactly as much as you use &mdash; auditing and narrowing a class's dependencies
        often cuts more real coupling than restructuring the code inside it.
      </p>

    </div>
  );
}
