import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingWriteBackArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Write-back (also called write-behind) caching writes to the cache <b>immediately</b> and
          confirms success right away &mdash; the write to the database happens <i>later</i>, in the
          background.
        </p>
        <p>
          It is the fastest of the write strategies, because the app never waits on the database at
          all. That speed is borrowed against risk: for a short window, the only copy of the new data
          lives in the cache.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A game logs a player&apos;s score after every level. Writing to the database on every
            single score update would be far too slow for a fast-paced game. Instead, scores are
            written to an in-memory cache instantly, and a background process flushes batches of
            score updates to the database every few seconds &mdash; the player never feels the
            database at all.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The flow</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="wbTitle">
            <title id="wbTitle">
              A write is confirmed the instant it lands in the cache; a background process flushes
              it to the database a moment later.
            </title>
            <rect className="box" x="20" y="45" width="90" height="40" />
            <text className="boxText" x="65" y="69">
              app
            </text>
            <line className="flow" x1="110" y1="60" x2="220" y2="60" />
            <text className="figHint" x="165" y="50">
              write
            </text>
            <rect className="boxAccent" x="220" y="45" width="120" height="40" />
            <text className="boxText" x="280" y="69">
              cache
            </text>
            <line className="flow" x1="340" y1="55" x2="200" y2="90" />
            <text className="figHint" x="270" y="100">
              confirmed &mdash; instantly
            </text>
            <line className="flowMuted" x1="340" y1="70" x2="480" y2="70" />
            <text className="figHint" x="410" y="60">
              flushed later
            </text>
            <rect className="boxWarn" x="480" y="45" width="130" height="40" />
            <text className="boxText" x="545" y="69">
              database
            </text>
          </svg>
          <figcaption>
            The app is told &quot;done&quot; before the database has seen the write at all.
          </figcaption>
        </figure>

        <h2>2. Comparing all three write strategies</h2>
        <table className="miniTable">
          <caption>WRITE-THROUGH VS WRITE-BACK VS CACHE-ASIDE</caption>
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Write latency</th>
              <th>Risk if the cache dies</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Write-through</td>
              <td>Waits on cache + database</td>
              <td>Low &mdash; database is always current</td>
            </tr>
            <tr>
              <td>Cache-aside</td>
              <td>Same as a plain database write</td>
              <td>Low, but reads can go stale until invalidated</td>
            </tr>
            <tr>
              <td>Write-back</td>
              <td>Fastest &mdash; only waits on the cache</td>
              <td>High &mdash; unflushed writes can be lost</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Batching is the real payoff</h2>
        <p>
          Because writes accumulate in the cache before flushing, write-back can <b>batch and
          coalesce</b> them &mdash; ten updates to the same key in one second can become a single
          database write, and many separate writes can go to the database in one round trip instead
          of ten.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: batched score updates</h2>
        <ol className="stepList">
          <li>
            <b>Player finishes a level.</b> App writes{" "}
            <code>cache.set(&quot;score:player7&quot;, 4200)</code> and returns instantly &mdash; no
            database call in this request.
          </li>
          <li>
            <b>The same player finishes another level</b> 4 seconds later, overwriting the cached
            score to 5100 before the first value was ever flushed.
          </li>
          <li>
            <b>Every 5 seconds,</b> a background flusher reads all &quot;dirty&quot; (unsaved) keys
            and writes them to the database in one batch &mdash; here, just the final 5100, not two
            separate writes.
          </li>
          <li>
            <b>If the cache crashes</b> right before a flush, that unsaved score is gone &mdash; a
            real risk this pattern accepts in exchange for its speed.
          </li>
          <li>
            <b>To reduce that risk,</b> some systems also write the change to a durable log first
            (so it can be replayed), while still batching the actual database writes.
          </li>
        </ol>
        <div className="takeaway">
          Write-back is the right trade when write speed matters more than the small chance of
          losing the very latest writes &mdash; game state, metrics, and logs often fit; money rarely
          does.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Using it for critical, non-recoverable data</h3>
            <p>
              A payment written only to a cache, flushed &quot;later&quot;, can simply vanish on a
              crash. Write-through or a durable queue fits money far better.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>No flush guarantee at all</h3>
            <p>
              Without a durable log or replication for the cache itself, a crash between writes and
              flush is unrecoverable data loss, not just a delay.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Flushing too infrequently</h3>
            <p>
              A long flush interval increases both the batching benefit and the amount of data at
              risk if something fails &mdash; it is a dial, not a fixed setting.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Would you use write-back for a &quot;likes&quot; counter on a post, or for a bank
            transfer? Justify both answers using the risk this pattern accepts.
          </p>
        </div>
      </section>
    </div>
  );
}
