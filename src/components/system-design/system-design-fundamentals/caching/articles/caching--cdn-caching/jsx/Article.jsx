import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingCdnArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          CDN caching is the same hit/miss idea as any other cache, just running on servers spread
          around the world instead of one machine &mdash; so the &quot;fast copy&quot; is close to
          each user, not close to your origin server.
        </p>
        <p>
          It sits between the client cache and your origin: usually slower than a local browser
          cache, but shared across every user in that region, so one miss can serve thousands of
          later hits.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A product image is requested by the first visitor in Mumbai. That request is a miss, so
            the Mumbai edge fetches it once from your origin in Virginia (slow, one time) and stores
            a copy. Every other visitor in that region for the next few hours gets it straight from
            the Mumbai edge &mdash; fast, and your origin server never even hears about those
            requests.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Three layers of TTL, working together</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="cdnCacheTitle">
            <title id="cdnCacheTitle">
              A request checks the browser cache, then the CDN edge, then finally the origin server
              &mdash; each layer with its own, usually shorter, TTL.
            </title>
            <rect className="box" x="20" y="50" width="130" height="40" />
            <text className="boxText" x="85" y="74">
              browser cache
            </text>
            <line className="flow" x1="150" y1="70" x2="220" y2="70" />
            <rect className="boxAccent" x="220" y="50" width="130" height="40" />
            <text className="boxText" x="285" y="74">
              CDN edge
            </text>
            <line className="flow" x1="350" y1="70" x2="420" y2="70" />
            <rect className="boxWarn" x="420" y="50" width="130" height="40" />
            <text className="boxText" x="485" y="74">
              origin server
            </text>
            <text className="figHint" x="85" y="105">
              max-age=300
            </text>
            <text className="figHint" x="285" y="105">
              s-maxage=3600
            </text>
            <text className="figHint" x="485" y="105">
              source of truth
            </text>
          </svg>
          <figcaption>
            <code>s-maxage</code> lets you tell shared caches (CDNs) to hold something longer than
            an individual browser would &mdash; the two audiences often want different freshness.
          </figcaption>
        </figure>

        <h2>2. The cache key is everything</h2>
        <p>
          A CDN decides &quot;have I seen this exact request before?&quot; using a <b>cache
          key</b> &mdash; by default, the URL. Anything not in the key is ignored for matching, and
          anything that <i>should</i> vary the response but is not in the key causes the wrong cached
          copy to be served.
        </p>
        <table className="miniTable">
          <caption>WHAT USUALLY BELONGS IN THE KEY</caption>
          <thead>
            <tr>
              <th>Include</th>
              <th>Usually exclude</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Path (<code>/products/42</code>)</td>
              <td>Tracking params (<code>?utm_source=...</code>)</td>
            </tr>
            <tr>
              <td>Meaningful query params (<code>?page=2</code>)</td>
              <td>Session / auth cookies (unless truly needed)</td>
            </tr>
            <tr>
              <td><code>Accept-Encoding</code> (gzip vs br)</td>
              <td>Random cache-busting query strings</td>
            </tr>
            <tr>
              <td>Device type, if content differs</td>
              <td>Anything that does not change the response</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Purging when you cannot wait for TTL</h2>
        <p>
          Sometimes you cannot wait for a cached file to expire &mdash; a bug in a live image, a
          price correction. A <b>purge</b> (or invalidation) API call tells every edge location to
          drop that specific cached copy immediately, so the next request is a fresh miss.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: serving a product image globally</h2>
        <ol className="stepList">
          <li>
            <b>Origin serves</b> <code>/images/shoe-42.jpg</code> with{" "}
            <code>Cache-Control: public, s-maxage=86400</code>.
          </li>
          <li>
            <b>First request from Tokyo:</b> the Tokyo edge has no copy &mdash; a miss. It fetches
            from origin once, stores it, and returns it (slower, one-time cost).
          </li>
          <li>
            <b>Every later Tokyo visitor,</b> for the next 24 hours, gets a hit straight from the
            Tokyo edge &mdash; origin sees nothing.
          </li>
          <li>
            <b>A visitor from Berlin</b> hits a <i>different</i> edge, which is also a miss the first
            time &mdash; each region builds up its own cached copy independently.
          </li>
          <li>
            <b>You update the image</b> the next day. Because the filename did not change, you call
            the CDN&apos;s purge API for that path so every edge drops its stale copy right away,
            instead of waiting up to 24 hours.
          </li>
        </ol>
        <div className="takeaway">
          A high cache-hit ratio at the CDN is often the single biggest lever for both latency and
          origin cost &mdash; most requests never need to reach your servers at all.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Letting tracking params fragment the cache key</h3>
            <p>
              <code>?utm_source=a</code> and <code>?utm_source=b</code> for the same page become two
              separate cache entries &mdash; both cold, hit rate collapses.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Caching personalised responses at a shared edge</h3>
            <p>
              Without a proper key or <code>private</code>, one user&apos;s dashboard can be served
              to the next visitor at that edge.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No purge plan</h3>
            <p>
              Relying purely on a 24-hour TTL means a bad deploy stays live at every edge for up to a
              day unless you can purge on demand.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A marketing link adds <code>?utm_campaign=...</code> to your homepage URL, and your CDN
            hit rate drops sharply. What is happening, and what is the fix?
          </p>
        </div>
      </section>
    </div>
  );
}
