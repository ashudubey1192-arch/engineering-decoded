import "../css/Article.css";

export default function DatabaseScalingTechniquesDenormalizationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Denormalization deliberately duplicates data across tables to avoid expensive joins at
          read time, trading storage and write complexity for read speed.
        </p>
        <p>
          A fully normalized schema stores every fact exactly once, which keeps data consistent
          but means popular queries often need several joins to reassemble it. Denormalization
          copies the pieces you read together back into one place.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Normalized</h3>
            <p>posts table + a separate count derived by <code>COUNT(*)</code> over the comments
              table every time you need it. No redundancy, but a join/aggregate on every read.</p>
          </div>
          <div>
            <h3>Denormalized</h3>
            <p>posts table carries a <code>comment_count</code> column, updated whenever a comment
              is added or removed. Reads are a single row lookup; writes now touch two places.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Identify the expensive read.</b> Rendering the feed runs a{" "}
            <code>COUNT(*)</code> join per post to show comment counts.</li>
          <li><b>Add a denormalized column.</b> <code>ALTER TABLE posts ADD comment_count INT DEFAULT 0;</code></li>
          <li><b>Keep it in sync.</b> Increment it inside the same transaction that inserts a
            comment; decrement on delete.</li>
          <li><b>Backfill once.</b> Run a one-time job to populate existing rows from the real count.</li>
          <li><b>Read the fast path.</b> The feed now reads <code>comment_count</code> directly — no join.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram showing a posts table and comments table joined on every read versus a posts table that carries its own comment_count column updated on write.">
          <text x="110" y="18" className="figLabel" textAnchor="middle">NORMALIZED — READ TIME</text>
          <rect className="box" x="30" y="35" width="90" height="30" rx="5" /><text x="75" y="55" className="boxText">posts</text>
          <rect className="box" x="150" y="35" width="90" height="30" rx="5" /><text x="195" y="55" className="boxText">comments</text>
          <line className="flowMuted" x1="120" y1="50" x2="150" y2="50" />
          <text x="135" y="42" className="figHint" textAnchor="middle">join</text>
          <text x="130" y="90" className="figHint" textAnchor="middle">counted fresh, every request</text>
          <line className="divider" x1="270" y1="10" x2="270" y2="120" />
          <text x="365" y="18" className="figLabel" textAnchor="middle">DENORMALIZED</text>
          <rect className="boxAccent" x="310" y="35" width="110" height="40" rx="5" />
          <text x="365" y="52" className="boxText">posts</text>
          <text x="365" y="68" className="boxText">comment_count: 42</text>
          <text x="365" y="95" className="figHint" textAnchor="middle">one row read, no join</text>
        </svg>
        <figcaption>The count moves from being computed at read time to being maintained at write time.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The recurring failure mode is drift: a code path updates comments but forgets to update
          <code>comment_count</code>, and the duplicated value slowly goes wrong. Denormalize only
          after a read pattern proves expensive, wrap the update in the same transaction as the
          source write, and keep a way to recompute the derived value from scratch.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the risk denormalization introduces, and what would you build to guard against it?</p>
        </div>
      </section>
      <p className="takeaway">
        Denormalization is a targeted trade: duplicate the one thing that's expensive to compute,
        keep it in sync at write time, and you buy back read latency at the cost of write discipline.
      </p>
    </div>
  );
}
