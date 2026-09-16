export default function ObjectDesignEncapsulateVariationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          "Encapsulate what varies" means identifying the part of your code that changes, or is
          likely to change, and isolating it behind a stable interface, so the surrounding code
          never needs to change when that one part does. Strategy, State, and Template Method are
          three different structural answers to the same underlying question this principle asks:
          where, specifically, is the variation, and what stays fixed around it?
        </p>
        <p>
          Applied well, this principle turns "we need to add a fourth tax jurisdiction" from a
          multi-file change into adding one new class.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Isolating variation, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Find the part of the code that changes for reasons unrelated to everything around
            it.</b> A tax calculation that changes because tax law changes, inside a method that
            also validates the order and applies a discount, is doing three unrelated jobs in one
            place.
          </li>
          <li>
            <b>Extract exactly that part behind its own interface.</b>{" "}
            <code>TaxCalculator.calculate(Order)</code>, with nothing about validation or
            discounts leaking into it.
          </li>
          <li>
            <b>Leave everything that doesn't vary where it is.</b> Order validation and discount
            logic don't need extracting just because tax calculation did &mdash; encapsulate only
            what actually varies, not everything nearby.
          </li>
          <li>
            <b>Verify the isolation by imagining the next change.</b> If a new tax jurisdiction
            can be added by writing one new <code>TaxCalculator</code> implementation and
            touching nothing else, the variation is genuinely encapsulated.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="40" width="130" height="60" rx="6" />
            <text className="boxText" x="85" y="65" fontSize="10">Validate</text>
            <text className="figHint" x="85" y="82">stable</text>
            <rect className="boxWarn" x="185" y="40" width="130" height="60" rx="6" />
            <text className="boxText" x="250" y="65" fontSize="10">Tax calc</text>
            <text className="figHint" x="250" y="82">varies by jurisdiction</text>
            <rect className="box" x="350" y="40" width="130" height="60" rx="6" />
            <text className="boxText" x="415" y="65" fontSize="10">Apply discount</text>
            <text className="figHint" x="415" y="82">stable</text>
          </svg>
          <figcaption>Only the middle piece changes for its own reasons &mdash; that's the piece worth isolating behind an interface.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Isolating one varying piece, leaving the rest alone</h2>
        <span className="codeLabel">JAVA &mdash; VARIATION TANGLED WITH STABLE LOGIC</span>
        <div className="codeBlock">
          <pre>{`double total(Order order) {
    validate(order);
    double subtotal = order.subtotal();
    double tax;
    if (order.jurisdiction() == Jurisdiction.CA) tax = subtotal * 0.0725;
    else if (order.jurisdiction() == Jurisdiction.NY) tax = subtotal * 0.08;
    else tax = subtotal * 0.05;
    return applyDiscount(subtotal + tax, order.discountCode());
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; VARIATION ENCAPSULATED</span>
        <div className="codeBlock">
          <pre>{`interface TaxCalculator { double calculate(double subtotal); }
class CaliforniaTax implements TaxCalculator { public double calculate(double s) { return s * 0.0725; } }
class NewYorkTax implements TaxCalculator { public double calculate(double s) { return s * 0.08; } }

double total(Order order, TaxCalculator taxCalculator) {
    validate(order); // untouched -- it never varied
    double subtotal = order.subtotal();
    double tax = taxCalculator.calculate(subtotal); // the only part that varies
    return applyDiscount(subtotal + tax, order.discountCode()); // untouched
}`}</pre>
        </div>
        <p>
          A new jurisdiction is now one new <code>TaxCalculator</code> class &mdash;{" "}
          <code>total()</code> itself never changes again for that reason.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Encapsulating everything, on the theory that anything might vary someday.</b>{" "}
            Wrapping <code>validate()</code> behind an interface too, with no actual variation
            need, is speculative generality dressed up as this principle.
          </li>
          <li>
            <b>Isolating the wrong boundary.</b> If discount logic and tax logic actually change
            together in practice (a jurisdiction-specific discount rule), splitting them into two
            separately-varying pieces can make a single real change touch two places instead of
            one.
          </li>
          <li>
            <b>Stopping at "this could vary" instead of asking "does this actually vary, and how
            often."</b> The cost of encapsulation should be paid for real, observed variation, not
            hypothetical variation.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the refactored <code>total()</code> method leave <code>validate()</code> and <code>applyDiscount()</code> untouched instead of extracting interfaces for them too?</p>
          <p>
            <b>Answer:</b> "Encapsulate what varies" means isolating specifically the part that
            changes for its own reasons &mdash; here, tax calculation, which changes as tax law
            changes. Validation and discount logic weren't shown to vary independently, so
            extracting interfaces for them would add cost without solving an actual problem.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Find the specific piece of logic that changes for its own reasons, isolate exactly that
        piece behind an interface, and leave everything stable around it alone.
      </p>
    </div>
  );
}
