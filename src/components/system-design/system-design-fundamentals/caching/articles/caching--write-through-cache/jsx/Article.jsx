import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingWriteThroughArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Write-through caching writes to the cache and the database <b>together, as one step</b>{" "}
          &mdash; the write is only considered done once both are updated. The cache is never stale
          for data it already holds.
        </p>
        <p>
          This solves the exact gap cache-aside leaves open: instead of remembering to invalidate the
          cache after every write, the write itself keeps the cache correct by construction.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A user updates their display name. With write-through, that single{" "}
            <code>updateUser()</code> call writes the new name to the database <i>and</i> to the
            cache before returning success. The very next read, from any server, sees the new name
            &mdash; there was never a window where the cache held the old one.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The flow</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="wtTitle">
            <title id="wtTitle">
              A write goes through the cache, which writes to the database first and then updates
              itself, only confirming success once both are done.
            </title>
            <rect className="box" x="20" y="45" width="90" height="40" />
            <text className="boxText" x="65" y="69">
              app
            </text>
            <line className="flow" x1="110" y1="65" x2="230" y2="65" />
            <text className="figHint" x="170" y="55">
              write
            </text>
            <rect className="boxAccent" x="230" y="45" width="120" height="40" />
            <text className="boxText" x="290" y="69">
              cache
            </text>
            <line className="flow" x1="350" y1="65" x2="480" y2="65" />
            <text className="figHint" x="415" y="55">
              1. write DB
            </text>
            <rect className="boxWarn" x="480" y="45" width="120" height="40" />
            <text className="boxText" x="540" y="69">
              database
            </text>
            <text className="figHint" x="290" y="100">
              2. cache updates its own copy, then confirms &quot;done&quot; to the app
            </text>
          </svg>
          <figcaption>
            Both writes happen before the app is told the write succeeded &mdash; the cache is never
            momentarily behind the database.
          </figcaption>
        </figure>

        <h2>2. Write-through vs cache-aside on writes</h2>
        <table className="miniTable">
          <caption>WHAT HAPPENS TO THE CACHE WHEN DATA CHANGES</caption>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Cache-aside</th>
              <th>Write-through</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>On write</td>
              <td>App must remember to delete the key</td>
              <td>Cache is updated automatically, as part of the write</td>
            </tr>
            <tr>
              <td>Risk of stale reads</td>
              <td>Yes, if invalidation is missed or delayed</td>
              <td>No &mdash; the cache is always current for written keys</td>
            </tr>
            <tr>
              <td>Write latency</td>
              <td>Same as a normal database write</td>
              <td>Slightly higher &mdash; two writes happen before success</td>
            </tr>
            <tr>
              <td>Unused / never-read keys</td>
              <td>Never cached (only reads populate it)</td>
              <td>Cached even if nobody reads them again</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>3. Step by step: updating an account balance</h2>
        <ol className="stepList">
          <li>
            <b>App calls</b> <code>cache.set(&quot;balance:42&quot;, 5200)</code> through a
            write-through cache client.
          </li>
          <li>
            <b>The cache client writes to the database first:</b>{" "}
            <code>UPDATE accounts SET balance=5200 WHERE id=42</code>.
          </li>
          <li>
            <b>Only after the database confirms,</b> the cache updates its own stored value for{" "}
            <code>balance:42</code>.
          </li>
          <li>
            <b>The write call returns success</b> to the app only now &mdash; both stores agree.
          </li>
          <li>
            <b>A read from a different server</b> a moment later hits the cache and sees 5200
            &mdash; never the stale 5000.
          </li>
        </ol>
        <div className="takeaway">
          Write-through is a good fit when correctness on read matters more than shaving a few
          milliseconds off write latency &mdash; you pay a little on every write to never risk a
          stale read.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Using it for rarely-read data</h3>
            <p>
              Writing every update into the cache when most of it is never read again wastes cache
              space for no benefit &mdash; cache-aside would only cache what is actually requested.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Ignoring the extra write latency</h3>
            <p>
              Every write now waits on both the cache and the database. For write-heavy, latency-
              sensitive paths, that added cost adds up.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No plan for a cache-write failure</h3>
            <p>
              If the database write succeeds but the cache write fails, decide deliberately: fail
              the whole operation, or let the cache lag until the next natural refresh.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Why does write-through never need a separate cache-invalidation step the way cache-aside
            does &mdash; and what does that guarantee cost you on every write?
          </p>
        </div>
      </section>
    </div>
  );
}
