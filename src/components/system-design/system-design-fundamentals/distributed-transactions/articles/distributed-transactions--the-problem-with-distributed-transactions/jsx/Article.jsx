import "../css/Article.css";

export default function DistributedTransactionsTheProblemWithDistributedTransactionsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          ACID transactions give strong guarantees within a single database. The moment a "single
          logical operation" spans multiple databases or services, those guarantees don't
          automatically carry over — and getting them back is genuinely hard.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A local transaction relies on one database's internal locking and logging to guarantee
          atomicity — all-or-nothing. Across two separate services, there's no single component
          that can atomically decide "commit both" or "commit neither" — each service can only
          commit its own local transaction, and the network between the two decision points can
          fail at exactly the wrong moment. This is the reason distributed transaction protocols
          (2PC, 3PC) and alternative patterns (sagas, outbox) exist — they're all different answers
          to "how do I get something like atomicity across a network boundary."
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>Placing an order needs to both deduct inventory (inventory service) and charge a card (payments service) — two separate databases.</p>
        </div>
        <ol className="stepList">
          <li><b>Deduct inventory.</b> The inventory service commits its local transaction
            successfully.</li>
          <li><b>Charge the card.</b> The payments service call fails or times out.</li>
          <li><b>Now what?</b> Inventory has been deducted but payment never succeeded — the two
            databases disagree about whether this order actually happened.</li>
          <li><b>No single transaction covers both</b> — some explicit strategy (2PC, saga with
            compensation, or the outbox pattern) is required to avoid this inconsistency, it
            doesn't happen automatically.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of an order committing successfully in the inventory database but failing in the payments database, leaving the two databases in an inconsistent state with no single transaction spanning both.">
          <rect className="box" x="20" y="30" width="150" height="34" rx="6" /><text x="95" y="52" className="boxText">inventory DB: ✓ committed</text>
          <rect className="boxWarn" x="240" y="30" width="160" height="34" rx="6" /><text x="320" y="52" className="boxText">payments DB: ✕ failed</text>
          <text x="210" y="95" className="figHint" textAnchor="middle">no single transaction covers both — they can disagree</text>
        </svg>
        <figcaption>Two independent local commits, no atomic guarantee spanning both.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming "it'll usually work" and skipping any explicit strategy for cross-service
          atomicity leaves a real, if infrequent, path to permanently inconsistent data. The fix
          isn't always a heavyweight protocol either — often a simpler pattern (saga, outbox) is
          the more practical answer than trying to force full ACID across a network.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can't a single database's transaction mechanism guarantee atomicity across two separate services' databases?</p>
        </div>
      </section>
      <p className="takeaway">
        A network boundary breaks the assumptions local ACID transactions rely on — the rest of
        this section covers the specific patterns built to restore something like atomicity across
        that boundary.
      </p>
    </div>
  );
}
