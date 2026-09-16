export default function PatternSelectionCombinePatternsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Real systems rarely use exactly one pattern in isolation &mdash; patterns commonly
          combine, with one pattern's participant filling a role that another pattern also needs.
          Recognizing which combinations are natural, and which are just accumulated complexity,
          is part of using patterns well.
        </p>
        <p>
          A combination is worth it when each pattern is solving a distinct, real problem in the
          same design; it's a warning sign when patterns are stacked because they seem
          sophisticated together, not because each one is individually earning its place.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Recognizing natural combinations, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Look for a role one pattern needs that another pattern's output fills.</b> Abstract
            Factory produces families of related objects; those objects are very often accessed
            afterward through a Facade that hides the factory and the subsystem behind one
            simple call.
          </li>
          <li>
            <b>Check that each pattern still has an independent justification.</b> Strategy
            varies an algorithm; Factory Method can be the thing that decides which Strategy
            instance to hand back &mdash; each pattern solves a distinct problem (varying
            behavior; deciding which variant to construct) rather than duplicating the other's
            job.
          </li>
          <li>
            <b>Watch for Composite and Visitor appearing together.</b> A classic, well-documented
            pairing: Composite structures a tree uniformly, and Visitor adds new operations
            across that tree without modifying every node class &mdash; each pattern's intent is
            distinct and complementary.
          </li>
          <li>
            <b>Stop combining once a new pattern isn't solving a problem the others don't already cover.</b>{" "}
            Three patterns solving three real problems is not automatically worse than one
            pattern solving one problem &mdash; but a fourth pattern added out of habit, not
            need, is a real cost with no matching benefit.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="130" height="30" rx="5" />
            <text className="boxText" x="85" y="39" fontSize="8">Composite (tree)</text>
            <line className="flow" x1="85" y1="50" x2="85" y2="80" />
            <rect className="boxAccent" x="20" y="80" width="130" height="30" rx="5" />
            <text className="boxText" x="85" y="99" fontSize="8">Visitor (new ops)</text>
            <text className="figHint" x="180" y="40">structure and operations</text>
            <text className="figHint" x="180" y="55">are separate, distinct concerns</text>
            <text className="figHint" x="180" y="95">-- each pattern owns one</text>
          </svg>
          <figcaption>Composite and Visitor combine naturally because each solves a genuinely different part of the same problem.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Two patterns combining to solve two distinct problems</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Factory Method decides which Strategy to hand back -- two distinct problems, one design
interface ShippingCostStrategy { BigDecimal calculate(Order order); }

class StandardShippingStrategy implements ShippingCostStrategy {
    public BigDecimal calculate(Order order) { return new BigDecimal("5.00"); }
}
class ExpressShippingStrategy implements ShippingCostStrategy {
    public BigDecimal calculate(Order order) { return new BigDecimal("15.00"); }
}

abstract class ShippingCostStrategyFactory { // Factory Method: which strategy to construct
    abstract ShippingCostStrategy create(Order order);
}
class DefaultShippingCostStrategyFactory extends ShippingCostStrategyFactory {
    ShippingCostStrategy create(Order order) { // decision logic lives here, not in the strategies
        return order.isExpedited() ? new ExpressShippingStrategy() : new StandardShippingStrategy();
    }
}

// Usage: Factory Method's job is deciding; Strategy's job is varying the calculation itself
ShippingCostStrategyFactory factory = new DefaultShippingCostStrategyFactory();
ShippingCostStrategy strategy = factory.create(order); // decision
BigDecimal cost = strategy.calculate(order);            // varying behavior`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Stacking patterns because the combination looks sophisticated.</b> Adding a
            Decorator around a Strategy around a Factory Method output, when only one of the
            three is actually solving a real problem in this specific code, is complexity without
            payoff.
          </li>
          <li>
            <b>Failing to check whether two patterns are solving the same problem twice.</b> A
            Strategy interface and a parallel State machine both trying to control the same
            piece of behavior usually means one of them is redundant.
          </li>
          <li>
            <b>Assuming a "classic" combination (like Composite + Visitor) is automatically
            justified here.</b> A well-known combination is still only worth using if this
            specific codebase has both of the underlying problems it addresses.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>In the shipping example, what distinct problem does the Factory Method solve that Strategy alone does not?</p>
          <p>
            <b>Answer:</b> Strategy solves "how do different shipping calculations vary" &mdash;
            each <code>ShippingCostStrategy</code> implementation encapsulates one calculation.
            But something still has to decide <i>which</i> strategy applies to a given order.
            That decision logic is a separate concern, and the Factory Method (
            <code>DefaultShippingCostStrategyFactory.create()</code>) is what owns it, keeping
            the decision out of the strategies themselves and out of the calling code.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Patterns combine naturally when each one solves a genuinely distinct problem in the same
        design &mdash; the test for whether a combination is justified is whether every pattern
        in it still has its own independent reason to exist.
      </p>
    </div>
  );
}
