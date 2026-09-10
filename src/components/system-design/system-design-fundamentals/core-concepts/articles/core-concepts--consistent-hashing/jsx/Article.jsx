import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsConsistentHashingArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Consistent hashing is a way to spread keys (cache entries, user data, files) across a set
          of servers so that <b>adding or removing a server moves as few keys as possible</b>.
        </p>
        <p>
          It is the standard trick behind distributed caches (Memcached, Redis Cluster), sharded
          databases, and systems like DynamoDB and Cassandra.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You run 4 cache servers and pick one with <code>server = hash(key) % 4</code>. It works
            &mdash; until you add a 5th server. Now the formula is <code>% 5</code>, so{" "}
            <b>almost every key maps to a different server</b>. The cache is suddenly empty, every
            request falls through to the database, and the database falls over. Consistent hashing
            exists to stop exactly this.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The problem with modulo hashing</h2>
        <p>
          With <code>hash(key) % N</code>, changing <code>N</code> reshuffles roughly{" "}
          <b>(N-1)/N of all keys</b>. Going from 4 to 5 servers moves about 80% of them. Every scale
          event becomes an outage.
        </p>

        <h2>2. The ring</h2>
        <p>
          Instead, imagine a circle numbered 0 to 2<sup>32</sup>. Hash each <b>server</b> to a point
          on the circle. Hash each <b>key</b> to a point too. A key belongs to the first server found
          by walking <b>clockwise</b> from the key&apos;s position.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 260" role="img" aria-labelledby="ringTitle">
            <title id="ringTitle">
              Servers and keys are placed around a circle; each key is owned by the next server
              clockwise.
            </title>
            <circle
              cx="200"
              cy="130"
              r="90"
              fill="none"
              stroke="var(--line)"
              strokeWidth="2"
            />
            {/* servers */}
            <circle className="ringNode" cx="200" cy="40" r="9" />
            <text className="figLabel" x="200" y="28">
              S1
            </text>
            <circle className="ringNode" cx="278" cy="175" r="9" />
            <text className="figLabel" x="298" y="180">
              S2
            </text>
            <circle className="ringNode" cx="122" cy="175" r="9" />
            <text className="figLabel" x="100" y="180">
              S3
            </text>
            {/* keys */}
            <circle className="ringKey" cx="243" cy="58" r="5" />
            <text className="figHint" x="255" y="52">
              key A
            </text>
            <circle className="ringKey" cx="255" cy="205" r="5" />
            <text className="figHint" x="268" y="218">
              key B
            </text>
            <circle className="ringKey" cx="140" cy="70" r="5" />
            <text className="figHint" x="120" y="60">
              key C
            </text>

            <text className="boxText" x="470" y="80">
              key A &rarr; clockwise &rarr; S2
            </text>
            <text className="boxText" x="470" y="120">
              key B &rarr; clockwise &rarr; S3
            </text>
            <text className="boxText" x="470" y="160">
              key C &rarr; clockwise &rarr; S1
            </text>
          </svg>
          <figcaption>
            Add S4 between S1 and S2 and only the keys in that arc move &mdash; to S4. Every other
            key stays put.
          </figcaption>
        </figure>

        <h2>3. Virtual nodes</h2>
        <p>
          With only 3 real points, one server can randomly own a huge arc and get overloaded. The
          fix: give each server <b>100&ndash;200 virtual points</b> spread around the ring. Load
          evens out, and when a server leaves, its keys scatter to <i>many</i> others instead of
          dumping onto one neighbour.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: a key&apos;s journey</h2>
        <ol className="stepList">
          <li>
            <b>Place the servers.</b> <code>hash(&quot;S1&quot;) = 12</code>,{" "}
            <code>hash(&quot;S2&quot;) = 48</code>, <code>hash(&quot;S3&quot;) = 90</code> (on a
            0&ndash;99 ring for simplicity).
          </li>
          <li>
            <b>Hash the key.</b> <code>hash(&quot;user:42&quot;) = 55</code>.
          </li>
          <li>
            <b>Walk clockwise</b> from 55: the next server point is S3 at 90. <b>user:42 lives on
            S3.</b>
          </li>
          <li>
            <b>Add S4 at 70.</b> Walk clockwise from 55 again &rarr; now you hit S4 first.{" "}
            <b>Only keys between 48 and 70 moved</b> (from S3 to S4). Keys elsewhere are untouched.
          </li>
          <li>
            <b>Remove S2 (at 48).</b> Its keys (from 12 to 48) now walk clockwise to S3. No other
            server is affected.
          </li>
        </ol>
        <div className="takeaway">
          Modulo hashing moves ~1 - 1/N of keys on every change. Consistent hashing moves only ~1/N
          &mdash; the share that the added/removed node should own.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Skipping virtual nodes</h3>
            <p>
              A handful of real points on the ring gives lumpy, unfair load. Always use many virtual
              nodes per server.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Non-uniform hash function</h3>
            <p>
              If the hash clusters, so do the servers and keys. Use a well-distributed hash (MD5,
              MurmurHash), not <code>String.hashCode()</code>.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Forgetting replication</h3>
            <p>
              Owning a key is not storing it safely. Real systems also copy each key to the next 2&ndash;3
              servers clockwise for redundancy.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            You have 10 cache servers holding 1M keys and add an 11th. Roughly how many keys move
            with modulo hashing versus consistent hashing, and why does the difference matter for the
            database behind the cache?
          </p>
        </div>
      </section>
    </div>
  );
}
