export default function BehavioralPatternsChainOfResponsibilityArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Chain of Responsibility passes a request along a sequence of handlers, each deciding
          either to process it or pass it to the next handler in the chain, until one handles it
          or the chain ends. The sender never knows which handler, if any, will actually process
          the request &mdash; it just puts the request into the chain.
        </p>
        <p>
          Intent: decouple the sender of a request from the specific handler, by giving multiple
          objects a chance to handle it. Applicability: more than one object may handle a request,
          the right handler isn't known in advance, and the set of handlers should be configurable
          independently of the sender.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a chain, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define a common handler interface with a reference to the next handler.</b>{" "}
            <code>ApprovalHandler</code>, holding a <code>next</code> field and a{" "}
            <code>handle(Request)</code> method.
          </li>
          <li>
            <b>Implement each handler to check its own condition first.</b> A{" "}
            <code>ManagerApproval</code> handles requests under $1,000; anything larger, it passes
            along without touching.
          </li>
          <li>
            <b>Have each handler explicitly forward what it doesn't handle.</b> If a handler's
            condition doesn't match, it calls <code>next.handle(request)</code> rather than
            silently dropping the request.
          </li>
          <li>
            <b>Assemble the chain once, separately from the handlers' own logic.</b> The order
            (Manager &rarr; Director &rarr; VP) is configured where the chain is built, not
            hard-coded inside any individual handler.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 520 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="120" height="40" rx="6" />
            <text className="boxText" x="80" y="68" fontSize="9">Manager (&lt;$1k)</text>
            <line className="flow" x1="140" y1="65" x2="190" y2="65" />
            <rect className="box" x="190" y="45" width="120" height="40" rx="6" />
            <text className="boxText" x="250" y="68" fontSize="9">Director (&lt;$10k)</text>
            <line className="flow" x1="310" y1="65" x2="360" y2="65" />
            <rect className="boxAccent" x="360" y="45" width="120" height="40" rx="6" />
            <text className="boxText" x="420" y="68" fontSize="9">VP (any amount)</text>
            <text className="figHint" x="270" y="20">request enters here, moves right until handled</text>
          </svg>
          <figcaption>Each handler checks its own condition and either handles the request or passes it along, unaware of who comes next.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A chain of expense approvers</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`abstract class ApprovalHandler {
    protected ApprovalHandler next;
    ApprovalHandler setNext(ApprovalHandler next) { this.next = next; return next; }
    abstract void handle(ExpenseRequest request);
}

class ManagerApproval extends ApprovalHandler {
    void handle(ExpenseRequest request) {
        if (request.amount() < 1000) { approve(request); return; }
        if (next != null) next.handle(request); // not mine to decide, pass it on
    }
}
class DirectorApproval extends ApprovalHandler {
    void handle(ExpenseRequest request) {
        if (request.amount() < 10_000) { approve(request); return; }
        if (next != null) next.handle(request);
    }
}

ApprovalHandler chain = new ManagerApproval();
chain.setNext(new DirectorApproval()).setNext(new VpApproval());
chain.handle(new ExpenseRequest(4500)); // Manager passes, Director approves`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Forgetting to forward when a handler can't handle the request.</b> A handler that
            silently returns instead of calling <code>next.handle()</code> drops the request,
            leaving no other handler a chance.
          </li>
          <li>
            <b>Building a chain with no terminal handling for the case nothing matches.</b> A
            chain that reaches its end with the request still unhandled should have an explicit
            fallback, not a silent no-op.
          </li>
          <li>
            <b>Using Chain of Responsibility when exactly one handler should always run.</b> If the
            routing logic is really "pick the one right handler," that's closer to a simple lookup
            or Strategy than a chain where multiple handlers get a chance in sequence.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>ManagerApproval.handle()</code> call <code>next.handle(request)</code> instead of throwing an exception when the amount is $4,500?</p>
          <p>
            <b>Answer:</b> Chain of Responsibility's whole point is that the sender doesn't know
            in advance which handler will process the request. $4,500 is outside{" "}
            <code>ManagerApproval</code>'s own condition, so forwarding it lets the next handler
            in the chain (<code>DirectorApproval</code>) get a chance, rather than treating "not
            mine" as an error.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Chain of Responsibility when a request might be handled by one of several
        candidates in sequence, and the sender shouldn't need to know which one &mdash; each
        handler decides for itself, and explicitly forwards what it doesn't handle.
      </p>
    </div>
  );
}
