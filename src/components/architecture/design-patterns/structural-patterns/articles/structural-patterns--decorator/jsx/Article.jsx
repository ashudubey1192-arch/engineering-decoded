export default function StructuralPatternsDecoratorArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Decorator attaches additional responsibilities to an object dynamically, by wrapping it
          in another object that implements the same interface, rather than by subclassing. This
          is the pattern the Intent and Applicability article used as its worked example: a
          coffee's optional add-ons, combining freely, without a subclass for every combination.
        </p>
        <p>
          Intent: add responsibilities to an individual object at runtime, without affecting other
          instances of the same class. Applicability: responsibilities need to combine freely and
          be added or removed at runtime, and subclassing every combination would be impractical.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Wrapping instead of subclassing, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define the shared interface both the base object and every decorator implement.</b>{" "}
            <code>Coffee</code>, with a <code>cost()</code> method.
          </li>
          <li>
            <b>Implement the base object with no decoration at all.</b>{" "}
            <code>SimpleCoffee.cost()</code> just returns the base price.
          </li>
          <li>
            <b>Implement each decorator wrapping a <code>Coffee</code>, adding its own
            contribution.</b> <code>MilkDecorator</code> holds a wrapped <code>Coffee</code>,
            calls its <code>cost()</code>, then adds milk's price on top.
          </li>
          <li>
            <b>Stack decorators by wrapping the result of one in another.</b> Any combination, in
            any order, is just nested construction &mdash; no new class needed per combination.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="100" height="45" rx="6" />
            <text className="boxText" x="70" y="77" fontSize="9">SimpleCoffee</text>
            <line className="flow" x1="120" y1="72" x2="170" y2="72" />
            <rect className="boxAccent" x="170" y="50" width="110" height="45" rx="6" />
            <text className="boxText" x="225" y="77" fontSize="9">MilkDecorator</text>
            <line className="flow" x1="280" y1="72" x2="330" y2="72" />
            <rect className="boxAccent" x="330" y="50" width="130" height="45" rx="6" />
            <text className="boxText" x="395" y="77" fontSize="8">ExtraShotDecorator</text>
          </svg>
          <figcaption>Each decorator wraps the previous layer, calling through to it and adding its own contribution &mdash; any stacking order is valid.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Stacking decorators freely</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface Coffee { double cost(); String description(); }

class SimpleCoffee implements Coffee {
    public double cost() { return 2.00; }
    public String description() { return "Coffee"; }
}

abstract class CoffeeDecorator implements Coffee {
    protected final Coffee wrapped;
    CoffeeDecorator(Coffee wrapped) { this.wrapped = wrapped; }
}

class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee wrapped) { super(wrapped); }
    public double cost() { return wrapped.cost() + 0.50; }
    public String description() { return wrapped.description() + " + milk"; }
}
class ExtraShotDecorator extends CoffeeDecorator {
    ExtraShotDecorator(Coffee wrapped) { super(wrapped); }
    public double cost() { return wrapped.cost() + 0.75; }
    public String description() { return wrapped.description() + " + extra shot"; }
}

Coffee order = new ExtraShotDecorator(new MilkDecorator(new SimpleCoffee()));
order.cost(); // 3.25 -- any combination, any order, zero new classes needed`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for Decorator when only one fixed combination is ever needed.</b> If
            every coffee in the system always has milk and never anything else, a single{" "}
            <code>MilkCoffee</code> class is simpler than decorator machinery for a combination
            that never varies.
          </li>
          <li>
            <b>Letting a decorator depend on which other decorators are stacked around it.</b> A
            decorator should work correctly regardless of stacking order or which other
            decorators are present &mdash; depending on specific neighbors breaks that
            independence.
          </li>
          <li>
            <b>Confusing Decorator with Proxy.</b> Both wrap an object behind the same interface,
            but Decorator adds new responsibility, while Proxy (later in this section) controls
            access to the same responsibility &mdash; a subtle but real difference in intent.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>new ExtraShotDecorator(new MilkDecorator(new SimpleCoffee()))</code> avoid needing a dedicated <code>MilkExtraShotCoffee</code> class?</p>
          <p>
            <b>Answer:</b> Each decorator only knows how to add its own contribution on top of
            whatever <code>Coffee</code> it wraps &mdash; it never needs to know the full chain.
            Nesting decorators combines their effects through composition at construction time,
            so any combination is expressible by nesting constructors differently, without a new
            class per combination.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Decorator when responsibilities need to combine freely at runtime &mdash; each
        decorator wraps the same shared interface and adds exactly one contribution, letting any
        combination be built by nesting rather than subclassing.
      </p>
    </div>
  );
}
