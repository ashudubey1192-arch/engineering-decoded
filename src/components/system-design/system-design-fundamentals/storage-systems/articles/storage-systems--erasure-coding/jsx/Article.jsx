import "../css/Article.css";

export default function StorageSystemsErasureCodingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Erasure coding is a way to protect data against loss using far less extra storage than
          full replication — by splitting data into pieces and adding mathematically-derived parity
          pieces that can reconstruct any missing piece.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Storing 3 full replicas of your data costs 3x the storage (200% overhead). Erasure coding
          instead splits data into <i>k</i> data fragments and computes <i>m</i> additional parity
          fragments, storing all <i>k+m</i> across different machines. Any <i>k</i> of the{" "}
          <i>k+m</i> fragments — data or parity, in any combination — are enough to reconstruct the
          original data. A common scheme (10 data + 4 parity) tolerates losing any 4 machines while
          using only 40% extra storage, versus 200% for triple replication.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A storage system needs to survive losing any 2 machines out of a group, without paying for 3x replication.</p>
        </div>
        <ol className="stepList">
          <li><b>Split the data.</b> A file is split into, say, 6 data fragments.</li>
          <li><b>Compute parity.</b> 2 parity fragments are calculated from the 6 data fragments
            using an erasure code.</li>
          <li><b>Distribute all 8.</b> Each of the 8 fragments (6 data + 2 parity) is stored on a
            different machine.</li>
          <li><b>Lose 2 machines.</b> Any 6 of the remaining fragments are enough to fully
            reconstruct the original file — including if the 2 lost fragments were both data.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of six data fragments and two parity fragments distributed across eight machines, with two machines lost but the original data still reconstructible from the remaining six fragments.">
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i}>
              <rect className={i >= 6 ? "boxAccent" : (i === 1 || i === 5 ? "boxWarn" : "box")} x={20 + i * 55} y="30" width="45" height="40" rx="5" />
              <text x={42 + i * 55} y="53" className="boxText">{i >= 6 ? `P${i - 5}` : `D${i + 1}`}</text>
            </g>
          ))}
          <text x="230" y="95" className="figHint" textAnchor="middle">2 fragments lost (marked) — still reconstructible from the remaining 6 of 8</text>
        </svg>
        <figcaption>6 data + 2 parity fragments: any 6 of the 8 reconstruct the original — for far less overhead than 3x replication.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Erasure coding costs more CPU to encode/decode and more network to reconstruct data after
          a failure than simple replication — using it for hot, frequently-accessed data can hurt
          latency. It's the right trade for large, infrequently-accessed data (backups, cold
          storage) where the storage savings outweigh the reconstruction cost.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a 10-data + 4-parity erasure coding scheme tolerate losing any 4 machines while using far less extra storage than triple replication?</p>
        </div>
      </section>
      <p className="takeaway">
        Erasure coding trades extra compute for far less storage overhead than replication — the
        standard choice for durable storage of large, cold data at scale.
      </p>
    </div>
  );
}
