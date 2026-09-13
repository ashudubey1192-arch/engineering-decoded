import "../css/Article.css";

export default function DistributedDataEventSourcingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Event sourcing stores every change to an entity as an immutable event, in order, instead
          of only storing its current state &mdash; the current state becomes something you compute
          by replaying history, not something you store directly at all.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of an <code>accounts</code> table with a <code>balance</code> column that gets
          overwritten on every transaction, an event-sourced <code>Account</code> stores an ordered
          log: <code>AccountOpened</code>, <code>FundsDeposited</code>, <code>FundsWithdrawn</code>...
          The current balance is computed by folding over that log from the start (or from the last
          saved snapshot). Nothing is ever deleted or overwritten &mdash; correcting a mistake means
          appending a new event that reverses it, not editing history.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Account <code>acc_42</code>'s current balance is derived, not stored directly:
        </p>
        <span className="codeLabel">REPLAYING EVENTS TO GET CURRENT STATE</span>
        <div className="codeBlock">
          <pre>{`events = [
  { type: "AccountOpened", amount: 0 },
  { type: "FundsDeposited", amount: 500 },
  { type: "FundsWithdrawn", amount: 120 },
]
balance = events.reduce((sum, e) =>
  e.type === "FundsDeposited" ? sum + e.amount :
  e.type === "FundsWithdrawn" ? sum - e.amount : sum, 0)
// balance === 380`}</pre>
        </div>
        <p>
          Because every event is kept, <code>AccountService</code> can answer not just "what's the
          balance now" but "what was the balance last Tuesday" or "show me every withdrawal this
          account has ever made" &mdash; questions a table that only stores the current balance
          simply cannot answer.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of an event log for one account, AccountOpened then FundsDeposited then FundsWithdrawn, with the current balance shown as a value computed by folding over that ordered log, rather than stored directly." >
          {["AccountOpened","FundsDeposited\n+500","FundsWithdrawn\n-120"].map((t,i) => (
            <g key={i}>
              <rect className="box" x={20 + i*130} y="20" width="110" height="36" rx="6" />
              {t.split("\n").map((line,li) => (<text key={li} x={75 + i*130} y={38 + li*13} className="boxText" style={{fontSize:"6.5px"}}>{line}</text>))}
              {i < 2 && <line className="flow" x1={130 + i*130} y1="38" x2={150 + i*130} y2="38" />}
            </g>
          ))}
          <line className="flowMuted" x1="75" y1="56" x2="210" y2="85" />
          <line className="flowMuted" x1="205" y1="56" x2="210" y2="85" />
          <line className="flowMuted" x1="335" y1="56" x2="210" y2="85" />
          <rect className="boxAccent" x="165" y="80" width="90" height="26" rx="5" />
          <text x="210" y="97" className="boxText" style={{fontSize:"6.5px"}}>balance = 380</text>
        </svg>
        <figcaption>The current balance isn't stored anywhere &mdash; it's computed by folding over the full ordered event log.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Replaying the entire event history from scratch on every single read is a common
          performance mistake once an entity has thousands of events &mdash; real systems save
          periodic snapshots and only replay events since the last one. Treating events as free to
          restructure later is the other mistake: because events are the permanent source of truth,
          changing an event's shape after real events have already been stored in the old shape
          requires a migration strategy, not a quick edit.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>An event-sourced account has 50,000 events. What technique keeps reading its current balance fast without replaying all 50,000 events every time?</p>
        </div>
      </section>
      <p className="takeaway">
        Event sourcing trades a simple "current state" table for a full, replayable history &mdash;
        worth it exactly when you need that history, and a real cost (snapshots, careful event
        versioning) when you don't.
      </p>
    </div>
  );
}
