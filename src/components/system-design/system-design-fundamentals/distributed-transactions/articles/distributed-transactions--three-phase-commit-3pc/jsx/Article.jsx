import "../css/Article.css";

export default function DistributedTransactionsThreePhaseCommit3pcArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Three-Phase Commit (3PC) extends 2PC with an extra step specifically to reduce the
          blocking problem — at the cost of more round trips and assumptions that don't always
          hold in real networks.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          3PC splits 2PC's commit phase into two: after everyone votes yes,
          the coordinator sends a <b>pre-commit</b> message (so every participant knows a
          commit is coming, even before it's told to actually do it), and only then sends the
          final <b>commit</b>. This extra step means that if the coordinator crashes, participants
          that received pre-commit can safely assume the transaction will commit and proceed
          without waiting indefinitely — reducing (not eliminating) 2PC's blocking window. The
          catch: 3PC assumes bounded network delay (a message will arrive within a known time
          limit), an assumption that doesn't always hold on real, unpredictable networks — which
          limits how much it's actually used in practice.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Phase 1: vote.</b> Coordinator asks to prepare; all participants vote yes.</li>
          <li><b>Phase 2: pre-commit.</b> Coordinator tells everyone "we're going to commit" —
            participants acknowledge but still don't apply the change yet.</li>
          <li><b>Coordinator crashes</b> before sending the final commit.</li>
          <li><b>Participants recover independently.</b> Since they already received pre-commit,
            they know every participant voted yes, so they can safely commit on their own without
            waiting for the coordinator to come back — the key improvement over 2PC.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of the three phases of 3PC: vote, pre-commit, and commit, with the extra pre-commit phase letting participants safely proceed on their own if the coordinator crashes afterward.">
          <rect className="box" x="20" y="45" width="110" height="30" rx="5" /><text x="75" y="65" className="boxText">1. vote</text>
          <line className="flow" x1="130" y1="60" x2="170" y2="60" />
          <rect className="boxAccent" x="180" y="45" width="110" height="30" rx="5" /><text x="235" y="65" className="boxText">2. pre-commit</text>
          <line className="flow" x1="290" y1="60" x2="330" y2="60" />
          <rect className="box" x="340" y="45" width="90" height="30" rx="5" /><text x="385" y="65" className="boxText">3. commit</text>
          <text x="235" y="100" className="figHint" textAnchor="middle">crash after pre-commit → participants can safely proceed alone</text>
        </svg>
        <figcaption>The added pre-commit step lets participants recover independently, unlike in 2PC.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming 3PC fully solves blocking is a common overstatement — it reduces the blocking
          window under its bounded-delay assumption, but real networks can still violate that
          assumption, and 3PC has its own known edge cases under certain partition scenarios. This
          is a large part of why 3PC sees relatively little real-world adoption compared to 2PC or,
          more commonly today, sagas.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does the extra pre-commit phase let participants recover independently after a coordinator crash, in a way 2PC can't?</p>
        </div>
      </section>
      <p className="takeaway">
        3PC trades an extra round trip for reduced (not eliminated) blocking — a real improvement
        on paper that depends on network assumptions real systems can't always guarantee.
      </p>
    </div>
  );
}
