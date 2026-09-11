import "../css/Article.css";

export default function DatabasesDatabaseTypesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A database's "type" describes how it models and stores data — rows in tables, JSON
          documents, key-value pairs, graphs, time-stamped points — and each shape is optimized
          for a different access pattern.
        </p>
        <p>
          There's no universally "best" database. The right choice follows from how your data is
          shaped and how you'll query it, which is why large systems often run several types side
          by side rather than forcing everything into one.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>COMMON DATABASE TYPES AND THEIR SWEET SPOT</caption>
          <thead><tr><th>Type</th><th>Shape</th><th>Good fit</th></tr></thead>
          <tbody>
            <tr><td>Relational</td><td>tables + rows, strict schema</td><td>orders, payments, anything needing joins + ACID</td></tr>
            <tr><td>Document</td><td>JSON-like documents</td><td>flexible, nested, evolving records</td></tr>
            <tr><td>Key-Value</td><td>key → value</td><td>sessions, caches, feature flags</td></tr>
            <tr><td>Graph</td><td>nodes + edges</td><td>social graphs, recommendations</td></tr>
            <tr><td>Time Series</td><td>timestamped points</td><td>metrics, sensor data</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start from the query, not the tool.</b> "Show me this user's order history" needs
            joins and consistency → relational.</li>
          <li><b>Check the shape.</b> "Store this user's arbitrary settings object" is naturally
            nested and schema-flexible → document.</li>
          <li><b>Check the access pattern.</b> "Look up a session by token in under a
            millisecond" is a pure key lookup → key-value store.</li>
          <li><b>Accept multiple databases.</b> One product ends up using Postgres for orders,
            Redis for sessions, and Elasticsearch for search — each doing what it's best at.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of one application talking to three different database types, each chosen for a different kind of data it stores.">
          <rect className="boxAccent" x="180" y="10" width="100" height="34" rx="6" /><text x="230" y="32" className="boxText">application</text>
          <line className="flow" x1="200" y1="44" x2="100" y2="90" />
          <line className="flow" x1="230" y1="44" x2="230" y2="90" />
          <line className="flow" x1="260" y1="44" x2="360" y2="90" />
          <rect className="box" x="50" y="95" width="100" height="34" rx="6" /><text x="100" y="117" className="boxText">Postgres — orders</text>
          <rect className="box" x="180" y="95" width="100" height="34" rx="6" /><text x="230" y="117" className="boxText">Redis — sessions</text>
          <rect className="box" x="310" y="95" width="100" height="34" rx="6" /><text x="360" y="117" className="boxText">Search — catalog</text>
        </svg>
        <figcaption>Different data shapes, different databases, one application.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Picking a database because it's trendy or familiar, then fighting its natural shape for
          years, is the most expensive version of this mistake. The second is over-fragmenting —
          adding a new database type for every feature instead of asking whether an existing one
          already fits well enough.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>You need to store a product catalog with highly variable attributes per category (a shirt has size/color, a laptop has RAM/CPU). Which database type fits best, and why?</p>
        </div>
      </section>
      <p className="takeaway">
        Choose a database type by matching its native shape to your data and queries — the
        remaining articles in this section go deep on each type so you can make that call well.
      </p>
    </div>
  );
}
