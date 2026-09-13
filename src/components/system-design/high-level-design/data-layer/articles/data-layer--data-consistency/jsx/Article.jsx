import "../css/Article.css";

export default function DataLayerDataConsistencyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Once data lives in more than one place &mdash; a replica, a cache, a second data center
          &mdash; the design has to decide, deliberately, how quickly those copies are allowed to
          agree.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Strong consistency</b> guarantees every read sees the latest write, immediately
          &mdash; simpler to reason about, but it usually costs latency or availability to
          guarantee. <b>Eventual consistency</b> allows a brief window where different copies
          disagree, in exchange for lower latency and higher availability. The right choice is
          per-piece-of-data: a bank balance almost always needs strong consistency; a like count on
          a post can usually tolerate a few seconds of eventual consistency.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="twoCol">
          <div>
            <h3>Account balance &rarr; strong</h3>
            <p>A withdrawal must see the true, current balance &mdash; reading a stale value could
              let someone overdraw. Worth the extra latency.</p>
          </div>
          <div>
            <h3>Like count &rarr; eventual</h3>
            <p>Showing a like count that&rsquo;s a few seconds stale has essentially no real
              consequence &mdash; not worth paying strong-consistency latency for.</p>
          </div>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram positioning strong consistency toward correctness at the cost of latency, and eventual consistency toward availability and speed at the cost of a brief staleness window." >
          <line className="divider" x1="30" y1="55" x2="390" y2="55" />
          <rect className="boxAccent" x="20" y="25" width="130" height="30" rx="5" /><text x="85" y="44" className="boxText" style={{fontSize:"8px"}}>Strong: correct, slower</text>
          <rect className="box" x="270" y="25" width="130" height="30" rx="5" /><text x="335" y="44" className="boxText" style={{fontSize:"8px"}}>Eventual: fast, briefly stale</text>
        </svg>
        <figcaption>Every piece of data sits somewhere on this spectrum &mdash; the choice should be explicit, not accidental.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Defaulting an entire system to strong consistency &ldquo;to be safe&rdquo; pays a latency
          and availability cost everywhere, even where it isn&rsquo;t needed. Defaulting to eventual
          consistency everywhere for speed, without checking whether a specific piece of data
          actually tolerates staleness, risks real correctness bugs in the pieces that don&rsquo;t.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an account balance typically need strong consistency while a like count usually doesn't?</p>
        </div>
      </section>
      <p className="takeaway">
        Consistency is a per-data-type design decision, not a single system-wide setting &mdash;
        spend strong consistency&rsquo;s cost only where being wrong is actually expensive.
      </p>
    </div>
  );
}
