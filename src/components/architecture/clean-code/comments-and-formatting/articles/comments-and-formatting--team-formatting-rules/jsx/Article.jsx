import "../css/Article.css";

export default function CommentsAndFormattingTeamFormattingRulesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Individually reasonable formatting preferences, left unsettled across a team,
          generate constant low-grade friction: every pull request accrues whitespace-only
          diffs and stylistic nitpicks that have nothing to do with correctness.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Consistency beats personal preference</b> &mdash; a team-wide style, even one no individual would have chosen alone, is more valuable than everyone writing in their own preferred style.</li>
          <li><b>Automate it, don't negotiate it repeatedly</b> &mdash; a shared formatter configuration (like Prettier or a language-standard formatter) run automatically removes formatting from the list of things reviewers discuss.</li>
          <li><b>Enforce in CI, not just locally</b> &mdash; a formatter that only runs in someone's editor is optional; one wired into a pre-commit hook or a CI check is guaranteed.</li>
          <li><b>Document the exceptions</b> &mdash; where a rule genuinely does not fit a specific case, write down why the exception exists, rather than leaving a silent, unexplained deviation.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Before Ledgerly adopted an automated formatter, a typical pull request review looked
          like this:
        </p>
        <span className="codeLabel">BEFORE: MANUAL STYLE POLICING</span>
        <div className="codeBlock">
          <pre>{`// PR #142 comments:
// "nit: should be 2-space indent here, not 4"
// "nit: we usually put the brace on the same line"
// "nit: extra blank line at the top of the file"
// (3 of 3 review comments are about formatting, 0 about the actual bug fix)`}</pre>
        </div>
        <span className="codeLabel">AFTER: FORMATTER IN CI</span>
        <div className="codeBlock">
          <pre>{`// .github/workflows/ci.yml
- run: npx prettier --check .
// a misformatted PR fails CI automatically, before a human ever
// has to notice or comment on it
// PR #143 comments: "LGTM, nice fix" (0 formatting comments — CI already caught it)`}</pre>
        </div>
        <p>
          The rule did not get stricter or looser &mdash; it just stopped requiring a human to
          notice and type it out every time, freeing review time for things that actually
          require judgment.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a pull request going through human review for both formatting and logic, versus a pull request where an automated formatter check handles formatting in CI, leaving human review time free for logic only.">
          <rect className="box" x="20" y="20" width="100" height="24" rx="4" /><text x="70" y="36" className="boxText" style={{fontSize:"4.5px"}}>Pull request</text>
          <rect className="boxWarn" x="170" y="20" width="110" height="24" rx="4" /><text x="225" y="36" className="boxText" style={{fontSize:"4.5px"}}>Human: style nits</text>
          <rect className="box" x="320" y="20" width="80" height="24" rx="4" /><text x="360" y="36" className="boxText" style={{fontSize:"4.5px"}}>+ logic review</text>
          <line className="flow" x1="120" y1="32" x2="168" y2="32" />
          <line className="flow" x1="280" y1="32" x2="318" y2="32" />
          <rect className="box" x="20" y="70" width="100" height="24" rx="4" /><text x="70" y="86" className="boxText" style={{fontSize:"4.5px"}}>Pull request</text>
          <rect className="boxAccent" x="170" y="70" width="110" height="24" rx="4" /><text x="225" y="86" className="boxText" style={{fontSize:"4.5px"}}>CI: formatter check</text>
          <rect className="boxAccent" x="320" y="70" width="80" height="24" rx="4" /><text x="360" y="86" className="boxText" style={{fontSize:"4.5px"}}>Human: logic only</text>
          <line className="flow" x1="120" y1="82" x2="168" y2="82" />
          <line className="flow" x1="280" y1="82" x2="318" y2="82" />
        </svg>
        <figcaption>Automating the formatting check moves it out of human review entirely, leaving reviewer attention for logic.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adopting a formatter but leaving it optional &mdash; a config file nobody is required to
          run &mdash; produces most of the friction of no standard at all, since some contributors
          use it and others don't. The value comes specifically from automatic, mandatory
          enforcement, not from the existence of a config file.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does wiring a formatter into CI produce a bigger improvement than just publishing a team style guide document?</p>
        </div>
      </section>
      <p className="takeaway">
        Formatting consistency is worth more than any individual formatting preference &mdash;
        settle it once with an automated, enforced tool, and free up review time for things
        that actually need a human's judgment.
      </p>

    </div>
  );
}
