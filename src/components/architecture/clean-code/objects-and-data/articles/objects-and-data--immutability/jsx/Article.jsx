import "../css/Article.css";

export default function ObjectsAndDataImmutabilityArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          An immutable object cannot be changed after it is created &mdash; any "modification"
          returns a new object instead. This sounds wasteful, but it eliminates an entire class
          of bugs caused by code that unexpectedly shares and mutates the same object.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>No surprise mutation</b> &mdash; if an object cannot change, passing it to a function can never result in the caller's copy being silently altered.</li>
          <li><b>Safe to share freely</b> &mdash; an immutable object can be passed around, cached, or used as a map key without defensive copying, because nothing can invalidate it later.</li>
          <li><b>Thread-safety for free</b> &mdash; an object that never changes after construction cannot have a data race, regardless of how many places read it concurrently.</li>
          <li><b>Value objects are natural candidates</b> &mdash; things defined entirely by their value, like <code>Money</code> or a date range, are usually a better fit for immutability than entities with a long-lived identity, like an <code>Invoice</code> that legitimately changes status over its life.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A bug caused by mutable <code>Money</code> sharing, and the immutable fix:
        </p>
        <span className="codeLabel">MUTABLE: SHARED REFERENCE BUG</span>
        <div className="codeBlock">
          <pre>{`class Money {
  constructor(cents) { this.cents = cents; }
  addInPlace(other) { this.cents += other.cents; return this; }
}
const lineItemPrice = new Money(500);
const runningTotal = lineItemPrice; // same object, not a copy!
runningTotal.addInPlace(new Money(200));
console.log(lineItemPrice.cents); // 700 — the original price mutated too`}</pre>
        </div>
        <span className="codeLabel">IMMUTABLE: NO SHARED-MUTATION RISK</span>
        <div className="codeBlock">
          <pre>{`class Money {
  #cents;
  constructor(cents) { this.#cents = cents; }
  add(other) { return new Money(this.#cents + other.#cents); } // returns new instance
  get cents() { return this.#cents; }
}
const lineItemPrice = new Money(500);
const runningTotal = lineItemPrice.add(new Money(200));
console.log(lineItemPrice.cents); // 500 — untouched, as expected`}</pre>
        </div>
        <p>
          The mutable version's bug had nothing to do with the addition logic itself &mdash; it was
          caused entirely by <code>runningTotal</code> and <code>lineItemPrice</code> secretly
          being the same object. Immutability makes that entire category of bug structurally
          impossible.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of two variables pointing at one mutable object, where changing one silently changes the other, versus two variables each pointing at their own separate immutable object after an add operation, where nothing is silently shared.">
          <text x="105" y="15" className="figLabel" style={{fontSize:"5px"}}>Mutable: shared reference</text>
          <rect className="boxWarn" x="60" y="25" width="90" height="30" rx="5" /><text x="105" y="44" className="boxText" style={{fontSize:"5px"}}>Money(700)</text>
          <text x="20" y="45" className="figHint" style={{fontSize:"4.5px"}}>lineItemPrice</text>
          <text x="160" y="45" className="figHint" style={{fontSize:"4.5px"}}>runningTotal</text>
          <line className="flowMuted" x1="60" y1="40" x2="35" y2="40" /><line className="flowMuted" x1="150" y1="40" x2="175" y2="40" />
          <text x="315" y="15" className="figLabel" style={{fontSize:"5px"}}>Immutable: separate objects</text>
          <rect className="box" x="260" y="25" width="80" height="26" rx="4" /><text x="300" y="42" className="boxText" style={{fontSize:"5px"}}>Money(500)</text>
          <rect className="boxAccent" x="345" y="60" width="70" height="26" rx="4" /><text x="380" y="77" className="boxText" style={{fontSize:"5px"}}>Money(700)</text>
          <line className="flow" x1="300" y1="51" x2="380" y2="60" />
        </svg>
        <figcaption>Mutable sharing lets one variable's change silently reach another; immutability makes "add" produce a distinct new object every time.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Making every object in a system immutable, including entities that legitimately have
          a changing lifecycle (an <code>Invoice</code> moving from draft to sent to paid),
          leads to awkward code that recreates a whole object graph for every state change.
          Reserve immutability for value objects; let entities with real identity and lifecycle
          change through clear, intentional methods instead.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the mutable Money bug have nothing to do with the correctness of the addInPlace logic itself?</p>
        </div>
      </section>
      <p className="takeaway">
        Immutability trades a small amount of allocation for eliminating an entire category of
        shared-mutation bugs &mdash; it is a strong default for value objects like Money, and a
        poor fit for long-lived entities with real state transitions.
      </p>

    </div>
  );
}
