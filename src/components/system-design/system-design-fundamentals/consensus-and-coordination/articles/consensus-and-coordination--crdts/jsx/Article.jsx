import "../css/Article.css";

export default function ConsensusAndCoordinationCrdtsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A CRDT (Conflict-free Replicated Data Type) is a data structure specifically designed so
          that replicas can be updated independently, without coordination, and always merge back
          into the same result — no conflict resolution logic required.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The trick is designing operations to be mathematically commutative, associative, and
          idempotent — so merging updates in any order, any number of times, always converges to
          the same state. A simple example: a <b>grow-only counter</b> per replica, where the
          total is the sum of all replicas' counters — merging never loses an increment regardless
          of order. More advanced CRDTs handle sets, maps, and even collaboratively-edited text,
          each with a specific merge rule that guarantees convergence.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A "like" counter needs to keep working even while two data centers are cut off from each other.</p>
        </div>
        <ol className="stepList">
          <li><b>Each replica tracks its own count.</b> Data center A tracks likes it received;
            data center B tracks likes it received — independently, with no coordination.</li>
          <li><b>Partition happens.</b> A and B can't talk, but both keep accepting likes locally.</li>
          <li><b>Partition heals.</b> The replicas exchange their per-replica counts.</li>
          <li><b>Merge by summing.</b> The total is simply the sum of every replica's count — no
            conflict to resolve, and the merge gives the same total no matter which replica
            initiates it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of two replicas independently incrementing their own counters during a partition, then merging by summing both counters once reconnected, with no conflict resolution needed.">
          <rect className="box" x="30" y="20" width="100" height="30" rx="5" /><text x="80" y="40" className="boxText">A: count=7</text>
          <rect className="box" x="290" y="20" width="100" height="30" rx="5" /><text x="340" y="40" className="boxText">B: count=4</text>
          <line className="flow" x1="130" y1="35" x2="290" y2="35" style={{ strokeDasharray: "3 3" }} />
          <line className="flow" x1="130" y1="60" x2="190" y2="90" /><line className="flow" x1="290" y1="60" x2="230" y2="90" />
          <rect className="boxAccent" x="150" y="90" width="120" height="30" rx="5" /><text x="210" y="110" className="boxText">merged = 11</text>
        </svg>
        <figcaption>Merging is just addition — order and timing don't affect the converged result.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for a general-purpose CRDT for data where operations don't have an obvious
          conflict-free merge rule (like "the account balance must never go negative") forces
          awkward workarounds — CRDTs fit specific data shapes well, not everything. Some CRDTs
          also grow metadata over time (like tombstones for deleted elements), which needs active
          management in long-running systems.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a grow-only counter CRDT always converge to the same total regardless of the order replicas are merged in?</p>
        </div>
      </section>
      <p className="takeaway">
        CRDTs sidestep conflict resolution entirely by designing the data structure's merge
        operation to always converge, no matter what order or how many times replicas sync.
      </p>
    </div>
  );
}
