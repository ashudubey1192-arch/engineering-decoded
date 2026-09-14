import "../css/Article.css";

export default function CleanCodeFoundationsProfessionalResponsibilityArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Robert C. Martin opens <i>Clean Code</i> by arguing that writing clean code is a
          professional obligation, not a nicety: the people who best understand the cost of a
          mess are the ones writing it, which makes them responsible for pushing back on
          pressure to create one.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>You are the domain expert on cost</b> &mdash; a product manager can judge business value, but only the engineer can judge how much a shortcut will cost to live with.</li>
          <li><b>"Yes" has a cost too</b> &mdash; agreeing to an unrealistic deadline by quietly cutting quality is not a neutral act; it trades a future team's velocity for a stakeholder's short-term comfort.</li>
          <li><b>Saying no is part of the job</b> &mdash; professionally raising a concern ("that timeline means skipping tests on the payment path") is not insubordination, it is giving stakeholders the information they need to make an informed call.</li>
          <li><b>Ownership over blame</b> &mdash; a professional does not ship code they know is broken and blame the deadline afterward; they surface the trade-off before the decision is made.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's lead engineer is asked to ship refund support in three days, matching a
          competitor's announcement. They estimate that doing it safely &mdash; with tests around
          money-handling logic &mdash; takes five days. Two ways to respond:
        </p>
        <span className="codeLabel">UNPROFESSIONAL RESPONSE</span>
        <div className="codeBlock">
          <pre>{`"Sure, I'll have it done in three days."
// ships refunds untested; a rounding bug in partial
// refunds is discovered three weeks later in production`}</pre>
        </div>
        <span className="codeLabel">PROFESSIONAL RESPONSE</span>
        <div className="codeBlock">
          <pre>{`"I can ship a full refund path in three days with tests.
Partial refunds involve rounding edge cases I'm not
comfortable shipping untested — I'd want two more days
for those, or we ship full refunds first and add partial
refunds next week. Your call on which trade-off you want."`}</pre>
        </div>
        <p>
          The second response does not refuse the deadline &mdash; it gives the stakeholder an
          honest, informed choice instead of a silent, hidden risk.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram contrasting a silent yes that hides risk from the deadline decision versus a professional response that surfaces the trade-off before the decision is made.">
          <rect className="box" x="15" y="15" width="130" height="26" rx="5" /><text x="80" y="32" className="boxText" style={{fontSize:"5px"}}>Deadline request</text>
          <rect className="boxWarn" x="180" y="15" width="120" height="26" rx="5" /><text x="240" y="32" className="boxText" style={{fontSize:"5px"}}>Silent "yes"</text>
          <rect className="boxWarn" x="330" y="15" width="80" height="26" rx="5" /><text x="370" y="32" className="boxText" style={{fontSize:"5px"}}>Hidden risk</text>
          <rect className="boxAccent" x="180" y="65" width="120" height="26" rx="5" /><text x="240" y="82" className="boxText" style={{fontSize:"5px"}}>Surfaced trade-off</text>
          <rect className="boxAccent" x="330" y="65" width="80" height="26" rx="5" /><text x="370" y="82" className="boxText" style={{fontSize:"5px"}}>Informed choice</text>
          <line className="flow" x1="145" y1="28" x2="178" y2="28" />
          <line className="flowMuted" x1="300" y1="28" x2="328" y2="28" />
          <line className="flow" x1="145" y1="28" x2="178" y2="78" />
          <line className="flow" x1="300" y1="78" x2="328" y2="78" />
        </svg>
        <figcaption>The same deadline pressure, handled two ways: one hides the trade-off, the other puts it in front of the person who owns the decision.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Confusing professional responsibility with unilateral refusal is a common
          misreading. The point is not "engineers should always say no to deadlines" &mdash; it is
          that trade-offs should be surfaced honestly so the person with business context can
          decide, rather than being made silently by omission.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is silently agreeing to an unrealistic deadline, and quietly cutting corners to meet it, a worse outcome than explicitly negotiating scope?</p>
        </div>
      </section>
      <p className="takeaway">
        Professional responsibility means surfacing the real cost of a shortcut before it is
        taken, so the trade-off is a decision someone made on purpose &mdash; not a surprise found
        later in production.
      </p>

    </div>
  );
}
