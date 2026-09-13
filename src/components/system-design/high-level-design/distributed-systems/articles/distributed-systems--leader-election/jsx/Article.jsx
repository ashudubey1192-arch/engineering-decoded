import "../css/Article.css";

export default function DistributedSystemsLeaderElectionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Whenever a design needs exactly one node to make a decision &mdash; who&rsquo;s the
          primary database, who assigns work &mdash; a leader election mechanism is what the group
          of nodes uses to agree on who that one node is.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Leader election lets a group of nodes agree on a single leader, and &mdash; critically
          &mdash; detect and replace that leader if it fails, without any node needing to be
          manually configured as &ldquo;the one.&rdquo; Nodes typically exchange heartbeats; if the
          leader stops heartbeating, the remaining nodes run an election (often via an underlying
          consensus protocol) to pick a new one. This is what lets a primary-replica database
          setup fail over automatically instead of requiring a human to promote a replica by hand.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Three database nodes</b> run a leader election protocol on startup; one becomes
            the primary, the other two become replicas.</li>
          <li><b>The primary sends heartbeats</b> to the replicas at a regular interval.</li>
          <li><b>The primary crashes.</b> Replicas notice the missing heartbeats after a timeout
            and start an election.</li>
          <li><b>A new primary is chosen</b> among the surviving replicas, and writes resume being
            accepted &mdash; without a person intervening.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a leader sending heartbeats to two followers, then, after the leader fails, the followers electing a new leader among themselves." >
          <rect className="boxAccent" x="170" y="15" width="80" height="30" rx="5" /><text x="210" y="34" className="boxText" style={{fontSize:"9px"}}>Leader</text>
          <line className="flowMuted" x1="200" y1="45" x2="100" y2="75" /><line className="flowMuted" x1="240" y1="45" x2="330" y2="75" />
          <rect className="box" x="55" y="78" width="90" height="28" rx="5" /><text x="100" y="96" className="boxText" style={{fontSize:"8px"}}>Follower A</text>
          <rect className="box" x="285" y="78" width="90" height="28" rx="5" /><text x="330" y="96" className="boxText" style={{fontSize:"8px"}}>Follower B</text>
          <text x="210" y="65" className="figHint" textAnchor="middle" style={{fontSize:"8px"}}>heartbeats stop &rarr; election</text>
        </svg>
        <figcaption>When heartbeats from the leader stop arriving, the remaining nodes elect a replacement among themselves.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Setting the failure-detection timeout too short causes spurious elections on brief
          network blips; too long delays recovery from a genuine failure noticeably. A subtler
          failure mode, split brain &mdash; two nodes each believing they&rsquo;re the leader after
          a partition &mdash; is why real implementations require a majority of nodes to agree
          before an election succeeds.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why must a leader election require a majority of nodes to agree, rather than letting any single node declare itself leader?</p>
        </div>
      </section>
      <p className="takeaway">
        Leader election turns &ldquo;who&rsquo;s in charge&rdquo; from a manual, human-driven
        decision into something the system detects and resolves automatically when a leader fails.
      </p>
    </div>
  );
}
