import "../css/Article.css";

export default function ObservabilityServiceLevelObjectivesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A service level objective turns "the service should be reliable" into a specific,
          measurable number everyone agrees to in advance &mdash; so reliability becomes something
          you track and make real trade-offs against, not a vague aspiration nobody can act on.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          An <b>SLI</b> (indicator) is the actual measured metric &mdash; the percentage of requests
          that succeeded and were fast enough. An <b>SLO</b> (objective) is the internal target for
          that SLI, such as 99.9% over a rolling 30 days. An <b>SLA</b> (agreement) is a looser,
          often contractual external commitment with real consequences if missed. The
          <b>error budget</b> is the flip side of the SLO: if the target is 99.9%, the remaining
          0.1% is a spendable resource &mdash; spend it on a risky rollout, or save it, but once it's
          gone, reliability takes priority over new features.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>PaymentService</code>'s SLO is 99.9% success over 30 rolling days. At 2 million
          requests/day, that's a budget of about 2,000 failed requests per day. A bad deploy causes
          45 minutes of elevated errors, consuming 1,400 of that day's budget in one incident &mdash;
          leaving only 600 for the rest of the day, so the team holds off on further risky rollouts
          until the budget resets.
        </p>
        <span className="codeLabel">MEASURING THE SLI</span>
        <div className="codeBlock">
          <pre>{`sli = (totalRequests - failedRequests) / totalRequests
// 0.9993 over the last 30 days -> above the 0.999 SLO, budget remains`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 100" role="img" aria-label="Error budget bar for a 30 day window, split into a consumed portion of about 70 percent from a recent incident and a remaining portion of about 30 percent still available before the objective is breached.">
          <text x="200" y="15" className="figLabel">ERROR BUDGET &mdash; 30-DAY WINDOW</text>
          <rect className="boxWarn" x="20" y="30" width="250" height="30" rx="6" />
          <text x="145" y="50" className="boxText" style={{fontSize:"6.5px"}}>consumed (70%)</text>
          <rect className="box" x="272" y="30" width="108" height="30" rx="6" />
          <text x="326" y="50" className="boxText" style={{fontSize:"6.5px"}}>remaining</text>
        </svg>
        <figcaption>One incident spent 70% of the month's error budget in a single day &mdash; the remaining 30% is what's left before the SLO is breached.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating the SLO as a target to exceed rather than a budget to manage leads to
          over-investing in reliability well past what users actually need, at real engineering
          cost that could have gone toward features. Setting the SLO with no reference to what users
          actually notice &mdash; picking "five nines" because it sounds impressive &mdash; creates a
          target that's either needlessly expensive to hit or, if picked carelessly the other
          direction, too loose to mean anything at all.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>PaymentService's 30-day SLO is 99.9%, and one incident consumes 70% of that month's error budget in a single day. What should the team most likely do differently for the rest of the month?</p>
        </div>
      </section>
      <p className="takeaway">
        An SLO makes reliability concrete and trackable, and its error budget makes it a resource to
        spend deliberately &mdash; not a vague aspiration, and not a target to over-engineer past
        either.
      </p>
    </div>
  );
}
