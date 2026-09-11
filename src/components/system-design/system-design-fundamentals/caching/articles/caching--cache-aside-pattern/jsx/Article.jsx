import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingCacheAsideArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Cache-aside (also called lazy loading) is the most common caching pattern: your{" "}
          <b>application code</b> checks the cache first, and on a miss, fetches from the database
          and fills the cache itself.
        </p>
        <p>
          The cache does not know the database exists, and the database does not know the cache
          exists &mdash; your application sits in between, managing both.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A product page checks Redis for <code>product:42</code>. Not there &mdash; the app
            queries the database, gets the product, writes it into Redis, and returns it. The next
            visitor to that page gets a Redis hit. Nobody configured the database to know about
            Redis; the application code did all three steps itself.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The flow</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="caTitle">
            <title id="caTitle">
              On a read, the application checks the cache; on a miss it queries the database itself
              and then writes the result into the cache.
            </title>
            <rect className="box" x="20" y="55" width="90" height="40" />
            <text className="boxText" x="65" y="79">
              app
            </text>
            <line className="flow" x1="110" y1="70" x2="190" y2="45" />
            <text className="figHint" x="150" y="35">
              1. check
            </text>
            <rect className="boxAccent" x="190" y="25" width="110" height="40" />
            <text className="boxText" x="245" y="49">
              cache: miss
            </text>
            <line className="flow" x1="110" y1="80" x2="190" y2="105" />
            <text className="figHint" x="150" y="120">
              2. query
            </text>
            <rect className="boxWarn" x="190" y="90" width="110" height="34" />
            <text className="boxText" x="245" y="111">
              database
            </text>
            <line className="flowMuted" x1="300" y1="105" x2="470" y2="45" />
            <text className="figHint" x="400" y="130">
              3. app writes result into cache
            </text>
            <rect className="box" x="470" y="25" width="110" height="40" />
            <text className="boxText" x="525" y="49">
              cache: filled
            </text>
          </svg>
          <figcaption>
            Every arrow is driven by the application &mdash; that is the defining trait of
            cache-aside.
          </figcaption>
        </figure>

        <h2>2. Why it is the default choice</h2>
        <ul>
          <li>
            <b>Only what is asked for gets cached.</b> Unpopular data never wastes cache space.
          </li>
          <li>
            <b>Works with any cache and any database</b> &mdash; no special integration needed.
          </li>
          <li>
            <b>A cache outage degrades, not breaks, reads.</b> Every request just becomes a miss and
            falls back to the database.
          </li>
        </ul>

        <h2>3. The trade-off</h2>
        <p>
          Because the application does all the work, <b>writes do not automatically update the
          cache</b>. If the database changes and nobody tells the cache, it keeps serving the old
          value until it expires or is explicitly invalidated &mdash; that gap is the price of this
          pattern&apos;s simplicity.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: reading and updating a product</h2>
        <ol className="stepList">
          <li>
            <b>Read:</b> <code>GET /products/42</code> &mdash; app checks{" "}
            <code>cache.get(&quot;product:42&quot;)</code>.
          </li>
          <li>
            <b>Miss:</b> app runs <code>db.query(&quot;SELECT * FROM products WHERE id=42&quot;)</code>.
          </li>
          <li>
            <b>App fills the cache:</b>{" "}
            <code>cache.set(&quot;product:42&quot;, result, ttl=300)</code>, then returns the
            product.
          </li>
          <li>
            <b>Write:</b> <code>PATCH /products/42</code> updates the price in the database.
          </li>
          <li>
            <b>Critical step:</b> the app also runs{" "}
            <code>cache.delete(&quot;product:42&quot;)</code> right after the write, so the next
            read is forced to be a miss and pulls the fresh price.
          </li>
        </ol>
        <div className="takeaway">
          Cache-aside is only half the story on its own &mdash; it needs a deliberate invalidation
          step on every write, or reads will happily serve stale data.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Forgetting to invalidate on write</h3>
            <p>
              Updating the database but not deleting the cache key leaves stale data being served
              until the TTL happens to expire.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>The thundering herd</h3>
            <p>
              A hot key expires and 500 concurrent requests all miss at once, all hammering the
              database simultaneously. Use a lock or brief &quot;stale while revalidating&quot;.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No TTL as a safety net</h3>
            <p>
              If invalidation code has a bug, a TTL is the backstop that guarantees staleness cannot
              last forever.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            With cache-aside, a product&apos;s price is updated in the database but the cache is not
            invalidated. What do the next readers see, and for how long?
          </p>
        </div>
      </section>
    </div>
  );
}
