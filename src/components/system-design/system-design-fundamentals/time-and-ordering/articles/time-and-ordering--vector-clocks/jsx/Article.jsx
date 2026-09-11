import "../css/Article.css";

export default function TimeAndOrderingVectorClocksArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A vector clock extends Lamport's idea with one counter per node instead of one counter
          total — letting it do something Lamport timestamps can't: definitively tell whether two
          events are causally related or truly concurrent.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each node keeps a full vector of counters, one per node in the system (e.g.,{" "}
          <code>[A: 2, B: 1, C: 0]</code>). A node increments only its own entry on a local event,
          and when receiving a message, it takes the element-wise max of its vector and the
          received one, then increments its own entry. Comparing two vectors tells you their exact
          relationship: if every entry in one is ≤ the other (and at least one is strictly less),
          one happened-before the other. If neither vector dominates the other, the events are
          truly concurrent — something a single Lamport number could never reveal.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A distributed database needs to know whether two conflicting writes to the same key were causally related or genuinely simultaneous, to decide how to merge them.</p>
        </div>
        <ol className="stepList">
          <li><b>Node A writes.</b> Its vector becomes <code>[A:1, B:0]</code>.</li>
          <li><b>Node B writes independently,</b> having never seen A's write. Its vector becomes{" "}
            <code>[A:0, B:1]</code>.</li>
          <li><b>Compare the vectors.</b> Neither <code>[1,0]</code> nor <code>[0,1]</code>{" "}
            dominates the other — the database now knows for certain these are concurrent,
            conflicting writes, not one superseding the other.</li>
          <li><b>Resolve the conflict explicitly</b> — merge, prompt the application, or use a
            deterministic tiebreaker — because the vector clock proved a simple "keep the newer
            one" rule doesn't apply here.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of two nodes each independently writing without seeing the other's write, producing vector clocks that neither dominates the other, proving the writes are concurrent rather than causally ordered.">
          <rect className="boxAccent" x="30" y="30" width="130" height="34" rx="5" /><text x="95" y="52" className="boxText">A: [1, 0]</text>
          <rect className="boxAccent" x="260" y="30" width="130" height="34" rx="5" /><text x="325" y="52" className="boxText">B: [0, 1]</text>
          <text x="210" y="50" className="figHint" textAnchor="middle">neither dominates</text>
          <text x="210" y="95" className="figHint" textAnchor="middle">→ provably concurrent, not causally ordered</text>
        </svg>
        <figcaption>Neither vector is fully ≤ the other — proof the two writes were genuinely concurrent.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Vector clocks grow with the number of nodes — using them naively in a system with
          thousands of nodes or short-lived actors (rather than a small, relatively stable set of
          replicas) makes the vectors themselves a real storage and bandwidth cost. Reaching for
          vector clocks when a simpler Lamport timestamp would answer the actual question is
          unnecessary overhead in the other direction.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a vector clock detect true concurrency between two events when a single Lamport timestamp cannot?</p>
        </div>
      </section>
      <p className="takeaway">
        Vector clocks trade a bit more size and bookkeeping for a precise answer Lamport
        timestamps can't give: whether two events are causally related or genuinely concurrent.
      </p>
    </div>
  );
}
