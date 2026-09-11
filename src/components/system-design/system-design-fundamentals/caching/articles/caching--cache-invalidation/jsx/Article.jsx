import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingInvalidationArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Cache invalidation is telling a cache &quot;the value you have for this key is no longer
          correct&quot; &mdash; either by removing it, replacing it, or marking it stale, so nobody
          reads outdated data.
        </p>
        <p>
          It is famously one of the two hard problems in computer science, alongside naming things
          and off-by-one errors. The difficulty is not the mechanism &mdash; it is reliably knowing{" "}
          <i>when</i> something changed and reaching every copy of it.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A support agent updates a customer&apos;s shipping address. If the order-confirmation
            page still reads from a cache that has not been told about the change, the customer sees
            their <i>old</i> address for the next 10 minutes, confused about whether the update
            actually saved. The database was correct the whole time &mdash; the cache just was not
            told.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Three ways to invalidate</h2>
        <table className="miniTable">
          <caption>PICK ONE FOR EACH PIECE OF DATA</caption>
          <thead>
            <tr>
              <th>Strategy</th>
              <th>How it works</th>
              <th>Trade-off</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TTL expiry</td>
              <td>The entry just times out on its own after N seconds</td>
              <td>Simple, but stale for up to the full TTL</td>
            </tr>
            <tr>
              <td>Explicit delete/update</td>
              <td>The write path deletes or updates the key directly</td>
              <td>Fresh instantly, but easy to forget a path</td>
            </tr>
            <tr>
              <td>Event-driven invalidation</td>
              <td>A change event (from Core Concepts) tells every cache to drop the key</td>
              <td>Reliable across services, more moving parts</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Delete vs update the cache</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="invTitle">
            <title id="invTitle">
              On a write, you can either delete the cached key so the next read fetches fresh data,
              or update the cache with the new value directly.
            </title>
            <rect className="box" x="20" y="50" width="100" height="34" />
            <text className="boxText" x="70" y="71">
              write happens
            </text>
            <line className="flow" x1="120" y1="60" x2="220" y2="30" />
            <rect className="boxAccent" x="220" y="12" width="150" height="34" />
            <text className="boxText" x="295" y="34">
              DELETE the key
            </text>
            <text className="figHint" x="295" y="60">
              next read is a clean miss
            </text>
            <line className="flow" x1="120" y1="75" x2="220" y2="100" />
            <rect className="box" x="220" y="83" width="150" height="34" />
            <text className="boxText" x="295" y="105">
              UPDATE the value
            </text>
            <text className="figHint" x="295" y="125">
              next read is a hit with fresh data
            </text>
          </svg>
          <figcaption>
            Deleting is simpler and safer (nothing to get wrong about the new value); updating
            avoids a miss but risks writing the wrong thing if two writes race.
          </figcaption>
        </figure>

        <h2>3. When invalidation gets genuinely hard</h2>
        <ul>
          <li>
            <b>Multiple caches, one change.</b> A CDN, an app cache, and a browser cache might all
            hold a copy &mdash; invalidating one does not touch the others.
          </li>
          <li>
            <b>Derived data.</b> Updating a product does not just affect{" "}
            <code>product:42</code> &mdash; it might also be embedded in a cached
            &quot;category:shoes&quot; list, a search index, and a &quot;recently viewed&quot; cache.
          </li>
          <li>
            <b>Race conditions.</b> A slow read that started before a write can finish and cache its
            stale result <i>after</i> the write&apos;s invalidation already ran.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: invalidating across a fan-out</h2>
        <ol className="stepList">
          <li>
            <b>An admin updates a product&apos;s price.</b> The write path updates the database and
            deletes <code>product:42</code> from the app cache &mdash; the direct copy is now fresh.
          </li>
          <li>
            <b>But a &quot;category:shoes&quot; list</b> that embeds this product&apos;s price is
            still cached with the old value &mdash; deleting one key did not touch it.
          </li>
          <li>
            <b>The write path also publishes</b> a <code>ProductUpdated {`{id: 42}`}</code> event
            (from the Communication Patterns section).
          </li>
          <li>
            <b>Any cache that embeds product 42</b> &mdash; category lists, search results, related-
            items &mdash; subscribes to that event and invalidates its own affected keys.
          </li>
          <li>
            <b>The CDN and browser caches</b> are handled separately: a short TTL plus, if urgent, an
            explicit purge call at the edge.
          </li>
        </ol>
        <div className="takeaway">
          There is rarely one invalidation call that reaches everywhere. Treat &quot;what caches
          derive from this data?&quot; as a design question, not an afterthought.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Invalidating the direct key, missing derived ones</h3>
            <p>
              Clearing <code>product:42</code> but leaving a list or aggregate that embeds it means
              stale data hides one level away from where anyone looked.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Relying purely on TTL for urgent corrections</h3>
            <p>
              A wrong price or an abusive comment needs to disappear now, not whenever a 10-minute
              TTL happens to expire.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No source of truth for &quot;what depends on this?&quot;</h3>
            <p>
              Without tracking which caches derive from which data, every schema change risks
              missing an invalidation path silently.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A user&apos;s display name is cached directly under their profile key, and also embedded
            in every cached comment they have posted. Deleting the profile key alone &mdash; is that
            enough? What else needs handling?
          </p>
        </div>
      </section>
    </div>
  );
}
