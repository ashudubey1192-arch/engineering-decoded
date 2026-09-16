export default function DistributedPatternsRetryAndBackoffArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Retry with Backoff re-attempts a failed remote call automatically, waiting
          progressively longer between attempts (often with randomness added), instead of
          retrying immediately and repeatedly or giving up after a single transient failure.
        </p>
        <p>
          Intent: recover automatically from transient failures (a dropped connection, a brief
          timeout) without overwhelming a recovering service with immediate, repeated retries.
          Applicability: a remote call can fail for reasons that are often temporary, and the
          caller can tolerate a short additional delay in exchange for not having to handle the
          failure itself.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Waiting longer each time, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Attempt the call and catch failures.</b> Wrap the remote call in a loop, catching
            exceptions that represent a retryable failure (a timeout, a 503 response).
          </li>
          <li>
            <b>Wait before retrying, with the delay growing each attempt.</b> Exponential
            backoff doubles the delay each time: 100ms, then 200ms, then 400ms, and so on.
          </li>
          <li>
            <b>Add jitter to the delay.</b> A small random amount added to each wait prevents
            many callers that failed at the same moment from all retrying in lockstep and
            re-overwhelming the service together.
          </li>
          <li>
            <b>Stop after a maximum number of attempts.</b> A retry loop with no cap can retry
            forever against a permanently broken dependency; a maximum attempt count converts a
            persistent failure into a clear error instead.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="70" height="30" rx="5" />
            <text className="boxText" x="55" y="64" fontSize="8">Try 1</text>
            <text className="figHint" x="95" y="40">wait 100ms</text>
            <rect className="box" x="150" y="45" width="70" height="30" rx="5" />
            <text className="boxText" x="185" y="64" fontSize="8">Try 2</text>
            <text className="figHint" x="225" y="40">wait 200ms</text>
            <rect className="box" x="290" y="45" width="70" height="30" rx="5" />
            <text className="boxText" x="325" y="64" fontSize="8">Try 3</text>
            <text className="figHint" x="365" y="40">wait 400ms</text>
            <rect className="boxAccent" x="410" y="45" width="60" height="30" rx="5" />
            <text className="boxText" x="440" y="64" fontSize="7">give up</text>
          </svg>
          <figcaption>Each retry waits roughly twice as long as the last, capped at a maximum number of attempts.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Exponential backoff with jitter</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class RetryExecutor {
    private final int maxAttempts;
    private final long baseDelayMillis;
    private final Random random = new Random();

    RetryExecutor(int maxAttempts, long baseDelayMillis) {
        this.maxAttempts = maxAttempts; this.baseDelayMillis = baseDelayMillis;
    }

    <T> T executeWithRetry(Supplier<T> call) throws InterruptedException {
        RuntimeException lastFailure = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return call.get();
            } catch (TransientFailureException e) {
                lastFailure = e;
                if (attempt == maxAttempts) break; // no point sleeping before the final failure
                long exponentialDelay = baseDelayMillis * (1L << (attempt - 1)); // 100, 200, 400...
                long jitter = random.nextLong(exponentialDelay / 2 + 1);
                Thread.sleep(exponentialDelay + jitter); // spreads retries out across callers
            }
        }
        throw lastFailure;
    }
}

RetryExecutor retry = new RetryExecutor(5, 100);
InventoryStatus status = retry.executeWithRetry(() -> inventoryClient.checkStock(productId));`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Retrying a call that isn't idempotent.</b> Retrying a "charge card" call that
            already succeeded but whose response was lost can double-charge the customer;
            non-idempotent operations need an idempotency key (see Idempotent Consumer) before
            they're safe to retry.
          </li>
          <li>
            <b>Retrying without backoff, or with fixed delays.</b> Immediate, repeated retries
            from many failing callers at once are exactly what can turn a struggling service into
            a fully down one &mdash; the "retry storm."
          </li>
          <li>
            <b>Retrying errors that will never succeed.</b> Retrying a 400 Bad Request or a
            validation failure wastes time and attempts on a call that's wrong, not transient
            &mdash; only retry errors that are plausibly temporary.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>executeWithRetry</code> add random jitter to the delay instead of sleeping for exactly the exponential delay each time?</p>
          <p>
            <b>Answer:</b> If a service fails for every caller at roughly the same moment (a
            brief outage, say), pure exponential backoff with no randomness means all those
            callers retry at the same instants &mdash; 100ms later, then 200ms later, in lockstep
            &mdash; hammering the recovering service in synchronized waves. Adding jitter spreads
            those retries out over time, so the service sees a smoother trickle of retries
            instead of repeated synchronized spikes.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Retry with Backoff turns a transient failure into an automatic recovery, but only safely:
        exponential delay plus jitter prevents synchronized retry storms, a maximum attempt count
        prevents infinite retries, and idempotency is a prerequisite, not an afterthought.
      </p>
    </div>
  );
}
