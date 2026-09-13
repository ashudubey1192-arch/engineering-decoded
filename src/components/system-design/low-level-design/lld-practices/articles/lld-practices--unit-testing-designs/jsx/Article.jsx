import "../css/Article.css";

export default function LldPracticesUnitTestingDesignsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A class's design directly determines how easily it can be tested in isolation &mdash;
          testability isn't a separate concern bolted on afterward, it's a genuine signal of
          whether the design itself is sound.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A dependency that's injected in (per the previous article) can be swapped for a test
          double that behaves predictably; a dependency constructed internally can't be swapped at
          all, forcing tests to either exercise the real thing or skip testing that path entirely.
          If a class is hard to test, that's usually pointing at a real design issue &mdash; not
          just a testing inconvenience to work around.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          With <code>OrderService</code> depending on an injected <code>PaymentGateway</code>
          interface, a test can pass in a <code>FakePaymentGateway</code> that deterministically
          succeeds or fails on command, letting every branch of OrderService's logic be tested
          without ever touching a real payment provider. With a hardcoded
          <code>new StripeGateway()</code> buried inside the constructor, testing OrderService
          means either actually talking to Stripe in every test run, or not testing that logic at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a test unable to isolate a class from a hardcoded real dependency, versus a test injecting a fake dependency to isolate the class under test." >
          <rect className="box" x="20" y="40" width="70" height="26" rx="5" /><text x="55" y="57" className="boxText" style={{fontSize:"7px"}}>Test</text>
          <line className="flow" x1="90" y1="53" x2="130" y2="53" />
          <rect className="box" x="135" y="40" width="110" height="26" rx="5" /><text x="190" y="57" className="boxText" style={{fontSize:"6.5px"}}>OrderService</text>
          <line className="flowMuted" x1="245" y1="53" x2="280" y2="53" />
          <rect className="boxWarn" x="285" y="40" width="110" height="26" rx="5" /><text x="340" y="57" className="boxText" style={{fontSize:"6px"}}>real StripeGateway</text>
          <text x="200" y="85" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>vs. injecting a FakePaymentGateway instead &mdash; same test, isolated</text>
        </svg>
        <figcaption>A hardcoded real dependency can't be isolated in a test; an injected one can simply be swapped for a fake.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Testing through so many real collaborators that a &ldquo;unit&rdquo; test is actually a
          slow, brittle integration test defeats the purpose of unit testing in the first place.
          Designing classes purely around what's easy to test, rather than what's a coherent
          responsibility, distorts the design in the other direction &mdash; testability should
          fall out of good design, not override it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does OrderService's testability depend on whether PaymentGateway is injected or constructed internally?</p>
        </div>
      </section>
      <p className="takeaway">
        If a class is hard to test in isolation, that's usually the design telling you something
        &mdash; not just an inconvenience for the test suite to work around.
      </p>
    </div>
  );
}
