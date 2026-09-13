import "../css/Article.css";

export default function LldCaseStudiesDesignAnElevatorSystemArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An elevator's behavior is fundamentally state-driven &mdash; idle, moving up, moving
          down, doors open &mdash; making this a direct, practical application of the State pattern
          from earlier in the course.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: multiple elevators, external up/down calls from a floor, internal floor
          requests from inside a car, and dispatching the best elevator for a given call.
          Candidate classes: <code>Elevator</code> (holds a current state object, current floor,
          and direction), <code>ElevatorController</code> (decides which elevator answers a call),
          and <code>Request</code> (a floor plus a direction). Each elevator's own states
          &mdash; <code>IdleState</code>, <code>MovingUpState</code>, <code>MovingDownState</code>,
          <code>DoorsOpenState</code> &mdash; each define what a new floor request actually means
          while that elevator is in that state.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A rider presses &ldquo;up&rdquo; on floor 3.</b> ElevatorController picks the best
            candidate &mdash; often the nearest idle elevator, or one already moving up toward that
            floor.</li>
          <li><b>The chosen Elevator's current state object handles the request.</b> An idle
            elevator transitions to MovingUpState; one already moving up just queues the new floor.</li>
          <li><b>The elevator reaches floor 3</b> and transitions to DoorsOpenState.</li>
          <li><b>After a timeout,</b> it returns to IdleState, or continues to any other floors
            still queued.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of an ElevatorController dispatching a floor call to one of several elevators, each of which delegates the request to whichever state object it currently holds." >
          <rect className="boxAccent" x="20" y="45" width="130" height="30" rx="6" /><text x="85" y="64" className="boxText" style={{fontSize:"7px"}}>ElevatorController</text>
          <line className="flow" x1="150" y1="60" x2="190" y2="60" />
          {["Elevator A","Elevator B"].map((t,i) => (<rect key={t} className="box" x="195" y={15+i*50} width="100" height="26" rx="5" />))}
          {["Elevator A","Elevator B"].map((t,i) => (<text key={t} x="245" y={32+i*50} className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>{t}</text>))}
          {[0,1].map(i => (<line key={i} className="flowMuted" x1="295" y1={28+i*50} x2="330" y2={28+i*50} />))}
          <rect className="box" x="335" y="15" width="70" height="26" rx="5" /><text x="370" y="32" className="boxText" style={{fontSize:"6px"}}>MovingUp</text>
          <rect className="box" x="335" y="65" width="70" height="26" rx="5" /><text x="370" y="82" className="boxText" style={{fontSize:"6px"}}>Idle</text>
        </svg>
        <figcaption>The controller only dispatches the call; each elevator's own current state decides what handling it actually means.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Modeling elevator movement as a single boolean plus a pile of if-checks, instead of real
          state objects, quickly becomes unmanageable as more states and edge cases appear. Letting
          the ElevatorController reach into an Elevator's internals to decide things the Elevator
          itself should own breaks the boundary between dispatching and per-elevator behavior.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an idle elevator and an already-moving-up elevator handle the same new floor request differently?</p>
        </div>
      </section>
      <p className="takeaway">
        The elevator's own behavior belongs to whichever state object it currently holds; the
        controller's only job is deciding which elevator gets the call.
      </p>
    </div>
  );
}
