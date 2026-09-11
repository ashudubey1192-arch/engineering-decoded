import "../css/Article.css";

export default function DistributedTransactionsSagaPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A saga breaks a distributed transaction into a sequence of local transactions, each with
          a corresponding <b>compensating action</b> that undoes it — trading true atomicity for
          availability and no long-held locks.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of one all-or-nothing commit, a saga runs each step as its own local
          transaction, committed immediately. If a later step fails, the saga runs compensating
          actions for every step that already succeeded, in reverse order — undoing their effects
          through new, explicit operations (like refunding a charge) rather than a database
          rollback. This means each service commits independently, with no cross-service locks
          held, but it also means there's a window where the overall operation is only partially
          complete — other parts of the system may briefly observe that intermediate state.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Step 1: reserve inventory.</b> Commits immediately, locally.</li>
          <li><b>Step 2: charge payment.</b> Commits immediately, locally.</li>
          <li><b>Step 3: schedule shipping — fails.</b> No shipping slot is available.</li>
          <li><b>Run compensations in reverse.</b> Refund the payment (compensates step 2), then
            release the reserved inventory (compensates step 1) — each a real, explicit operation,
            not a database rollback.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 140" role="img" aria-label="Diagram of three saga steps executing in sequence, the third step failing, and compensating actions running in reverse order to undo the first two steps' effects." >
          <rect className="box" x="20" y="20" width="110" height="28" rx="4" /><text x="75" y="38" className="boxText">1. reserve ✓</text>
          <line className="flow" x1="130" y1="34" x2="170" y2="34" />
          <rect className="box" x="180" y="20" width="110" height="28" rx="4" /><text x="235" y="38" className="boxText">2. charge ✓</text>
          <line className="flow" x1="290" y1="34" x2="330" y2="34" />
          <rect className="boxWarn" x="340" y="20" width="100" height="28" rx="4" /><text x="390" y="38" className="boxText">3. ship ✕</text>
          <line className="flowMuted" x1="340" y1="55" x2="130" y2="90" />
          <rect className="boxAccent" x="180" y="85" width="110" height="28" rx="4" /><text x="235" y="103" className="boxText">compensate: refund</text>
          <rect className="boxAccent" x="20" y="85" width="110" height="28" rx="4" /><text x="75" y="103" className="boxText">compensate: release</text>
        </svg>
        <figcaption>Each step commits locally; a failure triggers compensations for every completed step, in reverse.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forgetting that sagas offer no true isolation — another process could read the
          partially-completed state (inventory reserved but payment not yet confirmed) before
          compensation kicks in — and not designing for that possibility is a common gap. Writing
          a compensating action that isn't itself safe to retry (not idempotent) is another
          frequent bug, especially since compensations themselves can fail and need retrying.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a saga's lack of isolation mean other parts of the system might briefly observe a partially-completed operation?</p>
        </div>
      </section>
      <p className="takeaway">
        Sagas trade true atomicity and isolation for availability and no cross-service locking —
        the standard approach for multi-step operations across microservices today.
      </p>
    </div>
  );
}
