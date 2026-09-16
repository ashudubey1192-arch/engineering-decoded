export default function TacticalModelingValueObjectsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A value object is defined entirely by its attributes, has no identity of its own, and is
          immutable. <code>Money</code>, <code>Deadline</code>, and <code>Route</code> are all
          value objects at Cargoflow &mdash; two <code>Money</code> instances holding $50 USD are
          simply equal, interchangeable, and neither one is "the original."
        </p>
        <p>
          Value objects are the workhorse of a rich domain model: most of the small, precise types
          in a well-modeled system are value objects, not entities.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The three properties that define a value object</h2>
        <ol className="stepList">
          <li>
            <b>Equality by value.</b> Two <code>Money</code> objects with the same amount and
            currency are equal, full stop &mdash; there is no identity field to compare instead.
          </li>
          <li>
            <b>Immutability.</b> A <code>Money</code> object never changes after construction; an
            operation like <code>plus()</code> returns a new instance rather than mutating the
            original.
          </li>
          <li>
            <b>Replaceability.</b> Anywhere a <code>Money</code> value is used, it can be freely
            swapped for another equal one with no observable difference.
          </li>
        </ol>
        <div className="twoCol">
          <div>
            <h3>Entity</h3>
            <p>Has identity. Mutable over its lifetime. "The same one" persists through change.</p>
          </div>
          <div>
            <h3>Value object</h3>
            <p>No identity. Immutable. "Equal" is the only relationship that matters, not "same instance."</p>
          </div>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="40" width="150" height="60" rx="8" />
            <text className="boxText" x="105" y="65">Money($50, USD)</text>
            <text className="figHint" x="105" y="85">instance A</text>
            <rect className="boxAccent" x="380" y="40" width="150" height="60" rx="8" />
            <text className="boxText" x="455" y="65">Money($50, USD)</text>
            <text className="figHint" x="455" y="85">instance B</text>
            <text className="figLabel" x="290" y="75">==</text>
          </svg>
          <figcaption>Two distinct objects in memory, but equal and fully interchangeable &mdash; the essence of a value object.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Money, immutable and equal by value</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money plus(Money other) {
        requireSameCurrency(other);
        return new Money(amount.add(other.amount), currency); // new instance, never mutates
    }

    @Override
    public boolean equals(Object other) {
        if (!(other instanceof Money that)) return false;
        return amount.equals(that.amount) && currency.equals(that.currency); // value equality
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
}`}</pre>
        </div>
        <p>
          Java's <code>record</code> type gives all three properties for free when the fields are
          themselves immutable, which is why many of Cargoflow's simpler value objects, like
          <code> ShipmentId</code> and <code>Deadline</code>, are declared as records.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Adding a setter to a value object.</b> The moment <code>Money</code> has a
            <code> setAmount()</code>, every caller holding a reference risks having it change
            underneath them &mdash; immutability is not optional, it is the point.
          </li>
          <li>
            <b>Giving a value object an id field "just in case."</b> That silently turns it into
            an entity and defeats the interchangeability that made it useful.
          </li>
          <li>
            <b>Using primitives (a raw <code>BigDecimal</code>, a raw <code>String</code>) where a
            value object belongs.</b> A raw <code>BigDecimal</code> for money has no currency and
            no arithmetic safety; wrapping it is what prevents adding USD to EUR by accident.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>Money.plus()</code> return a new object instead of modifying <code>this</code>?</p>
          <p>
            <b>Answer:</b> Value objects are immutable by definition. Mutating in place would let
            other code holding a reference to the same object see its value change unexpectedly
            &mdash; returning a new instance is what keeps value objects safe to share freely.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Model anything defined purely by its attributes &mdash; money, dates, routes, addresses
        &mdash; as an immutable value object, not a primitive and not an entity.
      </p>
    </div>
  );
}
