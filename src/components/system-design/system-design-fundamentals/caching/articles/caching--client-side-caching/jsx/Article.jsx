import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingClientSideArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Client-side caching stores data right on the user&apos;s device &mdash; browser, phone, or
          desktop app &mdash; so a repeat request never has to leave the machine at all.
        </p>
        <p>
          It is the fastest cache in the whole chain: no network round trip, not even to a nearby
          CDN edge. The trade-off is that you, the server, do not fully control when it gets cleared.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You visit a site, then hit the back button. The page reappears instantly &mdash; no
            spinner, no network tab activity. Your browser never asked the server again; it served
            the whole page from its own local cache because the server had said &quot;this is good
            for a while.&quot;
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The HTTP caching headers</h2>
        <table className="miniTable">
          <caption>HOW THE SERVER TELLS THE BROWSER WHAT TO DO</caption>
          <thead>
            <tr>
              <th>Header</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>Cache-Control: max-age=3600</code>
              </td>
              <td>Reuse this response for 1 hour without asking again</td>
            </tr>
            <tr>
              <td>
                <code>Cache-Control: no-store</code>
              </td>
              <td>Never cache this &mdash; always fetch fresh (e.g. a bank balance)</td>
            </tr>
            <tr>
              <td>
                <code>ETag</code>
              </td>
              <td>A fingerprint of the content, used to check &quot;did this change?&quot;</td>
            </tr>
            <tr>
              <td>
                <code>If-None-Match</code>
              </td>
              <td>Browser sends the old ETag back; server replies 304 if unchanged</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Fresh vs stale-but-revalidate</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="clientCacheTitle">
            <title id="clientCacheTitle">
              Within max-age the browser serves the file with zero network calls; after it expires,
              a lightweight check confirms whether the cached copy is still valid.
            </title>
            <rect className="box" x="20" y="30" width="180" height="36" />
            <text className="boxText" x="110" y="53">
              within max-age
            </text>
            <text className="figHint" x="110" y="85">
              served from disk, 0 network calls
            </text>

            <rect className="boxAccent" x="260" y="30" width="180" height="36" />
            <text className="boxText" x="350" y="53">
              after max-age
            </text>
            <line className="flow" x1="440" y1="48" x2="540" y2="48" />
            <text className="figHint" x="490" y="38">
              If-None-Match
            </text>
            <rect className="box" x="540" y="30" width="80" height="36" />
            <text className="boxText" x="580" y="53">
              304?
            </text>
            <text className="figHint" x="490" y="80">
              unchanged &rarr; keep using cached copy, no re-download
            </text>
          </svg>
          <figcaption>
            Revalidation costs a tiny request-response, not the whole file &mdash; far cheaper than
            downloading it again.
          </figcaption>
        </figure>

        <h2>3. What browsers cache besides pages</h2>
        <ul>
          <li>
            <b>Static assets:</b> images, CSS, JS &mdash; usually long <code>max-age</code> plus a
            hash in the filename.
          </li>
          <li>
            <b>DNS and connection info:</b> so the next request to the same host skips lookup and
            handshake.
          </li>
          <li>
            <b>App data:</b> mobile apps and SPAs store data in <code>localStorage</code>, IndexedDB,
            or a local database for offline use.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: caching a versioned asset</h2>
        <ol className="stepList">
          <li>
            <b>Build step</b> outputs <code>app.9f2a1c.js</code> &mdash; the hash changes whenever the
            content changes.
          </li>
          <li>
            <b>Server responds</b> with{" "}
            <code>Cache-Control: public, max-age=31536000, immutable</code> &mdash; cache this for a
            year, it will never change under this exact name.
          </li>
          <li>
            <b>Browser stores it.</b> Every later visit uses the local copy &mdash; zero requests for
            this file until the app is redeployed.
          </li>
          <li>
            <b>You ship a new version:</b> the build produces <code>app.7bd310.js</code> &mdash; a
            brand-new filename, so it is guaranteed to be a fresh download, not a stale cache hit.
          </li>
          <li>
            <b>The HTML file itself</b> is served with a short or no cache time, so the browser
            always finds out about the new filename promptly.
          </li>
        </ol>
        <div className="takeaway">
          Content-hashed filenames plus a long <code>max-age</code> let you cache &quot;forever&quot;
          safely &mdash; the URL changes the instant the content does.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Long cache time on a URL that can change</h3>
            <p>
              Caching <code>/app.js</code> (no hash) for a year means users run stale JavaScript
              until they manually clear their cache.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Caching personalised or sensitive responses</h3>
            <p>
              A missing <code>no-store</code> / <code>private</code> on an account page can leave it
              cached on a shared computer for another user to see.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Relying on the client cache alone</h3>
            <p>
              Client caches are outside your control &mdash; a user can clear them anytime. Never
              assume a piece of data is guaranteed to still be there.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Why does <code>ETag</code> + <code>304 Not Modified</code> save bandwidth even though the
            browser still makes a network request every time the cache expires?
          </p>
        </div>
      </section>
    </div>
  );
}
