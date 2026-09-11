import "../css/Article.css";

export default function DatabasesWideColumnDatabasesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A wide-column database (Cassandra, HBase, Bigtable) stores data in rows identified by a
          key, where each row can have a different, large number of columns — and is built from
          the ground up to write at massive scale across many machines.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Data is organized by a partition key (which decides which node holds the row) and a
          clustering key (which decides sort order within that partition). Reads are fast when
          they match this layout — "give me all events for this device, newest first" — and slow
          or impossible when they don't, since there's no general-purpose query planner doing
          joins for you. You design the table around your queries, not the other way around.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>An IoT platform ingests 2 million sensor readings per second and needs to read back a device's recent history fast.</p>
        </div>
        <ol className="stepList">
          <li><b>Pick the partition key.</b> <code>device_id</code> — spreads write load evenly
            across nodes.</li>
          <li><b>Pick the clustering key.</b> <code>timestamp DESC</code> — readings for one
            device are stored pre-sorted, newest first.</li>
          <li><b>Write at scale.</b> Each node only owns a slice of devices, so ingest scales by
            adding nodes.</li>
          <li><b>Read the common query.</b> "Last 100 readings for device X" is a fast, sequential
            read within one partition — no scatter-gather needed.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 140" role="img" aria-label="Diagram of sensor readings distributed across three nodes by device id partition key, with each node's readings sorted by timestamp.">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect className={i === 1 ? "boxAccent" : "box"} x={30 + i * 145} y="20" width="120" height="90" rx="6" />
              <text x={90 + i * 145} y="15" className="figLabel" textAnchor="middle">NODE {i + 1}</text>
              <text x={90 + i * 145} y="45" className="boxText">device: {i === 1 ? "X" : "…"}</text>
              <text x={90 + i * 145} y="65" className="boxText">t=09:02</text>
              <text x={90 + i * 145} y="82" className="boxText">t=09:01</text>
              <text x={90 + i * 145} y="99" className="boxText">t=09:00</text>
            </g>
          ))}
        </svg>
        <figcaption>Device X's partition sits on one node, pre-sorted by time — a fast read for its recent history.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Designing the table like a relational schema and expecting flexible ad-hoc queries later
          is the classic mistake — a wide-column store rewards designing the partition and
          clustering keys around your known access patterns up front. A poorly chosen partition
          key (like a constant value) also creates a hot node that every write piles onto.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a wide-column database need you to design the table around your queries in advance, unlike a relational database?</p>
        </div>
      </section>
      <p className="takeaway">
        Wide-column stores buy massive write throughput and horizontal scale by asking you to
        commit to your access pattern in the schema itself.
      </p>
    </div>
  );
}
