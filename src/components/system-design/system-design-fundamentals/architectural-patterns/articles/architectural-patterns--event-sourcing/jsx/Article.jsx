import "../css/Article.css";

export default function ArchitecturalPatternsEventSourcingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Event sourcing stores every change to an entity as an immutable event, rather than just
          storing its current state — the current state is derived by replaying all of an entity's
          events in order.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of a row that says <code>balance: 150</code>, an event-sourced account stores{" "}
          <code>Deposited(100)</code>, <code>Deposited(100)</code>,{" "}
          <code>Withdrew(50)</code> — an append-only log of facts. The current state is just the
          result of folding all those events together. This gives you a complete audit trail for
          free, the ability to reconstruct state as of any point in time, and the ability to fix a
          bug in how state is derived and simply replay history with corrected logic. The
          trade-off: querying "current state" now requires replaying events (or maintaining a
          cached projection), and the event log can never be edited, only appended to.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Store events, not state.</b> An account's history is{" "}
            <code>AccountOpened</code>, <code>Deposited(100)</code>,{" "}
            <code>Withdrew(30)</code> — each appended, never modified.</li>
          <li><b>Derive current balance.</b> Replaying the events: 0 → 100 → 70. That's the
            current state, computed, not stored directly.</li>
          <li><b>Need history?</b> "What was the balance last Tuesday" replays events only up to
            that point — trivial, because the full history already exists.</li>
          <li><b>Speed it up with a snapshot.</b> For a long history, periodically cache the
            computed state so you don't replay from the very beginning every time.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of an append-only sequence of events being folded in order to produce the current derived state.">
          {["Opened", "Deposit 100", "Withdraw 30"].map((e, i) => (
            <g key={e}>
              <rect className="box" x={20 + i * 130} y="20" width="115" height="30" rx="5" /><text x={77 + i * 130} y="40" className="boxText">{e}</text>
              {i < 2 && <line className="flow" x1={135 + i * 130} y1="35" x2={150 + i * 130} y2="35" />}
            </g>
          ))}
          <line className="flow" x1="220" y1="50" x2="220" y2="80" />
          <text x="240" y="70" className="figHint">fold in order</text>
          <rect className="boxAccent" x="160" y="85" width="120" height="30" rx="5" /><text x="220" y="105" className="boxText">balance = 70</text>
        </svg>
        <figcaption>Events are the source of truth; current state is always a derived, replayable value.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using event sourcing for every entity in a system, including ones with no real need for
          history or audit trail, adds significant complexity for little benefit. Forgetting
          snapshots for long-lived, high-event-volume entities can also make replaying state slow
          — snapshotting periodically avoids replaying from event zero every time.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does event sourcing make it possible to reconstruct an entity's state as of any past point in time?</p>
        </div>
      </section>
      <p className="takeaway">
        Storing what happened, not just the current result, buys a full audit trail and
        point-in-time reconstruction — at the cost of deriving (or caching) current state instead
        of reading it directly.
      </p>
    </div>
  );
}
