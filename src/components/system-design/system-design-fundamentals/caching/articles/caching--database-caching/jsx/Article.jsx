import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingDatabaseArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Database caching is speeding up reads that would otherwise hit disk &mdash; and it happens
          at two levels: the caching your database engine already does for you, and the caching{" "}
          <i>you</i> add in front of it.
        </p>
        <p>
          Understanding both matters: sometimes the fix for a slow query is inside the database;
          sometimes it is an application cache that stops you from asking the database at all.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A dashboard query joins five tables and takes 800 ms the first time. Run it again a
            second later and it comes back in 40 ms &mdash; you did not add any cache. The
            database&apos;s own <b>buffer pool</b> kept the pages that query touched in memory, so the
            second run barely touched disk. That is caching you get for free, just by the database
            doing its job.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Two layers of database caching</h2>
        <table className="miniTable">
          <caption>BUILT-IN VS BOLTED-ON</caption>
          <thead>
            <tr>
              <th></th>
              <th>Buffer pool (built into the DB)</th>
              <th>Cache in front of the DB (Redis etc.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>What it stores</td>
              <td>Raw data pages recently read from disk</td>
              <td>Finished query results, or objects</td>
            </tr>
            <tr>
              <td>Who manages it</td>
              <td>The database engine, automatically</td>
              <td>Your application code, explicitly</td>
            </tr>
            <tr>
              <td>Still hits the database?</td>
              <td>Yes, but memory instead of disk</td>
              <td>No &mdash; a hit skips the database entirely</td>
            </tr>
            <tr>
              <td>Freshness</td>
              <td>Always current &mdash; it is the real engine</td>
              <td>Can go stale until invalidated or expired</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Why you still add a cache in front</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="dbCacheTitle">
            <title id="dbCacheTitle">
              Even a fast in-memory database read still costs a network round trip and query
              execution; an application-level cache skips both entirely.
            </title>
            <rect className="box" x="20" y="45" width="120" height="40" />
            <text className="boxText" x="80" y="69">
              app server
            </text>
            <line className="flow" x1="140" y1="55" x2="260" y2="35" />
            <text className="figHint" x="200" y="25">
              query &rarr; ~5&ndash;40ms
            </text>
            <rect className="box" x="260" y="18" width="150" height="34" />
            <text className="boxText" x="335" y="40">
              DB (buffer pool hit)
            </text>
            <line className="flow" x1="140" y1="70" x2="260" y2="90" />
            <text className="figHint" x="200" y="105">
              cache &rarr; ~0.5&ndash;1ms
            </text>
            <rect className="boxAccent" x="260" y="75" width="150" height="34" />
            <text className="boxText" x="335" y="97">
              app cache hit
            </text>
          </svg>
          <figcaption>
            Even a well-tuned database still has to parse, plan, and execute a query. An
            application cache in front skips all of that for repeat reads.
          </figcaption>
        </figure>

        <h2>3. Where a database cache is used inside the engine</h2>
        <ul>
          <li>
            <b>Buffer pool / page cache:</b> keeps recently used disk pages in RAM.
          </li>
          <li>
            <b>Query result cache:</b> some databases can cache the exact result of an identical
            query &mdash; fast, but invalidated the moment the underlying table changes.
          </li>
          <li>
            <b>Materialized views:</b> a precomputed, stored result of an expensive query, refreshed
            on a schedule &mdash; a cache you can query like a normal table.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: layering both caches</h2>
        <ol className="stepList">
          <li>
            <b>A dashboard query</b> aggregates last month&apos;s sales &mdash; expensive, called
            often, changes only a few times a day.
          </li>
          <li>
            <b>Application checks Redis</b> for <code>sales-summary:2026-09</code> first.
          </li>
          <li>
            <b>Miss:</b> the query runs against the database. If the relevant pages are already in
            the buffer pool, this is fast; if not, the database reads from disk once.
          </li>
          <li>
            <b>The application stores</b> the result in Redis with a several-hour TTL, then returns
            it.
          </li>
          <li>
            <b>Every request for the rest of the day</b> is a Redis hit &mdash; the database, and
            even its own buffer pool, are never touched again for this query.
          </li>
        </ol>
        <div className="takeaway">
          The database&apos;s own caching makes individual queries faster. An application-level
          cache in front removes the query &mdash; and the database load &mdash; entirely for repeat
          reads.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Assuming the buffer pool solves everything</h3>
            <p>
              It only helps if the working set fits in memory. A dataset far bigger than RAM still
              causes constant disk reads.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Caching results that must always be fresh</h3>
            <p>
              An account balance cached for 10 minutes at the application layer can show stale money
              &mdash; know which queries cannot tolerate that.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Ignoring cache invalidation on writes</h3>
            <p>
              If a write updates the database but not the application cache, readers keep seeing the
              old value until the TTL expires.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A query is fast the second time you run it, even with no application cache. What is
            actually making it fast, and why does restarting the database server undo that speed-up?
          </p>
        </div>
      </section>
    </div>
  );
}
