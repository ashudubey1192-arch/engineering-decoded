import "../css/Article.css";

export default function UmlModelingStateDiagramsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A state diagram is worth drawing for objects whose behavior genuinely depends on
          &ldquo;what mode am I in right now&rdquo; &mdash; an order, a traffic light, a media
          player &mdash; showing every state it can be in and exactly which events move it between
          them.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          States are drawn as boxes or rounded shapes; transitions are labeled arrows showing which
          event moves the object from one state to another. The diagram's real value is often in
          what it deliberately leaves out &mdash; a transition that isn't drawn is a transition that
          isn't allowed, which is exactly the kind of rule that's easy to forget when the same logic
          is buried in scattered if-statements instead.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          An order's states: <code>Placed</code> &rarr; <code>Paid</code> &rarr;
          <code>Shipped</code> &rarr; <code>Delivered</code>, with a <code>Cancelled</code> state
          reachable from <code>Placed</code> or <code>Paid</code> &mdash; but deliberately not from
          <code>Shipped</code> or <code>Delivered</code>, since a shipped order can't simply be
          cancelled without a separate returns process. Drawing the diagram makes that missing
          arrow &mdash; Shipped to Cancelled &mdash; an explicit design decision instead of an
          accident.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of an order moving through Placed, Paid, Shipped, and Delivered states in sequence, with a Cancelled state reachable only from Placed or Paid, not from Shipped or Delivered." >
          {["Placed","Paid","Shipped","Delivered"].map((t,i) => (<rect key={t} className={i===3?"boxAccent":"box"} x={20+i*100} y="20" width="80" height="30" rx="15" />))}
          {["Placed","Paid","Shipped","Delivered"].map((t,i) => (<text key={t} x={60+i*100} y="39" className="boxText" textAnchor="middle" style={{fontSize:"7px"}}>{t}</text>))}
          {[0,1,2].map(i => (<line key={i} className="flow" x1={100+i*100} y1="35" x2={120+i*100} y2="35" />))}
          <rect className="boxWarn" x="120" y="85" width="90" height="30" rx="15" /><text x="165" y="104" className="boxText" style={{fontSize:"7px"}}>Cancelled</text>
          <line className="flowMuted" x1="60" y1="50" x2="140" y2="88" /><line className="flowMuted" x1="160" y1="50" x2="165" y2="82" />
        </svg>
        <figcaption>The diagram makes clear that cancellation is only reachable from Placed or Paid, never from Shipped or Delivered.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Drawing a state diagram for an object that has no meaningfully distinct states adds
          ceremony without payoff. Missing an invalid transition &mdash; allowing
          &ldquo;Delivered&rdquo; to move back to &ldquo;Cancelled&rdquo; simply because nobody
          thought to exclude it &mdash; is the exact class of bug this diagram exists to prevent.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is it significant that this diagram has no arrow from "Shipped" to "Cancelled"?</p>
        </div>
      </section>
      <p className="takeaway">
        A missing arrow in a state diagram is a design decision, not an oversight &mdash; it's
        often the most important information the diagram carries.
      </p>
    </div>
  );
}
