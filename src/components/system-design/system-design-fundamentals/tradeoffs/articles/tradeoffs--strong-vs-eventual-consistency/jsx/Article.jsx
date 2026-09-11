import "../css/Article.css";

export default function TradeoffsStrongVsEventualConsistencyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Strong consistency guarantees that every read sees the latest write, everywhere,
          immediately. Eventual consistency only guarantees that replicas will converge to the
          same value <i>eventually</i>, if no new writes happen — trading immediacy for
          availability and speed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Strong consistency usually means coordinating with other replicas before confirming a
          write (or serving a read) — which costs latency, and which can mean a request fails
          outright if enough replicas aren't reachable. Eventual consistency lets a replica answer
          a read from its own local, possibly-stale data, and lets writes succeed even if some
          replicas are temporarily unreachable, propagating the update to them later. This is a
          direct expression of the CAP theorem's core trade-off during a network partition.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A bank balance and a social media "like" count need very different consistency guarantees.</p>
        </div>
        <ol className="stepList">
          <li><b>Bank balance → strong consistency.</b> Reading a balance must reflect every
            confirmed transaction — showing a stale, too-high balance could let someone overdraw.</li>
          <li><b>Like count → eventual consistency.</b> If a like count is off by a few for a few
            seconds while it propagates across replicas, nobody's harmed, and the system stays fast
            and available even under partition.</li>
          <li><b>Pick per use case,</b> not globally — many real systems use strong consistency for
            money and state-changing operations, eventual consistency for high-volume, low-stakes
            counters and feeds.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram contrasting strong consistency where all replicas confirm a write before it succeeds versus eventual consistency where a write succeeds immediately and propagates to replicas afterward.">
          <text x="110" y="18" className="figLabel" textAnchor="middle">STRONG</text>
          <rect className="boxAccent" x="30" y="35" width="80" height="26" rx="4" /><text x="70" y="52" className="boxText">write</text>
          <line className="flow" x1="110" y1="48" x2="150" y2="48" />
          <rect className="box" x="160" y="30" width="60" height="20" rx="3" /><rect className="box" x="160" y="55" width="60" height="20" rx="3" />
          <text x="190" y="85" className="figHint" textAnchor="middle">must ack before "success"</text>
          <line className="divider" x1="240" y1="10" x2="240" y2="140" />
          <text x="340" y="18" className="figLabel" textAnchor="middle">EVENTUAL</text>
          <rect className="boxAccent" x="260" y="35" width="80" height="26" rx="4" /><text x="300" y="52" className="boxText">write → OK</text>
          <line className="flowMuted" x1="340" y1="48" x2="400" y2="48" />
          <rect className="box" x="330" y="75" width="60" height="20" rx="3" /><rect className="box" x="330" y="100" width="60" height="20" rx="3" />
          <text x="360" y="125" className="figHint" textAnchor="middle">replicas catch up after</text>
        </svg>
        <figcaption>Strong consistency waits for agreement; eventual consistency confirms immediately and syncs later.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Defaulting to eventual consistency for data where staleness causes real harm (permissions,
          payments, inventory that can be double-sold) is a costly mistake. The opposite —
          demanding strong consistency everywhere — needlessly sacrifices availability and latency
          for data where a few seconds of staleness truly doesn't matter.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might a system choose eventual consistency for a "like" counter but strong consistency for an account balance?</p>
        </div>
      </section>
      <p className="takeaway">
        Strong consistency buys certainty at the cost of latency and availability; eventual
        consistency buys speed and availability at the cost of temporary staleness — choose per
        piece of data, based on what staleness would actually cost you.
      </p>
    </div>
  );
}
