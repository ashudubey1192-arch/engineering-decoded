import "../css/Article.css";

export default function CleanArchitecturePracticesTeamConventionsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Many clean-code decisions, like naming style, file layout, or which testing convention
          to follow, have more than one reasonable answer. What matters more than which one a
          team picks is that they pick one, write it down, and apply it consistently.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Consistency reduces cognitive load more than any single "correct" choice does</b> &mdash; a codebase with one predictable convention is easier to navigate than one with three "better" conventions used inconsistently.</li>
          <li><b>Write conventions down somewhere durable</b> &mdash; a style guide, a linter config, a template &mdash; rather than relying on tribal knowledge only current team members happen to remember.</li>
          <li><b>Enforce with tooling where possible</b> &mdash; a convention checked automatically doesn't need to be repeated in review comments over and over.</li>
          <li><b>Revisit conventions deliberately</b> &mdash; as an explicit team decision, rather than letting them drift silently one pull request at a time.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's team settling a real, recurring disagreement by writing it down once:
        </p>
        <span className="codeLabel">TESTING.MD, EXCERPT</span>
        <div className="codeBlock">
          <pre>{`Test names use full-sentence style describing behavior:
  test("rejects a line item with a negative quantity", ...)
Not the method_condition_result style used in some older files.
New tests follow this doc; existing tests are updated opportunistically,
not in a dedicated mass rename.`}</pre>
        </div>
        <p>
          The same disagreement had already come up in three separate pull requests before this
          was written down &mdash; each time re-argued from scratch, with a slightly different
          outcome.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of the same naming-style disagreement raised separately in three different pull requests, versus one written convention document that all three now reference instead.">
          <rect className="boxWarn" x="20" y="10" width="90" height="22" rx="4" /><text x="65" y="25" className="boxText" style={{fontSize:"3.8px"}}>PR #12 debate</text>
          <rect className="boxWarn" x="165" y="10" width="90" height="22" rx="4" /><text x="210" y="25" className="boxText" style={{fontSize:"3.8px"}}>PR #45 debate</text>
          <rect className="boxWarn" x="310" y="10" width="90" height="22" rx="4" /><text x="355" y="25" className="boxText" style={{fontSize:"3.8px"}}>PR #78 debate</text>
          <line className="flowMuted" x1="65" y1="32" x2="190" y2="58" />
          <line className="flowMuted" x1="210" y1="32" x2="210" y2="58" />
          <line className="flowMuted" x1="355" y1="32" x2="230" y2="58" />
          <rect className="boxAccent" x="140" y="62" width="140" height="26" rx="4" /><text x="210" y="79" className="boxText" style={{fontSize:"3.8px"}}>TESTING.md, written once</text>
        </svg>
        <figcaption>The same debate raised repeatedly across pull requests converges into one written convention everyone can point to.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Writing an exhaustive convention document covering every conceivable decision up
          front, before the team has hit most of the real disagreements in practice, tends to go
          stale or unread. Conventions are more durable when written down in response to an
          actual recurring disagreement.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the same test-naming disagreement getting re-argued in three separate pull requests cost the team more than writing the decision down once would have?</p>
        </div>
      </section>
      <p className="takeaway">
        Pick a convention, write it down, and enforce it with tooling where you can &mdash; which
        reasonable choice a team makes usually matters less than making it once and applying it
        consistently.
      </p>

    </div>
  );
}
