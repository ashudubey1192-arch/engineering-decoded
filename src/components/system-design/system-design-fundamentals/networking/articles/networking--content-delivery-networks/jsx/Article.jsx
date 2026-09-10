import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingContentDeliveryNetworksArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A CDN (Content Delivery Network) is a globe-spanning network of caching servers that keep
          copies of your content close to users, so requests are served from a nearby city instead of
          your origin server.
        </p>
        <p>
          Two wins: <b>lower latency</b> (fewer kilometres and hops) and <b>less load</b> on your
          origin (most requests never reach it).
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your server is in Virginia. A user in Singapore loads your homepage: every image, script,
            and font crosses the Pacific twice, adding ~200 ms per round trip. Put a CDN in front and
            those files are served from a Singapore edge location in ~10 ms &mdash; and your Virginia
            server only ever sent each file to the CDN once.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Origin, edge, and PoPs</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 190" role="img" aria-labelledby="cdnTitle">
            <title id="cdnTitle">
              Users hit a nearby edge server; on a cache miss the edge fetches once from the distant
              origin and stores it.
            </title>
            <rect className="box" x="20" y="30" width="80" height="36" />
            <text className="boxText" x="60" y="52">
              User EU
            </text>
            <rect className="box" x="20" y="80" width="80" height="36" />
            <text className="boxText" x="60" y="102">
              User US
            </text>
            <rect className="box" x="20" y="130" width="80" height="36" />
            <text className="boxText" x="60" y="152">
              User Asia
            </text>
            <line className="flow" x1="100" y1="48" x2="170" y2="60" />
            <line className="flow" x1="100" y1="98" x2="170" y2="98" />
            <line className="flow" x1="100" y1="148" x2="170" y2="135" />
            <rect className="boxAccent" x="170" y="45" width="110" height="34" />
            <text className="boxText" x="225" y="67">
              Edge EU
            </text>
            <rect className="boxAccent" x="170" y="82" width="110" height="34" />
            <text className="boxText" x="225" y="104">
              Edge US
            </text>
            <rect className="boxAccent" x="170" y="119" width="110" height="34" />
            <text className="boxText" x="225" y="141">
              Edge Asia
            </text>
            <line className="flowMuted" x1="280" y1="62" x2="470" y2="95" />
            <line className="flowMuted" x1="280" y1="99" x2="470" y2="99" />
            <line className="flowMuted" x1="280" y1="136" x2="470" y2="103" />
            <text className="figHint" x="380" y="80">
              only on cache miss
            </text>
            <rect className="box" x="470" y="80" width="110" height="40" />
            <text className="boxText" x="525" y="104">
              Origin
            </text>
          </svg>
          <figcaption>
            Each edge location (Point of Presence) serves its region. A cache miss is a one-time cost;
            every hit after that skips the origin entirely.
          </figcaption>
        </figure>

        <h2>2. What a CDN caches well</h2>
        <table className="miniTable">
          <caption>CACHEABILITY</caption>
          <thead>
            <tr>
              <th>Content</th>
              <th>Cache?</th>
              <th>How</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Images, video, CSS, JS, fonts</td>
              <td>Yes, easily</td>
              <td>Long <code>max-age</code> + versioned file names</td>
            </tr>
            <tr>
              <td>Public API responses (e.g. product list)</td>
              <td>Often</td>
              <td>Short TTL, cache key includes query params</td>
            </tr>
            <tr>
              <td>Personalised pages (dashboard)</td>
              <td>Rarely</td>
              <td>Cache the shell, load user data client-side</td>
            </tr>
            <tr>
              <td>POST / auth / payments</td>
              <td>Never</td>
              <td>Passed straight through to origin</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Cache busting</h2>
        <p>
          The classic problem: you deploy a new <code>style.css</code> but users keep the old cached
          one for a day. The fix is a <b>content hash in the filename</b>:{" "}
          <code>style.9f2a1c.css</code>. New content &rarr; new name &rarr; guaranteed fresh fetch,
          and the old file can be cached forever.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: a request through a CDN</h2>
        <ol className="stepList">
          <li>
            <b>DNS points to the CDN.</b> <code>cdn.example.com</code> resolves to the CDN, which
            returns the IP of the nearest edge (anycast / geo-DNS).
          </li>
          <li>
            <b>Edge checks its cache.</b> Cache key = host + path + selected headers.
          </li>
          <li>
            <b>Hit:</b> the edge returns the file in ~10 ms. Origin is untouched. Response carries{" "}
            <code>X-Cache: HIT</code>.
          </li>
          <li>
            <b>Miss:</b> the edge fetches from origin once, stores it per the{" "}
            <code>Cache-Control</code> TTL, and serves it. Later users in that region get hits.
          </li>
          <li>
            <b>Purge on deploy:</b> your pipeline calls the CDN&apos;s purge API (or you rely on
            hashed filenames) so stale files are dropped.
          </li>
        </ol>
        <div className="takeaway">
          A good cache-hit ratio (often 90%+ for static sites) means your origin can be small and
          cheap &mdash; the CDN absorbs the traffic and the spikes.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>No cache headers</h3>
            <p>
              Without <code>Cache-Control</code>, many CDNs will not cache at all, or cache
              unpredictably. Set it explicitly on every asset.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Caching personalised responses</h3>
            <p>
              One user&apos;s dashboard served to everyone. Mark private responses{" "}
              <code>Cache-Control: private, no-store</code> or split the cache key by user.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Query-string cache misses</h3>
            <p>
              <code>?utm_source=...</code> on every link creates a new cache key each time. Strip
              tracking params from the cache key.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            You ship a CSS change but users still see the old styles for hours. Name two ways to fix
            it going forward, and say which one lets you cache the file &quot;forever&quot;.
          </p>
        </div>
      </section>
    </div>
  );
}
