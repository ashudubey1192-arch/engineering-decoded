import "../css/Article.css";

export default function DistributedDataDataConsistencyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Once data lives in several independent databases, "consistency" stops being a single
          on/off property and becomes a spectrum &mdash; the real design question is which parts of
          your system need to agree instantly, and which can safely catch up a moment later.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Strong consistency</h3>
            <p>Every reader sees the same, latest value immediately after a write. Usually only achievable within one database or one service's boundary.</p>
          </div>
          <div>
            <h3>Eventual consistency</h3>
            <p>Readers may briefly see a stale value, but every replica converges to the same value given enough time and no new writes.</p>
          </div>
        </div>
        <p>
          Across services, strong consistency for everything is rarely worth its cost (the
          coordination overhead from the Distributed Transactions lesson); most systems mix the two
          deliberately, keeping strong consistency only where a stale read would actually be
          dangerous.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A social app requires strong consistency for a single user's own account balance (an
          in-app currency) &mdash; nobody should be able to double-spend it due to a stale read. But
          it accepts eventual consistency for follower counts shown on other people's profiles:
          seeing a count that's a few seconds stale after someone follows you causes no real harm,
          and demanding instant consistency there everywhere would make the whole system far more
          expensive to run for no meaningful benefit.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram contrasting a strongly consistent balance check that reads directly from the source of truth before allowing a spend, against an eventually consistent follower count that reads from a replica that may be a few seconds stale.">
          <text x="105" y="20" className="figLabel">STRONG: BALANCE CHECK</text>
          <rect className="boxAccent" x="20" y="35" width="90" height="28" rx="6" />
          <text x="65" y="53" className="boxText" style={{fontSize:"6.5px"}}>Spend request</text>
          <rect className="box" x="150" y="35" width="90" height="28" rx="6" />
          <text x="195" y="53" className="boxText" style={{fontSize:"6.5px"}}>Source of truth</text>
          <line className="flow" x1="110" y1="49" x2="148" y2="49" />
          <text x="330" y="20" className="figLabel">EVENTUAL: FOLLOWER COUNT</text>
          <rect className="box" x="260" y="80" width="70" height="28" rx="6" />
          <text x="295" y="98" className="boxText" style={{fontSize:"6px"}}>Profile view</text>
          <rect className="box" x="345" y="80" width="65" height="28" rx="6" />
          <text x="377" y="98" className="boxText" style={{fontSize:"6px"}}>Replica</text>
          <line className="flowMuted" x1="330" y1="94" x2="343" y2="94" />
        </svg>
        <figcaption>The same app makes different consistency choices for different data, based on how dangerous a stale read actually is in each case.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Applying eventual consistency uniformly, without asking what a stale read would actually
          cost, is how a follower-count-style shortcut ends up applied to account balances too
          &mdash; with real financial consequences. The opposite mistake, demanding strong consistency
          everywhere "to be safe," quietly reintroduces the tight coupling and coordination overhead
          that moving to independent databases was meant to remove in the first place.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an in-app currency balance need strong consistency while a profile's follower count usually doesn't, even though both are just numbers stored somewhere?</p>
        </div>
      </section>
      <p className="takeaway">
        Don't pick one consistency model for the whole system &mdash; ask what a stale read would
        actually cost for each specific piece of data, and let that answer decide.
      </p>
    </div>
  );
}
