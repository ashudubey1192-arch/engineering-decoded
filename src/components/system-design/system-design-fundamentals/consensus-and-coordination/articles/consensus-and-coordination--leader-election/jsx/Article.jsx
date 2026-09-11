import "../css/Article.css";

export default function ConsensusAndCoordinationLeaderElectionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Leader election is the specific, common problem of getting a group of nodes to agree on
          exactly one of them to coordinate some activity — it's the piece that consensus
          algorithms like Raft solve internally, and it's also useful as a standalone building
          block.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The requirement is simple to state and hard to get fully right: at any given time, all
          live nodes should agree on who the leader is, and if the leader fails, the remaining
          nodes should elect a new one. Real implementations lean on tools that already solve
          consensus internally — ZooKeeper (ephemeral nodes + watches), etcd (leases), or Raft's
          own built-in election — rather than reinventing the underlying coordination logic from
          scratch.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Nodes race to claim leadership.</b> Each candidate tries to create the same
            uniquely-named lock/key in a coordination service (like etcd) — only one can succeed.</li>
          <li><b>Winner becomes leader.</b> The node that created the key is the leader; it
            attaches a lease that must be periodically renewed.</li>
          <li><b>Leader does its job</b> — e.g., assigning work to other nodes — while
            periodically renewing its lease to prove it's still alive.</li>
          <li><b>Leader crashes.</b> It stops renewing the lease; the lease expires, the key is
            removed, and the remaining nodes race again to claim it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of three candidate nodes racing to claim a leadership key in a coordination service, with only one succeeding and becoming leader while renewing a lease to stay leader.">
          {[[70, 30], [70, 70], [70, 110]].map(([x, y], i) => (<rect key={i} className="box" x={x - 40} y={y - 15} width="80" height="26" rx="4" />))}
          <text x="70" y="35" className="boxText" textAnchor="middle">node A</text><text x="70" y="75" className="boxText" textAnchor="middle">node B</text><text x="70" y="115" className="boxText" textAnchor="middle">node C</text>
          <line className="flow" x1="110" y1="30" x2="180" y2="65" /><line className="flow" x1="110" y1="70" x2="180" y2="65" /><line className="flow" x1="110" y1="110" x2="180" y2="65" />
          <rect className="boxAccent" x="190" y="50" width="110" height="30" rx="5" /><text x="245" y="70" className="boxText">lock key (1 wins)</text>
          <text x="245" y="100" className="figHint" textAnchor="middle">winner = leader, renews lease</text>
        </svg>
        <figcaption>Only one candidate can claim the leadership key; it stays leader by renewing its lease.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming "I believe I'm the leader" is always true is dangerous — a leader can be
          isolated by a network partition while still believing it holds the lease (it just hasn't
          noticed the lease expired on the coordination service's side). Anything the leader does
          that's hard to undo needs a way to verify its leadership is still valid at the moment it
          acts, not just when it was first elected.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a node that "thinks" it's still the leader actually no longer be the leader from the rest of the system's point of view?</p>
        </div>
      </section>
      <p className="takeaway">
        Leader election gives a group exactly one coordinator at a time — in practice, built on
        top of a coordination service or consensus algorithm rather than implemented from scratch.
      </p>
    </div>
  );
}
