import "../css/Article.css";

export default function DatabasesRelationalDatabasesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A relational database stores data in tables of rows and columns, links related tables
          with foreign keys, and lets you recombine them at query time with joins.
        </p>
        <p>
          The relational model (Postgres, MySQL, SQL Server, Oracle) has stayed dominant for
          decades because "store each fact once, join when you need it" avoids duplication and
          keeps data consistent by construction.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Normalization is the discipline behind this: split data so each fact lives in exactly
          one place (a customer's address lives in the customers table, not copied onto every
          order). Foreign keys then enforce that an order can't reference a customer that doesn't
          exist. The cost is that reading a full picture — "this order, this customer, these line
          items" — usually means a join across several tables.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Model the entities.</b> <code>customers</code>, <code>orders</code>,{" "}
            <code>order_items</code> as separate tables.</li>
          <li><b>Link them.</b> <code>orders.customer_id</code> references{" "}
            <code>customers.id</code>; <code>order_items.order_id</code> references{" "}
            <code>orders.id</code>.</li>
          <li><b>Query across them.</b> <code>SELECT * FROM orders JOIN customers ON ...</code>{" "}
            reassembles the full picture on demand.</li>
          <li><b>Rely on constraints.</b> The database itself refuses an order for a
            non-existent customer — no application code has to check.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of three linked tables: customers, orders, and order items, connected by foreign keys.">
          <rect className="box" x="20" y="50" width="100" height="34" rx="5" /><text x="70" y="72" className="boxText">customers</text>
          <line className="flow" x1="120" y1="67" x2="170" y2="67" />
          <rect className="boxAccent" x="180" y="50" width="100" height="34" rx="5" /><text x="230" y="72" className="boxText">orders</text>
          <line className="flow" x1="280" y1="67" x2="330" y2="67" />
          <rect className="box" x="300" y="50" width="100" height="34" rx="5" /><text x="350" y="72" className="boxText">order_items</text>
          <text x="145" y="55" className="figHint" textAnchor="middle">FK</text>
          <text x="305" y="55" className="figHint" textAnchor="middle">FK</text>
        </svg>
        <figcaption>Each fact lives once; foreign keys let queries reassemble the relationships.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Over-normalizing a schema that's mostly read, rarely written, turns every read into a
          wall of joins — sometimes a bit of denormalization (covered earlier in this course) is
          the right call. The other trap is skipping foreign key constraints "for performance"
          and quietly losing the referential integrity that was the whole point of the model.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does normalizing data reduce the risk of inconsistency, and what does it cost you at read time?</p>
        </div>
      </section>
      <p className="takeaway">
        Relational databases trade some read-time join cost for a strong guarantee: every fact
        has exactly one home, and the database itself enforces how records relate.
      </p>
    </div>
  );
}
