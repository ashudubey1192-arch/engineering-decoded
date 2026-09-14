import "../css/Article.css";

export default function CleanCodeFoundationsTheBoyScoutRuleArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          The Boy Scout Rule, popularized in Robert C. Martin's <i>Clean Code</i>, borrows its
          name from the camping principle "leave the campground cleaner than you found it."
          Applied to software: every time you touch a file, leave it a little better than it was.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Small, continuous improvement</b> &mdash; not a rewrite, just one better name, one extracted function, one removed dead branch, done as a side effect of work you were already doing.</li>
          <li><b>Attached to real work</b> &mdash; the rule applies while you are already in a file for a feature or bug fix, not as a separate scheduled activity.</li>
          <li><b>Bounded scope</b> &mdash; the improvement should stay inside or very close to the code you are already changing, so the change stays reviewable and low-risk.</li>
          <li><b>Compounding effect</b> &mdash; a file touched ten times over a year by ten different small improvements ends up meaningfully cleaner without anyone scheduling a cleanup.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A Ledgerly engineer opens <code>reminder-scheduler.js</code> to fix a bug: reminder
          emails are sent one day early. Fixing the bug is a one-line change. While they are
          there, they also notice a poorly named variable used three lines away and rename it
          &mdash; still inside the same small, reviewable pull request:
        </p>
        <span className="codeLabel">BEFORE (bug + unrelated smell, same file)</span>
        <div className="codeBlock">
          <pre>{`function shouldSendReminder(inv) {
  const x = daysUntil(inv.dueAt);
  return x <= 3; // bug: should be < 3
}`}</pre>
        </div>
        <span className="codeLabel">AFTER (bug fixed, one nearby name improved)</span>
        <div className="codeBlock">
          <pre>{`function shouldSendReminder(invoice) {
  const daysUntilDue = daysUntil(invoice.dueAt);
  return daysUntilDue < 3;
}`}</pre>
        </div>
        <p>
          The pull request is still small and focused on one bug. But <code>x</code> is gone
          from this function forever, at essentially no added cost or risk.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of the Boy Scout Rule applied over five separate visits to the same file, each one leaving a small improvement, accumulating into a meaningfully cleaner file.">
          <rect className="box" x="10" y="40" width="60" height="26" rx="4" /><text x="40" y="57" className="boxText" style={{fontSize:"5px"}}>Visit 1</text>
          <rect className="box" x="100" y="40" width="60" height="26" rx="4" /><text x="130" y="57" className="boxText" style={{fontSize:"5px"}}>Visit 2</text>
          <rect className="box" x="190" y="40" width="60" height="26" rx="4" /><text x="220" y="57" className="boxText" style={{fontSize:"5px"}}>Visit 3</text>
          <rect className="box" x="280" y="40" width="60" height="26" rx="4" /><text x="310" y="57" className="boxText" style={{fontSize:"5px"}}>Visit 4</text>
          <rect className="boxAccent" x="360" y="30" width="50" height="46" rx="4" /><text x="385" y="50" className="boxText" style={{fontSize:"5px"}}>Cleaner</text><text x="385" y="60" className="boxText" style={{fontSize:"5px"}}>file</text>
          <line className="flow" x1="70" y1="53" x2="98" y2="53" />
          <line className="flow" x1="160" y1="53" x2="188" y2="53" />
          <line className="flow" x1="250" y1="53" x2="278" y2="53" />
          <line className="flow" x1="340" y1="53" x2="358" y2="53" />
        </svg>
        <figcaption>Each visit leaves one small improvement; the file's quality is the sum of every visit, not one dedicated cleanup.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Turning a bug-fix pull request into a large, unrelated refactor is the rule's most
          common misapplication. A reviewer who receives a one-line bug fix bundled with a
          200-line restructuring cannot easily verify either change. The rule is about small,
          local, low-risk improvement &mdash; not license to rewrite whatever you touch.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does bundling a large unrelated refactor into a bug-fix pull request work against the spirit of the Boy Scout Rule, even though both are technically "improving the code"?</p>
        </div>
      </section>
      <p className="takeaway">
        Leave every file you touch slightly better than you found it &mdash; small enough to stay
        safe and reviewable, consistent enough to compound into real improvement over time.
      </p>

    </div>
  );
}
