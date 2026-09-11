import "../css/Article.css";

export default function DatabaseScalingTechniquesConnectionPoolingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A connection pool keeps a small set of already-open database connections ready to be
          borrowed and returned, instead of opening a brand new connection for every request.
        </p>
        <p>
          Opening a database connection isn't free — it's a TCP handshake, authentication, and
          session setup, often tens of milliseconds. Do that on every request under real traffic
          and the database spends more effort on connection churn than on your queries.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A pool sits between your application and the database, holding a fixed number of live
          connections. A request "checks out" a connection, uses it, and "checks it back in" for
          the next request to reuse — no new handshake needed. Pool size is a real capacity
          decision: too small and requests queue waiting for a free connection; too large and you
          can overwhelm the database, which has its own connection limit.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Size the pool.</b> 20 app instances, each configured with a pool of 10 → up to
            200 concurrent DB connections, checked against the database's max_connections limit.</li>
          <li><b>Checkout.</b> A request comes in; the app borrows a free connection from its
            local pool (fast — no handshake).</li>
          <li><b>Use and release.</b> The query runs, the connection is returned to the pool for
            the next request.</li>
          <li><b>Handle exhaustion.</b> If all 10 local connections are busy, the next request
            waits briefly (with a timeout) rather than opening an 11th connection.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 480 170" role="img" aria-label="Diagram of many application requests sharing a small fixed pool of database connections instead of each opening its own connection.">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} className="box" x={20 + (i % 4) * 55} y={10 + Math.floor(i / 4) * 30} width="40" height="20" rx="4" />
          ))}
          <text x="130" y="80" className="figHint" textAnchor="middle">8 concurrent requests</text>
          <line className="flow" x1="130" y1="90" x2="130" y2="110" />
          <rect className="boxAccent" x="60" y="115" width="140" height="40" rx="6" />
          <text x="130" y="132" className="boxText">connection pool</text>
          <text x="130" y="148" className="boxText">4 live connections</text>
          <line className="flow" x1="200" y1="135" x2="260" y2="135" />
          <rect className="box" x="270" y="115" width="100" height="40" rx="6" />
          <text x="320" y="139" className="boxText">database</text>
        </svg>
        <figcaption>Requests queue briefly for a connection rather than each opening its own.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The most common bug is a connection leak: code that checks out a connection on an error
          path and forgets to release it, slowly starving the pool until every request hangs.
          Sizing the pool per-instance without accounting for total instances across a fleet is
          the other classic — 50 instances × a pool of 50 can quietly exceed what the database
          allows.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Your app has 30 instances and the database allows 300 connections. How would you size each instance's pool, and what would you watch in production?</p>
        </div>
      </section>
      <p className="takeaway">
        Pooling turns "open a connection" from a per-request cost into a one-time setup cost —
        the sizing question is really a capacity-planning question across your whole fleet.
      </p>
    </div>
  );
}
