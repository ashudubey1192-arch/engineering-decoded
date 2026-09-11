import "../css/Article.css";

export default function DatabaseScalingTechniquesIndexingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An index is a separate, ordered lookup structure that lets the database jump straight
          to the rows you want instead of reading every row to check if it matches.
        </p>
        <p>
          Without an index, finding a user by email means scanning the entire table row by row —
          fine for a thousand rows, brutal for a hundred million. An index on that email column
          turns "check every row" into "walk a small tree in a handful of steps."
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Most databases build indexes as B-trees: a sorted, balanced tree structure where each
          lookup eliminates most of the remaining rows at every level. The index stores the
          indexed column's value plus a pointer back to the full row, so reads get fast while the
          row data itself doesn't move.
        </p>
        <table className="miniTable">
          <caption>SAME QUERY, WITH AND WITHOUT AN INDEX</caption>
          <thead>
            <tr><th>Table size</th><th>Full scan (no index)</th><th>With a B-tree index</th></tr>
          </thead>
          <tbody>
            <tr><td>10,000 rows</td><td>~10,000 comparisons</td><td>~14 comparisons</td></tr>
            <tr><td>10,000,000 rows</td><td>~10,000,000 comparisons</td><td>~24 comparisons</td></tr>
          </tbody>
        </table>
        <p>
          That's the trade you're making: reads get dramatically cheaper, but every write now has
          to also update the index, and the index itself takes disk space.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>
            A "find orders by customer_id" query takes 4 seconds on a 20M-row orders table and is
            slowing down the whole checkout page.
          </p>
        </div>
        <ol className="stepList">
          <li><b>Confirm the scan.</b> Run <code>EXPLAIN</code> on the query — it shows a sequential
            scan touching all 20M rows.</li>
          <li><b>Add the index.</b> <code>CREATE INDEX idx_orders_customer ON orders(customer_id);</code></li>
          <li><b>Re-run EXPLAIN.</b> The plan now shows an index scan touching a few hundred rows.</li>
          <li><b>Measure again.</b> The query drops from 4s to 8ms.</li>
          <li><b>Watch write cost.</b> Bulk order inserts get ~5% slower — an acceptable trade for
            a query that runs on every checkout page view.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 520 180" role="img" aria-label="Diagram comparing a full table scan that checks every row against an index lookup that walks a small tree to the matching row.">
          <text x="120" y="20" className="figLabel" textAnchor="middle">NO INDEX</text>
          <g>
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={i} className={i === 7 ? "boxAccent" : "box"} x={20 + i * 22} y="35" width="18" height="18" rx="3" />
            ))}
          </g>
          <text x="120" y="70" className="figHint" textAnchor="middle">checks every row until it finds a match</text>
          <line x1="240" y1="90" x2="240" y2="90" />
          <text x="400" y="20" className="figLabel" textAnchor="middle">WITH INDEX</text>
          <g>
            <rect className="box" x="370" y="35" width="60" height="20" rx="4" />
            <text x="400" y="49" className="boxText">root</text>
            <line className="flow" x1="385" y1="55" x2="360" y2="80" />
            <line className="flow" x1="415" y1="55" x2="440" y2="80" />
            <rect className="box" x="330" y="80" width="60" height="20" rx="4" />
            <text x="360" y="94" className="boxText">a–m</text>
            <rect className="boxAccent" x="410" y="80" width="60" height="20" rx="4" />
            <text x="440" y="94" className="boxText">n–z</text>
          </g>
          <text x="400" y="120" className="figHint" textAnchor="middle">walks ~log(n) nodes straight to the row</text>
          <line className="divider" x1="260" y1="10" x2="260" y2="150" />
        </svg>
        <figcaption>Same lookup, two strategies: linear scan vs a tree that skips most of the data.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Indexing every column "just in case" slows down every write and bloats storage for
          indexes nobody queries. Indexing low-cardinality columns (like a boolean flag) rarely
          helps, since the index still points back to a large fraction of the table. And for
          multi-column indexes, column order matters — an index on <code>(a, b)</code> won't help
          a query that filters on <code>b</code> alone.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>
            Why does adding an index speed up reads but slow down writes, and how would you decide
            whether a given column is worth indexing?
          </p>
        </div>
      </section>
      <p className="takeaway">
        An index trades write cost and storage for read speed — worth it for columns your
        application actually filters or sorts by, wasteful otherwise.
      </p>
    </div>
  );
}
