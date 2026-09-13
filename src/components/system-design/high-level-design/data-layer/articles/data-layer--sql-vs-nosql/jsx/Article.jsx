import "../css/Article.css";

export default function DataLayerSqlVsNosqlArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          &ldquo;SQL or NoSQL&rdquo; isn&rsquo;t really one decision &mdash; it&rsquo;s shorthand
          for a handful of narrower trade-offs around consistency, schema flexibility, and how the
          data will scale.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Relational (SQL) databases give strong consistency, transactions across multiple rows
          and tables, and a fixed schema that catches structural mistakes early &mdash; well suited
          to data where correctness and relationships matter (money, inventory, anything with
          joins). NoSQL databases (document, key-value, wide-column) trade some of that rigor for
          flexible schemas and horizontal scalability that&rsquo;s often easier to reach &mdash;
          well suited to high-volume, loosely-structured data where a single entity is looked up on
          its own, not joined across many tables.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="twoCol">
          <div>
            <h3>Payments ledger &rarr; SQL</h3>
            <p>Debits and credits must balance exactly, across multiple rows, inside one
              transaction &mdash; a relational database&rsquo;s guarantees are exactly what this
              needs.</p>
          </div>
          <div>
            <h3>User activity feed &rarr; NoSQL</h3>
            <p>Each user&rsquo;s feed is looked up independently, at huge volume, and the shape of
              an activity event varies &mdash; a document store scales this more naturally.</p>
          </div>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram positioning SQL databases toward strong consistency and joins, and NoSQL databases toward flexible schema and horizontal scale, as two ends of one spectrum." >
          <line className="divider" x1="30" y1="55" x2="390" y2="55" />
          <rect className="boxAccent" x="20" y="25" width="110" height="30" rx="5" /><text x="75" y="44" className="boxText" style={{fontSize:"8px"}}>SQL: consistency, joins</text>
          <rect className="box" x="290" y="25" width="110" height="30" rx="5" /><text x="345" y="44" className="boxText" style={{fontSize:"8px"}}>NoSQL: flexible, scale</text>
        </svg>
        <figcaption>Most real designs sit closer to one end for a given piece of data, not at a single fixed point for the whole system.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating this as one binary choice for the entire system, rather than a per-entity
          decision, forces a compromise somewhere &mdash; either awkward transactions bolted onto a
          NoSQL store, or a relational schema stretched to hold loosely-structured data it wasn&rsquo;t
          designed for.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might a single system reasonably use a relational database for one entity and a document store for another, rather than picking one for everything?</p>
        </div>
      </section>
      <p className="takeaway">
        Ask the SQL-vs-NoSQL question per entity, driven by whether that entity needs strong
        cross-row consistency or benefits more from flexible schema and easier horizontal scale.
      </p>
    </div>
  );
}
