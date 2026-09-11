import "../css/Article.css";

export default function DatabasesKeyValueStoresArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A key-value store (Redis, DynamoDB, Memcached) maps a key directly to a value with no
          query language beyond "get," "set," and "delete" — the simplest possible data model,
          and often the fastest.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Because there's no schema, no joins, and no query planner to reason about, a lookup by
          key can be extremely fast and predictable — often sub-millisecond. Many key-value
          stores also keep data in memory, trading some durability guarantees for that speed. The
          value itself is opaque to the database — a string, a blob, a JSON string — the store
          doesn't look inside it.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Pick the key.</b> <code>session:{"{sessionId}"}</code> as the key.</li>
          <li><b>Store the value.</b> <code>SET session:abc123 "{"{ userId: 42 }"}" EX 3600</code>{" "}
            — the value plus a 1-hour expiry.</li>
          <li><b>Read it back.</b> <code>GET session:abc123</code> — one lookup, no query planning.</li>
          <li><b>Let it expire.</b> The store automatically removes the key after the TTL — no
            cleanup job needed.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a key mapping directly to a value in a hash table, with constant time lookup regardless of how many keys are stored.">
          <rect className="box" x="20" y="20" width="120" height="26" rx="4" /><text x="80" y="38" className="boxText">session:abc123</text>
          <line className="flow" x1="140" y1="33" x2="200" y2="33" />
          <rect className="boxAccent" x="210" y="20" width="160" height="26" rx="4" /><text x="290" y="38" className="boxText">{"{ userId: 42 }"}</text>
          <text x="195" y="80" className="figHint" textAnchor="middle">O(1) lookup — same speed whether the store holds 100 keys or 100 million</text>
        </svg>
        <figcaption>No schema, no joins — just a direct map from key to value.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for a key-value store when you actually need to query <em>by value</em> (find
          all sessions for a given user) forces you to bolt on a secondary index or scan
          everything — usually a sign a different database type fits better. Storing data with no
          expiry in an in-memory store can also quietly grow until it runs out of RAM.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a key-value store's lookup speed largely independent of how much data it holds, unlike a full table scan?</p>
        </div>
      </section>
      <p className="takeaway">
        Key-value stores win when your access pattern really is "give me the value for this exact
        key" — the instant you need to query by value, you need a different tool or an index.
      </p>
    </div>
  );
}
