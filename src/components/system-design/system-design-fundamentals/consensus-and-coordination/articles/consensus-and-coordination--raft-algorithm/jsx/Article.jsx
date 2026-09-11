import "../css/Article.css";

export default function ConsensusAndCoordinationRaftAlgorithmArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Raft solves the same problem as Paxos — safe consensus across unreliable machines — but
          was explicitly designed to be easier to understand and implement correctly, by splitting
          the problem into clearly separate parts.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Raft always maintains an explicit leader, elected by majority vote, that alone accepts
          writes and replicates them, in order, to followers as a log. Raft breaks the problem
          into three understandable pieces: <b>leader election</b> (nodes vote for a leader using
          randomized timeouts to avoid ties), <b>log replication</b> (the leader appends entries
          and replicates them to followers, committing once a majority acknowledge), and{" "}
          <b>safety</b> (rules ensuring a newly elected leader always has every previously
          committed entry). This structure is exactly why Raft is the algorithm behind etcd,
          Consul, and many other widely-used systems.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Election.</b> The current leader stops sending heartbeats (it crashed); a
            follower's randomized election timeout fires first, and it becomes a candidate,
            requesting votes.</li>
          <li><b>Majority votes.</b> It wins a majority and becomes the new leader.</li>
          <li><b>Log replication.</b> A client write is appended to the new leader's log and sent
            to all followers.</li>
          <li><b>Commit on majority.</b> Once a majority of followers acknowledge the entry, it's
            committed and safely applied — the client gets a success response.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a Raft leader appending a log entry and replicating it to followers, committing the entry once a majority of followers acknowledge it.">
          <rect className="boxAccent" x="170" y="15" width="100" height="30" rx="5" /><text x="220" y="35" className="boxText">leader</text>
          <line className="flow" x1="190" y1="45" x2="100" y2="75" /><line className="flow" x1="220" y1="45" x2="220" y2="75" /><line className="flow" x1="250" y1="45" x2="340" y2="75" />
          <rect className="box" x="55" y="80" width="90" height="26" rx="4" /><text x="100" y="97" className="boxText">follower ✓</text>
          <rect className="box" x="175" y="80" width="90" height="26" rx="4" /><text x="220" y="97" className="boxText">follower ✓</text>
          <rect className="box" x="295" y="80" width="90" height="26" rx="4" /><text x="340" y="97" className="boxText">follower</text>
          <text x="220" y="125" className="figHint" textAnchor="middle">2 of 3 followers ack'd → majority → entry committed</text>
        </svg>
        <figcaption>The leader replicates each entry and commits it once a majority of followers acknowledge.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Configuring election timeouts identically (or too close together) across nodes
          undermines the randomization Raft relies on to avoid repeated split votes. Misunderstanding
          that "committed" requires a majority — not all — followers can lead to incorrect
          assumptions about what's actually safe to acknowledge to a client.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does Raft use randomized election timeouts instead of a fixed timeout for every node?</p>
        </div>
      </section>
      <p className="takeaway">
        Raft achieves the same safety guarantees as Paxos through a more structured, explicit-leader
        design — which is largely why it's become the default consensus algorithm for new systems.
      </p>
    </div>
  );
}
