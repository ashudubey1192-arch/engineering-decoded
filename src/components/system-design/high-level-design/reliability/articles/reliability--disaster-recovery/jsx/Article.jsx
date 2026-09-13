import "../css/Article.css";

export default function ReliabilityDisasterRecoveryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Disaster recovery plans for the failure redundancy alone can&rsquo;t absorb &mdash; an
          entire region going down &mdash; and forces two explicit numbers onto the design: how
          much data you can afford to lose, and how long you can afford to be down.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Recovery Point Objective (RPO)</b> is how much data loss is acceptable, measured in
          time &mdash; an RPO of 5 minutes means backups or replication must be frequent enough
          that at most 5 minutes of writes are ever at risk. <b>Recovery Time Objective (RTO)</b>
          is how long recovery is allowed to take before the system is back up. These two numbers,
          agreed on explicitly, determine everything else: how often to back up, whether a warm
          standby region is needed, and how automated the recovery process has to be.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>The business states its tolerance:</b> RPO of 15 minutes, RTO of 1 hour for the
            order database.</li>
          <li><b>RPO of 15 minutes</b> rules out daily backups alone &mdash; it requires
            continuous replication to a secondary region, at minimum.</li>
          <li><b>RTO of 1 hour</b> rules out a fully manual, from-scratch rebuild &mdash; it
            requires a standby that can be promoted with mostly-automated steps.</li>
          <li><b>The region hosting the primary goes dark.</b> The team promotes the secondary
            region&rsquo;s replica, following a tested runbook, and is back within the agreed hour,
            having lost at most the last few minutes of writes.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Timeline diagram showing the last backup point, the moment of failure, the recovery point objective window of acceptable data loss, and the recovery time objective window before service is restored." >
          <line x1="20" y1="60" x2="400" y2="60" stroke="var(--line)" strokeWidth="1.5" />
          <circle className="ringNode" cx="150" cy="60" r="5" /><text x="150" y="45" className="figHint" textAnchor="middle" style={{fontSize:"7px"}}>last backup</text>
          <circle className="boxWarn" cx="220" cy="60" r="5" style={{stroke:"#e0574f"}} /><text x="220" y="80" className="figHint" textAnchor="middle" style={{fontSize:"7px"}}>failure</text>
          <line className="flow" x1="150" y1="60" x2="220" y2="60" style={{stroke:"#e0574f"}} /><text x="185" y="95" className="figHint" textAnchor="middle" style={{fontSize:"7px"}}>RPO: data at risk</text>
          <circle className="ringNode" cx="320" cy="60" r="5" /><text x="320" y="45" className="figHint" textAnchor="middle" style={{fontSize:"7px"}}>restored</text>
          <line className="flow" x1="220" y1="60" x2="320" y2="60" /><text x="270" y="95" className="figHint" textAnchor="middle" style={{fontSize:"7px"}}>RTO: downtime</text>
        </svg>
        <figcaption>RPO bounds how much data can be lost; RTO bounds how long recovery is allowed to take.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Having a disaster recovery plan that has never actually been rehearsed is a common,
          risky gap &mdash; the runbook that looks fine on paper often breaks on first real use.
          Agreeing to an RPO or RTO without checking whether the current architecture can actually
          meet it is the other common mistake &mdash; the numbers have to drive the design, not be
          promised independently of it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an RPO of 15 minutes rule out relying on daily backups alone?</p>
        </div>
      </section>
      <p className="takeaway">
        RPO and RTO turn &ldquo;what if the whole region goes down&rdquo; from a vague fear into
        two explicit numbers that the architecture is deliberately built to satisfy.
      </p>
    </div>
  );
}
