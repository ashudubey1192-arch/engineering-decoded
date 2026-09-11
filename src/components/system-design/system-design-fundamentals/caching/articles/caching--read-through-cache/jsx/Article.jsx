import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingReadThroughArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A read-through cache looks almost identical to cache-aside from the outside &mdash; but the{" "}
          <b>cache itself</b>, not your application, is responsible for loading missing data from the
          database.
        </p>
        <p>
          Your application only ever talks to the cache. On a miss, the cache knows how to fetch the
          data on its own (using a loader function you configured) and hands back the result.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            With cache-aside, every service that reads products has to remember the same three steps:
            check cache, query DB, fill cache. With read-through, that logic is configured{" "}
            <i>once</i>, on the cache itself. Every caller simply does{" "}
            <code>cache.get(&quot;product:42&quot;)</code> &mdash; and never needs to know a database
            is involved at all.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Who owns the miss?</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="rtTitle">
            <title id="rtTitle">
              With cache-aside the application handles the miss and fills the cache; with
              read-through the cache handles the miss itself using a configured loader.
            </title>
            <text className="figLabel" x="150" y="18">
              CACHE-ASIDE
            </text>
            <rect className="box" x="20" y="30" width="80" height="30" />
            <text className="boxText" x="60" y="49">
              app
            </text>
            <line className="flow" x1="100" y1="40" x2="170" y2="40" />
            <line className="flow" x1="170" y1="55" x2="100" y2="55" />
            <rect className="boxAccent" x="170" y="30" width="80" height="30" />
            <text className="boxText" x="210" y="49">
              cache
            </text>
            <text className="figHint" x="60" y="80">
              app also queries
            </text>
            <line className="flow" x1="60" y1="60" x2="60" y2="95" />
            <rect className="boxWarn" x="20" y="95" width="80" height="26" />
            <text className="boxText" x="60" y="113">
              database
            </text>

            <line className="divider" x1="330" y1="10" x2="330" y2="130" />

            <text className="figLabel" x="480" y="18">
              READ-THROUGH
            </text>
            <rect className="box" x="380" y="30" width="80" height="30" />
            <text className="boxText" x="420" y="49">
              app
            </text>
            <line className="flow" x1="460" y1="40" x2="530" y2="40" />
            <line className="flow" x1="530" y1="55" x2="460" y2="55" />
            <rect className="boxAccent" x="530" y="30" width="80" height="30" />
            <text className="boxText" x="570" y="49">
              cache
            </text>
            <line className="flow" x1="570" y1="60" x2="570" y2="95" />
            <text className="figHint" x="570" y="78">
              cache queries
            </text>
            <rect className="boxWarn" x="530" y="95" width="80" height="26" />
            <text className="boxText" x="570" y="113">
              database
            </text>
          </svg>
          <figcaption>
            Same end result, different owner of the &quot;go fetch it&quot; logic. The app talks to
            one thing in read-through: the cache.
          </figcaption>
        </figure>

        <h2>2. Trade-offs vs cache-aside</h2>
        <table className="miniTable">
          <caption>WHO DOES THE WORK, AND WHAT YOU GAIN</caption>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Cache-aside</th>
              <th>Read-through</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Miss handled by</td>
              <td>Your application code</td>
              <td>The caching library / layer</td>
            </tr>
            <tr>
              <td>Consistency across services</td>
              <td>Each service must implement it the same way</td>
              <td>One loader, guaranteed consistent</td>
            </tr>
            <tr>
              <td>Flexibility</td>
              <td>High &mdash; cache only what you choose, when</td>
              <td>Lower &mdash; every miss always loads the same way</td>
            </tr>
            <tr>
              <td>Needs</td>
              <td>Any cache</td>
              <td>A cache that supports a loader function</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>3. Step by step: configuring a read-through cache</h2>
        <ol className="stepList">
          <li>
            <b>Set up the cache once</b> with a loader:{" "}
            <code>cache.configure(loader: id =&gt; db.getProduct(id))</code>.
          </li>
          <li>
            <b>Any code, anywhere,</b> just calls <code>cache.get(&quot;product:42&quot;)</code>.
          </li>
          <li>
            <b>Hit:</b> the cache returns the stored value directly.
          </li>
          <li>
            <b>Miss:</b> the cache itself calls the loader, gets the product from the database,
            stores it, and returns it &mdash; the calling code never wrote any of that logic.
          </li>
          <li>
            <b>A second service</b> that also needs products just calls{" "}
            <code>cache.get(&quot;product:42&quot;)</code> too &mdash; it automatically benefits from
            the same loader and the same cached entry, with zero duplicated logic.
          </li>
        </ol>
        <div className="takeaway">
          Read-through trades a little flexibility for consistency: every consumer gets the exact
          same caching behaviour for free, instead of each one reimplementing cache-aside.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Assuming it solves stale writes</h3>
            <p>
              Read-through only changes who handles <i>misses</i>. A write to the database still
              needs an explicit invalidation step, exactly like cache-aside.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>One slow loader blocking everyone</h3>
            <p>
              If the configured loader is slow or has no timeout, every concurrent miss for that key
              waits on it &mdash; add timeouts and, ideally, request coalescing.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Forcing it where flexibility was needed</h3>
            <p>
              If different callers legitimately want different loading logic for the same key space,
              read-through&apos;s one-loader model gets in the way &mdash; cache-aside fits better.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Two microservices both need product data and both currently hand-roll cache-aside
            slightly differently. What would switching to read-through change, and what would it{" "}
            <i>not</i> fix on its own?
          </p>
        </div>
      </section>
    </div>
  );
}
