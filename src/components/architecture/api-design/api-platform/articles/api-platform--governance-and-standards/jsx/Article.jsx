import "../css/Article.css";

export default function ApiPlatformGovernanceAndStandardsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Governance is what keeps an API style guide from being a document nobody actually follows
          &mdash; the difference between "we wrote our conventions down once" and "our conventions
          are still true two years and forty engineers later."
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Automated enforcement</h3>
            <p>A linter that checks an OpenAPI spec against house rules &mdash; naming, pagination style, error shape &mdash; and flags violations automatically, at PR time.</p>
          </div>
          <div>
            <h3>Human judgment</h3>
            <p>Design review, from the previous lesson, for the calls a linter genuinely can't make &mdash; whether a resource is modeled sensibly, whether a use case was actually considered.</p>
          </div>
        </div>
        <p>
          The process itself has to stay lightweight. A governance process too heavyweight to get
          through quickly gets routed around entirely, which is worse than no governance at all
          &mdash; it adds friction while providing none of the consistency it promised.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's automated spec-linter runs in CI on every pull request that touches
          <code>openapi.yaml</code>, flagging a new endpoint that doesn't follow the established
          cursor-pagination convention before a human reviewer even opens the diff. The design
          review process from the previous lesson handles everything the linter structurally can't
          check &mdash; whether the new resource actually makes sense, whether a real use case was
          considered &mdash; so human reviewers spend their attention on judgment calls, not on
          restating rules a machine could enforce for free.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a pull request splitting into two checks: an automated linter catching mechanical rule violations, and a human reviewer catching judgment calls the linter can't make, before the change merges.">
          <rect className="box" x="20" y="45" width="90" height="30" rx="5" />
          <text x="65" y="64" className="boxText" style={{fontSize:"6px"}}>Pull request</text>
          <rect className="boxAccent" x="180" y="15" width="110" height="30" rx="5" />
          <text x="235" y="34" className="boxText" style={{fontSize:"6px"}}>Automated linter</text>
          <rect className="box" x="180" y="75" width="110" height="30" rx="5" />
          <text x="235" y="94" className="boxText" style={{fontSize:"6px"}}>Human reviewer</text>
          <line className="flow" x1="110" y1="55" x2="178" y2="32" />
          <line className="flow" x1="110" y1="65" x2="178" y2="88" />
          <rect className="box" x="340" y="45" width="70" height="30" rx="5" />
          <text x="375" y="64" className="boxText" style={{fontSize:"6px"}}>Merge</text>
          <line className="flow" x1="290" y1="30" x2="340" y2="55" />
          <line className="flow" x1="290" y1="90" x2="340" y2="65" />
        </svg>
        <figcaption>Mechanical rules get checked automatically; everything left over is exactly what still needs a person.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Writing a comprehensive style guide with no enforcement behind it is a common mistake
          &mdash; it becomes aspirational trivia, ignored the moment a deadline gets tight, since
          nothing actually catches a violation. Making governance so heavyweight &mdash; long
          approval chains, mandatory sign-off from unrelated teams &mdash; that engineers route
          around it entirely is the opposite mistake, and it leaves an organization with the
          appearance of control and none of the actual consistency.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does automating pagination-style enforcement in CI free up human reviewers to focus on something a linter can't check?</p>
        </div>
      </section>
      <p className="takeaway">
        Automate what's mechanically checkable, and reserve human review for what genuinely
        requires judgment &mdash; either piece alone leaves a real gap, and an overly heavy process
        just gets bypassed.
      </p>
    </div>
  );
}
