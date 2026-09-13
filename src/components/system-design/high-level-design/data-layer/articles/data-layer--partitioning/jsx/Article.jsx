import "../css/Article.css";

export default function DataLayerPartitioningArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Partitioning splits a large table into smaller, more manageable pieces &mdash; and unlike
          sharding, it can often be done inside a single database, with no extra machines involved.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A common form is <b>range partitioning</b>: splitting a table by a value range, most
          often time (one partition per month, say). Queries that only touch a recent date range
          then only scan the relevant partition instead of the entire table, and old partitions can
          be archived or dropped cheaply. This is a design lever worth reaching for before sharding
          &mdash; it solves &ldquo;this one table is too large and slow to query&rdquo; without the
          added complexity of spreading data across separate database servers.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>An events table grows by millions of rows a day,</b> and queries for &ldquo;last
            week&rsquo;s events&rdquo; are getting slower as the table grows.</li>
          <li><b>Partition the table by month.</b> Each month&rsquo;s events live in their own
            partition, still inside the same database.</li>
          <li><b>A query for last week&rsquo;s events</b> now only scans this month&rsquo;s
            partition, ignoring years of older data entirely.</li>
          <li><b>Old partitions (say, over a year old)</b> can be archived to cold storage or
            dropped, without touching the current, actively-queried partition at all.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of one large table split into monthly partitions inside a single database, with a query for a recent date range touching only the relevant partition." >
          <rect className="box" x="20" y="30" width="380" height="40" rx="6" />
          {[0,1,2,3].map(i => (<line key={i} className="divider" x1={20 + (i+1)*95} y1="30" x2={20 + (i+1)*95} y2="70" />))}
          {["Jan","Feb","Mar","Apr","May"].map((m,i) => (<text key={m} x={67 + i*95} y="53" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>{m}</text>))}
          <rect className="boxAccent" x="20" y="30" width="95" height="40" rx="0" style={{opacity:0.35}} />
          <text x="67" y="20" className="figHint" textAnchor="middle" style={{fontSize:"8px"}}>query touches only this partition</text>
        </svg>
        <figcaption>A query scoped to one month scans only that partition, not the whole table.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Confusing partitioning with sharding leads to reaching for the wrong tool &mdash;
          partitioning solves &ldquo;one table is too big&rdquo; within one database, while
          sharding solves &ldquo;the whole dataset is too big for one database.&rdquo; Choosing a
          partition key that doesn&rsquo;t match the dominant query pattern (partitioning by user ID
          when almost every query filters by date) gives up most of the benefit.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>How does partitioning differ from sharding, and which problem does each one solve?</p>
        </div>
      </section>
      <p className="takeaway">
        Partitioning is the lighter-weight lever &mdash; reach for it when one table has grown
        unwieldy, before reaching for sharding&rsquo;s added operational complexity.
      </p>
    </div>
  );
}
