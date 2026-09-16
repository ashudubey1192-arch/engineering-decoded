export default function DistributedPatternsCircuitBreakerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Circuit Breaker wraps a call to a remote service with a state machine that stops
          sending requests once failures cross a threshold, failing fast locally instead of
          letting every caller keep waiting on a service that's already down.
        </p>
        <p>
          Intent: prevent a failing remote dependency from exhausting a caller's threads and
          resources by short-circuiting calls to it once it's clearly unhealthy. Applicability: a
          service calls a remote dependency (another service, a database, a third-party API) that
          can become slow or unavailable, and repeated calls to it while it's down would tie up
          threads or connections that are needed elsewhere.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Three states, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Start closed, letting calls through normally.</b> In the{" "}
            <code>CLOSED</code> state, every call goes to the remote service, and failures are
            counted.
          </li>
          <li>
            <b>Trip to open once failures cross a threshold.</b> After, say, 5 consecutive
            failures, the breaker moves to <code>OPEN</code> and every call fails immediately
            without touching the network.
          </li>
          <li>
            <b>Let a timeout move it to half-open.</b> After a cooldown period, the breaker moves
            to <code>HALF_OPEN</code> and allows exactly one trial call through.
          </li>
          <li>
            <b>Close on success, reopen on failure.</b> If the trial call succeeds, the breaker
            returns to <code>CLOSED</code>; if it fails, it goes straight back to{" "}
            <code>OPEN</code> for another cooldown.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="110" height="35" rx="6" />
            <text className="boxText" x="75" y="67" fontSize="9">CLOSED</text>
            <line className="flow" x1="130" y1="62" x2="190" y2="62" />
            <text className="figHint" x="135" y="52">threshold hit</text>
            <rect className="boxWarn" x="190" y="45" width="110" height="35" rx="6" />
            <text className="boxText" x="245" y="67" fontSize="9">OPEN</text>
            <line className="flow" x1="300" y1="62" x2="360" y2="62" />
            <text className="figHint" x="305" y="52">cooldown elapses</text>
            <rect className="boxAccent" x="360" y="45" width="110" height="35" rx="6" />
            <text className="boxText" x="415" y="67" fontSize="8">HALF_OPEN</text>
          </svg>
          <figcaption>Failures trip the breaker open; a cooldown eventually allows one trial call to decide whether to close again.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A breaker guarding a remote payment call</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`enum State { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
    private State state = State.CLOSED;
    private int consecutiveFailures = 0;
    private final int failureThreshold = 5;
    private long openedAt = 0;
    private final long cooldownMillis = 30_000;

    <T> T call(Supplier<T> remoteCall, Supplier<T> fallback) {
        if (state == State.OPEN) {
            if (System.currentTimeMillis() - openedAt > cooldownMillis) {
                state = State.HALF_OPEN; // allow exactly one trial call through
            } else {
                return fallback.get(); // fail fast, no network call at all
            }
        }
        try {
            T result = remoteCall.get();
            onSuccess();
            return result;
        } catch (RuntimeException e) {
            onFailure();
            return fallback.get();
        }
    }

    private void onSuccess() { consecutiveFailures = 0; state = State.CLOSED; }
    private void onFailure() {
        consecutiveFailures++;
        if (state == State.HALF_OPEN || consecutiveFailures >= failureThreshold) {
            state = State.OPEN;
            openedAt = System.currentTimeMillis();
        }
    }
}

CircuitBreaker breaker = new CircuitBreaker();
PaymentResult result = breaker.call(
    () -> paymentGateway.charge(customer, amount),   // remote call
    () -> PaymentResult.queuedForRetry()              // fallback when open or failing
);`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Setting the failure threshold or cooldown without real data.</b> A threshold too
            low trips on normal transient blips; a cooldown too short hammers a still-recovering
            service with trial calls.
          </li>
          <li>
            <b>Providing no meaningful fallback.</b> A breaker that just throws when open pushes
            the same problem to every caller; a fallback (a cached value, a queued retry, a
            degraded response) is what actually protects the system.
          </li>
          <li>
            <b>Wrapping a call that has no real failure mode worth isolating.</b> Adding a
            breaker around a fast, reliable local call adds complexity without protecting
            anything meaningful.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the breaker allow only one trial call through in the <code>HALF_OPEN</code> state instead of letting all calls through once the cooldown elapses?</p>
          <p>
            <b>Answer:</b> If the remote service is still down, letting every queued caller
            through at once would immediately overwhelm it again and trip the breaker straight
            back open, achieving nothing. A single trial call tests whether the service has
            actually recovered without risking a fresh pile-up of failing requests.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Circuit Breaker turns "keep retrying a dead dependency" into "fail fast locally, then
        test recovery once" &mdash; the state machine protects the caller's own resources at
        least as much as it protects the remote service.
      </p>
    </div>
  );
}
