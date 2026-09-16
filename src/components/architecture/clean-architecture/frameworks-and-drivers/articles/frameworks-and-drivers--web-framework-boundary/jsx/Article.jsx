export default function FrameworksAndDriversWebFrameworkBoundaryArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Spring MVC's job is to turn an HTTP request into a plain Java call and turn a plain Java result back into an HTTP response — nothing more.</p>
        <p>The controller is where the outside world (HTTP, JSON, headers, status codes) meets your use cases. This lesson draws the line precisely: everything Spring-specific stays inside <code>OrderController</code>, and the input boundary it calls has never heard of <code>HttpServletRequest</code>. Get this boundary right and you can test your entire application logic without starting a servlet container.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The controller is a translator, not a decision-maker</h3>
        <p>An <code>{'@RestController'}</code> in Spring MVC receives an HTTP request, and its only architectural job is translation: pull data out of the request, build a plain request DTO, hand it to a use case through its input boundary, and translate whatever comes back into an HTTP response. It should not contain business rules — no checking whether an order can be placed, no computing totals, no deciding what "invalid" means. Those decisions belong to the use case interactor, which doesn't know HTTP exists.</p>
        <h3>Why this matters: the Dependency Rule applies to HTTP too</h3>
        <p>HTTP is a delivery mechanism, and delivery mechanisms live in the outermost ring. If <code>PlaceOrderUseCase</code> imports anything from <code>jakarta.servlet</code> or returns a Spring <code>ResponseEntity</code>, the Dependency Rule is broken: an inner circle now depends on an outer one. The fix is the input boundary interface — <code>PlaceOrderInputBoundary</code> — owned by the use-case layer, with a single method like <code>execute(PlaceOrderRequest)</code>. The controller depends on that interface; Spring wires the concrete interactor into it at startup. The use case never depends on Spring at all.</p>
        <h3>Status codes are an adapter concern</h3>
        <p>Deciding that "order not found" becomes HTTP 404, or that a validation failure becomes 422, is a translation decision, and translation decisions belong in the controller (or a dedicated exception-to-status mapper sitting next to it). The use case communicates outcomes through its own vocabulary — a response DTO, a thrown domain exception, an output boundary callback — never through an HTTP status code, because the use case has no idea it's being called over HTTP at all. The same interactor could be called from a CLI tomorrow with zero changes.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 240" role="img" aria-label="HTTP request entering an OrderController, crossing a boundary line through PlaceOrderInputBoundary into PlaceOrderUseCase, with nothing HTTP-specific past the line">
            <rect x="20" y="80" width="170" height="80" rx="6" className="mutedStroke" fill="none" />
            <text x="105" y="110" textAnchor="middle">OrderController</text>
            <text x="105" y="130" textAnchor="middle" fontSize="10">@RestController</text>
            <text x="105" y="60" textAnchor="middle" fontSize="11">frameworks &amp; drivers</text>

            <line x1="330" y1="20" x2="330" y2="220" className="mutedStroke" strokeDasharray="5 5" />
            <text x="330" y="15" textAnchor="middle" fontSize="10">boundary</text>

            <rect x="270" y="95" width="120" height="50" rx="6" className="accentStroke" fill="none" />
            <text x="330" y="115" textAnchor="middle" fontSize="10">PlaceOrder</text>
            <text x="330" y="130" textAnchor="middle" fontSize="10">InputBoundary</text>

            <line x1="190" y1="120" x2="270" y2="120" className="mutedStroke" markerEnd="url(#arrowW)" />

            <rect x="450" y="80" width="180" height="80" rx="6" className="accentStroke" fill="none" />
            <text x="540" y="110" textAnchor="middle">PlaceOrderUseCase</text>
            <text x="540" y="130" textAnchor="middle" fontSize="10">plain Java, no HTTP</text>
            <text x="540" y="60" textAnchor="middle" fontSize="11">use cases</text>

            <line x1="390" y1="120" x2="450" y2="120" className="accentStroke" markerEnd="url(#arrowW2)" strokeDasharray="4 4" />
            <text x="420" y="108" textAnchor="middle" fontSize="9">implements</text>

            <defs>
              <marker id="arrowW" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
              <marker id="arrowW2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">HTTP concerns stop at the controller; only the plain request DTO crosses into the use case.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p><code>OrderController</code> depends only on the input boundary interface — never on <code>PlaceOrderUseCase</code> directly, and never leaks servlet types past itself.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.web;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final PlaceOrderInputBoundary placeOrder;

    public OrderController(PlaceOrderInputBoundary placeOrder) {
        this.placeOrder = placeOrder;
    }

    @PostMapping
    public ResponseEntity<OrderViewModel> placeOrder(@RequestBody PlaceOrderHttpRequest body) {
        PlaceOrderRequest request = new PlaceOrderRequest(
            body.customerId(),
            body.lineItems()
        );

        PlaceOrderResponse response = placeOrder.execute(request);

        OrderViewModel viewModel = new OrderViewModel(
            response.orderId(),
            response.status()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(viewModel);
    }
}

// Owned by the use-case layer — no Spring import in sight
public interface PlaceOrderInputBoundary {
    PlaceOrderResponse execute(PlaceOrderRequest request);
}`}</code></pre>
        <p>Note that <code>PlaceOrderRequest</code> and <code>PlaceOrderResponse</code> are plain DTOs, not <code>@RequestBody</code>-annotated classes — <code>PlaceOrderHttpRequest</code> carries the HTTP-shaping annotations instead, keeping them out of the use-case layer entirely.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Business logic inside the controller</h3><p>Validating order rules or computing totals directly in <code>OrderController</code> means the logic can only ever be reached over HTTP, and duplicates once a second entry point appears.</p></div>
          <div><b>MISTAKE</b><h3>Passing servlet types inward</h3><p>Handing <code>HttpServletRequest</code> or <code>{'@RequestBody'}</code>-annotated classes straight into the use case forces the use case to import <code>jakarta.servlet</code>, violating the Dependency Rule.</p></div>
          <div><b>MISTAKE</b><h3>Returning entities straight from the controller</h3><p>Serializing the domain <code>Order</code> directly as JSON couples your wire format to your domain model, so an internal refactor breaks every API client.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>If <code>PlaceOrderUseCase</code> needs to signal "customer not found," should it throw an exception that <code>OrderController</code> maps to HTTP 404, or should it return an HTTP status code directly? Justify your answer using the Dependency Rule.</p>
        </div>
      </section>
    </div>
  );
}
