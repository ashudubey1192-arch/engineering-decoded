import "../css/Article.css";

export default function CleanArchitecturePracticesStaticAnalysisArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A linter, a type-checker, and a formatter catch a whole category of problem before a
          human reviewer ever needs to look at it &mdash; freeing review time for things a machine
          genuinely can't judge, like whether an abstraction actually makes sense.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>A formatter removes an entire class of review comments</b> &mdash; spacing and brace placement stop being debated once a tool enforces them automatically.</li>
          <li><b>A linter catches common, mechanical mistakes reliably</b> &mdash; unused variables, an accidental assignment where a comparison was meant, an unreachable branch, without fatigue.</li>
          <li><b>A type checker catches an entire category of shape mismatches</b> &mdash; "I passed the wrong shape of data" bugs surface before the code even runs, and the types double as always-accurate documentation.</li>
          <li><b>Run these in CI, not just locally</b> &mdash; a check that's optional locally gets skipped under deadline pressure; one enforced in the pipeline doesn't.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A one-character typo in Ledgerly's tax code that two human reviewers missed:
        </p>
        <span className="codeLabel">CAUGHT ONLY BY A LINTER RULE</span>
        <div className="codeBlock">
          <pre>{`function calculateTotal(invoice) {
  if (invoice.total = 0) { // typo: assignment, not comparison
    return 0;
  }
  return invoice.total * 1.0825;
}
// this passed two human code reviews before a linter rule
// (no-assignment-in-condition) caught it automatically on the third pull request`}</pre>
        </div>
        <p>
          Neither reviewer was careless &mdash; a single stray character in a large diff is exactly
          the kind of thing human attention is unreliable at catching, and exactly the kind of
          thing a mechanical rule never gets tired of checking.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a funnel: many potential issues enter at the top, static analysis tools filter out the mechanical ones, and a smaller set of issues requiring real judgment reaches human review.">
          <rect className="boxWarn" x="30" y="10" width="360" height="24" rx="4" /><text x="210" y="26" className="boxText" style={{fontSize:"4px"}}>typos, unused vars, style, type mismatches, dead branches</text>
          <line className="flowMuted" x1="210" y1="34" x2="210" y2="55" />
          <rect className="box" x="120" y="58" width="180" height="24" rx="4" /><text x="210" y="74" className="boxText" style={{fontSize:"3.8px"}}>linter + type-checker + formatter</text>
          <line className="flow" x1="210" y1="82" x2="210" y2="103" />
          <rect className="boxAccent" x="150" y="106" width="120" height="22" rx="4" /><text x="210" y="121" className="boxText" style={{fontSize:"3.8px"}}>human review: judgment calls</text>
        </svg>
        <figcaption>Static analysis filters out mechanical issues before review, leaving human attention for the judgment calls a tool can't make.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Configuring a linter with dozens of stylistic rules nobody agreed on generates so much
          noise that the team starts ignoring its warnings altogether &mdash; a linter whose output
          is routinely ignored provides no more protection than having no linter at all.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a one-character typo like invoice.total = 0 instead of invoice.total === 0 exactly the kind of bug static analysis catches more reliably than human review?</p>
        </div>
      </section>
      <p className="takeaway">
        Let tools catch what tools are good at &mdash; mechanical, well-defined problems &mdash; enforced
        in CI so they're never optional, and save human review for the judgment calls a linter
        can't make.
      </p>

    </div>
  );
}
