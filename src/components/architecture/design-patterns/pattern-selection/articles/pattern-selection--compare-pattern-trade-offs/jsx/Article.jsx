export default function PatternSelectionComparePatternTradeOffsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Once a problem points toward more than one plausible pattern, the choice between them
          comes down to comparing what each one costs and protects &mdash; the same forces and
          trade-offs framing from Pattern Foundations, applied to a real decision instead of a
          single pattern in isolation.
        </p>
        <p>
          Two patterns can look like they solve the same problem on the surface while making very
          different bets about what's likely to change next &mdash; the right choice depends on
          which of those bets actually matches the situation.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Comparing candidates, step by step</h2>
        <ol className="stepList">
          <li>
            <b>List every pattern whose intent plausibly matches.</b> A construction problem
            might point to Factory Method, Abstract Factory, or Builder, depending on the exact
            shape of what varies.
          </li>
          <li>
            <b>State what each candidate optimizes for.</b> Factory Method optimizes for one
            product type varying by subclass; Abstract Factory optimizes for whole families of
            related products varying together; Builder optimizes for many optional parameters on
            one product.
          </li>
          <li>
            <b>State what each candidate costs.</b> Abstract Factory adds a full hierarchy of
            factories and products even for a single product family; Builder adds a whole extra
            class for construction that a simple constructor could otherwise handle.
          </li>
          <li>
            <b>Match the trade-off to what's actually varying.</b> If only one product varies,
            Factory Method's smaller footprint wins; if whole families vary together, Abstract
            Factory's structure earns its cost.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="130" height="30" rx="5" />
            <text className="boxText" x="85" y="39" fontSize="8">Factory Method</text>
            <rect className="box" x="20" y="60" width="130" height="30" rx="5" />
            <text className="boxText" x="85" y="79" fontSize="8">Abstract Factory</text>
            <line className="flow" x1="150" y1="35" x2="220" y2="35" />
            <line className="flow" x1="150" y1="75" x2="220" y2="75" />
            <text className="figHint" x="225" y="30">one product varies</text>
            <text className="figHint" x="225" y="70">a family varies together</text>
          </svg>
          <figcaption>Two candidates for "construction varies" split on how much varies together, not on which is generically "better."</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Comparing two candidates against the same problem</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Problem: a UI toolkit needs to create buttons and checkboxes, and every button must be
// paired with a checkbox from the same visual theme (dark theme button with dark theme checkbox).

// Candidate A: Factory Method per widget type -- doesn't capture the pairing constraint
interface ButtonFactory { Button createButton(); }
interface CheckboxFactory { Checkbox createCheckbox(); }
// nothing stops a DarkButtonFactory from being paired with a LightCheckboxFactory by mistake

// Candidate B: Abstract Factory -- captures "these belong together" directly
interface UiFactory {
    Button createButton();
    Checkbox createCheckbox(); // same factory guarantees both come from the same theme
}
class DarkUiFactory implements UiFactory {
    public Button createButton() { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}
class LightUiFactory implements UiFactory {
    public Button createButton() { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}
// Chosen: B. The constraint being solved is "family consistency," which is exactly
// Abstract Factory's intent -- Factory Method alone can't express that constraint at all.`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Picking the more "impressive" or complex pattern when a simpler one fits.</b> If
            only one product genuinely varies, Abstract Factory's extra structure is pure cost
            with no corresponding benefit.
          </li>
          <li>
            <b>Comparing patterns on popularity rather than on what they actually optimize for.</b>{" "}
            A widely-used pattern isn't automatically the right one for a specific, narrower
            problem.
          </li>
          <li>
            <b>Treating the comparison as one-time instead of revisiting it if the problem changes.</b>{" "}
            A Factory Method chosen when only one product varied should be reconsidered if the
            code later grows a second, correlated product family.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>In the UI toolkit example, why does Abstract Factory get chosen over two separate Factory Methods, given that Factory Method is the simpler pattern?</p>
          <p>
            <b>Answer:</b> The actual constraint isn't just "create a button" or "create a
            checkbox" independently &mdash; it's "a button and a checkbox from the same theme
            must always be created together." Two independent Factory Methods can't express or
            enforce that pairing; nothing stops a caller from mismatching a dark button with a
            light checkbox. Abstract Factory's single interface producing the whole family is
            what actually captures and enforces the real constraint, which is why its extra
                structure is worth the cost here.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Comparing pattern trade-offs means stating precisely what each candidate optimizes for
        and what it costs, then matching that to what's actually varying in the problem &mdash;
        not picking whichever pattern is more familiar or more structurally impressive.
      </p>
    </div>
  );
}
