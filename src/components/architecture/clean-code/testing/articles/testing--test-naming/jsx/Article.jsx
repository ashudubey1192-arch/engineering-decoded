import "../css/Article.css";

export default function TestingTestNamingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A test name is often the only thing anyone reads about it &mdash; in a CI failure list, in
          a coverage report, in a teammate's pull request. A name that describes the behavior
          under test turns that list into documentation.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Name the behavior, not the mechanism</b> &mdash; "rejects negative line-item quantities" survives a rewrite of how the rejection is implemented; a name describing internals does not.</li>
          <li><b>Pick one convention and keep it consistent</b> &mdash; a full-sentence style or a method-condition-result style both work; switching between them within one suite adds friction for no benefit.</li>
          <li><b>A name is a substitute for a comment</b> &mdash; a well-named test needs no additional comment explaining its purpose.</li>
          <li><b>Difficulty naming a test is a signal</b> &mdash; if you can't summarize a test in one clear phrase, it may be checking more than one concept.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's suite before and after a naming pass:
        </p>
        <span className="codeLabel">VAGUE NAMES</span>
        <div className="codeBlock">
          <pre>{`test("test1", () => { /* ... */ });
test("test2", () => { /* ... */ });
test("testInvoice", () => { /* ... */ });
test("testInvoice2", () => { /* ... */ });
// a failing "testInvoice2" in a CI report says nothing about what broke`}</pre>
        </div>
        <span className="codeLabel">NAMES THAT DESCRIBE BEHAVIOR</span>
        <div className="codeBlock">
          <pre>{`test("rejects a line item with a negative quantity", () => { /* ... */ });
test("rejects a line item with a zero unit price", () => { /* ... */ });
test("applies a 10% discount to invoices over $5,000", () => { /* ... */ });
test("does not discount invoices exactly at the $5,000 threshold", () => { /* ... */ });
// a failing test now names the broken behavior directly in the CI report`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a CI failure report listing vaguely named tests that give no information about what broke, requiring the file to be opened, versus a report listing descriptively named tests that state the broken behavior directly.">
          <rect className="boxWarn" x="20" y="10" width="180" height="70" rx="4" />
          <text x="30" y="28" className="boxText" style={{fontSize:"4.2px"}}>test2 &mdash; FAILED</text>
          <text x="30" y="44" className="boxText" style={{fontSize:"4.2px"}}>testInvoice2 &mdash; FAILED</text>
          <text x="30" y="60" className="boxText" style={{fontSize:"4.2px"}}>test7 &mdash; FAILED</text>
          <text x="110" y="88" className="figHint" style={{fontSize:"4px"}}>must open the file to know why</text>
          <rect className="boxAccent" x="230" y="10" width="170" height="70" rx="4" />
          <text x="240" y="28" className="boxText" style={{fontSize:"3.8px"}}>rejects negative quantity &mdash; FAILED</text>
          <text x="240" y="50" className="boxText" style={{fontSize:"3.8px"}}>discounts over $5,000 &mdash; FAILED</text>
          <text x="315" y="88" className="figHint" style={{fontSize:"4px"}}>failure names the behavior</text>
        </svg>
        <figcaption>A vague test name forces a reader to open the file to learn what broke; a descriptive name states it directly in the failure report.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Encoding implementation details into a test's name &mdash; mentioning a loop, a specific
          internal helper, or a private field &mdash; couples the name to something that can change
          without the tested behavior changing, forcing needless renames later. Name what the
          code does, not how it currently does it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a name like "rejects a line item with a negative quantity" remain accurate even after the implementation of that check is rewritten, while a name describing the internal mechanism would not?</p>
        </div>
      </section>
      <p className="takeaway">
        Write test names as a sentence about behavior, consistently, so a failure report alone
        tells a reader what broke without requiring them to open the file.
      </p>

    </div>
  );
}
