export default function PatternCaseStudiesDesignAPaymentWorkflowArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A payment workflow needs to support multiple payment providers, retry transient
          failures safely, and protect the rest of the system if a provider goes down &mdash; a
          case study that pulls together patterns from three different sections of this course
          into one coherent design.
        </p>
        <p>
          Each requirement maps to a distinct pattern already covered elsewhere in this course;
          the work here is choosing the right one for each requirement and seeing how they fit
          together without overlapping.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Mapping requirements to patterns, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Multiple providers, one interface.</b> Stripe, PayPal, and a bank transfer API each
            have different SDKs and call shapes; an <code>Adapter</code> per provider translates
            each into one common <code>PaymentGateway</code> interface.
          </li>
          <li>
            <b>Safe retries on transient failures.</b> A charge call can time out without a clear
            answer on whether it succeeded; <code>Retry with Backoff</code> handles the retry
            timing, and <code>Idempotent Consumer</code>'s idempotency-key approach (applied here
            to outgoing calls) makes a retried charge safe to repeat.
          </li>
          <li>
            <b>Protection when a provider is degraded.</b> A <code>Circuit Breaker</code> wraps
            each provider adapter, failing fast to a fallback (queue for later, or try a
            secondary provider) instead of letting every caller hang on a provider that's down.
          </li>
          <li>
            <b>Assemble the pieces, keeping each one's responsibility distinct.</b> The adapter
            translates; the retry logic handles transient failure; the breaker handles sustained
            failure &mdash; each addressing a different failure mode, not duplicating the others.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="90" height="30" rx="5" />
            <text className="boxText" x="65" y="64" fontSize="8">Caller</text>
            <line className="flow" x1="110" y1="60" x2="160" y2="60" />
            <rect className="boxAccent" x="160" y="45" width="110" height="30" rx="5" />
            <text className="boxText" x="215" y="64" fontSize="7">CircuitBreaker</text>
            <line className="flow" x1="270" y1="60" x2="320" y2="60" />
            <rect className="box" x="320" y="45" width="130" height="30" rx="5" />
            <text className="boxText" x="385" y="64" fontSize="7">StripeAdapter (retries)</text>
          </svg>
          <figcaption>Each layer owns a distinct concern: coordination, sustained-failure protection, and provider-specific translation with retry.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The pieces assembled</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface PaymentGateway { PaymentResult charge(Customer customer, BigDecimal amount, String idempotencyKey); }

class StripeAdapter implements PaymentGateway { // Adapter: translates to Stripe's actual SDK shape
    private final RetryExecutor retry = new RetryExecutor(3, 200);
    public PaymentResult charge(Customer customer, BigDecimal amount, String idempotencyKey) {
        try {
            return retry.executeWithRetry(() -> stripeSdk.createCharge(customer.stripeId(), amount, idempotencyKey));
        } catch (InterruptedException e) { throw new RuntimeException(e); }
    }
    private final StripeSdk stripeSdk = new StripeSdk();
}

class CircuitBreakerPaymentGateway implements PaymentGateway { // wraps any gateway with fast failure
    private final PaymentGateway delegate;
    private final CircuitBreaker breaker = new CircuitBreaker();
    CircuitBreakerPaymentGateway(PaymentGateway delegate) { this.delegate = delegate; }
    public PaymentResult charge(Customer customer, BigDecimal amount, String idempotencyKey) {
        return breaker.call(
            () -> delegate.charge(customer, amount, idempotencyKey),
            () -> PaymentResult.queuedForRetry() // fallback when the provider is clearly down
        );
    }
}

// Assembled: one adapter per provider, each wrapped in its own breaker
PaymentGateway stripe = new CircuitBreakerPaymentGateway(new StripeAdapter());
PaymentResult result = stripe.charge(customer, total, orderId); // orderId as the idempotency key`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Putting retry logic inside the circuit breaker instead of the adapter.</b> Retrying
            transient failures and breaking on sustained failure are different timescales and
            different decisions; conflating them makes the breaker's failure count noisy with
            retries it shouldn't be counting individually.
          </li>
          <li>
            <b>Reusing the same idempotency key across genuinely different charge attempts.</b> An
            idempotency key must uniquely identify one logical charge; reusing it for an
            unrelated charge risks the provider treating a legitimate second charge as a
            duplicate of the first.
          </li>
          <li>
            <b>Wrapping every provider in one shared circuit breaker instance.</b> That's exactly
            the problem Bulkhead addresses: one provider's outage would trip a breaker shared with
            an unrelated, healthy provider.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>StripeAdapter</code> handle retries internally, while <code>CircuitBreakerPaymentGateway</code> wraps the whole adapter from outside, rather than combining both concerns into one class?</p>
          <p>
            <b>Answer:</b> Retry is about recovering from a single transient failure within one
            logical charge attempt &mdash; it belongs close to the actual network call, inside
            the adapter, where the idempotency key can be reused correctly across attempts. The
            circuit breaker is about tracking failure across many charge attempts over time and
            protecting the rest of the system once the provider is clearly down &mdash; a
            concern that applies at a higher level, across calls, regardless of which specific
            adapter is behind it. Keeping them in separate layers means each can be reasoned
            about, tested, and reused independently.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A payment workflow's requirements &mdash; multiple providers, safe retries, protection
        from a degraded provider &mdash; map to Adapter, Retry with Backoff, and Circuit Breaker
        respectively, each layered to own a distinct failure mode rather than blurred together.
      </p>
    </div>
  );
}
