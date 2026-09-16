export default function CreationalPatternsObjectPoolArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Object Pool maintains a set of pre-constructed, reusable objects that are checked out,
          used, and returned, instead of being created fresh and discarded every time. It earns
          its place specifically when construction is expensive and the objects are safe to reset
          and reuse &mdash; database connections are the textbook case, and the reason nearly
          every real database client library ships a connection pool.
        </p>
        <p>
          Intent: avoid the cost of repeatedly creating and destroying expensive objects by
          reusing a managed set of them. Applicability: object creation is measurably expensive,
          objects are used briefly and released, and the object's state can be safely reset
          between uses.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a pool, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Confirm creation is actually expensive enough to justify a pool.</b> A database
            connection (TCP handshake, authentication) is expensive; a plain Java object with a
            few fields almost never is &mdash; pooling the latter adds overhead without a real
            saving.
          </li>
          <li>
            <b>Pre-construct a fixed or bounded number of instances up front.</b> A pool of 10
            connections, built once at startup, rather than built and torn down per request.
          </li>
          <li>
            <b>Check an instance out, use it, and return it when done &mdash; via a fixed
            protocol, not manual bookkeeping.</b> A <code>try/finally</code> or a try-with-
            resources block that guarantees the return happens even if the borrowing code throws.
          </li>
          <li>
            <b>Reset an object's state before it re-enters the pool.</b> A connection returned
            mid-transaction, or with a stale result set open, must be cleaned up before the next
            borrower gets it &mdash; otherwise the pool leaks state between unrelated callers.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="40" width="160" height="60" rx="8" />
            <text className="figLabel" x="100" y="35">pool: 10 built once</text>
            <text className="boxText" x="100" y="65" fontSize="9">conn1 conn2 conn3...</text>
            <text className="figHint" x="100" y="85">idle, ready to borrow</text>
            <line className="flow" x1="180" y1="70" x2="240" y2="70" />
            <rect className="boxAccent" x="240" y="45" width="120" height="50" rx="8" />
            <text className="boxText" x="300" y="68" fontSize="10">borrowed</text>
            <text className="figHint" x="300" y="85">in use</text>
            <line className="flowMuted" x1="360" y1="70" x2="420" y2="70" />
            <text className="figHint" x="440" y="70">return</text>
          </svg>
          <figcaption>Connections are checked out for the duration of one use, then returned to the pool &mdash; never destroyed and rebuilt.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Borrow, use, and guarantee return</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class ConnectionPool {
    private final BlockingQueue<Connection> available;

    ConnectionPool(int size) {
        available = new LinkedBlockingQueue<>();
        for (int i = 0; i < size; i++) available.add(buildConnection()); // built once, up front
    }

    Connection borrow() throws InterruptedException { return available.take(); }
    void release(Connection c) {
        c.reset(); // clear any leftover transaction/result-set state before reuse
        available.offer(c);
    }
}

// caller: guaranteed return even if the query throws
Connection conn = pool.borrow();
try {
    conn.executeQuery("SELECT * FROM orders");
} finally {
    pool.release(conn); // always returned, never leaked
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Pooling cheap objects that don't need it.</b> Object Pool adds real complexity
            (checkout/return bookkeeping, sizing decisions); applying it to plain, cheap-to-
            construct objects is pure overhead with no offsetting benefit.
          </li>
          <li>
            <b>Forgetting to reset state before returning an object to the pool.</b> A connection
            returned with a half-finished transaction hands the next borrower a corrupted starting
            state &mdash; often the source of hard-to-reproduce production bugs.
          </li>
          <li>
            <b>Not guaranteeing release on the failure path.</b> Borrowing without a{" "}
            <code>try/finally</code> (or equivalent) means an exception during use leaks the
            object out of the pool permanently, eventually exhausting it.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>ConnectionPool.release()</code> call <code>c.reset()</code> before returning the connection to <code>available</code>?</p>
          <p>
            <b>Answer:</b> The connection may still carry state from its previous use &mdash; an
            open transaction, an unclosed result set. Without resetting it first, the next
            borrower would inherit that leftover state, which is exactly the kind of subtle,
            hard-to-trace bug that undermines the whole point of safely reusing objects.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Object Pool only when construction is measurably expensive and instances are
        safe to reset and reuse &mdash; and always guarantee both the reset before reuse and the
        return even on a failure path.
      </p>
    </div>
  );
}
