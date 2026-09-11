import "../css/Article.css";

export default function ConsensusAndCoordinationDistributedLocksArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A distributed lock lets multiple processes across different machines coordinate
          exclusive access to a shared resource — the distributed equivalent of a mutex, but with
          all the extra failure modes a network introduces.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A distributed lock is typically implemented as a key in a shared store (Redis, etcd,
          ZooKeeper) that only one client can hold at a time, usually with a time-to-live so a
          crashed holder doesn't lock the resource forever. The subtle danger: a client can believe
          it holds the lock (its local clock says the lease hasn't expired) while the lock service
          has actually already expired and reassigned it — for example after a long GC pause. Using
          the lock safely for something truly critical means also verifying, at the point of use,
          that the lock is still valid (a fencing token), not just trusting that it was acquired
          earlier.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Acquire the lock.</b> A worker sets a key <code>lock:job-42</code> in Redis with
            a 10-second TTL, and receives a fencing token (a monotonically increasing number).</li>
          <li><b>Do the work.</b> The worker processes job 42.</li>
          <li><b>A long pause happens</b> (GC, scheduling delay) that exceeds 10 seconds — the
            lock expires and a second worker acquires it with a higher fencing token.</li>
          <li><b>First worker resumes</b> and tries to write its result, presenting its (now
            stale) fencing token — the storage layer rejects it because a higher token has already
            been seen, preventing the two workers from corrupting each other's work.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a worker acquiring a lock with a fencing token, pausing past the lock's expiry, and a second worker acquiring the lock with a higher token, so the first worker's stale write is rejected.">
          <rect className="box" x="20" y="20" width="120" height="30" rx="5" /><text x="80" y="40" className="boxText">worker 1: token=5</text>
          <rect className="boxWarn" x="20" y="60" width="120" height="24" rx="4" /><text x="80" y="76" className="boxText">long pause...</text>
          <rect className="boxAccent" x="180" y="20" width="130" height="30" rx="5" /><text x="245" y="40" className="boxText">worker 2: token=6</text>
          <line className="flow" x1="20" y1="100" x2="140" y2="100" /><text x="80" y="115" className="figHint" textAnchor="middle">worker 1 writes with token=5 → rejected (stale)</text>
        </svg>
        <figcaption>A fencing token lets the storage layer reject a stale write from a worker that lost its lock.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using a distributed lock without a fencing mechanism for anything where a stale write
          would cause real harm is a classic, subtle bug — the lock alone doesn't protect you from
          a paused-then-resumed holder. Setting the TTL too short causes locks to expire and get
          reassigned mid-task; too long delays recovery when a holder genuinely crashes.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a lock's TTL alone not enough to guarantee mutual exclusion, and what does a fencing token add?</p>
        </div>
      </section>
      <p className="takeaway">
        A distributed lock provides coordination, but only a fencing token — checked at the point
        of use — actually protects against a holder that paused past its lease without realizing it.
      </p>
    </div>
  );
}
