import "../css/Article.css";

export default function DistributedSystemsFundamentalsNetworkPartitionsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A network partition happens when a network failure splits a distributed system into two
          or more groups of machines that can't talk to each other — even though each group is
          internally healthy and running fine.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The CAP theorem states that during a partition, a system must choose between
          Consistency (refuse requests that can't be safely answered) and Availability (keep
          answering, accepting the risk of inconsistency) — it cannot have both at once, because
          the two halves can't coordinate. Partitions aren't rare edge cases to design around
          later — on any large enough network, some partition will eventually happen, so systems
          need an explicit, deliberate answer for what happens when one does.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Normal operation.</b> A 6-node cluster split across two data centers replicates
            writes between all nodes.</li>
          <li><b>The link between data centers fails.</b> Now there are two groups of 3 nodes each,
            unable to reach each other, though each group is internally healthy.</li>
          <li><b>Choose CP.</b> The system could refuse writes on the minority side (or even both
            sides) until the partition heals, keeping data consistent at the cost of availability.</li>
          <li><b>Or choose AP.</b> Both sides could keep accepting writes independently, staying
            available, and reconcile the diverging data once the partition heals.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of a six node cluster split by a broken network link into two groups of three nodes, each internally connected but unable to reach the other group.">
          {[[70, 30], [110, 60], [70, 90]].map(([x, y], i) => (<circle key={"a" + i} className="box" cx={x} cy={y} r="18" />))}
          {[[350, 30], [310, 60], [350, 90]].map(([x, y], i) => (<circle key={"b" + i} className="box" cx={x} cy={y} r="18" />))}
          <line className="flowMuted" x1="70" y1="30" x2="110" y2="60" /><line className="flowMuted" x1="110" y1="60" x2="70" y2="90" /><line className="flowMuted" x1="70" y1="30" x2="70" y2="90" />
          <line className="flowMuted" x1="350" y1="30" x2="310" y2="60" /><line className="flowMuted" x1="310" y1="60" x2="350" y2="90" /><line className="flowMuted" x1="350" y1="30" x2="350" y2="90" />
          <line x1="150" y1="60" x2="270" y2="60" style={{ stroke: "var(--course-accent)", strokeWidth: 2, strokeDasharray: "4 4" }} />
          <text x="210" y="45" className="figHint" textAnchor="middle">✕ link down</text>
        </svg>
        <figcaption>Two internally-healthy groups, unable to reach each other — the defining shape of a partition.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming "the network is reliable" is one of the classic fallacies of distributed
          computing — every distributed system will eventually face a partition, so the failure
          mode needs to be a deliberate design decision, not an afterthought discovered during an
          actual outage.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>During a network partition, why can't a distributed system guarantee both full consistency and full availability at the same time?</p>
        </div>
      </section>
      <p className="takeaway">
        Partitions are a certainty, not a possibility, in any sufficiently large distributed
        system — the real design question is which guarantee, consistency or availability, you
        give up when one happens.
      </p>
    </div>
  );
}
