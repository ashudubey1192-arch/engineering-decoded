import "../css/Article.css";

export default function ArchitecturalPatternsHexagonalArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Hexagonal architecture (also called Ports and Adapters) keeps your core business logic
          completely isolated from external concerns — databases, web frameworks, message queues —
          by only ever talking to abstract "ports," with swappable "adapters" plugging in the real
          implementation.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The business logic at the center defines <b>ports</b> — interfaces describing what it
          needs ("a way to save an order," "a way to send a notification") — without knowing or
          caring how those are implemented. <b>Adapters</b> are the concrete implementations
          (a Postgres adapter, an SQS adapter, a REST controller) that plug into those ports from
          the outside. Because the core never imports a specific database driver or web framework,
          you can swap Postgres for MongoDB, or REST for gRPC, by writing a new adapter — the
          business logic doesn't change at all.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Define a port.</b> The order-placing logic depends on an{" "}
            <code>OrderRepository</code> interface with <code>save(order)</code> — nothing about
            SQL or Postgres.</li>
          <li><b>Write an adapter.</b> A <code>PostgresOrderRepository</code> class implements
            that interface using real SQL queries.</li>
          <li><b>Wire it up.</b> At startup, the concrete Postgres adapter is injected wherever the
            port is needed.</li>
          <li><b>Swap it later.</b> Migrating to DynamoDB means writing a{" "}
            <code>DynamoOrderRepository</code> adapter — the order-placing business logic is
            untouched.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram of core business logic in the center connected through ports to swappable adapters for the database, web framework, and message queue on the outside.">
          <rect className="boxAccent" x="150" y="55" width="120" height="45" rx="8" /><text x="210" y="82" className="boxText">core logic</text>
          <line className="flow" x1="150" y1="70" x2="90" y2="35" /><line className="flow" x1="150" y1="90" x2="90" y2="115" /><line className="flow" x1="270" y1="77" x2="340" y2="77" />
          <rect className="box" x="20" y="15" width="90" height="26" rx="4" /><text x="65" y="33" className="boxText">DB adapter</text>
          <rect className="box" x="20" y="105" width="90" height="26" rx="4" /><text x="65" y="123" className="boxText">queue adapter</text>
          <rect className="box" x="340" y="64" width="90" height="26" rx="4" /><text x="385" y="82" className="boxText">HTTP adapter</text>
          <text x="120" y="75" className="figHint">ports</text>
        </svg>
        <figcaption>Core logic depends only on ports; adapters plug in the real, swappable implementations.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Over-applying this pattern to a tiny CRUD app adds indirection with little payoff — it
          earns its keep when business logic is complex enough to be worth protecting, or when you
          genuinely expect to swap infrastructure. Letting a "port" interface leak
          implementation-specific details (like a SQL-flavored query object) defeats the purpose —
          the port should stay implementation-agnostic.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does defining a port as an abstract interface make it possible to swap the database technology without touching business logic?</p>
        </div>
      </section>
      <p className="takeaway">
        Hexagonal architecture isolates business logic behind ports so infrastructure — databases,
        frameworks, queues — becomes swappable detail instead of a hard dependency.
      </p>
    </div>
  );
}
