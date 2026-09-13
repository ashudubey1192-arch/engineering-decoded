import "../css/Article.css";

export default function DataLayerReplicationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Replication keeps copies of the same data on multiple machines &mdash; the standard
          answer to &ldquo;what happens if the database server dies&rdquo; and, often, to read
          scaling as well.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A <b>primary-replica</b> setup sends all writes to one primary, which streams changes to
          one or more replicas that serve read traffic. This buys two things at once: read
          scalability (spread reads across replicas) and durability (a replica can be promoted if
          the primary fails). The trade-off is <b>replication lag</b> &mdash; a replica&rsquo;s data
          is briefly behind the primary&rsquo;s, so reads from a replica can return slightly stale
          results.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Estimate shows heavy read traffic</b> against a single database instance already
            near its limit.</li>
          <li><b>Add two read replicas.</b> All writes still go to the primary; reads are spread
            across the replicas.</li>
          <li><b>The primary fails.</b> One replica is promoted to primary, and the design keeps
            serving writes within seconds instead of going fully down.</li>
          <li><b>A user updates their profile, then immediately reloads it</b> from a replica that
            hasn&rsquo;t caught up yet &mdash; they briefly see the old value, a direct consequence
            of replication lag.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a primary database streaming writes to two replicas, with writes going only to the primary and reads spread across all three." >
          <rect className="boxAccent" x="170" y="15" width="90" height="30" rx="5" /><text x="215" y="34" className="boxText" style={{fontSize:"9px"}}>Primary</text>
          <line className="flow" x1="200" y1="45" x2="100" y2="75" /><line className="flow" x1="240" y1="45" x2="330" y2="75" />
          <rect className="box" x="55" y="78" width="90" height="28" rx="5" /><text x="100" y="96" className="boxText" style={{fontSize:"8px"}}>Replica A</text>
          <rect className="box" x="285" y="78" width="90" height="28" rx="5" /><text x="330" y="96" className="boxText" style={{fontSize:"8px"}}>Replica B</text>
          <text x="215" y="60" className="figHint" textAnchor="middle" style={{fontSize:"8px"}}>writes replicate down</text>
        </svg>
        <figcaption>Writes flow only to the primary; replicas take reads and stand ready to be promoted.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reading a value from a replica immediately after writing it to the primary, and being
          surprised it&rsquo;s stale, is a common and avoidable bug &mdash; anything that must read
          its own most recent write should read from the primary. Assuming replica promotion is
          instant and lossless is another common gap; failover takes real time and can lose the
          last few unreplicated writes.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might a user briefly see stale data immediately after updating it, in a primary-replica setup?</p>
        </div>
      </section>
      <p className="takeaway">
        Replication buys read scale and failover protection at the cost of replication lag &mdash;
        design around that lag explicitly rather than assuming replicas are always perfectly
        up to date.
      </p>
    </div>
  );
}
