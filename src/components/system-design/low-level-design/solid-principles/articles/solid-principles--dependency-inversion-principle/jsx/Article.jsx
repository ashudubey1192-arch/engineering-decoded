import "../css/Article.css";

export default function SolidPrinciplesDependencyInversionPrincipleArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          High-level modules shouldn't depend on low-level modules directly &mdash; both should
          depend on an abstraction in between, so a change to one detail never has to ripple up
          into business logic that shouldn't care about it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          &ldquo;High-level&rdquo; here means the code that expresses policy &mdash; what the
          application actually does; &ldquo;low-level&rdquo; means the specific mechanism
          &mdash; which database, which HTTP client. DIP says the high-level code should depend on
          an interface it defines in its own terms, and the low-level mechanism should implement
          that interface &mdash; not the other way around, where high-level logic is written
          against a specific low-level class's API.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          An <code>OrderService</code> that directly writes <code>new MySQLDatabase()</code>
          inside its own constructor is coupled to that one concrete class &mdash; swapping storage,
          or testing OrderService without a real database, means editing OrderService itself. Once
          OrderService instead depends on a <code>Database</code> interface it defines (with methods
          like <code>save(order)</code>), and <code>MySQLDatabase</code> is just one implementation
          of that interface supplied from outside, OrderService never needs to change to support a
          different database or a fake one in tests.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of OrderService directly instantiating MySQLDatabase, a rigid direct dependency, versus both OrderService and MySQLDatabase depending on a shared Database interface in between." >
          <rect className="box" x="20" y="40" width="120" height="28" rx="6" /><text x="80" y="58" className="boxText" style={{fontSize:"7px"}}>OrderService</text>
          <line className="flowMuted" x1="140" y1="54" x2="185" y2="54" /><text x="162" y="44" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>new</text>
          <rect className="boxWarn" x="190" y="40" width="120" height="28" rx="6" /><text x="250" y="58" className="boxText" style={{fontSize:"7px"}}>MySQLDatabase</text>
          <line className="divider" x1="330" y1="10" x2="330" y2="105" />
          <rect className="box" x="345" y="15" width="60" height="24" rx="5" /><text x="375" y="31" className="boxText" style={{fontSize:"6.5px"}}>Order</text><text x="375" y="8" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>Service</text>
        </svg>
        <figcaption>OrderService constructing MySQLDatabase directly is a rigid dependency; both depending on a shared interface removes it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Conflating DIP with &ldquo;always use a dependency injection framework&rdquo; overstates
          it &mdash; DIP is the principle (depend on abstractions), and a DI framework is just one
          common mechanism for satisfying it, not a requirement. Inverting a dependency where
          there's only ever going to be one real implementation adds a layer of indirection with no
          practical payoff.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does OrderService directly instantiating MySQLDatabase violate DIP, and what fixes it?</p>
        </div>
      </section>
      <p className="takeaway">
        Depend on an interface your own code defines, not on a specific low-level class &mdash;
        the mechanism for wiring it together is a separate, later decision.
      </p>
    </div>
  );
}
