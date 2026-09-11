import "../css/Article.css";

export default function DistributedSystemsFundamentalsHeartbeatsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A heartbeat is a small, periodic "I'm still alive" message one node sends to another —
          the basic mechanism distributed systems use to detect that a peer has failed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each node sends a lightweight heartbeat on a fixed interval; if a receiver doesn't see
          one within some timeout, it assumes the sender has failed and takes action — removing it
          from a load balancer's pool, triggering a leader election, or marking a replica
          unhealthy. The timeout is a real tuning trade-off: too short, and normal network jitter
          triggers false failure detection; too long, and a genuine failure takes a long time to
          notice and react to.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Set the interval.</b> Each node sends a heartbeat every 2 seconds.</li>
          <li><b>Set the timeout.</b> A node is considered failed if no heartbeat arrives within
            6 seconds — a few missed intervals, to absorb normal jitter.</li>
          <li><b>A node crashes.</b> Its heartbeats stop.</li>
          <li><b>Peers notice within the timeout window.</b> After 6 seconds of silence, peers mark
            it as failed and react — removing it from routing, starting a leader election, or
            alerting an operator.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of a node sending periodic heartbeat pulses to a peer, then the heartbeats stopping after a crash, with the peer detecting the failure once the timeout window elapses.">
          <line x1="20" y1="60" x2="420" y2="60" stroke="var(--muted)" />
          {[0, 1, 2].map((i) => (<circle key={i} className="box" cx={60 + i * 70} cy="60" r="6" />))}
          <text x="130" y="40" className="figHint" textAnchor="middle">heartbeats every 2s</text>
          <rect className="boxWarn" x="280" y="45" width="120" height="30" rx="5" /><text x="340" y="65" className="boxText">silence → timeout</text>
          <text x="340" y="95" className="figHint" textAnchor="middle">after 6s with no pulse, peer marks it failed</text>
        </svg>
        <figcaption>Regular pulses signal life; their absence past a timeout signals failure.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Setting the timeout too aggressively causes false positives during ordinary network
          blips or GC pauses, triggering unnecessary failovers. It's also a mistake to assume a
          missed heartbeat definitively means "dead" — it only means "unreachable right now,"
          which is why systems built on heartbeats (like leader election) still need quorum-based
          safeguards against split brain.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a missed heartbeat only prove "unreachable," not "actually dead" — and why does that distinction matter for failover logic?</p>
        </div>
      </section>
      <p className="takeaway">
        Heartbeats are the simplest failure detector in distributed systems — their timeout is a
        direct trade between fast detection and tolerance for normal network noise.
      </p>
    </div>
  );
}
