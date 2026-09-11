import "../css/Article.css";

export default function DistributedSystemsFundamentalsSplitBrainProblemArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Split brain is what happens when a network partition causes two halves of a cluster to
          each believe <i>they</i> are in charge — both accepting writes independently, with no
          way to know about the other, leading to conflicting, hard-to-reconcile data.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Many distributed systems elect a single leader to coordinate writes. If a partition
          isolates the leader from the rest of the cluster, the other side may (reasonably) elect a
          new leader, believing the old one is dead. Now there are two leaders, each accepting
          writes, each unaware of the other — that's split brain. The standard defense is
          requiring a <b>quorum</b> (a majority of nodes) to elect a leader or accept a write: only
          one side of any partition can possibly contain a majority, so only one side can proceed.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>5-node cluster, one leader.</b> Node 1 is the leader; nodes 2-5 are followers.</li>
          <li><b>Partition isolates the leader.</b> Node 1 ends up alone on one side; nodes 2-5 are
            together on the other.</li>
          <li><b>Without quorum:</b> both sides might elect/keep a leader — node 1 keeps accepting
            writes on its side, nodes 2-5 elect node 3 and accept writes on theirs. Data diverges.</li>
          <li><b>With quorum (3 of 5 needed):</b> node 1 alone can't reach a majority and steps
            down or refuses writes; nodes 2-5 can reach a majority and safely elect a new leader.
            Only one leader ever accepts writes.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of a five node cluster split by a partition, where the isolated single node cannot reach a majority quorum and steps down, while the remaining four nodes can and safely elect a new leader.">
          <circle className="boxWarn" cx="70" cy="60" r="24" /><text x="70" y="65" className="boxText">N1</text>
          <text x="70" y="105" className="figHint" textAnchor="middle">alone, no quorum → steps down</text>
          <line x1="140" y1="60" x2="200" y2="60" style={{ stroke: "var(--course-accent)", strokeWidth: 2, strokeDasharray: "4 4" }} />
          {[[280, 30], [340, 30], [280, 90], [340, 90]].map(([x, y], i) => (<circle key={i} className={i === 0 ? "boxAccent" : "box"} cx={x} cy={y} r="20" />))}
          <text x="310" y="120" className="figHint" textAnchor="middle">4 of 5 = majority → safely elects new leader</text>
        </svg>
        <figcaption>A quorum requirement ensures at most one side of any partition can proceed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Running a cluster with an even number of nodes (or no quorum requirement at all) leaves
          it vulnerable to split brain or to neither side reaching a majority. Some systems also
          add "fencing" (forcibly cutting off a suspected-dead node's access to shared resources)
          as an extra layer of protection beyond quorum alone.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does requiring a majority quorum to elect a leader guarantee that at most one side of a partition can have an active leader?</p>
        </div>
      </section>
      <p className="takeaway">
        Split brain happens when a partition lets two sides both believe they're in charge —
        quorum-based leadership is the standard defense, since only one side of any partition can
        ever hold a majority.
      </p>
    </div>
  );
}
