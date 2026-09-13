import "../css/Article.css";

export default function ScalabilityCachingStrategyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Whenever an estimate shows reads far outnumbering writes, a cache is usually the single
          highest-leverage box you can add to a design &mdash; it absorbs the read traffic before
          it ever reaches the database.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A cache stores the results of expensive reads in fast, usually in-memory storage
          (Redis, Memcached). The design question is always <b>what</b> to cache (frequently-read,
          rarely-changed data is the best fit) and <b>how</b> it stays consistent with the
          underlying database &mdash; a time-based expiry, or explicit invalidation when the
          underlying data changes. A cache is a read-path optimization, not a source of truth; the
          database underneath it must still hold the correct data.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Estimate shows 4,000 reads/sec against 40 writes/sec</b> for URL redirects &mdash;
            a strong signal to cache.</li>
          <li><b>On a redirect request,</b> check the cache first for that short code.</li>
          <li><b>Cache hit:</b> return the long URL immediately, without touching the database.</li>
          <li><b>Cache miss:</b> read from the database, return the result, and populate the cache
            so the next request for that code is fast too.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a read request checking a cache first, returning immediately on a hit, or falling through to the database and populating the cache on a miss." >
          <rect className="box" x="20" y="45" width="70" height="30" rx="5" /><text x="55" y="64" className="boxText">Request</text>
          <line className="flow" x1="90" y1="60" x2="150" y2="60" />
          <rect className="boxAccent" x="160" y="45" width="70" height="30" rx="5" /><text x="195" y="64" className="boxText" style={{fontSize:"9px"}}>Cache</text>
          <line className="flow" x1="230" y1="52" x2="200" y2="20" /><text x="235" y="22" className="figHint" style={{fontSize:"8px"}}>hit &rarr; return</text>
          <line className="flowMuted" x1="230" y1="68" x2="300" y2="68" /><text x="265" y="85" className="figHint" style={{fontSize:"8px"}}>miss</text>
          <rect className="box" x="305" y="53" width="70" height="30" rx="5" /><text x="340" y="72" className="boxText" style={{fontSize:"9px"}}>Database</text>
        </svg>
        <figcaption>A cache hit skips the database entirely; a miss falls through and refills the cache for next time.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Caching data that changes on nearly every write gains little (the cache is invalidated
          almost as often as it&rsquo;s read) while adding complexity. Forgetting an invalidation
          strategy entirely is worse &mdash; a cache that never expires stale data quietly serves
          wrong answers indefinitely.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What read-to-write pattern in a capacity estimate should push you toward adding a cache to the design?</p>
        </div>
      </section>
      <p className="takeaway">
        A cache is the highest-leverage box for read-heavy designs, but it&rsquo;s only as good as
        its invalidation strategy &mdash; the database still has to remain the source of truth.
      </p>
    </div>
  );
}
