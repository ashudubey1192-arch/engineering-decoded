import "../css/Article.css";

export default function BigDataProcessingDataWarehousingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A data warehouse stores structured, cleaned, and modeled data — specifically organized
          for fast analytical queries across large historical datasets, not for the
          transaction-by-transaction workload a regular application database handles.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Warehouses use a <b>columnar</b> storage layout (storing all values of one column
          together, rather than row by row), which is exactly suited to analytical queries that
          typically read a few columns across millions of rows ("total revenue by region last
          quarter") rather than reading whole rows. This is the opposite optimization from a
          normal transactional database, which is why warehouses (like Snowflake, BigQuery,
          Redshift) are separate systems from an application's operational database, fed by an
          ETL/ELT pipeline rather than serving live application traffic directly.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Operational database</b> stores live order rows, optimized for fast individual
            inserts and lookups by order ID.</li>
          <li><b>ETL pipeline copies and reshapes</b> that data nightly into the warehouse, in a
            columnar format organized around common analytical questions.</li>
          <li><b>Analyst runs a query:</b> "total revenue by region, last 12 months." Only the{" "}
            <code>region</code>, <code>revenue</code>, and <code>date</code> columns are read —
            not every column of every order row.</li>
          <li><b>The query returns in seconds</b> across billions of historical rows — something
            the operational database, tuned for a different workload, would struggle to do without
            slowing down live traffic.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting row-oriented storage where whole rows are read together versus columnar storage where only the needed columns are read across all rows, favoring analytical queries." >
          <text x="100" y="18" className="figLabel" textAnchor="middle">ROW-ORIENTED</text>
          {[0, 1, 2].map((i) => (<rect key={i} className="box" x="30" y={25 + i * 24} width="150" height="18" rx="3" />))}
          <text x="330" y="18" className="figLabel" textAnchor="middle">COLUMNAR</text>
          {[0, 1, 2].map((i) => (<rect key={i} className={i === 1 ? "boxAccent" : "box"} x={250 + i * 55} y="25" width="45" height="66" rx="3" />))}
          <text x="330" y="110" className="figHint" textAnchor="middle">read only the needed column, across all rows</text>
        </svg>
        <figcaption>Columnar layout matches the "few columns, many rows" shape of typical analytical queries.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Pointing analytical dashboards directly at the live operational database "to keep things
          simple" risks both slow queries and, worse, accidentally degrading production
          application performance. Under-modeling the warehouse's schema (skipping a proper
          dimensional model) can also leave every analyst reinventing the same complex joins
          instead of querying clean, pre-joined tables.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is columnar storage a better fit for "total revenue by region" than the row-oriented storage a transactional database typically uses?</p>
        </div>
      </section>
      <p className="takeaway">
        A data warehouse's columnar, pre-modeled structure is purpose-built for fast analytical
        queries across huge historical datasets — a fundamentally different job from an
        application's live operational database.
      </p>
    </div>
  );
}
