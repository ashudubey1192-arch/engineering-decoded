import "../css/Article.css";

export default function DatabaseScalingTechniquesQueryOptimizationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Query optimization is the practice of rewriting a query or its supporting indexes so
          the database's query planner picks a cheaper way to answer it.
        </p>
        <p>
          The planner already tries to pick the fastest execution plan it can — your job is to
          give it the information (indexes, statistics, a well-shaped query) it needs to succeed,
          and to remove patterns that force it into a slow plan.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Every SQL query compiles into an execution plan: a tree of steps like "scan this table,"
          "use this index," "join these two result sets." <code>EXPLAIN</code> (or{" "}
          <code>EXPLAIN ANALYZE</code>) shows you that plan and how many rows each step actually
          touched, which is usually where a slow query reveals itself.
        </p>
        <ol className="stepList">
          <li><b>Select only what you need.</b> <code>SELECT *</code> pulls extra columns across
            the network and defeats index-only scans.</li>
          <li><b>Avoid the N+1 pattern.</b> One query per row in a loop turns 1 query into 1,001 —
            batch it into a single join or <code>IN (...)</code> query instead.</li>
          <li><b>Filter early.</b> A <code>WHERE</code> clause on an indexed column before a join
            shrinks what the join has to process.</li>
        </ol>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A product listing page loads each product, then loops to fetch that product's reviews one at a time — 1 query becomes 51 for a 50-item page.</p>
        </div>
        <ol className="stepList">
          <li><b>Spot the pattern.</b> Request logs show 51 near-identical queries per page load.</li>
          <li><b>Rewrite as one query.</b> Fetch all reviews with a single{" "}
            <code>WHERE product_id IN (...)</code> query instead of one per product.</li>
          <li><b>Group in application code.</b> Bucket the single result set by product_id.</li>
          <li><b>Measure.</b> Page load query count drops from 51 to 2; response time drops from
            900ms to 60ms.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 480 150" role="img" aria-label="Diagram comparing 50 separate per-row queries against one batched query returning the same data.">
          <text x="110" y="18" className="figLabel" textAnchor="middle">N+1 PATTERN</text>
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i}>
              <rect className={i > 3 ? "boxWarn" : "box"} x={20 + i * 30} y="30" width="20" height="16" rx="3" />
            </g>
          ))}
          <text x="110" y="65" className="figHint" textAnchor="middle">…50 queries, one per row</text>
          <line className="divider" x1="230" y1="10" x2="230" y2="120" />
          <text x="360" y="18" className="figLabel" textAnchor="middle">BATCHED</text>
          <rect className="boxAccent" x="320" y="30" width="90" height="24" rx="4" />
          <text x="365" y="47" className="boxText">1 IN (...) query</text>
          <line className="flow" x1="365" y1="54" x2="365" y2="80" />
          <rect className="box" x="320" y="84" width="90" height="20" rx="4" />
          <text x="365" y="98" className="boxText">grouped in app</text>
        </svg>
        <figcaption>Same data, one round trip instead of fifty.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Optimizing without measuring first — guessing at the slow part instead of reading{" "}
          <code>EXPLAIN ANALYZE</code> — often "fixes" a query that wasn't the bottleneck. Stale
          table statistics can also make the planner pick a bad plan even when the right index
          exists; running <code>ANALYZE</code> after a big data load is easy to forget.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A query is slow. What's the first thing you'd look at, and what would make you reach for an index versus a query rewrite?</p>
        </div>
      </section>
      <p className="takeaway">
        Most query performance problems are shape problems — N+1 loops, unindexed filters,
        unnecessary columns — and <code>EXPLAIN</code> is how you find which one you have.
      </p>
    </div>
  );
}
