import "../css/Article.css";

export default function RefactoringLegacyCodeRefactoringArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Most real refactoring happens not on clean new code but on legacy code &mdash; code
          without tests, sometimes without a single person left who fully understands it. One
          useful definition: legacy code is simply code without tests.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>The chicken-and-egg problem</b> &mdash; you want tests before refactoring, but the code's design, tight coupling and hidden dependencies, is often exactly what makes it hard to test in the first place.</li>
          <li><b>Find a seam</b> &mdash; a point where a different dependency can be substituted with a minimally invasive change, without altering the rest of the class, to get a first test in place.</li>
          <li><b>Write characterization tests</b> &mdash; tests that record what the code currently does, correct or not, giving a safety net before you've fully understood or fixed the logic.</li>
          <li><b>Improve the code you touch, not the whole file</b> &mdash; the Boy Scout Rule applied at legacy scale: leave the specific area you're working in a little better, rather than attempting a risky full rewrite.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's untested <code>LegacyInvoiceProcessor</code>, given one small seam:
        </p>
        <span className="codeLabel">NO SEAM, UNTESTABLE</span>
        <div className="codeBlock">
          <pre>{`class LegacyInvoiceProcessor {
  constructor() {
    this.db = new PostgresConnection(process.env.DB_URL); // real connection, every time
  }
  process(invoiceId) {
    const row = this.db.query("SELECT * FROM invoices WHERE id = ?", invoiceId);
    // 150 more lines nobody has touched in 4 years
    return row.total * 1.0825;
  }
}`}</pre>
        </div>
        <span className="codeLabel">ONE SEAM, FIRST TEST POSSIBLE</span>
        <div className="codeBlock">
          <pre>{`class LegacyInvoiceProcessor {
  constructor(db = new PostgresConnection(process.env.DB_URL)) { // seam: default argument
    this.db = db;
  }
  process(invoiceId) {
    const row = this.db.query("SELECT * FROM invoices WHERE id = ?", invoiceId);
    return row.total * 1.0825; // still untouched, still not understood — now protected
  }
}
test("characterizes current processing behavior", () => {
  const fakeDb = new FakeDb({ total: 100000 });
  expect(new LegacyInvoiceProcessor(fakeDb).process("inv-1")).toBe(108250);
  // whatever this number is, it's what the legacy code already does today
});`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a legacy class with a real database connection hardwired inside its constructor, impossible to substitute, versus the same class with one small seam, a default constructor argument, allowing a fake to be passed in for a first test.">
          <rect className="boxWarn" x="30" y="15" width="170" height="40" rx="4" /><text x="115" y="32" className="boxText" style={{fontSize:"4px"}}>LegacyInvoiceProcessor</text><text x="115" y="45" className="boxText" style={{fontSize:"3.6px"}}>db hardwired inside, no seam</text>
          <rect className="box" x="30" y="65" width="170" height="34" rx="4" /><text x="115" y="84" className="boxText" style={{fontSize:"4px"}}>LegacyInvoiceProcessor</text>
          <rect className="boxAccent" x="250" y="65" width="140" height="34" rx="4" /><text x="320" y="84" className="boxText" style={{fontSize:"4px"}}>FakeDb (via seam)</text>
          <line className="flow" x1="200" y1="82" x2="248" y2="82" />
        </svg>
        <figcaption>A hardwired dependency admits no substitute; one small seam is enough to attach a first test.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Attempting a full rewrite of a large, poorly understood legacy module in one pass, with
          no tests as a safety net at any point along the way, is a common and costly overreach.
          Small, tested, incremental seams carry far less risk.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a characterization test that simply records the current output of process(), without judging whether that output is correct, still provide real value before refactoring?</p>
        </div>
      </section>
      <p className="takeaway">
        Find the smallest seam that lets you substitute a fake dependency, write a characterization
        test through it, and only then start improving &mdash; a safety net first, understanding and
        fixes second.
      </p>

    </div>
  );
}
