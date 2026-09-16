export default function ObjectDesignFavorCompositionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          "Favor composition over inheritance" means building behavior by holding a reference to
          another object and delegating to it, rather than by extending a base class. Inheritance
          fixes a relationship at compile time, for the object's entire lifetime; composition lets
          it be assembled, swapped, and reasoned about piece by piece. This principle underlies
          Decorator, Strategy, and Bridge directly &mdash; each one is composition applied to a
          different kind of variation.
        </p>
        <p>
          The classic warning sign is an inheritance hierarchy that grows combinatorially: one
          subclass per combination of behaviors, rather than one class per behavior.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Recognizing when composition wins, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Count how many combinations inheritance would require.</b> A{" "}
            <code>Coffee</code> with optional milk, extra shot, and syrup, via subclassing, needs
            a subclass for every combination &mdash; up to eight, for three independent options.
          </li>
          <li>
            <b>Ask whether the "is-a" relationship is actually true, or just convenient.</b> A{" "}
            <code>MilkCoffee extends Coffee</code> is a real is-a relationship; a{" "}
            <code>LoggingRepository extends Repository</code> to sneak in logging usually isn't
            &mdash; logging isn't a kind of repository.
          </li>
          <li>
            <b>Replace the hierarchy with one class holding references to its collaborators.</b>{" "}
            A <code>Coffee</code> holding a list of <code>Addon</code> objects, each contributing
            its own price and description, replaces all eight subclasses with one class and three
            small addon types.
          </li>
          <li>
            <b>Keep inheritance for genuine is-a relationships with stable, shared behavior.</b>{" "}
            Composition isn't a blanket replacement for inheritance &mdash; it's the better choice
            specifically when variation needs to combine or change at runtime.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="20" width="200" height="120" rx="8" />
            <text className="figLabel" x="120" y="14">inheritance: combinatorial</text>
            <text className="boxText" x="120" y="45" fontSize="9">Coffee</text>
            <text className="boxText" x="120" y="65" fontSize="8">MilkCoffee</text>
            <text className="boxText" x="120" y="80" fontSize="8">MilkExtraShotCoffee</text>
            <text className="boxText" x="120" y="95" fontSize="8">MilkExtraShotSyrupCoffee</text>
            <text className="boxText" x="120" y="110" fontSize="8">...5 more subclasses</text>
            <rect className="boxAccent" x="280" y="20" width="200" height="120" rx="8" />
            <text className="figLabel" x="380" y="14">composition: linear</text>
            <text className="boxText" x="380" y="50" fontSize="10">Coffee</text>
            <text className="figHint" x="380" y="68">holds List&lt;Addon&gt;</text>
            <text className="boxText" x="380" y="90" fontSize="9">Milk, ExtraShot, Syrup</text>
            <text className="figHint" x="380" y="108">any combination, no new class</text>
          </svg>
          <figcaption>Three independent options: eight subclasses via inheritance, or three small classes plus one list via composition.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Replacing a subclass explosion with composition</h2>
        <span className="codeLabel">JAVA &mdash; INHERITANCE, GROWING COMBINATORIALLY</span>
        <div className="codeBlock">
          <pre>{`class Coffee { double cost() { return 2.00; } }
class MilkCoffee extends Coffee { double cost() { return super.cost() + 0.50; } }
class MilkExtraShotCoffee extends MilkCoffee { double cost() { return super.cost() + 0.75; } }
// a fourth optional add-on doubles the subclass count again`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; COMPOSITION</span>
        <div className="codeBlock">
          <pre>{`interface Addon { double price(); String label(); }
class Milk implements Addon { public double price() { return 0.50; } public String label() { return "milk"; } }
class ExtraShot implements Addon { public double price() { return 0.75; } public String label() { return "extra shot"; } }

class Coffee {
    private final List<Addon> addons = new ArrayList<>();
    void add(Addon addon) { addons.add(addon); }
    double cost() { return 2.00 + addons.stream().mapToDouble(Addon::price).sum(); }
}
// a fourth addon is one new class, not a doubling of the hierarchy`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Using inheritance purely for code reuse, with no real is-a relationship.</b>{" "}
            Extending a class just to inherit a few methods, when the subclass isn't genuinely a
            kind of the parent, is the exact anti-pattern this principle warns against.
          </li>
          <li>
            <b>Over-applying composition where a stable, simple is-a relationship already exists.</b>{" "}
            A <code>SavingsAccount extends Account</code> with genuinely shared, stable behavior
            doesn't need to be flattened into composition just because the principle says
            "favor" it.
          </li>
          <li>
            <b>Missing that composition requires deliberate delegation code.</b> Unlike
            inheritance, composition doesn't give you the collaborator's methods for free &mdash;
            each one you want to expose needs an explicit delegating method.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does adding a fourth optional add-on to the composition-based <code>Coffee</code> cost one new class, while the inheritance version's subclass count would double?</p>
          <p>
            <b>Answer:</b> With composition, each add-on is an independent <code>Addon</code>{" "}
            implementation held in a list &mdash; adding one more option means adding one more
            class. With inheritance, each combination of options needs its own subclass, so every
            new independent option multiplies the number of subclasses needed to represent every
            combination.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for composition when behavior needs to combine or vary independently &mdash;
        inheritance still earns its place for genuine, stable is-a relationships, but a growing
        subclass count for every new combination is the signal to switch.
      </p>
    </div>
  );
}
