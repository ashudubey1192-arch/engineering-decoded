export default function ObjectDesignOpenClosedDesignArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The Open/Closed Principle says a class should be open for extension but closed for
          modification: adding a new behavior should be possible by adding new code, not by
          editing code that already works and is already tested. This closes the Object Design
          Principles section by tying the previous four articles together &mdash; program to an
          interface, favor composition, encapsulate variation, and loose coupling are the tools;
          open/closed is the goal they're all in service of.
        </p>
        <p>
          The signal that a design violates this principle: a growing <code>switch</code> or{" "}
          <code>if/else if</code> chain that needs a new branch every time a new case shows up.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Getting to open/closed, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Find the code that gets edited every time a new case is added.</b> A{" "}
            <code>calculateShipping()</code> method with one branch per carrier is edited every
            time a new carrier is supported.
          </li>
          <li>
            <b>Extract the varying behavior behind an interface (Encapsulate Variation, applied
            again).</b> <code>ShippingCalculator</code>, with one implementation per carrier.
          </li>
          <li>
            <b>Make the calling code depend only on the interface (Program to an Interface,
            applied again).</b> The dispatch code holds a <code>Map&lt;Carrier,
            ShippingCalculator&gt;</code> or receives the right one injected, instead of branching
            internally.
          </li>
          <li>
            <b>Confirm a new case requires only a new class, and zero edits to existing,
            already-tested files.</b> Adding a new carrier means writing one new{" "}
            <code>ShippingCalculator</code> implementation and registering it &mdash; the dispatch
            logic itself is never touched again.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="180" height="50" rx="8" />
            <text className="boxText" x="110" y="68" fontSize="11">Dispatch logic</text>
            <text className="figHint" x="110" y="85">closed: never edited again</text>
            <line className="flow" x1="200" y1="70" x2="250" y2="70" />
            <rect className="boxAccent" x="250" y="20" width="120" height="35" rx="6" />
            <text className="boxText" x="310" y="42" fontSize="9">FedExCalculator</text>
            <rect className="boxAccent" x="250" y="60" width="120" height="35" rx="6" />
            <text className="boxText" x="310" y="82" fontSize="9">UpsCalculator</text>
            <rect className="boxAccent" x="250" y="100" width="120" height="35" rx="6" fillOpacity="0.5" />
            <text className="boxText" x="310" y="122" fontSize="9">+ new carrier</text>
            <text className="figLabel" x="370" y="14">open: new classes added freely</text>
          </svg>
          <figcaption>Dispatch logic stops changing once it depends on an interface; new behavior arrives as new classes, not edits.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. From an editable chain to an extensible one</h2>
        <span className="codeLabel">JAVA &mdash; CLOSED FOR EXTENSION (EDITED EVERY TIME)</span>
        <div className="codeBlock">
          <pre>{`double calculateShipping(Order order, Carrier carrier) {
    if (carrier == Carrier.FEDEX) return order.weight() * 1.20;
    if (carrier == Carrier.UPS) return order.weight() * 1.15;
    throw new IllegalArgumentException("unsupported carrier"); // edited for every new carrier
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; OPEN FOR EXTENSION</span>
        <div className="codeBlock">
          <pre>{`interface ShippingCalculator { double calculate(Order order); }
class FedExCalculator implements ShippingCalculator { public double calculate(Order o) { return o.weight() * 1.20; } }
class UpsCalculator implements ShippingCalculator { public double calculate(Order o) { return o.weight() * 1.15; } }

class ShippingService {
    private final Map<Carrier, ShippingCalculator> calculators; // registered once, at startup
    double calculateShipping(Order order, Carrier carrier) {
        return calculators.get(carrier).calculate(order); // never edited for a new carrier
    }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Applying open/closed prematurely, before a second case ever shows up.</b> With
            exactly one carrier and no near-term plan for a second, the interface and registration
            machinery is speculative generality &mdash; the same overuse trap the foundations
            section warned about.
          </li>
          <li>
            <b>Treating "closed for modification" as "never edit this file again, ever."</b> Fixing
            an actual bug in the dispatch logic is still legitimate; the principle is about not
            needing to edit it for the routine case of adding a new variant.
          </li>
          <li>
            <b>Forgetting the registration step.</b> A new <code>ShippingCalculator</code> class
            that's never added to the map is dead code &mdash; extension requires both writing the
            new class and wiring it in.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does adding a new carrier to the open/closed version require zero changes to <code>ShippingService.calculateShipping()</code>, while the original version required editing that exact method?</p>
          <p>
            <b>Answer:</b> The original method's own body contained the branching logic for every
            carrier, so a new carrier meant adding a branch inside it. The refactored version
            delegates entirely to whichever <code>ShippingCalculator</code> is registered for a
            given carrier &mdash; the method's own code has no carrier-specific logic left to
            edit, only a lookup.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Open/closed is the payoff of the previous four principles applied together: depend on
        interfaces, encapsulate what varies, compose rather than branch &mdash; and new behavior
        arrives as new code, not edits to code that already works.
      </p>
    </div>
  );
}
