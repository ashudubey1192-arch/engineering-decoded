import "../css/Article.css";

export default function CleanArchitecturePracticesCodeReviewPracticesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Code review is where clean-code principles either get reinforced as a team habit or
          quietly abandoned. A review focused only on "does this work" misses the half of the
          job that keeps a codebase livable six months from now.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Review for the reader, not just correctness</b> &mdash; naming, function size, and structure are legitimate review comments, not just nitpicks to wave away.</li>
          <li><b>Distinguish blocking issues from preferences</b> &mdash; a genuine bug or a clear violation of a shared convention is worth blocking on; a stylistic preference the codebase doesn't already enforce usually isn't.</li>
          <li><b>Explain the why, not just the what</b> &mdash; a reason gives the author something to act on and learn from, rather than just a demand to comply with.</li>
          <li><b>Small, frequent pull requests review better</b> &mdash; a reviewer skimming a very large diff catches far less than one reading a focused, smaller change carefully.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          The same underlying concern, raised two different ways on a Ledgerly pull request:
        </p>
        <span className="codeLabel">A DEMAND, NO REASON</span>
        <div className="codeBlock">
          <pre>{`Reviewer comment: "clean this up"
// no reader can act on this — clean up what, specifically, and why?`}</pre>
        </div>
        <span className="codeLabel">A REASON, TIED TO SHARED CONVENTIONS</span>
        <div className="codeBlock">
          <pre>{`Reviewer comment: "processInvoice() now does validation, tax calculation, and
email sending in one 80-line function — could we extract calculateTax() and
sendConfirmation() so each piece can be tested and read on its own? (matches
the Small Functions pattern we've been using elsewhere in this codebase)"`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a small, focused pull request receiving thorough review coverage across all of its files, versus a large pull request receiving only sparse, skimmed coverage across a much larger set of files.">
          <rect className="boxAccent" x="20" y="20" width="50" height="24" rx="4" />
          <rect className="boxAccent" x="80" y="20" width="50" height="24" rx="4" />
          <text x="75" y="62" className="figHint" style={{fontSize:"4px"}}>~150 lines, reviewed thoroughly</text>
          <rect className="box" x="220" y="10" width="35" height="18" rx="3" /><rect className="box" x="260" y="10" width="35" height="18" rx="3" /><rect className="box" x="300" y="10" width="35" height="18" rx="3" /><rect className="box" x="340" y="10" width="35" height="18" rx="3" />
          <rect className="box" x="220" y="35" width="35" height="18" rx="3" /><rect className="boxWarn" x="260" y="35" width="35" height="18" rx="3" /><rect className="box" x="300" y="35" width="35" height="18" rx="3" /><rect className="box" x="340" y="35" width="35" height="18" rx="3" />
          <text x="300" y="70" className="figHint" style={{fontSize:"4px"}}>~2,000 lines, skimmed</text>
        </svg>
        <figcaption>A small, focused pull request gets real scrutiny across all of it; a sprawling one gets a skim, with issues easy to miss.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating every review comment as equally mandatory, including minor style preferences
          not already codified anywhere, blocks trivial changes on debates that should have been
          settled once, in a shared convention, rather than re-litigated on every pull request.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does "clean this up" give the author less to act on than a comment naming the specific function, its problem, and the pattern already used elsewhere in the codebase?</p>
        </div>
      </section>
      <p className="takeaway">
        Review for the person who reads this code next, give reasons instead of bare demands, and
        keep pull requests small enough that a reviewer can actually give every line real
        attention.
      </p>

    </div>
  );
}
