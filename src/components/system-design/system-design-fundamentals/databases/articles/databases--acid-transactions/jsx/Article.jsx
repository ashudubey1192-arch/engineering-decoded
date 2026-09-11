import "../css/Article.css";

export default function DatabasesAcidTransactionsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          ACID describes four guarantees a transaction gives you: Atomicity, Consistency,
          Isolation, and Durability — the reason "transfer $50 from A to B" either fully happens
          or doesn't happen at all, even if the server crashes mid-way.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>WHAT EACH LETTER ACTUALLY GUARANTEES</caption>
          <thead><tr><th>Letter</th><th>Guarantee</th></tr></thead>
          <tbody>
            <tr><td>Atomicity</td><td>all steps in the transaction happen, or none do</td></tr>
            <tr><td>Consistency</td><td>the database moves from one valid state to another (constraints hold)</td></tr>
            <tr><td>Isolation</td><td>concurrent transactions don't see each other's half-finished work</td></tr>
            <tr><td>Durability</td><td>once committed, the write survives a crash</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>Transferring $50 from Account A to Account B requires two writes: debit A, credit B.</p>
        </div>
        <ol className="stepList">
          <li><b>Begin the transaction.</b> <code>BEGIN;</code></li>
          <li><b>Debit A.</b> <code>UPDATE accounts SET balance = balance - 50 WHERE id = 'A';</code></li>
          <li><b>Credit B.</b> <code>UPDATE accounts SET balance = balance + 50 WHERE id = 'B';</code></li>
          <li><b>Commit.</b> <code>COMMIT;</code> — both writes become permanent together.</li>
          <li><b>If the server crashes after step 2</b> but before commit, the whole transaction
            rolls back on restart — A is never left debited without B being credited.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 140" role="img" aria-label="Diagram of a two-step transaction that either commits both the debit and credit together or rolls back both if anything fails before commit.">
          <rect className="box" x="20" y="20" width="110" height="30" rx="5" /><text x="75" y="40" className="boxText">debit A</text>
          <line className="flow" x1="130" y1="35" x2="180" y2="35" />
          <rect className="box" x="190" y="20" width="110" height="30" rx="5" /><text x="245" y="40" className="boxText">credit B</text>
          <line className="flow" x1="300" y1="35" x2="350" y2="35" />
          <rect className="boxAccent" x="360" y="20" width="90" height="30" rx="5" /><text x="405" y="40" className="boxText">COMMIT</text>
          <line className="flowMuted" x1="75" y1="55" x2="405" y2="55" />
          <rect className="boxWarn" x="330" y="70" width="120" height="30" rx="5" /><text x="390" y="90" className="boxText">crash → rollback</text>
          <text x="230" y="115" className="figHint" textAnchor="middle">anything short of COMMIT undoes both steps</text>
        </svg>
        <figcaption>Atomicity means partial completion isn't an option — it's all or nothing.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Wrapping unrelated operations into one giant transaction holds locks longer than
          necessary and hurts concurrency. The other common gap is assuming ACID at the database
          level protects you across <em>multiple</em> databases or services — it doesn't; that's
          the harder problem covered later in Distributed Transactions.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Which ACID guarantee specifically prevents two concurrent transactions from seeing each other's uncommitted changes?</p>
        </div>
      </section>
      <p className="takeaway">
        ACID is what lets you reason about a multi-step write as a single, safe unit — but it's a
        single-database guarantee, not a distributed-systems one.
      </p>
    </div>
  );
}
