import "../css/Article.css";

export default function WelcomeCleanCodeLearningRoadmapArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          The eleven sections in this course are ordered deliberately: each one gives you a tool
          the next section assumes you already have. Skipping around works, but following the
          order means every example builds on a codebase that is already a little cleaner than
          the one before it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Foundations first</b> &mdash; what clean code even means and why it is worth the effort, before any technique.</li>
          <li><b>Micro before macro</b> &mdash; names, then functions, then comments and formatting: the smallest units of a codebase, cleaned first.</li>
          <li><b>Structure, then behavior</b> &mdash; objects and data, then error handling: how things are shaped, then how they fail.</li>
          <li><b>Verification and change</b> &mdash; clean tests, then refactoring: how you prove code works, then how you safely reshape it.</li>
          <li><b>Practice at scale</b> &mdash; applied clean code: boundaries, reviews, and standards for a whole team, not just one file.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>calc()</code> function from the introduction touches almost every
          section in this roadmap. Its variables get fixed in Meaningful Names. Its mixed
          responsibilities get split in Functions. Its magic numbers (<code>1.20</code>) get
          explained in Comments and Formatting or replaced with named constants. Its
          <code>inv.li</code> array-of-arrays shape gets redesigned in Objects and Data. Its
          silent failure on bad input gets addressed in Error Handling. And the whole
          transformation only becomes safe to do once Clean Tests covers the original
          behavior &mdash; which is exactly the order this course follows:
        </p>
        <table className="miniTable">
          <caption>Where each part of calc() gets addressed</caption>
          <thead><tr><th>Problem in calc()</th><th>Section that fixes it</th></tr></thead>
          <tbody>
            <tr><td>Names like <code>t</code>, <code>inv</code>, <code>li</code></td><td>Meaningful Names</td></tr>
            <tr><td>One function doing three jobs</td><td>Functions</td></tr>
            <tr><td>No explanation for <code>1.20</code></td><td>Comments and Formatting</td></tr>
            <tr><td>Invoice as a loose bag of fields</td><td>Objects and Data</td></tr>
            <tr><td>No handling for empty or negative quantities</td><td>Error Handling</td></tr>
            <tr><td>No safety net before changing it</td><td>Clean Tests</td></tr>
            <tr><td>The rewrite itself, done incrementally</td><td>Refactoring</td></tr>
          </tbody>
        </table>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram of the roadmap as a vertical sequence: foundations, naming, functions, comments and formatting, objects and data, error handling, classes and modules, clean tests, refactoring, and applied practice.">
          <rect className="box" x="150" y="6" width="120" height="20" rx="4" /><text x="210" y="20" className="boxText" style={{fontSize:"5.5px"}}>Foundations</text>
          <rect className="box" x="150" y="32" width="120" height="20" rx="4" /><text x="210" y="46" className="boxText" style={{fontSize:"5.5px"}}>Names &amp; functions</text>
          <rect className="box" x="150" y="58" width="120" height="20" rx="4" /><text x="210" y="72" className="boxText" style={{fontSize:"5.5px"}}>Comments &amp; objects</text>
          <rect className="box" x="150" y="84" width="120" height="20" rx="4" /><text x="210" y="98" className="boxText" style={{fontSize:"5.5px"}}>Errors &amp; classes</text>
          <rect className="boxAccent" x="150" y="110" width="120" height="20" rx="4" /><text x="210" y="124" className="boxText" style={{fontSize:"5.5px"}}>Tests, refactoring, practice</text>
          <line className="flow" x1="210" y1="26" x2="210" y2="30" />
          <line className="flow" x1="210" y1="52" x2="210" y2="56" />
          <line className="flow" x1="210" y1="78" x2="210" y2="82" />
          <line className="flow" x1="210" y1="104" x2="210" y2="108" />
        </svg>
        <figcaption>Each stage assumes the tools from the stage above it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Jumping straight to Refactoring because it looks like the "real" skill is a common
          shortcut &mdash; and a risky one. Refactoring safely depends on tests (Clean Tests) and on
          recognizing what is actually wrong (every earlier section). Refactoring without that
          foundation tends to produce code that is different, not better.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does Clean Tests come before Refactoring in this roadmap rather than after it?</p>
        </div>
      </section>
      <p className="takeaway">
        The roadmap moves from the smallest unit of a codebase (a variable name) to the largest
        (a team's conventions), so each new skill has somewhere concrete to land on code you
        have already started cleaning up.
      </p>

    </div>
  );
}
