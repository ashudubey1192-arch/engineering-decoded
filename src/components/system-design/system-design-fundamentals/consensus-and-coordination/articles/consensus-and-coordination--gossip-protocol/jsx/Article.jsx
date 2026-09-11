import "../css/Article.css";

export default function ConsensusAndCoordinationGossipProtocolArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A gossip protocol spreads information across a cluster the way rumors spread among
          people: each node periodically shares what it knows with a few random peers, and the
          information reaches everyone eventually — without any central broadcaster.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          On each round, a node picks a few random peers and exchanges state with them — each
          side updates to the newer information either has. This spreads information
          exponentially fast (each round roughly doubles the number of informed nodes) while
          putting only a small, constant load on any individual node, regardless of cluster size.
          It's also naturally resilient: there's no single broadcaster to fail, and a node
          rejoining after downtime just gossips its way back up to date.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Node A learns node X is unhealthy.</b> It marks that in its local state.</li>
          <li><b>Round 1.</b> A gossips with 2 random peers, B and C, who now also know X is
            unhealthy.</li>
          <li><b>Round 2.</b> A, B, and C each gossip with 2 more random peers — the number of
            informed nodes roughly doubles each round.</li>
          <li><b>Convergence.</b> Within a handful of rounds, the whole cluster knows about X —
            with no node ever having to talk to more than a few others per round.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of gossip spreading information exponentially across rounds, starting from one informed node and roughly doubling the number of informed nodes each round.">
          <circle className="boxAccent" cx="60" cy="70" r="18" /><text x="60" y="30" className="figHint" textAnchor="middle">round 0: 1 knows</text>
          <line className="flow" x1="78" y1="60" x2="140" y2="35" /><line className="flow" x1="78" y1="80" x2="140" y2="105" />
          <circle className="boxAccent" cx="160" cy="30" r="16" /><circle className="boxAccent" cx="160" cy="110" r="16" />
          <text x="160" y="150" className="figHint" textAnchor="middle">round 1: 3 know</text>
          {[[260, 15], [260, 45], [260, 95], [260, 125]].map(([x, y], i) => (<circle key={i} className="boxAccent" cx={x} cy={y} r="13" />))}
          <text x="340" y="70" className="figHint" textAnchor="middle">round 2: ~7 know...</text>
        </svg>
        <figcaption>Each round roughly doubles how many nodes know — fast, decentralized convergence.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Expecting gossip to deliver information instantly or in a guaranteed order is a mismatch
          — gossip is eventually consistent by design, good for things like cluster membership and
          failure detection, not for anything needing immediate, ordered delivery. Ignoring
          message size at scale can also matter — gossiping large payloads (instead of small
          deltas or digests) multiplies bandwidth use across the whole cluster.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does gossip spread information exponentially fast while keeping each individual node's workload constant, regardless of cluster size?</p>
        </div>
      </section>
      <p className="takeaway">
        Gossip trades immediate, guaranteed delivery for a decentralized, scalable way to
        eventually spread information — ideal for cluster membership and failure detection at
        large scale.
      </p>
    </div>
  );
}
