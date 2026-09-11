import "../css/Article.css";

export default function TimeAndOrderingLamportTimestampsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A Lamport timestamp is the simplest concrete logical clock: a single integer counter per
          node, updated with two small rules, that guarantees causally-related events get
          consistently ordered timestamps.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The rules: (1) before any local event, a node increments its own counter; (2) when
          sending a message, it attaches its current counter value, and when receiving one, the
          node sets its counter to <code>max(local, received) + 1</code>. This guarantees that if
          event A happened-before event B, then A's timestamp is less than B's. The limitation:
          the reverse isn't guaranteed — two unrelated (concurrent) events can end up with
          timestamps in either order, or coincidentally equal ones, since a single number can't
          capture the full shape of causality.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Node A: local event.</b> Counter goes from 0 to 1.</li>
          <li><b>Node A sends a message</b> tagged with timestamp 1.</li>
          <li><b>Node B receives it.</b> Node B's own counter was at 0; it becomes{" "}
            <code>max(0, 1) + 1 = 2</code>.</li>
          <li><b>Compare timestamps.</b> A's send (1) is less than B's receive (2) — correctly
            reflecting that the send happened-before the receive.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a Lamport timestamp counter incrementing on a local event and jumping to max of local and received plus one when a message arrives, keeping causally related events correctly ordered.">
          <rect className="box" x="20" y="20" width="90" height="28" rx="4" /><text x="65" y="38" className="boxText">local: 0→1</text>
          <line className="flow" x1="110" y1="34" x2="170" y2="34" />
          <rect className="boxAccent" x="180" y="20" width="90" height="28" rx="4" /><text x="225" y="38" className="boxText">send: ts=1</text>
          <line className="flow" x1="270" y1="34" x2="330" y2="34" />
          <rect className="box" x="340" y="20" width="70" height="28" rx="4" /><text x="375" y="38" className="boxText">recv</text>
          <text x="375" y="70" className="figHint" textAnchor="middle">B: max(0,1)+1 = 2</text>
        </svg>
        <figcaption>A single incrementing counter, bumped past any received value, keeps causal order intact.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming a smaller Lamport timestamp always means "happened before" in every case is
          incorrect — it only guarantees the forward direction (happened-before implies smaller
          timestamp), not that any two timestamps' order reflects a real causal relationship.
          When you need to explicitly detect which events are truly concurrent versus causally
          related, vector clocks (next article) are the tool, not Lamport timestamps.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>If event A has a smaller Lamport timestamp than event B, does that guarantee A happened-before B? Why or why not?</p>
        </div>
      </section>
      <p className="takeaway">
        Lamport timestamps are a cheap, simple way to guarantee causally-related events get
        correctly ordered numbers — at the cost of not being able to distinguish "definitely
        before" from "merely concurrent."
      </p>
    </div>
  );
}
