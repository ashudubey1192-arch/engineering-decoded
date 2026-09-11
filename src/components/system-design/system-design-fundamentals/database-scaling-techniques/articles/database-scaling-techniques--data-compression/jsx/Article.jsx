import "../css/Article.css";

export default function DatabaseScalingTechniquesDataCompressionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Data compression re-encodes stored data to take up less space, which also means less
          disk I/O to read it back — at the cost of CPU spent compressing and decompressing.
        </p>
        <p>
          On large tables, disk I/O is often the real bottleneck, not CPU. Compressing cold or
          rarely-changed data trades a small, cheap amount of CPU for a large reduction in the
          bytes that have to move off disk on every read.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Column-oriented storage compresses especially well, because values in the same column
          tend to repeat or vary smoothly (a status column with three possible values, a
          timestamp column that's nearly sorted) — far more redundancy than a row that mixes
          unrelated types together. That's part of why analytics databases lean columnar.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Identify a cold, large table.</b> A 2-year archive of application logs, rarely
            queried but taking up 800GB.</li>
          <li><b>Pick a compression scheme.</b> Enable columnar compression for the archive table
            (many databases and storage engines support this per-table).</li>
          <li><b>Measure the trade.</b> Storage drops from 800GB to 140GB; a full scan takes
            slightly more CPU per row but far less disk I/O overall, so it's still faster end to
            end.</li>
          <li><b>Leave hot tables alone.</b> The live "current_sessions" table stays uncompressed
            — it's small and read/written constantly, where compression's CPU cost isn't worth it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram showing an 800 gigabyte table shrinking to 140 gigabytes after compression, with a small CPU cost added and a larger disk I/O saving.">
          <text x="90" y="18" className="figLabel" textAnchor="middle">BEFORE</text>
          <rect className="box" x="20" y="30" width="140" height="60" rx="6" />
          <text x="90" y="65" className="boxText">800 GB on disk</text>
          <line className="flow" x1="170" y1="60" x2="230" y2="60" />
          <text x="200" y="50" className="figHint" textAnchor="middle">compress</text>
          <text x="330" y="18" className="figLabel" textAnchor="middle">AFTER</text>
          <rect className="boxAccent" x="260" y="45" width="70" height="30" rx="6" />
          <text x="295" y="64" className="boxText">140 GB</text>
          <text x="295" y="100" className="figHint" textAnchor="middle">+ small CPU cost to read</text>
        </svg>
        <figcaption>Less to move off disk, a little more to decode on the way out.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Compressing data that's already compressed (JPEGs, videos, already-gzipped blobs) burns
          CPU for little or no size reduction. And compressing a hot, frequently-updated table can
          backfire — the CPU cost of constant recompression on write can outweigh the I/O savings
          on read.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does compression tend to pay off more for a columnar analytics table than for a row-oriented table that's updated constantly?</p>
        </div>
      </section>
      <p className="takeaway">
        Compression is a disk-I/O-for-CPU trade — a clear win for large, cold, column-friendly
        data, and a potential net loss for small, hot, frequently-written data.
      </p>
    </div>
  );
}
