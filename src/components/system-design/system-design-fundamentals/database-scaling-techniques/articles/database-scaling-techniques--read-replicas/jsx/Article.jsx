import "../css/Article.css";

export default function DatabaseScalingTechniquesReadReplicasArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A read replica is a copy of your database that continuously applies the primary's
          writes and serves read traffic, so reads and writes stop competing for the same machine.
        </p>
        <p>
          Most applications read far more than they write — a social feed might see 100 reads for
          every write. Read replicas let you scale that read volume horizontally by adding more
          replicas, while all writes still funnel through a single primary.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The primary streams a replication log of every change to each replica, which replays it
          locally. This is almost always <b>asynchronous</b>: the primary doesn't wait for
          replicas to confirm before acknowledging a write, which keeps writes fast but means
          replicas trail the primary by some amount of <b>replication lag</b> — typically
          milliseconds, occasionally seconds under heavy load.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Provision replicas.</b> Stand up two read replicas of the orders database.</li>
          <li><b>Split traffic at the connection layer.</b> Writes (<code>INSERT</code>,{" "}
            <code>UPDATE</code>) go to the primary; reads go to a round-robin pool of replicas.</li>
          <li><b>Route carefully.</b> A "view my order confirmation" page right after checkout
            reads from the <em>primary</em> to avoid showing a not-yet-replicated order as missing.</li>
          <li><b>Monitor lag.</b> Alert if replication lag exceeds a threshold, and temporarily
            pull a lagging replica out of the read pool.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 170" role="img" aria-label="Diagram of a primary database streaming writes to two replicas, while client reads are load balanced across the replicas and writes go only to the primary.">
          <rect className="boxAccent" x="180" y="15" width="100" height="36" rx="6" />
          <text x="230" y="38" className="boxText">PRIMARY</text>
          <line className="flow" x1="210" y1="51" x2="120" y2="90" />
          <line className="flow" x1="250" y1="51" x2="340" y2="90" />
          <text x="150" y="75" className="figHint">replication</text>
          <rect className="box" x="70" y="95" width="100" height="36" rx="6" />
          <text x="120" y="118" className="boxText">REPLICA A</text>
          <rect className="box" x="290" y="95" width="100" height="36" rx="6" />
          <text x="340" y="118" className="boxText">REPLICA B</text>
          <line className="flowMuted" x1="230" y1="155" x2="230" y2="51" />
          <text x="235" y="150" className="figHint">writes →</text>
          <line className="flow" x1="120" y1="155" x2="120" y2="131" />
          <line className="flow" x1="340" y1="155" x2="340" y2="131" />
          <text x="120" y="167" className="figHint" textAnchor="middle">reads</text>
          <text x="340" y="167" className="figHint" textAnchor="middle">reads</text>
        </svg>
        <figcaption>Writes always go to one primary; reads spread across replicas that trail it slightly.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The classic bug is reading your own write from a replica that hasn't caught up yet — a
          user updates their profile, refreshes, and briefly sees the old data. Route
          read-your-own-write paths to the primary, or track a "read from primary for N seconds
          after writing" rule. Also watch for replicas silently falling far behind under load,
          which can turn "eventually consistent" into "consistent whenever."
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why are read replicas usually asynchronous, and what problem does that trade-off create for the client that just wrote the data?</p>
        </div>
      </section>
      <p className="takeaway">
        Read replicas scale read throughput horizontally without touching write capacity — the
        price is replication lag, which you have to design around, not ignore.
      </p>
    </div>
  );
}
