import "../css/Article.css";

export default function ConsensusAndCoordinationConsensusAlgorithmsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Consensus is getting a group of machines to agree on a single value, even when some
          machines might crash or messages might be delayed — the foundational problem behind
          leader election, distributed locks, and replicated logs.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A consensus algorithm must guarantee two things at once: <b>safety</b> (all nodes that
          decide, decide on the same value — never two different "winners") and{" "}
          <b>liveness</b> (the system eventually does make progress, assuming enough machines are
          working). This is provably impossible to guarantee perfectly under fully asynchronous
          conditions with even one failure (the FLP result) — which is why real algorithms like
          Paxos and Raft make pragmatic assumptions (timeouts, majority quorums) that work
          extremely well in practice rather than chasing an unreachable theoretical guarantee.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Five database replicas must agree</b> on which one is the primary, accepting
            writes.</li>
          <li><b>Propose a value.</b> One node proposes itself as leader.</li>
          <li><b>Gather a majority.</b> It needs agreement from at least 3 of 5 nodes — a quorum —
            before the decision is final.</li>
          <li><b>Decision is safe.</b> Because any two majorities out of 5 must overlap by at
            least one node, it's impossible for two different nodes to both gather a majority for
            conflicting proposals at the same time.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of five nodes where any two possible majority groups of three must share at least one common node, which is what prevents two conflicting decisions from both being finalized.">
          {[[80, 30], [150, 20], [220, 30], [160, 90], [100, 100]].map(([x, y], i) => (
            <circle key={i} className={i < 3 ? "boxAccent" : "box"} cx={x} cy={y} r="20" />
          ))}
          <text x="150" y="10" className="figHint" textAnchor="middle">majority A (nodes 1,2,3)</text>
          <circle className="box" cx="360" cy="60" r="20" style={{ opacity: 0.001 }} />
          <text x="150" y="130" className="figHint" textAnchor="middle">any other majority must overlap with this one</text>
        </svg>
        <figcaption>Any two majorities among 5 nodes must share at least one node — the basis of safe consensus.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Rolling your own ad hoc "agreement" logic instead of using a proven algorithm (Paxos,
          Raft) or a battle-tested implementation (etcd, ZooKeeper) is a common and risky shortcut
          — consensus has famously subtle edge cases that are easy to get wrong. Using an
          even-sized cluster is another frequent gap, since it doesn't improve fault tolerance over
          the next smaller odd number and can make majorities harder to reach.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does requiring a majority quorum guarantee that two conflicting proposals can never both be finalized?</p>
        </div>
      </section>
      <p className="takeaway">
        Consensus is what lets a group of unreliable machines safely agree on one thing — the rest
        of this section covers specific, proven algorithms and tools built on this idea.
      </p>
    </div>
  );
}
