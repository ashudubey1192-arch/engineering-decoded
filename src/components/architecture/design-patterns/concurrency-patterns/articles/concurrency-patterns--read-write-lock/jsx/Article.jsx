export default function ConcurrencyPatternsReadWriteLockArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Read-Write Lock lets any number of readers access shared data concurrently, but gives a
          writer exclusive access with no readers or other writers present &mdash; improving on a
          plain mutex, which forces even simultaneous reads to run one at a time even though
          reads alone can never corrupt shared state.
        </p>
        <p>
          Intent: allow concurrent read access to shared data while still guaranteeing exclusive
          access for writes. Applicability: shared data is read far more often than it's written,
          and a plain mutual-exclusion lock is serializing reads that could safely happen at the
          same time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Separating read and write access, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify data that's read-heavy and write-light.</b> An in-memory configuration
            cache, read on every request but updated only when an admin changes a setting.
          </li>
          <li>
            <b>Acquire the read lock for reads, the write lock for writes.</b>{" "}
            <code>lock.readLock().lock()</code> before reading a value;{" "}
            <code>lock.writeLock().lock()</code> before changing one.
          </li>
          <li>
            <b>Let the lock allow many concurrent readers.</b> Multiple threads can hold the read
            lock at once, since none of them mutate anything.
          </li>
          <li>
            <b>Let the lock force the writer to wait for exclusivity.</b> A thread requesting the
            write lock waits until all current readers release, then blocks any new readers or
            writers until it releases.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="15" width="100" height="28" rx="5" />
            <text className="boxText" x="70" y="33" fontSize="8">Reader 1</text>
            <rect className="box" x="20" y="50" width="100" height="28" rx="5" />
            <text className="boxText" x="70" y="68" fontSize="8">Reader 2</text>
            <rect className="box" x="20" y="85" width="100" height="28" rx="5" />
            <text className="boxText" x="70" y="103" fontSize="8">Reader 3</text>
            <line className="flow" x1="120" y1="29" x2="190" y2="60" />
            <line className="flow" x1="120" y1="64" x2="190" y2="65" />
            <line className="flow" x1="120" y1="99" x2="190" y2="70" />
            <rect className="boxAccent" x="190" y="45" width="110" height="40" rx="6" />
            <text className="boxText" x="245" y="69" fontSize="8">shared data</text>
            <rect className="boxWarn" x="340" y="45" width="120" height="40" rx="6" />
            <text className="boxText" x="400" y="69" fontSize="8">Writer (exclusive)</text>
          </svg>
          <figcaption>All three readers hold the read lock simultaneously; the writer waits for exclusive access before touching the data.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A cache readable by many, writable by one</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class ConfigCache {
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final Map<String, String> values = new HashMap<>();

    String get(String key) {
        lock.readLock().lock();
        try {
            return values.get(key); // many threads can be here concurrently
        } finally {
            lock.readLock().unlock();
        }
    }

    void set(String key, String value) {
        lock.writeLock().lock();
        try {
            values.put(key, value); // exclusive: no readers, no other writers, while this runs
        } finally {
            lock.writeLock().unlock();
        }
    }
}

// Usage: hundreds of request threads reading concurrently, one admin thread updating rarely
ConfigCache cache = new ConfigCache();
// request threads: cache.get("maxUploadSizeMb") -- never blocks on each other
// admin thread:    cache.set("maxUploadSizeMb", "50") -- briefly excludes all readers`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Using a read-write lock for data that's written about as often as it's read.</b>{" "}
            The bookkeeping overhead of tracking readers and writers separately can cost more
            than it saves when writes aren't rare.
          </li>
          <li>
            <b>Forgetting to release the read lock in a finally block.</b> An exception thrown
            between <code>lock()</code> and <code>unlock()</code> leaves the lock held forever,
            eventually starving every writer.
          </li>
          <li>
            <b>Upgrading a read lock to a write lock directly.</b> Most read-write lock
            implementations don't support this safely and can deadlock; the correct approach is
            releasing the read lock first, then acquiring the write lock.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>ConfigCache</code> use a <code>ReadWriteLock</code> instead of a single plain lock, given it's read far more often than it's written?</p>
          <p>
            <b>Answer:</b> A plain mutex would force every <code>get()</code> call to run one at
            a time, even though concurrent reads can never corrupt the map. The read-write lock
            lets hundreds of request threads call <code>get()</code> simultaneously, only
            blocking all of them briefly during the rare <code>set()</code> call, which needs
            genuine exclusivity to avoid a torn or inconsistent read.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Read-Write Lock separates concurrent-safe reads from exclusive writes &mdash; a clear win
        when reads dominate writes, but the bookkeeping cost isn't worth it once writes become
        frequent enough that readers are usually waiting anyway.
      </p>
    </div>
  );
}
