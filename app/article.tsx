"use client";

import { useEffect, useState } from "react";

const sqlSetup = `CREATE TABLE product (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    price       NUMERIC(12, 2) NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION notify_product_changed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM pg_notify(
        'product_changed',
        json_build_object(
            'operation', TG_OP,
            'productId', COALESCE(NEW.id, OLD.id),
            'changedAt', clock_timestamp()
        )::text
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER product_changed_trigger
AFTER INSERT OR UPDATE OR DELETE ON product
FOR EACH ROW EXECUTE FUNCTION notify_product_changed();`;

const dependency = `<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>`;

const listenerCode = `@Component
public class ProductChangeListener implements SmartLifecycle {
    private final DataSource dataSource;
    private final ObjectMapper objectMapper;
    private final ProductCache productCache;
    private final ExecutorService worker =
        Executors.newSingleThreadExecutor(
            Thread.ofPlatform().name("pg-notify-listener").factory());

    private volatile boolean running;
    private volatile Connection connection;

    @Override
    public void start() {
        running = true;
        worker.submit(this::listenWithReconnect);
    }

    private void listenWithReconnect() {
        long retryMillis = 1_000;
        while (running) {
            try (Connection c = dataSource.getConnection();
                 Statement statement = c.createStatement()) {
                connection = c;
                c.setAutoCommit(true);
                statement.execute("LISTEN product_changed");
                PGConnection pg = c.unwrap(PGConnection.class);
                retryMillis = 1_000;

                while (running && !c.isClosed()) {
                    PGNotification[] events =
                        pg.getNotifications(10_000);
                    if (events == null) continue;

                    for (PGNotification event : events) {
                        ProductChanged change = objectMapper.readValue(
                            event.getParameter(), ProductChanged.class);
                        productCache.evict(change.productId());
                    }
                }
            } catch (Exception failure) {
                connection = null;
                sleepWithJitter(retryMillis);
                retryMillis = Math.min(retryMillis * 2, 30_000);
            }
        }
    }

    @Override
    public void stop() {
        running = false;
        closeQuietly(connection); // unblocks getNotifications
        worker.shutdownNow();
    }

    @Override public boolean isRunning() { return running; }
    @Override public int getPhase() { return Integer.MAX_VALUE; }

    public record ProductChanged(
        String operation, long productId, Instant changedAt) {}
}`;

const springConfig = `@Configuration
public class CacheConfiguration {
    @Bean
    CacheManager cacheManager() {
        return new CaffeineCacheManager("products");
    }
}

@Service
public class ProductService {
    @Cacheable(cacheNames = "products", key = "#id")
    public ProductDto findById(long id) {
        return repository.findById(id)
            .map(ProductDto::from)
            .orElseThrow();
    }
}

@Component
public class ProductCache {
    private final CacheManager cacheManager;

    public void evict(long productId) {
        Cache cache = Objects.requireNonNull(
            cacheManager.getCache("products"));
        cache.evict(productId);
    }
}`;

const flashcards = [
  ["When is a notification delivered?", "Only after the transaction commits. A rollback produces no notification."],
  ["Is LISTEN/NOTIFY durable?", "No. A disconnected listener misses events; PostgreSQL does not replay them."],
  ["What belongs in the payload?", "A small signal: event type, entity ID, version, or outbox ID—not the full record."],
  ["Can a normal pooled connection LISTEN?", "Technically yes, operationally risky. A listener needs one dedicated, session-scoped connection."],
  ["What is the safest cache action?", "Evict the key, then let the next read load committed truth from PostgreSQL."],
  ["When should you use an outbox?", "When every event must survive crashes, disconnects, retries, and downstream outages."],
];

function CodeBlock({ label, children }: { label: string; children: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }
  return (
    <div className="code-wrap">
      <div className="code-head"><span>{label}</span><button onClick={copy}>{copied ? "Copied" : "Copy"}</button></div>
      <pre><code>{children}</code></pre>
    </div>
  );
}

function CacheLab() {
  const [phase, setPhase] = useState(0);
  const steps = ["Update product 42", "Commit transaction", "NOTIFY all listeners", "Evict only key 42"];
  useEffect(() => {
    if (!phase) return;
    const id = setTimeout(() => setPhase((p) => (p < 4 ? p + 1 : 0)), 950);
    return () => clearTimeout(id);
  }, [phase]);
  return (
    <section className="lab" aria-label="Animated cache invalidation example">
      <div className="section-kicker">Interactive trace</div>
      <div className="lab-title-row">
        <div><h2>Watch one committed row invalidate three caches</h2><p>No polling. No full refresh. Just a small signal after commit.</p></div>
        <button className="run-button" onClick={() => setPhase(1)} disabled={phase > 0}>{phase ? "Running…" : "Run the flow"}</button>
      </div>
      <div className="flow">
        <div className={`flow-node writer ${phase >= 1 ? "active" : ""}`}><small>Writer</small><strong>UPDATE product</strong><span>id = 42</span></div>
        <div className={`flow-line ${phase >= 2 ? "active" : ""}`}><i /></div>
        <div className={`flow-node postgres ${phase >= 2 ? "active" : ""}`}><small>PostgreSQL</small><strong>COMMIT + NOTIFY</strong><span>product_changed</span></div>
        <div className={`flow-line ${phase >= 3 ? "active" : ""}`}><i /></div>
        <div className="instances">
          {[1,2,3].map((n) => <div className={`mini-node ${phase >= 3 ? "notified" : ""} ${phase >= 4 ? "evicted" : ""}`} key={n}><b>App {n}</b><span>{phase >= 4 ? "42 evicted ✓" : "Cache: 42"}</span></div>)}
        </div>
      </div>
      <ol className="timeline">{steps.map((s, i) => <li className={phase >= i + 1 ? "done" : ""} key={s}><span>{i + 1}</span>{s}</li>)}</ol>
    </section>
  );
}

function FlashCards() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="flashcards" className="wide-section">
      <div className="section-kicker">Recall, don’t reread</div>
      <h2>Six production flash cards</h2>
      <p>Tap a card, answer from memory, then reveal the back.</p>
      <div className="cards">
        {flashcards.map(([q,a], i) => (
          <button key={q} className={`flashcard ${open === i ? "flipped" : ""}`} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span className="card-face card-front"><small>Question {i + 1}</small><strong>{q}</strong><em>Tap to reveal</em></span>
            <span className="card-face card-back"><small>Answer</small><strong>{a}</strong><em>Tap to close</em></span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Article() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max > 0 ? (scrollY / max) * 100 : 0);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  const toc = [
    ["problem","The problem"],["mental-model","Mental model"],["implementation","Implementation"],
    ["production","Production hardening"],["limitations","Limitations"],["decision","Decision guide"],["flashcards","Flash cards"],["memory-map","Memory map"]
  ];
  return (
    <main>
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <header className="site-header">
        <a className="brand" href="#"><span>ED</span><b>Engineering Decoded</b></a>
        <nav><a href="#implementation">Implementation</a><a href="#limitations">Limitations</a><a href="#flashcards">Flash cards</a></nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>Contents</button>
      </header>

      <article>
        <section className="hero">
          <div className="eyebrow"><span>DATABASE SYSTEMS</span><span>19 MIN READ</span><span>PRODUCTION GUIDE</span></div>
          <h1>PostgreSQL LISTEN/NOTIFY with Java: Real-Time Change Notifications and Their Hidden Limitations</h1>
          <p className="dek">A practical Spring Boot implementation for targeted cache invalidation—plus the failure modes that decide whether it belongs in your architecture.</p>
          <div className="byline"><div className="avatar">ED</div><div><b>Engineering Decoded</b><span>Java architecture, without the hand-waving · Updated July 2026</span></div></div>
          <div className="hero-terminal" aria-label="Notification example">
            <div className="terminal-top"><span /><span /><span /><b>product-cache.log</b></div>
            <div><i>12:40:18.061</i> <em>COMMIT</em> product_id=42</div>
            <div><i>12:40:18.063</i> <strong>NOTIFY</strong> channel=product_changed payload=&#123;&quot;productId&quot;:42&#125;</div>
            <div><i>12:40:18.066</i> <mark>EVICT</mark> cache=products key=42 instances=3</div>
          </div>
        </section>

        <div className="article-grid">
          <aside className={`toc ${menuOpen ? "open" : ""}`}>
            <b>IN THIS ARTICLE</b>
            {toc.map(([id,label], i) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}><span>0{i+1}</span>{label}</a>)}
            <div className="toc-note"><b>The one-line rule</b><p>Use NOTIFY as a hint to re-read truth—not as the truth itself.</p></div>
          </aside>

          <div className="prose">
            <section id="problem">
              <div className="section-kicker">01 · Start with the problem</div>
              <h2>Three application instances. Three copies of stale data.</h2>
              <p>Imagine a product service running on three Java instances. Each instance keeps frequently requested products in a local Caffeine cache. PostgreSQL is the system of record.</p>
              <p>Instance A changes the price of product <code>42</code>. Or perhaps a back-office job writes directly to the database. Instance B and C know nothing about that commit, so both can continue serving the old price until their cache entries expire.</p>
              <div className="scenario">
                <div><span>A</span><b>App instance</b><small>Writes £89.00</small></div>
                <div><span>B</span><b>App instance</b><small>Still caches £99.00</small></div>
                <div><span>C</span><b>App instance</b><small>Still caches £99.00</small></div>
              </div>
              <h3>The obvious solution: poll</h3>
              <div className="poll-strip"><span>Application</span><i>→</i><span>Query every few seconds</span><i>→</i><span>Compare data</span><i>→</i><span>Refresh cache</span></div>
              <p>Polling is simple and sometimes perfectly acceptable. But it pays the query cost even when nothing changes. Tighten the interval and database load rises; loosen it and stale data lives longer. A full refresh also throws away healthy cache entries just because one row changed.</p>
              <div className="callout"><b>The requirement</b><p>Tell every live instance that product <code>42</code> changed, quickly and cheaply, so each can evict only that key.</p></div>
            </section>

            <section id="mental-model">
              <div className="section-kicker">02 · The mental model</div>
              <h2>LISTEN/NOTIFY is PostgreSQL’s tiny pub/sub channel</h2>
              <p>A session executes <code>LISTEN product_changed</code> and remains connected. Another transaction executes <code>NOTIFY product_changed, &apos;…&apos;</code>. After that transaction commits, PostgreSQL sends the payload to every session currently listening on that channel.</p>
              <div className="truth-grid">
                <div><b>LISTEN</b><p>Subscribe this database session to a named channel.</p></div>
                <div><b>NOTIFY</b><p>Publish a short string to current subscribers after commit.</p></div>
                <div><b>Payload</b><p>Carry a key or pointer. Keep the database row as truth.</p></div>
              </div>
              <p>That “currently listening” phrase matters. PostgreSQL is not storing a durable event for later delivery. If an application is disconnected when the notification is emitted, that application misses it.</p>
              <blockquote><b>Think doorbell, not mailbox.</b> A doorbell tells you to check the door. It does not store the parcel, retry delivery, or prove that you answered.</blockquote>
            </section>
          </div>
        </div>

        <CacheLab />

        <div className="article-grid continuation">
          <div />
          <div className="prose">
            <section id="implementation">
              <div className="section-kicker">03 · Complete implementation</div>
              <h2>Build it from the database outward</h2>
              <p>The implementation has four pieces: a trigger that emits a small message, a dedicated JDBC connection that listens, a parser for the payload, and targeted cache eviction.</p>
              <h3>1. Emit after a row changes</h3>
              <CodeBlock label="schema.sql">{sqlSetup}</CodeBlock>
              <p>The trigger runs inside the same transaction as the row change. PostgreSQL queues the notification and exposes it only after commit. A rollback therefore cannot make listeners evict for a change that never became real.</p>
              <p><code>COALESCE(NEW.id, OLD.id)</code> supports deletes as well as inserts and updates. The payload identifies the aggregate; consumers can fetch the authoritative state if they need more than an eviction.</p>
              <div className="demo-production"><div><b>Demo shortcut</b><p>A trigger for every row is easy to understand and catches changes made outside the Java service.</p></div><div><b>Production choice</b><p>For high write rates, notify once per logical aggregate or write an outbox row. Measure trigger overhead and notification volume.</p></div></div>
              <h3>2. Add the PostgreSQL JDBC driver</h3>
              <CodeBlock label="pom.xml">{dependency}</CodeBlock>
              <p><code>PGConnection</code> is a PostgreSQL-specific extension. Standard JDBC does not define asynchronous database notifications, so the listener unwraps the physical connection.</p>
              <h3>3. Own one long-lived listener connection</h3>
              <CodeBlock label="ProductChangeListener.java">{listenerCode}</CodeBlock>
              <p><code>LISTEN</code> is session-scoped. That is why this component holds a connection instead of borrowing one for a short query. The blocking <code>getNotifications(timeout)</code> call avoids a hot polling loop while still allowing periodic lifecycle checks.</p>
              <p>The outer loop reconnects with capped exponential backoff. The real version should also log structured connection state, increment reconnect and malformed-payload metrics, and expose listener readiness separately from ordinary HTTP health.</p>
              <div className="warning"><b>Do not return the listening connection to HikariCP.</b><p>The next borrower could inherit the subscription, while your listener silently loses it. Use a dedicated physical connection or a tiny separate data source with a maximum size of one.</p></div>
              <h3>4. Evict, then load on demand</h3>
              <CodeBlock label="CacheConfiguration.java">{springConfig}</CodeBlock>
              <p>Eviction is deliberately safer than pushing the payload value into the cache. The next request reads committed state and repopulates the entry. It also handles deletes naturally: the reload becomes “not found.”</p>
              <p>If a local write already evicts its own cache, receiving the same notification is harmless. Cache eviction should be idempotent.</p>
            </section>

            <section id="production">
              <div className="section-kicker">04 · Production hardening</div>
              <h2>The code is the easy part. Recovery is the design.</h2>
              <table><thead><tr><th>Concern</th><th>Production recommendation</th></tr></thead><tbody>
                <tr><td>Connection ownership</td><td>Reserve one physical connection per application instance. Do not multiplex it through transaction pooling.</td></tr>
                <tr><td>Reconnects</td><td>Use exponential backoff with jitter and a cap. Assume network devices will terminate quiet connections.</td></tr>
                <tr><td>Missed window</td><td>On reconnect, invalidate the relevant cache region or reconcile using a version/watermark table.</td></tr>
                <tr><td>Payload schema</td><td>Include an event type, aggregate ID, schema version, and optionally an outbox ID. Reject unknown versions safely.</td></tr>
                <tr><td>Back pressure</td><td>Keep listener work tiny. Hand expensive work to a bounded executor; monitor queue depth and drop policy.</td></tr>
                <tr><td>Observability</td><td>Track connection state, last notification time, reconnects, parse failures, handler latency, and queue usage.</td></tr>
                <tr><td>Security</td><td>Use fixed channel names and parameterized payload values. Grant the listener only the database access it needs.</td></tr>
                <tr><td>Deployments</td><td>Expect duplicate processing during overlap. Make every handler idempotent.</td></tr>
              </tbody></table>
              <h3>Use a version when ordering matters</h3>
              <p>Notifications from different transactions can reach a consumer close together, and asynchronous handlers can complete out of order. Put a monotonically increasing row version in the payload. Apply an update only if its version is newer than the cache entry—or simply evict, which avoids most ordering logic.</p>
              <h3>PgBouncer changes the connection rules</h3>
              <p>LISTEN depends on session state. It does not work reliably through transaction-pooling mode because successive operations may use different server connections. Route the listener through a direct PostgreSQL connection or a session-pooled endpoint. Keep normal request traffic on the regular pool.</p>
            </section>

            <section id="limitations">
              <div className="section-kicker">05 · Hidden limitations</div>
              <h2>Where LISTEN/NOTIFY stops being a messaging system</h2>
              <div className="limits">
                <div><span>01</span><h3>No durable replay</h3><p>A stopped or disconnected instance misses events. There is no offset to resume and no history to query.</p></div>
                <div><span>02</span><h3>At-most-once in practice</h3><p>Delivery to a connected session is best-effort. Your application can crash after receipt but before handling.</p></div>
                <div><span>03</span><h3>Small payloads only</h3><p>The payload is limited to under 8 KB in the default configuration. Large values also amplify memory and network cost.</p></div>
                <div><span>04</span><h3>Queue pressure</h3><p>Notifications wait while a listening session sits in a transaction. A stuck listener can prevent queue cleanup.</p></div>
                <div><span>05</span><h3>No consumer groups</h3><p>Every connected listener receives each notification. PostgreSQL cannot distribute jobs across competing workers.</p></div>
                <div><span>06</span><h3>No acknowledgement</h3><p>The publisher cannot know that every application processed the event, only that the database accepted the notify.</p></div>
              </div>
              <p>PostgreSQL also folds identical notifications from the same transaction when channel and payload match. That is useful for invalidation, where “key 42 changed” is enough, but wrong for counting business events.</p>
              <div className="danger"><b>Never use it as the only record of money movement, order fulfillment, email delivery, or audit events.</b><p>If losing one event creates incorrect business state, LISTEN/NOTIFY alone is the wrong transport.</p></div>
            </section>

            <section id="decision">
              <div className="section-kicker">06 · Decision guide</div>
              <h2>Choose by the consequence of a missed event</h2>
              <table className="decision-table"><thead><tr><th>Use case</th><th>Fit</th><th>Why</th></tr></thead><tbody>
                <tr><td>Local cache invalidation</td><td><span className="fit good">Strong</span></td><td>A missed event can be repaired by TTL, reconnect flush, or a later read.</td></tr>
                <tr><td>Refresh a dashboard</td><td><span className="fit good">Strong</span></td><td>The client can always reload authoritative state.</td></tr>
                <tr><td>Configuration change hint</td><td><span className="fit good">Strong</span></td><td>Small volume; reconciliation is cheap.</td></tr>
                <tr><td>Background job queue</td><td><span className="fit bad">Poor</span></td><td>No acknowledgement, retry, delay, or competing consumers.</td></tr>
                <tr><td>Business integration event</td><td><span className="fit maybe">Conditional</span></td><td>Use an outbox as truth; NOTIFY may wake the dispatcher.</td></tr>
                <tr><td>Cross-region event backbone</td><td><span className="fit bad">Poor</span></td><td>Use Kafka, Pulsar, RabbitMQ, or a managed event service.</td></tr>
              </tbody></table>
              <div className="architecture">
                <div className="arch-title"><span>Recommended hybrid</span><b>Transactional outbox + NOTIFY as a wake-up signal</b></div>
                <div className="arch-flow"><div><b>Business transaction</b><small>Update row + insert outbox</small></div><i>→</i><div><b>COMMIT</b><small>durable truth</small></div><i>→</i><div><b>NOTIFY</b><small>wake dispatcher</small></div><i>→</i><div><b>Broker / consumer</b><small>retry + replay</small></div></div>
                <p>If the notification is missed, a periodic outbox scan still finds the durable row. Latency stays low without making correctness depend on an ephemeral signal.</p>
              </div>
              <h3>The production rule of thumb</h3>
              <p>Use LISTEN/NOTIFY when a notification means <em>“something may have changed; go check.”</em> Use a durable log or queue when it means <em>“this event must be processed exactly as designed.”</em></p>
            </section>
          </div>
        </div>

        <FlashCards />

        <section id="memory-map" className="memory-section">
          <div className="section-kicker">Memory map</div>
          <h2>Remember it as SIGNAL</h2>
          <p className="memory-intro">Six anchors for your next architecture review.</p>
          <div className="mind-map">
            <div className="mind-center"><b>LISTEN<br/>/ NOTIFY</b><span>ephemeral signal</span></div>
            {[
              ["S","Session","LISTEN lives on one dedicated connection"],
              ["I","Invalidate","Evict a key; reload committed truth"],
              ["G","Gaps","Reconnects can miss notifications"],
              ["N","Not durable","No replay, acknowledgement, or consumer groups"],
              ["A","After commit","Rollback never produces a visible notification"],
              ["L","Light payload","Send IDs and versions, not whole records"],
            ].map(([letter,title,text], i) => <div className={`mind-node n${i+1}`} key={letter}><span>{letter}</span><div><b>{title}</b><small>{text}</small></div></div>)}
          </div>
        </section>

        <section className="seo-panel">
          <div className="section-kicker">Publishing kit</div>
          <h2>SEO metadata</h2>
          <dl>
            <div><dt>SEO title</dt><dd>PostgreSQL LISTEN/NOTIFY with Java: Implementation & Limits</dd></div>
            <div><dt>Meta description</dt><dd>Build PostgreSQL LISTEN/NOTIFY with Java and Spring Boot, invalidate caches safely, and understand delivery, pooling, payload, and scaling limits.</dd></div>
            <div><dt>Suggested URL</dt><dd>/postgresql-listen-notify-java-spring-boot</dd></div>
            <div><dt>Primary keyword</dt><dd>PostgreSQL LISTEN NOTIFY Java</dd></div>
            <div><dt>Secondary keywords</dt><dd>Spring Boot PostgreSQL notifications · distributed cache invalidation · PostgreSQL event notifications · Java PostgreSQL listener · LISTEN NOTIFY limitations</dd></div>
            <div><dt>Summary</dt><dd>A production-focused guide to using PostgreSQL LISTEN/NOTIFY from Java for fast, targeted cache invalidation—complete with triggers, a resilient JDBC listener, Spring Cache integration, failure handling, and a clear boundary between ephemeral signals and durable messaging.</dd></div>
          </dl>
        </section>

        <section className="final-check">
          <div><span>THE 30-SECOND REVIEW</span><h2>Should we use it?</h2></div>
          <ul><li>Can the consumer recover by re-reading PostgreSQL?</li><li>Is a missed notification tolerable or reconcilable?</li><li>Is the payload only an ID, version, or pointer?</li><li>Can each instance afford one dedicated connection?</li></ul>
          <p>If all four answers are yes, LISTEN/NOTIFY is probably a clean fit. If any answer is no, reach for an outbox and a durable broker.</p>
        </section>
      </article>
      <footer><a className="brand" href="#"><span>ED</span><b>Engineering Decoded</b></a><p>Production architecture, explained like an engineer.</p><a href="#">Back to top ↑</a></footer>
    </main>
  );
}
