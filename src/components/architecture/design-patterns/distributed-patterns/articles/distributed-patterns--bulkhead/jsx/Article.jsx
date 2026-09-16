export default function DistributedPatternsBulkheadArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Bulkhead partitions a system's resources &mdash; thread pools, connection pools &mdash;
          per dependency, so that one failing or slow dependency can only exhaust the resources
          set aside for it, instead of consuming the shared pool that every other dependency
          also relies on.
        </p>
        <p>
          Intent: isolate resource pools per dependency so a failure in one doesn't cascade into
          starving calls to unrelated, healthy dependencies. Applicability: a service calls
          multiple independent downstream dependencies from a shared thread or connection pool,
          and one dependency slowing down has, in practice, caused calls to unrelated
          dependencies to fail too.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Partitioning resources, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the shared resource being exhausted.</b> A single thread pool of 50
            threads serving calls to both the payment service and the recommendation service.
          </li>
          <li>
            <b>Split it into separate pools per dependency.</b> A 20-thread pool dedicated to
            payment calls, a separate 20-thread pool dedicated to recommendation calls.
          </li>
          <li>
            <b>Route each dependency's calls only through its own pool.</b> A slow
            recommendation service can fill its own 20 threads with stuck calls, but it can never
            touch the 20 threads reserved for payment.
          </li>
          <li>
            <b>Size each partition to the dependency's actual importance and load.</b> A
            critical dependency (payment) might get a larger, more carefully monitored partition
            than an optional one (recommendations).
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="20" width="140" height="40" rx="6" />
            <text className="boxText" x="90" y="44" fontSize="8">Recommendation pool (stuck)</text>
            <rect className="box" x="20" y="80" width="140" height="40" rx="6" />
            <text className="boxText" x="90" y="104" fontSize="8">Payment pool (healthy)</text>
            <line className="flow" x1="160" y1="40" x2="230" y2="40" />
            <text className="figHint" x="235" y="35">all threads stuck</text>
            <line className="flow" x1="160" y1="100" x2="230" y2="100" />
            <text className="figHint" x="235" y="95">still serving calls</text>
          </svg>
          <figcaption>The recommendation pool exhausting itself has no effect on the separately-partitioned payment pool.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Separate thread pools per downstream dependency</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class BulkheadedClient {
    // separate, fixed-size pools -- one dependency can never starve the other
    private final ExecutorService paymentPool = Executors.newFixedThreadPool(20);
    private final ExecutorService recommendationPool = Executors.newFixedThreadPool(20);

    Future<PaymentResult> chargeAsync(Customer customer, BigDecimal amount) {
        return paymentPool.submit(() -> paymentService.charge(customer, amount));
    }

    Future<List<Product>> recommendationsAsync(String userId) {
        return recommendationPool.submit(() -> recommendationService.fetchFor(userId));
    }
}

// Usage: even if recommendationService hangs and fills all 20 recommendation threads,
// chargeAsync() still has its own untouched pool of 20 threads to run on.
BulkheadedClient client = new BulkheadedClient();
Future<PaymentResult> payment = client.chargeAsync(customer, total);       // unaffected
Future<List<Product>> recs = client.recommendationsAsync(userId);          // may be stuck, isolated`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Partitioning resources but leaving a shared bottleneck underneath.</b> Separate
            thread pools that all route through one shared database connection pool just move
            the single point of exhaustion one layer down.
          </li>
          <li>
            <b>Sizing every partition identically regardless of importance.</b> Giving an
            optional, best-effort dependency the same-sized pool as a critical one wastes
            capacity that the critical dependency might need under load.
          </li>
          <li>
            <b>Over-partitioning a system with very few dependencies.</b> Bulkheads add
            configuration and monitoring overhead; a service calling one or two dependencies with
            a stable load profile may not need the isolation at all.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>In the example, if <code>recommendationService</code> starts hanging on every call, why does <code>chargeAsync()</code> keep working normally instead of also failing?</p>
          <p>
            <b>Answer:</b> <code>chargeAsync()</code> submits its work to <code>paymentPool</code>,
            a separate fixed pool of 20 threads that recommendation calls never touch. Even if
            every thread in <code>recommendationPool</code> is stuck waiting on the hanging
            service, <code>paymentPool</code>'s threads are entirely unaffected, so payment calls
            continue to be picked up and executed normally.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Bulkhead contains a failing dependency's damage to its own partition &mdash; the
        isolation only works as far down as the partitioning actually goes, so watch for shared
        resources still lurking underneath separate pools.
      </p>
    </div>
  );
}
