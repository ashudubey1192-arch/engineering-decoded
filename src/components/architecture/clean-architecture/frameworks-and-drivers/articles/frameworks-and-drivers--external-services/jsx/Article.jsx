export default function FrameworksAndDriversExternalServicesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Stripe, Twilio, SendGrid — every third-party service you call is just another detail, and it deserves the same gateway treatment as your database.</p>
        <p>The database boundary lesson showed the pattern once; this lesson shows it's not a special-case trick for persistence, it's the general strategy for anything outside your process. A <code>PaymentGateway</code> interface owned by the use-case layer, with a <code>StripePaymentGateway</code> adapter behind it, means your checkout logic never imports the Stripe SDK — and swapping providers, or faking one in a test, costs you one new class.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Same shape, different vendor</h3>
        <p>Every external service integration follows the identical structure you already learned for persistence: define a narrow interface expressed in your domain's vocabulary, owned by the use-case layer, and put the vendor SDK behind an adapter that implements it. For payments, that's <code>PaymentGateway</code> with a method like <code>charge(CustomerId, Money)</code> returning a <code>PaymentResult</code> — not a method that takes or returns a Stripe <code>PaymentIntent</code>. The interactor that processes a checkout depends only on <code>PaymentGateway</code>; <code>StripePaymentGateway</code> is the one class permitted to import <code>com.stripe.*</code>.</p>
        <h3>Design the interface around what the use case needs, not what the vendor offers</h3>
        <p>The temptation with third-party gateways is stronger than with your own database, because the vendor SDK already hands you a rich, convenient API — it's easy to let <code>PaymentGateway</code> mirror Stripe's <code>PaymentIntent</code> object one-to-one. Resist it. If the interface exposes Stripe-shaped concepts (idempotency keys, webhook payloads, Stripe's specific error taxonomy), you haven't abstracted the vendor away, you've just renamed it. Ask what the use case actually needs — "charge this customer this amount and tell me if it worked" — and let the adapter absorb everything vendor-specific translating that answer into Stripe's actual API calls.</p>
        <h3>What this buys you</h3>
        <p>Two concrete payoffs. First, swapping providers — say Stripe to Adyen — means writing <code>AdyenPaymentGateway</code> and changing one line in the composition root; <code>PlaceOrderUseCase</code> or a <code>CheckoutUseCase</code> doesn't change at all. Second, and more immediately valuable, testing: a <code>FakePaymentGateway</code> that always succeeds (or fails, on demand) lets you unit-test checkout logic in milliseconds with no network calls, no test-mode API keys, and no flaky third-party sandbox. The same pattern applies to notification services — an <code>OrderNotifier</code> interface with an <code>SmsOrderNotifier</code> or <code>EmailOrderNotifier</code> behind it, swappable and fakeable the same way.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 250" role="img" aria-label="A use case depending on a PaymentGateway interface, with two interchangeable adapters below it: StripePaymentGateway and FakePaymentGateway">
            <rect x="240" y="30" width="180" height="60" rx="6" className="accentStroke" fill="none" />
            <text x="330" y="55" textAnchor="middle" fontSize="12">CheckoutUseCase</text>
            <text x="330" y="72" textAnchor="middle" fontSize="10">depends on PaymentGateway</text>

            <line x1="330" y1="90" x2="330" y2="120" className="accentStroke" markerEnd="url(#arrowE)" />

            <rect x="240" y="120" width="180" height="50" rx="6" className="accentStroke" fill="none" />
            <text x="330" y="150" textAnchor="middle" fontSize="12">PaymentGateway</text>
            <text x="330" y="105" textAnchor="middle" fontSize="9">interface (usecase.port)</text>

            <line x1="290" y1="170" x2="150" y2="210" className="mutedStroke" strokeDasharray="4 4" markerEnd="url(#arrowE2)" />
            <line x1="370" y1="170" x2="510" y2="210" className="mutedStroke" strokeDasharray="4 4" markerEnd="url(#arrowE2)" />

            <rect x="60" y="210" width="180" height="30" rx="4" className="mutedStroke" fill="none" />
            <text x="150" y="230" textAnchor="middle" fontSize="10">StripePaymentGateway</text>

            <rect x="420" y="210" width="180" height="30" rx="4" className="mutedStroke" fill="none" />
            <text x="510" y="230" textAnchor="middle" fontSize="10">FakePaymentGateway (tests)</text>

            <defs>
              <marker id="arrowE" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="accentFill" />
              </marker>
              <marker id="arrowE2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">One interface, two interchangeable implementations — a real vendor adapter and a fake for tests.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The use-case-owned interface stays vendor-neutral; only the adapter touches the Stripe SDK.</p>
        <pre><code>{`// usecase/port/PaymentGateway.java — owned by the use-case layer
package com.engineeringdecoded.orders.usecase.port;

public interface PaymentGateway {
    PaymentResult charge(CustomerId customerId, Money amount);
}

public record PaymentResult(boolean successful, String reference) {}

// usecase/PlaceOrderUseCase.java — never imports com.stripe.*
public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    public PlaceOrderUseCase(OrderRepository orderRepository, PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }

    @Override
    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lineItems());

        PaymentResult result = paymentGateway.charge(order.getCustomerId(), order.total());
        if (!result.successful()) {
            throw new PaymentDeclinedException(order.getCustomerId());
        }

        orderRepository.save(order);
        return new PlaceOrderResponse(order.getId(), order.getStatus());
    }
}

// adapter/payment/StripePaymentGateway.java — the only file that imports Stripe
package com.engineeringdecoded.orders.adapter.payment;

@Component
public class StripePaymentGateway implements PaymentGateway {

    private final StripeClient stripeClient;

    public StripePaymentGateway(StripeClient stripeClient) {
        this.stripeClient = stripeClient;
    }

    @Override
    public PaymentResult charge(CustomerId customerId, Money amount) {
        PaymentIntent intent = stripeClient.paymentIntents().create(
            PaymentIntentCreateParams.builder()
                .setAmount(amount.cents())
                .setCurrency(amount.currencyCode())
                .setCustomer(customerId.value())
                .build()
        );
        return new PaymentResult(intent.getStatus().equals("succeeded"), intent.getId());
    }
}`}</code></pre>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Leaking vendor types into the interface</h3><p>Making <code>PaymentGateway.charge</code> return a Stripe <code>PaymentIntent</code> instead of a domain <code>PaymentResult</code> ties every caller to Stripe's object model regardless of the interface's name.</p></div>
          <div><b>MISTAKE</b><h3>Calling the SDK directly from a use case "temporarily"</h3><p>Instantiating <code>StripeClient</code> inside <code>PlaceOrderUseCase</code> for a quick fix means the temporary shortcut becomes permanent, and testing checkout now requires network access.</p></div>
          <div><b>MISTAKE</b><h3>One gateway interface per method the SDK offers</h3><p>Mirroring the entire Stripe API surface in <code>PaymentGateway</code> instead of exposing only what your use cases need recreates vendor lock-in behind a thin, misleading wrapper.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>You need to write a unit test proving that <code>PlaceOrderUseCase</code> throws <code>PaymentDeclinedException</code> when a charge fails. Using <code>PaymentGateway</code> as designed here, what would you write instead of hitting Stripe's test-mode API?</p>
        </div>
      </section>
    </div>
  );
}
