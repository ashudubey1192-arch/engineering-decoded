import "../css/Article.css";

export default function LldFoundationsEncapsulationAndAbstractionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Encapsulation and abstraction get used almost interchangeably in casual conversation, but
          they solve two different problems: one protects an object's state, the other hides a
          system's complexity behind a simpler contract.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Encapsulation</b> bundles data with the methods that operate on it, and hides internal
          state behind a controlled interface &mdash; private fields, public methods &mdash; so the
          internals can change without breaking anything that depends on the class.
          <b> Abstraction</b> exposes only the essential behavior through an interface, hiding
          implementation details entirely &mdash; a caller depends on what a class does, never how
          it does it.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>PaymentProcessor</code> interface exposing one method, <code>charge(amount)</code>,
          is abstraction: calling code depends only on that contract, never on which payment
          provider is behind it. A concrete <code>StripePaymentProcessor</code> implementing that
          interface is where encapsulation applies: its API keys and HTTP client are private
          fields, never exposed as public getters, so swapping the HTTP library later doesn&rsquo;t
          touch a single caller.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of an object's private internal fields hidden behind a small public interface surface that callers depend on instead." >
          <rect className="box" x="130" y="15" width="160" height="80" rx="8" />
          <text x="210" y="10" className="figLabel" textAnchor="middle" style={{fontSize:"8px"}}>StripePaymentProcessor</text>
          <rect className="boxWarn" x="145" y="30" width="60" height="22" rx="4" /><text x="175" y="45" className="boxText" style={{fontSize:"6.5px"}}>apiKey</text>
          <rect className="boxWarn" x="215" y="30" width="60" height="22" rx="4" /><text x="245" y="45" className="boxText" style={{fontSize:"6.5px"}}>httpClient</text>
          <text x="210" y="68" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>private, hidden</text>
          <line className="flow" x1="60" y1="55" x2="125" y2="55" />
          <rect className="box" x="20" y="42" width="60" height="26" rx="5" /><text x="50" y="58" className="boxText" style={{fontSize:"7px"}}>Caller</text>
          <rect className="boxAccent" x="120" y="88" width="180" height="20" rx="5" /><text x="210" y="102" className="boxText" style={{fontSize:"7px"}}>charge(amount)</text>
        </svg>
        <figcaption>The caller depends only on charge(amount); everything that makes it work is private and free to change.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Exposing raw fields through public getters and setters that add no real logic is
          encapsulation in name only &mdash; the internal state is just as exposed as if the field
          were public. Conflating an &ldquo;abstract class&rdquo; the language feature with
          &ldquo;abstraction&rdquo; the design principle is a common vocabulary slip; you can write
          a perfectly good abstraction with no abstract class in sight, and a badly encapsulated
          one that happens to use one.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the difference between what encapsulation protects and what abstraction hides?</p>
        </div>
      </section>
      <p className="takeaway">
        Encapsulation protects an object's state from the outside; abstraction hides a system's
        complexity behind a simpler contract. A well-designed class usually does both.
      </p>
    </div>
  );
}
