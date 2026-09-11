import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingIntroductionArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Caching is keeping a copy of data somewhere faster to reach than its original source, so
          repeated requests for the same thing are answered quickly instead of redone from scratch.
        </p>
        <p>
          Every layer of a system &mdash; the browser, the network, the app, the database &mdash;
          has its own cache, because &quot;fetch it again from the slow place&quot; is almost always
          more expensive than &quot;remember what you fetched last time.&quot;
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A product page hits the database for the same &quot;best sellers&quot; list on every
            single visitor &mdash; thousands of times a minute, for data that only changes once an
            hour. Put that list in a cache for 60 seconds, and 99% of those visitors are served from
            memory in under a millisecond instead of hitting the database at all.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Hit, miss, and why it works</h2>
        <p>
          A <b>cache hit</b> means the data was already there &mdash; fast. A <b>cache miss</b> means
          it was not, so you fetch it the slow way and (usually) store it for next time. Caching
          works because real traffic is skewed: a small set of &quot;hot&quot; data is requested far
          more often than everything else.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="cacheTitle">
            <title id="cacheTitle">
              A request checks the cache first; a hit returns instantly, a miss goes to the slower
              source and then fills the cache for next time.
            </title>
            <rect className="box" x="20" y="50" width="90" height="40" />
            <text className="boxText" x="65" y="74">
              request
            </text>
            <line className="flow" x1="110" y1="70" x2="190" y2="70" />
            <rect className="boxAccent" x="190" y="50" width="110" height="40" />
            <text className="boxText" x="245" y="74">
              cache
            </text>
            <line className="flow" x1="300" y1="60" x2="380" y2="30" />
            <text className="figHint" x="340" y="20">
              hit &rarr; instant
            </text>
            <rect className="box" x="380" y="15" width="90" height="30" />
            <text className="boxText" x="425" y="35">
              return
            </text>
            <line className="flow" x1="300" y1="80" x2="380" y2="110" />
            <text className="figHint" x="340" y="125">
              miss &rarr; go further
            </text>
            <rect className="boxWarn" x="380" y="95" width="120" height="30" />
            <text className="boxText" x="440" y="115">
              database
            </text>
            <line className="flowMuted" x1="500" y1="105" x2="300" y2="70" />
            <text className="figHint" x="440" y="145">
              result is stored back in the cache
            </text>
          </svg>
          <figcaption>
            After a miss fills the cache, the next request for the same thing is a hit.
          </figcaption>
        </figure>

        <h2>2. Where caches live</h2>
        <table className="miniTable">
          <caption>A CACHE AT EVERY LAYER</caption>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Example</th>
              <th>Covered in</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Client</td>
              <td>Browser cache, mobile app local storage</td>
              <td>Client-Side Caching</td>
            </tr>
            <tr>
              <td>Network / edge</td>
              <td>CDN caching a video or image near the user</td>
              <td>CDN Caching</td>
            </tr>
            <tr>
              <td>Application</td>
              <td>Redis / Memcached in front of a service</td>
              <td>Application Caching</td>
            </tr>
            <tr>
              <td>Database</td>
              <td>Query result cache, buffer pool</td>
              <td>Database Caching</td>
            </tr>
          </tbody>
        </table>

        <h2>3. The two big questions every cache answers</h2>
        <ul>
          <li>
            <b>How do I keep it fast and up to date?</b> &mdash; the strategies (cache-aside,
            read-through, write-through, write-back) covered next.
          </li>
          <li>
            <b>What do I do when it fills up, or the data changes?</b> &mdash; eviction and
            invalidation, covered at the end of this section.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: adding a cache to a slow endpoint</h2>
        <ol className="stepList">
          <li>
            <b>Measure first.</b> <code>GET /bestsellers</code> takes 220 ms, almost all of it one
            expensive database query, and the result barely changes minute to minute.
          </li>
          <li>
            <b>Pick a key.</b> <code>bestsellers:v1</code> &mdash; something that uniquely identifies
            this exact result.
          </li>
          <li>
            <b>On each request,</b> check the cache for that key first.
          </li>
          <li>
            <b>Miss:</b> run the query, store the result under the key with a TTL (say 60s), then
            return it.
          </li>
          <li>
            <b>Hit:</b> return the cached value directly &mdash; no database call at all.
          </li>
          <li>
            <b>Result:</b> p99 latency drops from 220 ms to under 2 ms for the ~99% of requests that
            now hit the cache.
          </li>
        </ol>
        <div className="takeaway">
          A cache does not make data correct or complete &mdash; it makes <i>reading it again</i>{" "}
          cheap. Everything else in this section is about the trade-offs that come with that.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Caching data that changes every request</h3>
            <p>
              If almost nothing repeats, a cache just adds complexity and memory cost for a hit rate
              near zero.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>No expiry at all</h3>
            <p>
              Data cached forever eventually goes stale silently &mdash; always have a TTL or an
              explicit invalidation plan.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Caching as the first fix, not the last</h3>
            <p>
              A cache can hide a genuinely slow, unoptimised query instead of fixing it &mdash;
              sometimes an index is the real answer.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            An endpoint is called 10,000 times/minute and its result changes once every 5 minutes.
            Would you cache it? What TTL would you pick, and what is the worst case for staleness at
            that TTL?
          </p>
        </div>
      </section>
    </div>
  );
}
