import "../css/Article.css";

export default function BigDataProcessingDataLakehouseArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A data lakehouse combines a data lake's cheap, flexible raw storage with a data
          warehouse's structure and query performance — one system instead of maintaining both
          separately and copying data between them.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Traditionally, teams ran a lake for cheap raw storage and a separate warehouse for fast
          structured queries, with pipelines constantly copying and reshaping data between the
          two — extra cost, extra latency, and two systems that could drift out of sync. Lakehouse
          formats (Delta Lake, Apache Iceberg, Apache Hudi) add a structured metadata and
          transaction layer directly on top of cheap object storage, giving warehouse-like features
          — ACID transactions, schema enforcement, fast columnar queries — without moving the data
          into a separate proprietary warehouse system at all.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Old approach: lake + warehouse.</b> Raw data lands in the lake; a pipeline copies
            and reshapes a subset into the warehouse for analysts — two copies, two systems to keep
            in sync.</li>
          <li><b>Lakehouse approach.</b> Raw data lands in object storage, but a table format
            (like Iceberg) adds schema, versioning, and transaction guarantees directly on top.</li>
          <li><b>One copy, multiple uses.</b> A data scientist reads the same underlying files for
            flexible exploration; an analyst runs fast structured SQL queries against the same
            files through the table format's query engine.</li>
          <li><b>No separate sync pipeline needed</b> between "the lake" and "the warehouse" —
            they're now the same underlying storage.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a data lakehouse as one underlying object storage layer with a table format adding structure and transactions on top, serving both flexible raw access and fast structured queries." >
          <rect className="box" x="60" y="70" width="300" height="30" rx="5" /><text x="210" y="90" className="boxText">object storage (raw files)</text>
          <rect className="boxAccent" x="90" y="25" width="240" height="30" rx="5" /><text x="210" y="45" className="boxText">table format: schema + ACID</text>
          <line className="flow" x1="210" y1="55" x2="210" y2="65" />
          <text x="210" y="115" className="figHint" textAnchor="middle">one storage layer serves both raw and structured access</text>
        </svg>
        <figcaption>A structured table format layered directly on object storage merges lake flexibility with warehouse capability.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming a lakehouse eliminates all need for data modeling and governance is a
          misunderstanding — it removes the need to physically copy data between two systems, but
          disciplined schema design and data quality work are still just as necessary.
          Lakehouse table formats also vary in maturity and feature support, so picking one is
          still a real architectural decision, not an interchangeable commodity choice.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What specific cost does a lakehouse architecture remove compared to maintaining a separate lake and warehouse?</p>
        </div>
      </section>
      <p className="takeaway">
        A lakehouse collapses the lake-and-warehouse split into one storage layer with
        warehouse-grade structure and transactions — fewer copies, less sync overhead, without
        giving up raw data flexibility.
      </p>
    </div>
  );
}
