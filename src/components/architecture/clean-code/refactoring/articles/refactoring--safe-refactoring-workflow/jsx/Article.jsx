import "../css/Article.css";

export default function RefactoringSafeRefactoringWorkflowArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Refactoring means changing structure without changing behavior. The "without changing
          behavior" part is only trustworthy if you follow a disciplined workflow, not just
          careful intentions.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Never refactor and add a feature in the same commit</b> &mdash; mixing them makes it impossible to tell, if something breaks, whether the structure change or the new logic caused it.</li>
          <li><b>Start from a passing test suite</b> &mdash; refactoring code with no tests is closer to a rewrite with extra steps, since there is no way to verify behavior was preserved.</li>
          <li><b>Take small steps, verified constantly</b> &mdash; run the tests after each small mechanical change, such as a single rename or a single extraction, not after a large batch of them.</li>
          <li><b>Commit each verified step</b> &mdash; a refactoring built from a series of small, green, committed steps can be bisected or reverted individually if a later step reveals a problem.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's extraction of <code>TaxCalculator</code> out of <code>InvoiceService</code>,
          as a sequence of small, verified commits:
        </p>
        <span className="codeLabel">SMALL, VERIFIED STEPS</span>
        <div className="codeBlock">
          <pre>{`$ git log --oneline
a1b2c3d refactor: inject TaxCalculator into InvoiceService
e4f5a6b refactor: move calculateTax into TaxCalculator class
b7c8d9e refactor: extract calculateTax as a free function
f0a1b2c chore: confirm test suite green before refactoring
// each of these 4 steps ran the full suite, green, before the next began`}</pre>
        </div>
        <span className="codeLabel">THE SAME CHANGE, AS ONE BIG LEAP</span>
        <div className="codeBlock">
          <pre>{`$ git log --oneline
9f8e7d6 refactor: restructure tax calculation (also fixes rounding bug, also adds EU VAT)
// one large commit mixing a structural change, a bug fix, and a new feature —
// if anything breaks, which of the three caused it?`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a staircase of small refactoring steps, each verified green before the next, versus one large unverified leap covering the same overall change.">
          <rect className="boxAccent" x="20" y="90" width="70" height="20" rx="3" /><text x="55" y="103" className="boxText" style={{fontSize:"3.6px"}}>step 1</text>
          <rect className="boxAccent" x="110" y="65" width="70" height="20" rx="3" /><text x="145" y="78" className="boxText" style={{fontSize:"3.6px"}}>step 2</text>
          <rect className="boxAccent" x="200" y="40" width="70" height="20" rx="3" /><text x="235" y="53" className="boxText" style={{fontSize:"3.6px"}}>step 3</text>
          <rect className="boxAccent" x="290" y="15" width="90" height="20" rx="3" /><text x="335" y="28" className="boxText" style={{fontSize:"3.6px"}}>step 4, done</text>
          <text x="200" y="120" className="figHint" style={{fontSize:"4px"}}>each step run through tests before the next begins</text>
        </svg>
        <figcaption>A staircase of small, verified steps versus the same overall change taken as one unverified leap.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Refactoring without running the test suite between steps, saving verification for the
          very end, means that if something breaks, the search for the cause spans the entire
          multi-step change instead of the one step that just ran.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a break at "move calculateTax into TaxCalculator class" in the small-steps version point directly at the cause, in a way the single large commit version could not?</p>
        </div>
      </section>
      <p className="takeaway">
        Refactor in small, independently verified steps, each its own commit &mdash; the discipline,
        not good intentions alone, is what keeps "changing structure" from quietly becoming
        "changing behavior."
      </p>

    </div>
  );
}
