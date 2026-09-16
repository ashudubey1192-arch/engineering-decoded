export default function PatternCaseStudiesDesignACacheLibraryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A cache library needs to support pluggable eviction policies (LRU, LFU, TTL), let
          callers configure a cache instance with many optional settings, and stay safe under
          concurrent reads and writes &mdash; three requirements pulling from Creational,
          Behavioral, and Concurrency patterns in one small library.
        </p>
        <p>
          The interesting design decision here isn't which patterns to use in isolation, but
          keeping their responsibilities cleanly separated so the library stays simple to use
          despite solving three problems internally.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Working through the design, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Pluggable eviction policies, chosen without an if/else.</b> LRU, LFU, and TTL each
            decide differently which entry to evict when the cache is full &mdash;{" "}
            <code>Strategy</code> encapsulates each policy so a new one is a new class, not a new
            branch.
          </li>
          <li>
            <b>Many optional configuration values at construction time.</b> Max size, eviction
            policy, TTL duration, and whether to record statistics are all optional with sensible
            defaults &mdash; <code>Builder</code> lets callers set only what they need.
          </li>
          <li>
            <b>Safe concurrent access with reads far more common than writes.</b> Cache lookups
            vastly outnumber insertions and evictions in most workloads &mdash;{" "}
            <code>Read-Write Lock</code> lets concurrent reads proceed together while still
            serializing the rarer mutations.
          </li>
          <li>
            <b>Keep the three concerns from leaking into each other.</b> The builder only
            constructs; the strategy only decides what to evict; the lock only protects the
            underlying map &mdash; none of the three needs to know about the other two.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="15" width="160" height="28" rx="5" />
            <text className="boxText" x="100" y="33" fontSize="7">CacheBuilder (construction)</text>
            <line className="flow" x1="100" y1="43" x2="100" y2="60" />
            <rect className="boxAccent" x="20" y="60" width="160" height="28" rx="5" />
            <text className="boxText" x="100" y="78" fontSize="7">Cache (ReadWriteLock)</text>
            <line className="flow" x1="180" y1="74" x2="240" y2="74" />
            <text className="figHint" x="245" y="65">EvictionStrategy</text>
            <text className="figHint" x="245" y="80">(LRU / LFU / TTL)</text>
          </svg>
          <figcaption>Construction, concurrency, and eviction policy are three separate concerns, each handled by its own pattern.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The three patterns combined in one small library</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface EvictionStrategy<K> { K selectEvictionCandidate(Map<K, ?> entries); } // Strategy

class LruEvictionStrategy<K> implements EvictionStrategy<K> {
    public K selectEvictionCandidate(Map<K, ?> entries) { return entries.keySet().iterator().next(); }
}

class Cache<K, V> {
    private final ReadWriteLock lock = new ReentrantReadWriteLock(); // Concurrency
    private final Map<K, V> entries = new LinkedHashMap<>();
    private final int maxSize;
    private final EvictionStrategy<K> evictionStrategy;

    private Cache(int maxSize, EvictionStrategy<K> evictionStrategy) { // built only via CacheBuilder
        this.maxSize = maxSize; this.evictionStrategy = evictionStrategy;
    }

    V get(K key) {
        lock.readLock().lock();
        try { return entries.get(key); } finally { lock.readLock().unlock(); }
    }

    void put(K key, V value) {
        lock.writeLock().lock();
        try {
            if (entries.size() >= maxSize && !entries.containsKey(key)) {
                entries.remove(evictionStrategy.selectEvictionCandidate(entries)); // Strategy decides
            }
            entries.put(key, value);
        } finally { lock.writeLock().unlock(); }
    }

    static class CacheBuilder<K, V> { // Builder
        private int maxSize = 1000;
        private EvictionStrategy<K> evictionStrategy = new LruEvictionStrategy<>();
        CacheBuilder<K, V> maxSize(int maxSize) { this.maxSize = maxSize; return this; }
        CacheBuilder<K, V> evictionStrategy(EvictionStrategy<K> strategy) { this.evictionStrategy = strategy; return this; }
        Cache<K, V> build() { return new Cache<>(maxSize, evictionStrategy); }
    }
}

Cache<String, User> cache = new Cache.CacheBuilder<String, User>().maxSize(500).build();`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the eviction strategy reach into the lock directly.</b>{" "}
            <code>EvictionStrategy</code> should only decide which key to evict; it shouldn't
            acquire or release locks itself &mdash; that responsibility belongs entirely to{" "}
            <code>Cache</code>.
          </li>
          <li>
            <b>Using a plain mutex instead of a read-write lock for a read-heavy cache.</b> A
            cache is the textbook case for Read-Write Lock precisely because lookups so heavily
            outnumber writes; a plain mutex would serialize reads that could safely run
            concurrently.
          </li>
          <li>
            <b>Making the builder mutable and exposing it after <code>build()</code>.</b> A
            builder reused or shared after producing a <code>Cache</code> instance can create
            confusing coupling between separately-built caches.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>CacheBuilder</code> never need to know anything about <code>ReadWriteLock</code>, and <code>EvictionStrategy</code> never need to know anything about how <code>Cache</code> is constructed?</p>
          <p>
            <b>Answer:</b> Each pattern here is solving one distinct problem and has no reason to
            reach into another's responsibility. <code>CacheBuilder</code>'s only job is
            assembling a valid <code>Cache</code> with the requested settings; what happens
            inside <code>Cache</code> afterward (locking, eviction decisions) isn't its concern.
            Similarly, <code>EvictionStrategy</code>'s only job is picking which key to evict
            given the current entries; how that cache was built or how its access is
            synchronized doesn't affect that decision at all. Keeping each pattern's
            responsibility this narrow is what lets all three combine without becoming tangled.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A cache library's three problems &mdash; flexible construction, pluggable eviction, and
        concurrent safety &mdash; map cleanly to Builder, Strategy, and Read-Write Lock, and stay
        simple to use precisely because each pattern's responsibility never bleeds into the
        others.
      </p>
    </div>
  );
}
