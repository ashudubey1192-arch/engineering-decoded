import "../css/Article.css";

export default function CreationalPatternsBuilderPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Builder separates constructing a complex object from what that object ultimately looks
          like, letting you build it up step by step instead of via one unreadable constructor call.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          It fits objects with many optional fields, where a single constructor accepting every
          combination becomes an unreadable list of positional arguments (or worse, a family of
          overloaded constructors for every combination). A builder exposes one chained method per
          field, ending in a <code>build()</code> call that assembles the final object once every
          desired field has been set.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>Pizza</code> with size, crust, and a variable list of toppings: a constructor
          taking eight positional arguments (several of them optional booleans) is easy to call
          with the wrong value in the wrong position. A <code>PizzaBuilder</code> instead reads as
          <code>new PizzaBuilder().setSize("large").setCrust("thin").addTopping("cheese").build()</code>
          &mdash; every value is explicitly named at the call site, and optional fields can simply
          be left out.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram contrasting a constructor call with eight unlabeled positional arguments against a chained builder call where every value is explicitly named." >
          <rect className="boxWarn" x="20" y="20" width="180" height="30" rx="6" /><text x="110" y="39" className="boxText" style={{fontSize:"6.5px"}}>new Pizza(12, true, false, "thin"...)</text>
          <text x="110" y="65" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>which argument is which?</text>
          <line className="divider" x1="230" y1="10" x2="230" y2="100" />
          <rect className="boxAccent" x="250" y="15" width="150" height="24" rx="5" /><text x="325" y="31" className="boxText" style={{fontSize:"6px"}}>.setSize("large")</text>
          <rect className="boxAccent" x="250" y="42" width="150" height="24" rx="5" /><text x="325" y="58" className="boxText" style={{fontSize:"6px"}}>.setCrust("thin")</text>
          <rect className="boxAccent" x="250" y="69" width="150" height="24" rx="5" /><text x="325" y="85" className="boxText" style={{fontSize:"6px"}}>.addTopping("cheese").build()</text>
        </svg>
        <figcaption>A telescoping constructor call versus a chained builder where every field is named at the point it's set.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for Builder when an object only has two or three simple, always-required fields
          adds ceremony a plain constructor already handled clearly. Reusing the same builder
          instance across multiple threads without care can let one thread's in-progress build get
          corrupted by another's concurrent calls &mdash; builders are rarely designed to be shared.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What specific problem with constructors does Builder solve, and when is that problem not actually present?</p>
        </div>
      </section>
      <p className="takeaway">
        Builder earns its place once a constructor's argument list becomes hard to read or
        remember the order of &mdash; not before.
      </p>
    </div>
  );
}
