import "../css/Article.css";

export default function DatabasesLsmTreesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A Log-Structured Merge (LSM) Tree is a write-optimized alternative to the B-Tree, used by
          Cassandra, RocksDB, and LevelDB — it turns random writes into fast sequential ones by
          never updating data in place.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Writes first land in an in-memory structure (a <b>memtable</b>), plus a write-ahead log
          on disk for crash safety. When the memtable fills up, it's flushed to disk as an
          immutable sorted file (an <b>SSTable</b>) — a single fast sequential write, never a
          scattered in-place update. Over time, many small SSTables accumulate, so a background{" "}
          <b>compaction</b> process merges them into fewer, larger sorted files, discarding
          overwritten or deleted entries along the way.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Write arrives.</b> A new key-value pair is appended to the write-ahead log and
            inserted into the in-memory memtable.</li>
          <li><b>Memtable fills up.</b> Its contents are flushed to disk as a new immutable,
            sorted SSTable file.</li>
          <li><b>More flushes happen.</b> Over time, several SSTables pile up on disk.</li>
          <li><b>Compaction runs in the background.</b> Overlapping SSTables are merged into
            fewer, larger ones, dropping any values a later write overwrote.</li>
          <li><b>A read checks multiple places</b> — the memtable, then SSTables from newest to
            oldest — which is why LSM Trees are optimized for writes at some cost to read speed.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 160" role="img" aria-label="Diagram of writes landing in an in-memory memtable, flushing to disk as sorted SSTable files, and being merged by background compaction.">
          <rect className="boxAccent" x="20" y="20" width="110" height="34" rx="6" /><text x="75" y="42" className="boxText">memtable (RAM)</text>
          <line className="flow" x1="75" y1="54" x2="75" y2="85" />
          <text x="95" y="72" className="figHint">flush</text>
          <rect className="box" x="20" y="90" width="70" height="28" rx="4" /><text x="55" y="108" className="boxText">SSTable</text>
          <rect className="box" x="100" y="90" width="70" height="28" rx="4" /><text x="135" y="108" className="boxText">SSTable</text>
          <rect className="box" x="180" y="90" width="70" height="28" rx="4" /><text x="215" y="108" className="boxText">SSTable</text>
          <line className="flow" x1="135" y1="118" x2="135" y2="140" />
          <text x="230" y="132" className="figHint">compaction merges</text>
          <rect className="boxAccent" x="60" y="140" width="150" height="28" rx="4" /><text x="135" y="158" className="boxText">1 merged SSTable</text>
        </svg>
        <figcaption>Sequential writes and flushes now, background merging later — the LSM trade for write speed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming an LSM-backed store reads as fast as a B-Tree-backed one is a common
          misconception — reads may need to check several SSTables (mitigated with Bloom filters
          and compaction, but never fully eliminated). Under-provisioning for compaction
          (it uses real CPU and I/O) can also let SSTables pile up and degrade both read and write
          performance.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an LSM Tree turn writes into a sequential operation, and what cost does that shift onto reads?</p>
        </div>
      </section>
      <p className="takeaway">
        LSM Trees trade read simplicity for write throughput — great for write-heavy workloads,
        with compaction as the ongoing cost of keeping reads reasonable.
      </p>
    </div>
  );
}
