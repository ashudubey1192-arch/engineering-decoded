export default function ObjectDesignLooseCouplingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Coupling is how much one piece of code knows about, and depends on, another. Loose
          coupling means that knowledge is minimized: a class depends on the smallest interface it
          actually needs, not on another class's full concrete shape. Program to an Interface is
          the main tool for achieving loose coupling; this article is about recognizing coupling
          itself &mdash; tight and loose &mdash; as a thing you can directly observe and measure
          in code.
        </p>
        <p>
          The practical test: how many other files does a class force you to open and understand
          before you can safely change it?
        </p>
      </section>
      <section id="concepts">
        <h2>1. Measuring and reducing coupling, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Count what a class directly depends on.</b> A class that constructs three concrete
            other classes internally, reaches into their public fields, and calls
            implementation-specific methods is tightly coupled to all three.
          </li>
          <li>
            <b>Ask whether each dependency needs the full concrete type, or just a capability.</b>{" "}
            A class that only ever calls <code>save()</code> on a repository doesn't need to know
            it's specifically a <code>PostgresOrderRepository</code>.
          </li>
          <li>
            <b>Narrow each dependency to the smallest interface that provides what's actually
            used.</b> Depending on <code>OrderRepository</code> (one method: <code>save</code>)
            instead of the concrete Postgres implementation removes all knowledge of the database
            technology from the calling class.
          </li>
          <li>
            <b>Inject dependencies rather than constructing them internally.</b> A class that
            receives its collaborators through its constructor doesn't need to know how to build
            them &mdash; that knowledge moves to whoever assembles the object graph.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="20" width="160" height="110" rx="8" />
            <text className="figLabel" x="100" y="14">tight coupling</text>
            <text className="boxText" x="100" y="50" fontSize="10">OrderService</text>
            <text className="figHint" x="100" y="70">knows PostgresRepo</text>
            <text className="figHint" x="100" y="85">knows SmtpMailer</text>
            <text className="figHint" x="100" y="100">knows StripeGateway</text>
            <rect className="boxAccent" x="300" y="20" width="180" height="110" rx="8" />
            <text className="figLabel" x="390" y="14">loose coupling</text>
            <text className="boxText" x="390" y="50" fontSize="10">OrderService</text>
            <text className="figHint" x="390" y="70">knows OrderRepository</text>
            <text className="figHint" x="390" y="85">knows Mailer</text>
            <text className="figHint" x="390" y="100">knows PaymentGateway</text>
          </svg>
          <figcaption>Same class, same three collaborators &mdash; one version depends on concrete implementations, the other on narrow interfaces.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Reducing coupling with narrower dependencies</h2>
        <span className="codeLabel">JAVA &mdash; TIGHT</span>
        <div className="codeBlock">
          <pre>{`class OrderService {
    private final PostgresOrderRepository repo = new PostgresOrderRepository(); // constructs internally
    void place(Order order) {
        repo.saveWithConnection(DataSourceRegistry.get()); // knows Postgres-specific detail
    }
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; LOOSE</span>
        <div className="codeBlock">
          <pre>{`interface OrderRepository { void save(Order order); }

class OrderService {
    private final OrderRepository repo; // narrow interface, injected
    OrderService(OrderRepository repo) { this.repo = repo; }
    void place(Order order) { repo.save(order); } // no database-specific knowledge at all
}`}</pre>
        </div>
        <p>
          <code>OrderService</code> can now be tested with an in-memory{" "}
          <code>OrderRepository</code>, and the database technology can change without touching
          this class at all &mdash; both are direct consequences of removing the unnecessary
          knowledge.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Constructing collaborators internally instead of injecting them.</b> Even with an
            interface extracted, <code>new PostgresOrderRepository()</code> inside the class
            still couples it to that concrete implementation at construction time.
          </li>
          <li>
            <b>Depending on a wide interface when only one or two methods are actually used.</b>{" "}
            Depending on a 15-method <code>Repository</code> interface to call only{" "}
            <code>save()</code> is looser than depending on the concrete class, but still tighter
            than it needs to be.
          </li>
          <li>
            <b>Treating loose coupling as free.</b> Every interface and injection point is a small
            ongoing cost; apply it where multiple implementations, testability, or independent
            change are real needs, matching this section's Forces and Trade-Offs discipline.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does injecting <code>OrderRepository</code> through the constructor reduce coupling more than just extracting the interface while still calling <code>new PostgresOrderRepository()</code> inside <code>OrderService</code>?</p>
          <p>
            <b>Answer:</b> Extracting the interface narrows what methods <code>OrderService</code>{" "}
            can call, but constructing the concrete class internally still hard-codes which
            implementation is used and how it's built. Injection moves that knowledge out of{" "}
            <code>OrderService</code> entirely, so the class depends only on the interface's
            shape, not on any specific implementation or how to construct one.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Loose coupling is measurable: count what a class actually knows about its collaborators,
        narrow that to the smallest interface it needs, and inject rather than construct.
      </p>
    </div>
  );
}
