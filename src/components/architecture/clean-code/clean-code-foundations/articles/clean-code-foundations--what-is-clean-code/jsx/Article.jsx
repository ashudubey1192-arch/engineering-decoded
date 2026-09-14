import "../css/Article.css";

export default function CleanCodeFoundationsWhatIsCleanCodeArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Ask five experienced engineers to define "clean code" and you will get five answers
          that agree more than they disagree. Clean code is code that does what it claims,
          says what it does, and does not surprise the person reading it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Reads like well-written prose</b> &mdash; a widely echoed standard (associated with Grady Booch): clean code reads like it was written by someone who cared, each line leading naturally to the next.</li>
          <li><b>Does one thing well</b> &mdash; a function, class, or module has a single clear purpose rather than a bundle of loosely related ones.</li>
          <li><b>No duplication</b> &mdash; the same logic or knowledge is not repeated in multiple places, because duplication is where bugs hide when only one copy gets fixed.</li>
          <li><b>Minimal surprises</b> &mdash; a function named <code>getTotal()</code> does not also send an email; behavior matches what the name promises.</li>
          <li><b>Cared for, not just correct</b> &mdash; Bjarne Stroustrup's framing: clean code is efficient, but more importantly it "does one thing well" and "looks like it was written by someone who cares."</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Compare two versions of the same check in Ledgerly &mdash; deciding whether an invoice is
          overdue:
        </p>
        <span className="codeLabel">NOT CLEAN</span>
        <div className="codeBlock">
          <pre>{`function chk(x) {
  return x.s == 1 && Date.now() > x.d && !x.f;
}`}</pre>
        </div>
        <span className="codeLabel">CLEAN</span>
        <div className="codeBlock">
          <pre>{`function isOverdue(invoice) {
  const isUnpaid = invoice.status === InvoiceStatus.PENDING;
  const isPastDueDate = Date.now() > invoice.dueAt;
  const hasNoActiveDispute = !invoice.isFlaggedForDispute;
  return isUnpaid && isPastDueDate && hasNoActiveDispute;
}`}</pre>
        </div>
        <p>
          Both versions compute the same three-part boolean. Only the second one tells you,
          without checking any other file, what those three parts mean. That gap &mdash; identical
          behavior, wildly different clarity &mdash; is the entire subject of this course.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram showing that clean code and working code overlap but are not the same: code can compile and pass tests while still being unclean, and clean code is always also correct.">
          <circle className="boxAccent" cx="160" cy="60" r="52" style={{fillOpacity:0.35}} />
          <circle className="box" cx="230" cy="60" r="52" style={{fillOpacity:0.35}} />
          <text x="120" y="60" className="boxText" style={{fontSize:"6px"}}>Works</text>
          <text x="270" y="60" className="boxText" style={{fontSize:"6px"}}>Clean</text>
          <text x="195" y="63" className="boxText" style={{fontSize:"5px"}}>both</text>
        </svg>
        <figcaption>Working code is necessary but not sufficient &mdash; clean code always works, but plenty of working code is not clean.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating "clean" as a synonym for "clever" is a common confusion. A one-line regex
          that replaces twenty lines of validation is not automatically cleaner &mdash; if it takes
          the reader longer to decode than the twenty lines would have taken to read, it has
          made the code worse, not better, even though it is shorter.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is "the code compiles and the tests pass" not a sufficient definition of clean code?</p>
        </div>
      </section>
      <p className="takeaway">
        Clean code is defined by its effect on the next reader &mdash; it does one thing, says what
        it does, and holds no surprises &mdash; not by any single stylistic rule.
      </p>

    </div>
  );
}
