import "../css/Article.css";

export default function BehavioralPatternsChainOfResponsibilityPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Chain of Responsibility passes a request along a chain of handler objects until one of
          them handles it, decoupling the sender from ever needing to know which specific handler
          will actually deal with it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each handler in the chain either handles the request itself or passes it to the next
          handler in line. The sender only ever talks to the first handler &mdash; it never knows,
          or needs to know, how many handlers exist or which one will ultimately act.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          An expense-approval chain: a <code>TeamLead</code> can approve requests up to $500, a
          <code>Manager</code> up to $5,000, a <code>Director</code> anything above that. A request
          for $2,000 enters at <code>TeamLead</code>, which passes it along since it's over its own
          limit, and <code>Manager</code> approves it &mdash; the person submitting the expense
          never had to know which specific approver's limit would actually cover it.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of an expense request entering a chain of TeamLead, Manager, and Director handlers, passed along until one handler's approval limit covers it." >
          <rect className="box" x="20" y="35" width="90" height="30" rx="6" /><text x="65" y="54" className="boxText" style={{fontSize:"7px"}}>Request: $2,000</text>
          <line className="flow" x1="110" y1="50" x2="150" y2="50" />
          <rect className="box" x="155" y="35" width="80" height="30" rx="6" /><text x="195" y="54" className="boxText" style={{fontSize:"7px"}}>TeamLead</text>
          <line className="flowMuted" x1="235" y1="50" x2="265" y2="50" /><text x="250" y="40" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>passes on</text>
          <rect className="boxAccent" x="270" y="35" width="80" height="30" rx="6" /><text x="310" y="54" className="boxText" style={{fontSize:"7px"}}>Manager</text>
          <text x="310" y="80" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>approves here</text>
        </svg>
        <figcaption>The request moves along the chain until a handler's limit covers it; the sender never picks which one.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forgetting to handle the case where no handler in the chain accepts the request leaves it
          silently dropped at the end with no resolution. Building a chain so long that it becomes
          hard to trace which handler actually processed &mdash; or should have processed &mdash; a
          given request makes debugging the chain itself a real cost.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why doesn't the code submitting the expense request need to know which handler will actually approve it?</p>
        </div>
      </section>
      <p className="takeaway">
        Chain of Responsibility lets the sender hand off a request without knowing &mdash; or
        caring &mdash; which handler down the line will end up dealing with it.
      </p>
    </div>
  );
}
