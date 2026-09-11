import "../css/Article.css";

export default function DatabaseScalingTechniquesShardingVsPartitioningArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          "Partitioning" and "sharding" get used interchangeably in casual conversation, but they
          answer different questions: partitioning splits data <em>within</em> one database
          instance; sharding splits it <em>across</em> multiple independent instances.
        </p>
        <p>
          Getting this distinction right matters in an interview and in production — they solve
          different bottlenecks and carry different operational costs.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Partitioning</h3>
            <p>
              One database server, one set of CPU/RAM/disk. The engine internally splits a table
              into partitions (by range, list, or hash) to speed up scans and maintenance — but
              it's still one instance's resources serving all the traffic.
            </p>
          </div>
          <div>
            <h3>Sharding</h3>
            <p>
              Multiple independent database servers, each with its own CPU/RAM/disk. Your
              application (or a routing layer) decides which server a row lives on. Total
              capacity scales with the number of shards.
            </p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start with partitioning.</b> A 500GB <code>events</code> table on one Postgres
            server is partitioned by month, so old partitions can be archived and queries on
            recent data skip scanning old months.</li>
          <li><b>Hit a real ceiling.</b> Even partitioned, one server's disk and write throughput
            max out at 3TB and 20K writes/sec.</li>
          <li><b>Move to sharding.</b> The same table is split across 6 independent Postgres
            servers by <code>user_id</code> — now there are 6x the disks and 6x the write capacity.</li>
          <li><b>Combine them.</b> Each of those 6 shards can still be internally partitioned by
            month — the two techniques stack.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 480 160" role="img" aria-label="Diagram comparing one database server internally divided into partitions against three separate, independent database servers each holding one shard.">
          <text x="110" y="18" className="figLabel" textAnchor="middle">PARTITIONING</text>
          <rect className="box" x="30" y="30" width="160" height="90" rx="8" />
          <line className="divider" x1="30" y1="60" x2="190" y2="60" />
          <line className="divider" x1="30" y1="90" x2="190" y2="90" />
          <text x="110" y="48" className="boxText">Jan partition</text>
          <text x="110" y="78" className="boxText">Feb partition</text>
          <text x="110" y="108" className="boxText">Mar partition</text>
          <text x="110" y="135" className="figHint" textAnchor="middle">one server, one disk</text>
          <line className="divider" x1="230" y1="10" x2="230" y2="150" />
          <text x="360" y="18" className="figLabel" textAnchor="middle">SHARDING</text>
          <rect className="boxAccent" x="250" y="30" width="60" height="90" rx="6" /><text x="280" y="78" className="boxText">shard 1</text>
          <rect className="boxAccent" x="320" y="30" width="60" height="90" rx="6" /><text x="350" y="78" className="boxText">shard 2</text>
          <rect className="boxAccent" x="390" y="30" width="60" height="90" rx="6" /><text x="420" y="78" className="boxText">shard 3</text>
          <text x="360" y="135" className="figHint" textAnchor="middle">three independent servers</text>
        </svg>
        <figcaption>Partitioning reorganizes data on one machine; sharding spreads it across many.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The costly mix-up is assuming partitioning alone fixes a throughput problem — it
          organizes data better, but every partition still shares the same server's CPU, RAM, and
          disk, so total capacity doesn't grow. If the bottleneck is genuinely "this one machine
          can't keep up," only adding more machines (sharding) relieves it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A table is partitioned by month but the database server is still maxed out on write throughput. Will adding more partitions help? Why or why not?</p>
        </div>
      </section>
      <p className="takeaway">
        Partitioning organizes data on one machine; sharding adds machines. If you're still bound
        by one server's resources, you need sharding, not more partitions.
      </p>
    </div>
  );
}
