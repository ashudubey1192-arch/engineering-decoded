export default function CreationalPatternsAbstractFactoryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Abstract Factory provides an interface for creating families of related objects without
          specifying their concrete classes &mdash; where Factory Method builds one product,
          Abstract Factory builds a whole matched set, guaranteeing the set stays internally
          consistent. The classic example is UI toolkits: a <code>Button</code>,{" "}
          <code>Checkbox</code>, and <code>Scrollbar</code> must all come from the same visual
          theme, never mixed.
        </p>
        <p>
          Intent: create families of related objects, guaranteeing they're compatible with each
          other. Applicability: a system needs to work with multiple families of related products,
          and must never mix members from different families.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a family, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the family: which products must always be created together.</b> A{" "}
            <code>Button</code> and <code>Checkbox</code> both rendered in "Dark" theme, never one
            Dark and one Light.
          </li>
          <li>
            <b>Define one abstract factory interface with one method per product in the
            family.</b> <code>UiFactory</code> with <code>createButton()</code> and{" "}
            <code>createCheckbox()</code>, both returning the shared product interfaces.
          </li>
          <li>
            <b>Implement one concrete factory per family variant.</b>{" "}
            <code>DarkUiFactory</code> and <code>LightUiFactory</code>, each producing only its
            own theme's components.
          </li>
          <li>
            <b>Select the concrete factory once, then let it guarantee consistency for the rest of
            the object's lifetime.</b> Choosing <code>DarkUiFactory</code> at startup means every
            component built from it is structurally guaranteed to match &mdash; there's no code
            path that could accidentally mix themes.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="10" width="140" height="35" rx="6" />
            <text className="boxText" x="250" y="32" fontSize="10">UiFactory</text>
            <line className="flow" x1="220" y1="45" x2="120" y2="80" />
            <line className="flow" x1="280" y1="45" x2="380" y2="80" />
            <rect className="box" x="50" y="80" width="140" height="35" rx="6" />
            <text className="boxText" x="120" y="102" fontSize="9">DarkUiFactory</text>
            <rect className="box" x="310" y="80" width="140" height="35" rx="6" />
            <text className="boxText" x="380" y="102" fontSize="9">LightUiFactory</text>
            <line className="flowMuted" x1="120" y1="115" x2="80" y2="145" />
            <line className="flowMuted" x1="120" y1="115" x2="160" y2="145" />
            <text className="figHint" x="80" y="150" fontSize="8">DarkButton</text>
            <text className="figHint" x="160" y="150" fontSize="8">DarkCheckbox</text>
          </svg>
          <figcaption>Each concrete factory produces only its own theme's products &mdash; mixing is structurally impossible, not just avoided by convention.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Guaranteeing a matched family</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface Button { void render(); }
interface Checkbox { void render(); }

interface UiFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class DarkUiFactory implements UiFactory {
    public Button createButton() { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}
class LightUiFactory implements UiFactory {
    public Button createButton() { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}

// selected once; every component built afterward is guaranteed consistent
UiFactory factory = darkModeEnabled ? new DarkUiFactory() : new LightUiFactory();
Button button = factory.createButton();
Checkbox checkbox = factory.createCheckbox(); // impossible to be a different theme than button`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for Abstract Factory with only one product in the family.</b> A single
            product per variant is Factory Method's job; Abstract Factory earns its extra
            structure specifically when multiple products must travel together.
          </li>
          <li>
            <b>Letting call sites construct one product from the factory and another with
            <code>new</code> directly.</b> That reintroduces the exact mixing risk the pattern
            exists to prevent.
          </li>
          <li>
            <b>Adding a new product to the family without updating every existing concrete
            factory.</b> Every implementation of <code>UiFactory</code> must implement the new
            method &mdash; a real maintenance cost that grows with the number of family variants.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is it structurally impossible for <code>factory.createButton()</code> and <code>factory.createCheckbox()</code> to return components from different themes, given <code>factory</code> is a single <code>DarkUiFactory</code> instance?</p>
          <p>
            <b>Answer:</b> Both methods are implemented on the same concrete factory class, and{" "}
            <code>DarkUiFactory</code> only ever constructs Dark-themed components internally.
            Since there's no code path where <code>createButton()</code> could reach for a Light
            component, the two calls are guaranteed to produce a consistent family by
            construction, not by a convention someone has to remember to follow.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Abstract Factory when multiple related products must always travel together
        &mdash; it turns "remember to keep these consistent" into a guarantee the type system
        enforces.
      </p>
    </div>
  );
}
