import "../css/Article.css";

export default function ReliabilityRedundancyAndFailoverArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Redundancy means never having exactly one of anything critical; failover is the
          mechanism that actually switches traffic to the backup the moment the primary stops
          responding.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Redundancy without failover is nearly useless &mdash; a backup database that nothing
          knows how to switch to doesn&rsquo;t help during an actual outage. The two are always
          designed together: redundant instances (multiple API servers, replica databases, a
          secondary region), plus a mechanism &mdash; a load balancer&rsquo;s health checks, a
          leader election protocol, DNS failover &mdash; that detects the failure and redirects
          traffic automatically, ideally within seconds and without a human in the loop.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A single database instance</b> is a single point of failure &mdash; its loss takes
            down every write in the system.</li>
          <li><b>Add a standby replica</b> in a different availability zone, continuously
            replicating from the primary.</li>
          <li><b>Health checks monitor the primary</b> continuously for responsiveness.</li>
          <li><b>The primary&rsquo;s zone has an outage.</b> Failover promotes the standby
            automatically, and writes resume within seconds &mdash; the redundancy (the standby)
            was only useful because the failover (automatic promotion) existed alongside it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a primary database failing and a standby replica in a different zone being automatically promoted to take over traffic within seconds." >
          <rect className="boxWarn" x="30" y="35" width="120" height="40" rx="6" /><text x="90" y="59" className="boxText" style={{fontSize:"8px"}}>Primary: down</text>
          <line className="flow" x1="150" y1="55" x2="250" y2="55" /><text x="200" y="42" className="figHint" style={{fontSize:"8px"}}>failover</text>
          <rect className="boxAccent" x="260" y="35" width="130" height="40" rx="6" /><text x="325" y="59" className="boxText" style={{fontSize:"8px"}}>Standby: promoted</text>
        </svg>
        <figcaption>Redundancy provides the standby; failover is what actually promotes it when the primary fails.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Building redundancy without ever testing the failover path is a common and dangerous gap
          &mdash; the first time it&rsquo;s exercised shouldn&rsquo;t be during a real outage.
          Placing the redundant instance in the same failure domain as the primary (same rack, same
          availability zone) also defeats much of the purpose &mdash; a single event can then take
          both down together.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a backup database that has never had its failover path tested not meaningfully more reliable than having no backup at all?</p>
        </div>
      </section>
      <p className="takeaway">
        Redundancy and failover are one design decision, not two &mdash; a backup is only as good
        as the tested, automatic mechanism that actually switches to it.
      </p>
    </div>
  );
}
