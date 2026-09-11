import "../css/Article.css";

export default function DistributedTransactionsTwoPhaseCommit2pcArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Two-Phase Commit (2PC) is a protocol for atomically committing a transaction across
          multiple databases: a coordinator asks everyone to prepare, and only commits if every
          participant agrees.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          In the <b>prepare</b> phase, a coordinator asks every participant "can you commit this?"
          — each participant locks the relevant rows and votes yes or no, without committing yet.
          If every participant votes yes, the coordinator sends <b>commit</b> to all of them in the{" "}
          <b>commit</b> phase; if any votes no, it sends <b>abort</b> to all. This gives true
          atomicity — either everyone commits or everyone aborts — but at a real cost: participants
          hold locks the entire time, and if the coordinator crashes after participants vote yes
          but before sending the final decision, those participants are stuck blocked, unable to
          proceed either way, until the coordinator recovers.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Coordinator sends "prepare."</b> Both the inventory and payments services are
            asked if they can commit.</li>
          <li><b>Both vote yes,</b> locking their relevant rows and writing their intent to a log,
            but not committing yet.</li>
          <li><b>Coordinator decides.</b> Since both voted yes, it logs the decision and sends
            "commit" to both.</li>
          <li><b>Both commit</b> and release their locks — the operation is now atomically
            complete across both databases.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a two-phase commit coordinator asking two participants to prepare, receiving yes votes from both, and then sending a commit instruction to both participants.">
          <rect className="boxAccent" x="180" y="10" width="90" height="28" rx="5" /><text x="225" y="29" className="boxText">coordinator</text>
          <line className="flow" x1="200" y1="38" x2="110" y2="65" /><line className="flow" x1="250" y1="38" x2="340" y2="65" />
          <rect className="box" x="60" y="70" width="100" height="26" rx="4" /><text x="110" y="87" className="boxText">participant A</text>
          <rect className="box" x="290" y="70" width="100" height="26" rx="4" /><text x="340" y="87" className="boxText">participant B</text>
          <text x="110" y="55" className="figHint" textAnchor="middle">prepare</text><text x="340" y="55" className="figHint" textAnchor="middle">prepare</text>
          <text x="225" y="120" className="figHint" textAnchor="middle">both vote yes → coordinator sends commit to both</text>
        </svg>
        <figcaption>Every participant must vote yes before the coordinator commits any of them.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using 2PC across services that need to stay highly available is a common mismatch — the
          blocking behavior during a coordinator failure directly trades away availability, which
          is why many modern microservice architectures prefer sagas instead. Treating 2PC as free
          is another gap — held locks for the duration of the protocol reduce concurrency compared
          to a single local transaction.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can participants get stuck blocked, holding their locks, if the coordinator crashes between the prepare and commit phases?</p>
        </div>
      </section>
      <p className="takeaway">
        2PC delivers true cross-database atomicity at the cost of blocking and reduced
        availability if the coordinator fails — exactly the trade-off that later patterns like
        sagas were designed to avoid.
      </p>
    </div>
  );
}
