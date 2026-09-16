export default function RefactoringToPatternsReplaceInheritanceWithCompositionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Replace Inheritance with Composition takes a subclass that only exists to override one
          or two methods, or that inherits behavior it doesn't actually want, and restructures it
          to hold the varying behavior as a field instead &mdash; the same "favor composition"
          principle from Object Design, applied as a concrete refactoring to existing code.
        </p>
        <p>
          Applicability: a class hierarchy is being extended just to vary one piece of behavior,
          producing subclasses that share little else, or a subclass needs to reject or override
          most of what its parent provides &mdash; a sign the "is-a" relationship inheritance
          implies doesn't actually hold.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The refactoring, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the piece of behavior that varies across subclasses.</b> A{" "}
            <code>Bird</code> base class with a <code>fly()</code> method, overridden by{" "}
            <code>Penguin</code> to throw an exception &mdash; the real variation is "can this
            bird fly," not the bird itself.
          </li>
          <li>
            <b>Extract that behavior into its own interface.</b> A <code>FlightBehavior</code>{" "}
            interface with <code>fly()</code>, implemented separately by{" "}
            <code>CanFly</code> and <code>CannotFly</code>.
          </li>
          <li>
            <b>Hold the behavior as a field instead of inheriting it.</b> <code>Bird</code>{" "}
            gets a <code>FlightBehavior</code> field, set differently per bird instance rather
            than fixed by subclassing.
          </li>
          <li>
            <b>Delete the subclass hierarchy the behavior used to justify.</b> Once{" "}
            <code>Penguin</code> is just a <code>Bird</code> constructed with{" "}
            <code>CannotFly</code>, the separate <code>Penguin</code> subclass (and its awkward
            override) is no longer needed.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="20" width="110" height="30" rx="5" />
            <text className="boxText" x="75" y="39" fontSize="8">Bird.fly()</text>
            <line className="flow" x1="75" y1="50" x2="75" y2="75" />
            <rect className="boxWarn" x="20" y="75" width="110" height="30" rx="5" />
            <text className="boxText" x="75" y="94" fontSize="7">Penguin overrides: throw</text>
            <line className="flow" x1="150" y1="60" x2="220" y2="60" />
            <rect className="boxAccent" x="220" y="20" width="120" height="30" rx="5" />
            <text className="boxText" x="280" y="39" fontSize="8">Bird has-a FlightBehavior</text>
            <rect className="box" x="220" y="75" width="120" height="30" rx="5" />
            <text className="boxText" x="280" y="94" fontSize="8">CannotFly (a value, not a subclass)</text>
          </svg>
          <figcaption>Flight moves from an inherited, overridden method to a swappable field &mdash; no subclass needed to express "can't fly."</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Before and after</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Before: Penguin inherits fly() only to reject it -- a sign the hierarchy is wrong
class Bird {
    void fly() { System.out.println("flying"); }
}
class Penguin extends Bird {
    @Override void fly() { throw new UnsupportedOperationException("penguins can't fly"); }
}

// After: flight is a field, not an inherited method
interface FlightBehavior { void fly(); }
class CanFly implements FlightBehavior {
    public void fly() { System.out.println("flying"); }
}
class CannotFly implements FlightBehavior {
    public void fly() { System.out.println("staying on the ground"); } // no exception needed
}

class Bird {
    private final FlightBehavior flightBehavior;
    Bird(FlightBehavior flightBehavior) { this.flightBehavior = flightBehavior; }
    void fly() { flightBehavior.fly(); }
}

Bird eagle = new Bird(new CanFly());
Bird penguin = new Bird(new CannotFly()); // no subclass, no thrown exception, no special case`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Refactoring a hierarchy where every subclass genuinely shares the parent's full contract.</b>{" "}
            If every subclass legitimately supports every inherited method, the hierarchy isn't
            the problem &mdash; forcing composition onto it just adds indirection.
          </li>
          <li>
            <b>Extracting a behavior interface but still using inheritance for everything else.</b>{" "}
            The refactoring targets the specific behavior that varies incorrectly; unrelated,
            genuinely shared behavior can often stay right where it is.
          </li>
          <li>
            <b>Overriding a method to throw an exception as a "temporary" fix instead of refactoring.</b>{" "}
            An overridden method that throws is usually the exact signal that composition, not
            inheritance, is the right relationship &mdash; not something to patch around.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What specifically about the original <code>Penguin extends Bird</code> design signals that inheritance is the wrong tool here?</p>
          <p>
            <b>Answer:</b> <code>Penguin</code> inherits <code>fly()</code> from <code>Bird</code>{" "}
            only to override it with behavior that rejects the call entirely (throwing an
            exception). That's a violation of the substitutability inheritance is supposed to
            guarantee &mdash; code expecting any <code>Bird</code> to fly breaks specifically when
            given a <code>Penguin</code>. Composition sidesteps this by making flight a value
            (<code>CanFly</code> or <code>CannotFly</code>) rather than an inherited, sometimes-broken
            method.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Replace Inheritance with Composition turns behavior that varies incorrectly across a
        hierarchy into a field instead &mdash; the tell is a subclass overriding a method just to
        reject or replace what it inherited.
      </p>
    </div>
  );
}
