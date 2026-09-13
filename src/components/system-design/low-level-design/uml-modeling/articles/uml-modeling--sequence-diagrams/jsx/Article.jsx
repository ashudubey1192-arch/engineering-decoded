import "../css/Article.css";

export default function UmlModelingSequenceDiagramsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Where a class diagram shows static structure, a sequence diagram shows dynamic behavior
          &mdash; the order that messages pass between specific objects for one concrete scenario,
          over time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each participating object gets a vertical lifeline; time runs top to bottom. A horizontal
          arrow from one lifeline to another represents a call, labeled with the method being
          invoked; a dashed return arrow represents the response coming back. A sequence diagram
          only ever describes one scenario at a time &mdash; it complements the class diagram
          rather than replacing it.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          For a &ldquo;place an order&rdquo; scenario: <code>Customer</code> calls
          <code>OrderService.placeOrder()</code>, which calls <code>Inventory.reserve()</code>,
          waits for its response, then calls <code>PaymentService.charge()</code>, waits for that
          response, and finally returns a confirmation back to the Customer. The diagram makes the
          order of these calls &mdash; and which call is waiting on which &mdash; explicit in a way
          a class diagram never could.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram of a sequence with four vertical lifelines for Customer, OrderService, Inventory, and PaymentService, with horizontal arrows stepping downward in call order and dashed arrows showing responses." >
          {["Customer","OrderService","Inventory","Payment"].map((t,i) => (<g key={t}><line x1={40+i*110} y1="20" x2={40+i*110} y2="140" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="3,3" /><text x={40+i*110} y="14" className="figLabel" textAnchor="middle" style={{fontSize:"7px"}}>{t}</text></g>))}
          <line className="flow" x1="40" y1="35" x2="150" y2="35" /><text x="95" y="30" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>placeOrder()</text>
          <line className="flow" x1="150" y1="55" x2="260" y2="55" /><text x="205" y="50" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>reserve()</text>
          <line className="flowMuted" x1="260" y1="72" x2="150" y2="72" />
          <line className="flow" x1="150" y1="90" x2="370" y2="90" /><text x="260" y="85" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>charge()</text>
          <line className="flowMuted" x1="370" y1="107" x2="150" y2="107" />
          <line className="flowMuted" x1="150" y1="125" x2="40" y2="125" /><text x="95" y="120" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>confirmation</text>
        </svg>
        <figcaption>Each arrow's order and direction shows exactly which call waits on which, for one specific scenario.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Trying to use one sequence diagram to describe every possible path through a system,
          instead of one concrete scenario, turns it into an unreadable tangle. Omitting return
          arrows loses exactly the information &mdash; which call is actually blocking on which
          &mdash; that a sequence diagram is best at showing.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a sequence diagram only ever describe one scenario, rather than every path through a system?</p>
        </div>
      </section>
      <p className="takeaway">
        A class diagram tells you the pieces exist; a sequence diagram tells you the order they
        actually talk in for one specific scenario.
      </p>
    </div>
  );
}
