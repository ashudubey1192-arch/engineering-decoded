import "../css/Article.css";

export default function ObjectsAndDataDataAbstractionArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Data abstraction means exposing what an object can do, while hiding how it stores the
          information needed to do it. A well-abstracted object can change its internal
          representation completely without breaking a single caller.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Interface over representation</b> &mdash; callers should depend on what an object exposes (its methods), never on how it stores its fields internally.</li>
          <li><b>Getters and setters are not automatically abstraction</b> &mdash; a class with a getter and setter for every private field has just made its internal representation public with extra steps.</li>
          <li><b>Abstract at the level of the concept</b> &mdash; a good interface asks "what percentage is discounted" rather than "give me the raw discount fraction," matching how a caller actually thinks about the concept.</li>
          <li><b>Changeable internals are the payoff</b> &mdash; good abstraction is what lets you change a field's storage format (say, cents-as-integer instead of dollars-as-float) without touching any calling code.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>Money</code> concept, first exposed as raw fields, then properly
          abstracted:
        </p>
        <span className="codeLabel">LEAKY: CALLERS DEPEND ON REPRESENTATION</span>
        <div className="codeBlock">
          <pre>{`class Money {
  constructor(dollars, cents) {
    this.dollars = dollars;
    this.cents = cents;
  }
}
// every caller has to know the two-field representation:
const total = money.dollars + money.cents / 100;`}</pre>
        </div>
        <span className="codeLabel">ABSTRACTED: CALLERS DEPEND ONLY ON BEHAVIOR</span>
        <div className="codeBlock">
          <pre>{`class Money {
  #totalCents;
  constructor(totalCents) { this.#totalCents = totalCents; }
  toDecimal() { return this.#totalCents / 100; }
  add(other) { return new Money(this.#totalCents + other.#totalCents); }
}
// callers only ever see behavior:
const total = money.toDecimal();`}</pre>
        </div>
        <p>
          When Ledgerly later needed to support currencies with three decimal places (some
          Middle Eastern currencies use fils, 1/1000 of a unit), the second version changed in
          exactly one place &mdash; the internal cents-based storage &mdash; while every caller kept
          working unmodified.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of many callers depending directly on an object's internal fields, all breaking when the representation changes, versus many callers depending only on the object's behavior interface, unaffected when the internal representation changes underneath.">
          <rect className="boxWarn" x="150" y="10" width="120" height="26" rx="4" /><text x="210" y="27" className="boxText" style={{fontSize:"5px"}}>Internal fields exposed</text>
          <rect className="box" x="20" y="60" width="80" height="24" rx="4" /><text x="60" y="75" className="boxText" style={{fontSize:"4.5px"}}>Caller A</text>
          <rect className="box" x="170" y="60" width="80" height="24" rx="4" /><text x="210" y="75" className="boxText" style={{fontSize:"4.5px"}}>Caller B</text>
          <rect className="box" x="320" y="60" width="80" height="24" rx="4" /><text x="360" y="75" className="boxText" style={{fontSize:"4.5px"}}>Caller C</text>
          <line className="flowMuted" x1="60" y1="60" x2="180" y2="36" />
          <line className="flowMuted" x1="210" y1="60" x2="210" y2="36" />
          <line className="flowMuted" x1="360" y1="60" x2="240" y2="36" />
          <text x="210" y="100" className="figHint" style={{fontSize:"5px"}}>representation changes &mdash; all 3 callers break</text>
        </svg>
        <figcaption>Exposed internals become a hidden contract with every caller &mdash; a behavior-only interface avoids that contract entirely.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Auto-generating a getter and setter for every field, out of habit, defeats the purpose
          of abstraction &mdash; it just adds a layer of indirection around the same leaky contract.
          Expose behavior your callers actually need (<code>toDecimal()</code>, <code>add()</code>),
          not a mechanical mirror of every internal field.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did exposing dollars and cents as public fields make it harder to later support currencies with three decimal places?</p>
        </div>
      </section>
      <p className="takeaway">
        Good data abstraction hides representation behind behavior &mdash; callers should be able to
        use an object fully without ever knowing, or depending on, how it stores its data
        internally.
      </p>

    </div>
  );
}
