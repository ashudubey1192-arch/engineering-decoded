export default function BehavioralPatternsStrategyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Strategy defines a family of interchangeable algorithms, encapsulates each one behind a
          common interface, and lets the algorithm be selected and swapped independently of the
          code that uses it. This is the pattern the Course Introduction and Design Patterns
          Roadmap articles both promised: the discount-calculation <code>if/else</code> chain,
          finally rewritten.
        </p>
        <p>
          Intent: define a family of algorithms, encapsulate each one, and make them
          interchangeable at runtime. Applicability: multiple ways of doing the same job exist,
          the choice between them can change at runtime, and a growing conditional is the current
          symptom.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Extracting a strategy, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Find the conditional that selects between interchangeable algorithms.</b> The
            discount method from the Course Introduction article, branching on membership tier.
          </li>
          <li>
            <b>Define a strategy interface capturing what every algorithm has in common.</b>{" "}
            <code>DiscountPolicy.apply(Order)</code>, returning the discounted amount.
          </li>
          <li>
            <b>Implement one class per algorithm.</b> <code>GoldDiscountPolicy</code>,{" "}
            <code>SilverDiscountPolicy</code>, <code>StandardDiscountPolicy</code> &mdash; each
            holding exactly its own rate.
          </li>
          <li>
            <b>Let the calling code hold and swap a strategy, without branching internally.</b> An{" "}
            <code>Order</code> holds a <code>DiscountPolicy</code>, selected once when the
            customer's tier is known, and never branches on tier again.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="120" height="40" rx="6" />
            <text className="boxText" x="80" y="73" fontSize="10">Order</text>
            <line className="flow" x1="140" y1="70" x2="190" y2="70" />
            <rect className="boxAccent" x="190" y="20" width="140" height="35" rx="6" />
            <text className="boxText" x="260" y="42" fontSize="9">GoldDiscountPolicy</text>
            <rect className="boxAccent" x="190" y="65" width="140" height="35" rx="6" />
            <text className="boxText" x="260" y="87" fontSize="9">SilverDiscountPolicy</text>
            <rect className="boxAccent" x="190" y="105" width="140" height="30" rx="6" />
            <text className="boxText" x="260" y="123" fontSize="8">StandardDiscountPolicy</text>
          </svg>
          <figcaption>Order holds exactly one DiscountPolicy at a time; the algorithms themselves live entirely outside Order.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. From a branching method to a swappable strategy</h2>
        <span className="codeLabel">JAVA &mdash; BEFORE</span>
        <div className="codeBlock">
          <pre>{`public double discountFor(Order order, MembershipTier tier) {
    if (tier == MembershipTier.GOLD) return order.total() * 0.20;
    if (tier == MembershipTier.SILVER) return order.total() * 0.10;
    return order.total() * 0.02;
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; AFTER</span>
        <div className="codeBlock">
          <pre>{`interface DiscountPolicy { double apply(Order order); }
class GoldDiscountPolicy implements DiscountPolicy { public double apply(Order o) { return o.total() * 0.20; } }
class SilverDiscountPolicy implements DiscountPolicy { public double apply(Order o) { return o.total() * 0.10; } }
class StandardDiscountPolicy implements DiscountPolicy { public double apply(Order o) { return o.total() * 0.02; } }

class Order {
    private DiscountPolicy discountPolicy; // selected once, held, never branched on again
    void setDiscountPolicy(DiscountPolicy policy) { this.discountPolicy = policy; }
    double discount() { return discountPolicy.apply(this); }
}

order.setDiscountPolicy(new GoldDiscountPolicy());
order.discount(); // 20% -- Order itself has no tier-checking logic at all`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Extracting Strategy for algorithms that never actually vary at runtime.</b> If the
            discount rule is fixed at compile time and never swapped, the interface and classes
            are overhead without a corresponding flexibility need.
          </li>
          <li>
            <b>Selecting the strategy with a conditional that just moved, not disappeared.</b> If
            picking which <code>DiscountPolicy</code> to construct still needs an{" "}
            <code>if</code> chain somewhere, that's fine &mdash; Strategy doesn't eliminate the
            selection logic, it isolates the algorithms themselves; the selection point can even
            become its own small factory.
          </li>
          <li>
            <b>Confusing Strategy with State because both swap behavior via composition.</b>{" "}
            Strategy's variants are independent, interchangeable choices with no inherent order or
            transitions between them; State's variants represent stages of one lifecycle,
            transitioning into each other.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does adding a fourth membership tier now require adding one new class instead of editing <code>Order</code>?</p>
          <p>
            <b>Answer:</b> <code>Order.discount()</code> delegates entirely to whichever{" "}
            <code>DiscountPolicy</code> it currently holds, with no tier-specific logic of its own
            left inside it. A new tier means writing one new <code>DiscountPolicy</code>{" "}
            implementation and selecting it where the customer's tier is determined &mdash;{" "}
            <code>Order</code>'s own code has nothing left to edit.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Strategy when a growing conditional is selecting between genuinely
        interchangeable algorithms &mdash; encapsulate each one behind a shared interface, and let
        the calling code hold and swap strategies instead of branching internally.
      </p>
    </div>
  );
}
