import "../css/Article.css";

export default function ArchitecturePatternsChoreographyVsOrchestrationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          When a business process spans several services, two different coordination styles decide
          who's actually in charge &mdash; orchestration, where one central coordinator directs every
          step, versus choreography, where each service reacts to events and no single place holds
          the whole picture.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Orchestration</h3>
            <p>A central orchestrator explicitly calls each service in sequence and tracks the process's state itself &mdash; the whole flow is visible in one place, but that orchestrator becomes a central dependency.</p>
          </div>
          <div>
            <h3>Choreography</h3>
            <p>Each service publishes an event when it finishes its part, and others independently subscribe and react &mdash; no single point of coordination, but no single place to see the whole process either.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Via orchestration, an <code>OrderOrchestrator</code> explicitly calls
          <code>PaymentService</code>, then <code>InventoryService</code>, then
          <code>ShippingService</code> in sequence, tracking state itself. Via choreography,
          <code>CheckoutService</code> emits <code>OrderPlaced</code>; <code>PaymentService</code>
          reacts and emits <code>PaymentCompleted</code>; <code>InventoryService</code> reacts to
          that and emits <code>ItemsReserved</code>; <code>ShippingService</code> reacts and ships
          &mdash; nobody orchestrates it, each service just reacts to the last event.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 160" role="img" aria-label="Side-by-side comparison of orchestration, where a central orchestrator explicitly directs Payment, Inventory, and Shipping in sequence, against choreography, where the same three services each react independently to events with no central coordinator.">
          <text x="105" y="18" className="figLabel">ORCHESTRATION</text>
          <rect className="boxAccent" x="65" y="30" width="80" height="24" rx="5" />
          <text x="105" y="46" className="boxText" style={{fontSize:"5.5px"}}>Orchestrator</text>
          {["Payment","Inventory","Shipping"].map((t,i) => (
            <g key={t}>
              <rect className="box" x={20 + i*55} y="85" width="48" height="24" rx="4" />
              <text x={44 + i*55} y="101" className="boxText" style={{fontSize:"4.8px"}}>{t}</text>
              <line className="flow" x1="105" y1="54" x2={44 + i*55} y2="83" />
            </g>
          ))}
          <line className="divider" x1="215" y1="10" x2="215" y2="150" />
          <text x="315" y="18" className="figLabel">CHOREOGRAPHY</text>
          {["Payment","Inventory","Shipping"].map((t,i) => (
            <g key={t}>
              <rect className="box" x={240 + i*55} y="60" width="48" height="24" rx="4" />
              <text x={264 + i*55} y="76" className="boxText" style={{fontSize:"4.8px"}}>{t}</text>
              {i < 2 && <line className="flow" x1={288 + i*55} y1="72" x2={295 + i*55} y2="72" />}
            </g>
          ))}
          <text x="315" y="105" className="figHint" style={{fontSize:"5.5px"}}>each reacts to the previous event &mdash; no central box</text>
        </svg>
        <figcaption>Orchestration keeps one box in charge of the whole sequence; choreography has each service react to the last event with nobody in overall charge.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using orchestration for a process, then also letting services react to each other's events
          on the side, bypassing the orchestrator, creates two competing sources of truth for what
          should happen next. Using choreography for a complex process with many steps and
          conditional branches makes the overall flow nearly impossible to see in one place &mdash;
          nobody owns the whole picture, and debugging "why didn't the order ship" means
          reconstructing the story from events scattered across many services' logs.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A choreographed order flow breaks silently somewhere between PaymentCompleted and ItemsReserved. Why is finding the cause typically harder here than in an orchestrated version of the same flow?</p>
        </div>
      </section>
      <p className="takeaway">
        Orchestration centralizes visibility at the cost of a central dependency; choreography
        removes that central dependency at the cost of visibility &mdash; the right choice depends on
        how complex the process is and how much you need to see its state in one place.
      </p>
    </div>
  );
}
