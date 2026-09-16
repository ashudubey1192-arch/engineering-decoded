export default function PatternFoundationsPatternsVsPrinciplesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A principle (like "favor composition over inheritance") is a general rule of thumb with
          no fixed shape. A pattern (like Decorator) is one specific, named structure that applies
          a principle to a recurring problem. Principles are the reasoning; patterns are worked
          examples of that reasoning. This distinction is why the next section of this course,
          Object Design Principles, exists separately from the pattern catalog that follows it.
        </p>
        <p>
          Confusing the two leads to two opposite mistakes: applying a principle so literally that
          you reinvent a named pattern badly, or applying a pattern so rigidly that you violate the
          principle it was supposed to serve.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Telling them apart, step by step</h2>
        <ol className="stepList">
          <li>
            <b>A principle has no structure diagram; a pattern does.</b> "Encapsulate variation"
            is advice. "Strategy" is that advice, given a specific class-and-interface shape.
          </li>
          <li>
            <b>Multiple patterns can implement the same principle differently.</b> Strategy,
            State, and Template Method all apply "encapsulate variation" to different situations
            &mdash; the principle doesn't tell you which shape to use, only that variation
            shouldn't live scattered through conditionals.
          </li>
          <li>
            <b>A principle can be satisfied without any named pattern at all.</b> Extracting one
            interface with one implementation satisfies "program to an interface" without needing
            Factory Method, Abstract Factory, or any other pattern layered on top.
          </li>
          <li>
            <b>When a pattern and the principle behind it conflict, the principle wins.</b> A
            "faithful" Singleton implementation that makes code untestable has violated
            testability concerns the underlying design goals actually cared about &mdash; the
            textbook shape isn't the point, the reasoning behind it is.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="20" width="140" height="40" rx="6" />
            <text className="boxText" x="250" y="45" fontSize="11">Encapsulate variation</text>
            <text className="figLabel" x="250" y="12">principle</text>
            <line className="flow" x1="220" y1="60" x2="90" y2="100" />
            <line className="flow" x1="250" y1="60" x2="250" y2="100" />
            <line className="flow" x1="280" y1="60" x2="410" y2="100" />
            <rect className="box" x="20" y="100" width="140" height="35" rx="6" />
            <text className="boxText" x="90" y="122" fontSize="10">Strategy</text>
            <rect className="box" x="180" y="100" width="140" height="35" rx="6" />
            <text className="boxText" x="250" y="122" fontSize="10">State</text>
            <rect className="box" x="340" y="100" width="140" height="35" rx="6" />
            <text className="boxText" x="410" y="122" fontSize="10">Template Method</text>
          </svg>
          <figcaption>One principle, three different named patterns, each applying it to a different kind of variation.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The same principle, satisfied with and without a named pattern</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// principle satisfied, no named pattern needed -- one interface, one implementation
interface PaymentGateway { void charge(Money amount); }
class StripeGateway implements PaymentGateway { /* ... */ }

// same principle, now with real variation -- this is where Strategy earns its name
interface PaymentGateway { void charge(Money amount); }
class StripeGateway implements PaymentGateway { /* ... */ }
class PaypalGateway implements PaymentGateway { /* ... */ }
class CryptoGateway implements PaymentGateway { /* ... */ }
// selecting between them at runtime, via a common interface, is Strategy`}</pre>
        </div>
        <p>
          The first snippet already follows "program to an interface" &mdash; it just doesn't need
          a pattern name yet, because there's nothing varying to select between. The pattern name
          becomes relevant only once real variation shows up.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for a named pattern to satisfy a principle that a single interface already
            satisfies.</b> One implementation doesn't need Strategy's runtime selection machinery.
          </li>
          <li>
            <b>Following a pattern's textbook structure so rigidly it undermines the principle
            behind it.</b> A Singleton that's impossible to substitute in tests has technically
            matched the diagram while failing the actual design goal.
          </li>
          <li>
            <b>Treating "principles" and "patterns" as interchangeable vocabulary.</b> Saying "I
            used the composition pattern" when you mean the composition principle muddies exactly
            the distinction this article is about.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why don't <code>PaymentGateway</code> and <code>StripeGateway</code> alone count as an example of the Strategy pattern, even though they follow "program to an interface"?</p>
          <p>
            <b>Answer:</b> Strategy is specifically about selecting between interchangeable
            implementations at runtime. With only one implementation, there's nothing to select
            between &mdash; the code satisfies the underlying principle but doesn't yet need the
            additional structure (multiple interchangeable strategies, runtime selection) that
            earns the pattern's name.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Principles are the reasoning behind good design; patterns are named, specific structures
        that apply that reasoning to recurring situations &mdash; when they conflict, the
        principle is what actually matters, not the diagram.
      </p>
    </div>
  );
}
