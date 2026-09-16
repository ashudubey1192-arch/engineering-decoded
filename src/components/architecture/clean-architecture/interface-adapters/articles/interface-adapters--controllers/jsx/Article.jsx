export default function InterfaceAdaptersControllersArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A controller's entire job is translation — take framework-specific input, turn it into a plain request object, and hand it to the use case. Nothing more.</p>
        <p>Controllers are the first stop in the interface-adapters ring, and they're also where business logic most often leaks in by accident, because it's so convenient to "just add one more check" right there in the handler method. This lesson draws a hard line around what <code>OrderController</code> is and is not allowed to do.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>The interface-adapters layer exists to convert data between the format most convenient for entities and use cases, and the format most convenient for external agents like the web, a database, or a CLI. A <strong>controller</strong> handles one direction of that conversion for incoming requests: it receives something framework-shaped — an HTTP request, a message off a queue, command-line arguments — and converts it into a plain request object the use-case layer already understands.</p>
        <h3>Thin by design, not by accident</h3>
        <p>A well-written controller method is almost boring to read: extract fields, validate that they're well-formed (not that they're <em>business-valid</em> — that's the entity's job), build a request object, call the input boundary. If you can't summarize what a controller method does in one sentence without the word "and" appearing more than once, it's probably doing too much.</p>
        <h3>What "no business logic" actually means</h3>
        <p>It's not that a controller can't have any code beyond one line — it's that the code it has must all be about <em>translation</em>, never about <em>business rules</em>. Checking that a required form field isn't null is translation (you need well-formed data to build the request object). Checking that an order's total doesn't exceed the customer's credit limit is a business rule, and it belongs inside a use case or entity, not scattered across every controller that happens to touch orders.</p>
        <h3>Depends on the input boundary, nothing deeper</h3>
        <p><code>OrderController</code> depends only on <code>PlaceOrderInputBoundary</code> — never directly on <code>PlaceOrderUseCase</code>, never on <code>Order</code>, never on <code>OrderRepository</code>. This keeps the controller replaceable (swap Spring MVC for something else and only this class needs to change) and keeps it from becoming a second home for orchestration logic that should live in the interactor.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 230" role="img" aria-label="An HTTP request flowing into OrderController, which translates it into a PlaceOrderRequest and calls the input boundary, with a crossed-out box showing business logic does not belong in the controller">
            <rect x="10" y="80" width="110" height="50" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="65" y="109" textAnchor="middle" fontSize="9">HTTP request</text>

            <rect x="170" y="65" width="160" height="80" rx="8" className="accentStroke" fill="none" strokeWidth="2.5" />
            <text x="250" y="98" textAnchor="middle" fontSize="11">OrderController</text>
            <text x="250" y="115" textAnchor="middle" fontSize="8">extract → validate shape</text>
            <text x="250" y="129" textAnchor="middle" fontSize="8">→ build request</text>

            <rect x="380" y="80" width="120" height="50" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="440" y="102" textAnchor="middle" fontSize="8">«interface»</text>
            <text x="440" y="117" textAnchor="middle" fontSize="8">InputBoundary</text>

            <line x1="120" y1="105" x2="168" y2="105" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowCtl)" />
            <line x1="330" y1="105" x2="378" y2="105" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowCtl)" />

            <rect x="200" y="175" width="220" height="40" rx="6" className="mutedStroke" fill="none" strokeWidth="1.3" strokeDasharray="3 2" />
            <text x="310" y="199" textAnchor="middle" fontSize="9" className="mutedFill">business rules — NOT here</text>
            <line x1="230" y1="180" x2="390" y2="210" className="mutedStroke" strokeWidth="1.5" />
            <line x1="390" y1="180" x2="230" y2="210" className="mutedStroke" strokeWidth="1.5" />

            <defs>
              <marker id="arrowCtl" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The controller only translates and delegates — business rules are explicitly excluded from this box.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A thin Spring MVC controller that does exactly one job: translate and delegate.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.web;

import com.engineeringdecoded.orders.entity.CustomerId;
import com.engineeringdecoded.orders.entity.OrderId;
import com.engineeringdecoded.orders.usecase.OrderLineRequest;
import com.engineeringdecoded.orders.usecase.PlaceOrderInputBoundary;
import com.engineeringdecoded.orders.usecase.PlaceOrderRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final PlaceOrderInputBoundary placeOrder;

    public OrderController(PlaceOrderInputBoundary placeOrder) {
        this.placeOrder = placeOrder;
    }

    @PostMapping
    public void placeOrder(@RequestBody PlaceOrderHttpRequest body) {
        if (body.customerId() == null || body.lines() == null || body.lines().isEmpty()) {
            throw new IllegalArgumentException("customerId and lines are required");
        }

        List<OrderLineRequest> lines = body.lines().stream()
                .map(l -> new OrderLineRequest(l.sku(), l.quantity(), l.unitPriceCents()))
                .toList();

        PlaceOrderRequest request = new PlaceOrderRequest(
                new OrderId(UUID.randomUUID().toString()),
                new CustomerId(body.customerId()),
                lines);

        placeOrder.placeOrder(request);
    }
}`}</code></pre>
        <p>No inventory checks, no total calculations, no persistence — all of that lives in <code>PlaceOrderUseCase</code>. The controller's validation is strictly "is this data well-formed enough to build a request," not "is this order allowed."</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Business rules hiding in a controller "for convenience"</h3><p>Checking inventory availability directly in <code>OrderController</code> because "it's faster than going through the use case" means a CLI or batch job placing the same order skips that check entirely — the rule only exists in one delivery mechanism.</p></div>
          <div><b>MISTAKE</b><h3>Controller talking to the repository directly</h3><p>Injecting <code>OrderRepository</code> into <code>OrderController</code> to "quickly check if an order exists" bypasses the use case and the entity rules entirely, and duplicates persistence knowledge that belongs one layer deeper.</p></div>
          <div><b>MISTAKE</b><h3>Framework types leaking past the controller</h3><p>Passing the raw <code>{'@RequestBody'}</code> object straight into <code>placeOrder()</code> instead of mapping it to <code>PlaceOrderRequest</code> ties the use-case layer to Spring's binding annotations and JSON deserialization quirks.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your team wants to add rate limiting — "no more than 5 orders per customer per minute." Is that something <code>OrderController</code> should implement directly, or does it belong somewhere else in the architecture? Justify your answer using the controller's stated job.</p>
        </div>
      </section>
    </div>
  );
}
