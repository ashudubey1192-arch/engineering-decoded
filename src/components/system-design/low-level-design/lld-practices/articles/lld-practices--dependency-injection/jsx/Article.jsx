import "../css/Article.css";

export default function LldPracticesDependencyInjectionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Dependency Injection is the practical mechanism most often used to satisfy the
          Dependency Inversion Principle: instead of a class constructing its own dependencies, they're
          supplied to it from outside.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          DIP is the principle &mdash; depend on abstractions, not concrete details. DI is one
          common way to satisfy it in real code: constructor injection (passing dependencies as
          constructor arguments), setter injection, or a DI container that wires an entire
          application's object graph together at startup. A small codebase can satisfy DIP with a
          few manual constructor calls; DI containers earn their complexity once an application has
          enough services depending on each other that wiring them by hand becomes unwieldy.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Take the earlier <code>OrderService</code> depending on a <code>PaymentGateway</code>
          interface. Constructor injection looks like
          <code>new OrderService(new StripeGateway())</code> &mdash; explicit and simple for a
          handful of classes. A DI container, in a larger application, instead reads configuration
          once at startup and automatically constructs and wires every service's dependencies,
          including OrderService's, without any single line of application code calling
          <code>new</code> on another service directly.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a class constructing its own dependency internally, a tight coupling, versus the same dependency being handed in from outside through the constructor, an injected one." >
          <rect className="boxWarn" x="20" y="35" width="170" height="30" rx="6" /><text x="105" y="54" className="boxText" style={{fontSize:"7px"}}>OrderService: new StripeGateway()</text>
          <line className="divider" x1="220" y1="10" x2="220" y2="100" />
          <rect className="box" x="240" y="20" width="80" height="26" rx="5" /><text x="280" y="37" className="boxText" style={{fontSize:"7px"}}>caller</text>
          <line className="flow" x1="320" y1="33" x2="360" y2="33" /><text x="340" y="23" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>injects</text>
          <rect className="boxAccent" x="245" y="60" width="150" height="28" rx="5" /><text x="320" y="78" className="boxText" style={{fontSize:"6.5px"}}>OrderService(gateway)</text>
        </svg>
        <figcaption>A dependency built internally versus one handed in from outside, ready to be swapped or faked by whoever constructs the service.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Injecting so many dependencies into one constructor that the parameter list itself
          becomes a design smell is usually a Single Responsibility Principle violation wearing a
          DI costume &mdash; too many dependencies often means too many responsibilities. Reaching
          for a full DI framework on a small project where three manual constructor calls would do
          adds machinery the project doesn't need yet.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the difference between DIP as a principle and DI as a mechanism, and when does a DI framework actually start paying for itself?</p>
        </div>
      </section>
      <p className="takeaway">
        DI is how you actually satisfy DIP in code &mdash; start with plain constructor injection,
        and reach for a framework only once wiring by hand genuinely becomes the bottleneck.
      </p>
    </div>
  );
}
