export default function BoundariesCrossingBoundariesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A boundary is only as good as what actually happens when a call crosses it — and what crosses should always be a plain request, never the entity itself.</p>
        <p>The previous lesson covered the anatomy of a boundary at rest: interface, implementation, direction of dependency. This lesson is about the moment of the crossing — what an <code>{'OrderController'}</code> does the instant a request needs to reach <code>{'PlaceOrderUseCase'}</code>. Getting this moment right is what keeps a web framework's concerns (HTTP, JSON, sessions) from ever mixing with business rules, and it's usually where teams that understand boundaries in theory still let details leak through in practice.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The controller calls an input boundary, not a class</h3>
        <p>When an HTTP request arrives, <code>{'OrderController'}</code> doesn't instantiate or directly reference <code>{'PlaceOrderUseCase'}</code>. It holds a reference to <code>{'PlaceOrderInputBoundary'}</code> — an interface the use-case layer defines — and calls a method on that. Which concrete interactor actually runs is decided elsewhere, at composition time. This is the same dependency-inversion mechanic from the anatomy lesson, applied specifically to the inbound crossing: web-framework code depends on a use-case-owned interface, never the reverse.</p>
        <h3>Data crosses as a request, not as HTTP artifacts</h3>
        <p>The controller's job is to translate: take whatever the framework handed it (a JSON body, path variables, a session) and package only what the use case needs into a plain object — <code>{'PlaceOrderRequest'}</code>. That request travels across the boundary. Nothing about <code>{'HttpServletRequest'}</code>, headers, or Spring annotations goes with it. The use case receives a request shaped entirely around the business operation, not around the transport that carried it.</p>
        <h3>The return trip never hands back an entity</h3>
        <p>The same discipline applies going out. <code>{'PlaceOrderUseCase'}</code> doesn't return an <code>{'Order'}</code> to the controller, and the controller never serializes an <code>{'Order'}</code> straight to JSON. Instead, the use case calls a <code>{'PlaceOrderOutputBoundary'}</code> with a <code>{'PlaceOrderResponse'}</code>, and a presenter turns that into an <code>{'OrderViewModel'}</code> shaped for the specific UI that's asking. If the entity crossed directly, every future change to <code>{'Order'}</code>'s internal shape would risk breaking the HTTP contract, and vice versa — exactly the coupling boundaries exist to prevent.</p>
        <h3>Why the crossing, not just the interface, matters</h3>
        <p>You can have a perfectly-owned interface and still defeat the boundary at the crossing — by validating business rules in the controller, by passing framework types through, or by returning the entity "just this once." The crossing is where architecture meets a deadline, and it's the part that has to be disciplined every single time a new endpoint is added, not just the first time.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 670 230" role="img" aria-label="Pipeline diagram: OrderController crosses into PlaceOrderInputBoundary carrying a PlaceOrderRequest, through PlaceOrderUseCase, out through PlaceOrderOutputBoundary as a PlaceOrderResponse, to OrderPresenter which produces an OrderViewModel">
            <rect x="10" y="70" width="120" height="70" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="70" y="100" textAnchor="middle" fontSize="11" fontWeight="600">OrderController</text>
            <text x="70" y="118" textAnchor="middle" fontSize="9" className="mutedFill">adapter</text>

            <path d="M130 105 L168 105" className="accentStroke" strokeWidth="2" markerEnd="url(#arr1)" fill="none" />
            <text x="149" y="95" textAnchor="middle" fontSize="8">Request</text>

            <rect x="170" y="70" width="130" height="70" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="235" y="96" textAnchor="middle" fontSize="10" fontWeight="600">PlaceOrder</text>
            <text x="235" y="110" textAnchor="middle" fontSize="10" fontWeight="600">InputBoundary</text>
            <text x="235" y="126" textAnchor="middle" fontSize="8" className="mutedFill">interface</text>

            <path d="M300 105 L338 105" className="accentStroke" strokeWidth="2" markerEnd="url(#arr1)" fill="none" />

            <rect x="340" y="70" width="130" height="70" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="405" y="100" textAnchor="middle" fontSize="10" fontWeight="600">PlaceOrder</text>
            <text x="405" y="114" textAnchor="middle" fontSize="10" fontWeight="600">UseCase</text>

            <path d="M470 105 L508 105" className="accentStroke" strokeWidth="2" markerEnd="url(#arr1)" fill="none" />
            <text x="489" y="95" textAnchor="middle" fontSize="8">Response</text>

            <rect x="510" y="70" width="130" height="70" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="575" y="96" textAnchor="middle" fontSize="10" fontWeight="600">PlaceOrder</text>
            <text x="575" y="110" textAnchor="middle" fontSize="10" fontWeight="600">OutputBoundary</text>
            <text x="575" y="126" textAnchor="middle" fontSize="8" className="mutedFill">interface</text>

            <path d="M575 140 L575 168" className="accentStroke" strokeWidth="2" markerEnd="url(#arr1)" fill="none" />

            <rect x="500" y="170" width="150" height="50" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="575" y="192" textAnchor="middle" fontSize="10" fontWeight="600">OrderPresenter</text>
            <text x="575" y="206" textAnchor="middle" fontSize="8" className="mutedFill">produces OrderViewModel</text>

            <text x="335" y="30" textAnchor="middle" fontSize="12" className="mutedFill">Only requests and responses cross — never Order itself</text>

            <defs>
              <marker id="arr1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0 0 L8 4 L0 8 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Each crossing carries a plain request or response object; the interfaces are owned inward, the entity itself never travels.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The controller depends only on the input boundary interface and builds a request object — it never touches <code>{'Order'}</code> directly.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.web;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final PlaceOrderInputBoundary placeOrder;

    public OrderController(PlaceOrderInputBoundary placeOrder) {
        this.placeOrder = placeOrder;
    }

    @PostMapping
    public ResponseEntity<OrderViewModel> create(@RequestBody PlaceOrderHttpRequest body) {
        PlaceOrderRequest request = new PlaceOrderRequest(
            body.customerId(),
            body.lines()
        );

        // Crosses the boundary as a plain request; the use case
        // knows nothing about HTTP, JSON, or this controller.
        placeOrder.execute(request);

        OrderViewModel viewModel = ((OrderPresenter) placeOrder).viewModel();
        return ResponseEntity.status(HttpStatus.CREATED).body(viewModel);
    }
}

// use-case layer — the contract the controller depends on
package com.engineeringdecoded.orders.usecase;

public interface PlaceOrderInputBoundary {
    void execute(PlaceOrderRequest request);
}

public record PlaceOrderRequest(String customerId, List<OrderLineRequest> lines) {}`}</code></pre>
        <p><code>{'PlaceOrderHttpRequest'}</code> stays inside the web adapter; <code>{'PlaceOrderRequest'}</code> is the plain shape that actually crosses into the use case.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Serializing the entity straight to JSON</h3><p>Returning <code>{'Order'}</code> directly from a controller method is fast to write, but it means a refactor of <code>{'Order'}</code>'s internal fields silently changes the public API contract — the entity's shape is now load-bearing for every client.</p></div>
          <div><b>MISTAKE</b><h3>Validating business rules in the controller</h3><p>Checking "does this order have at least one line" in <code>{'OrderController'}</code> before calling the use case duplicates a rule that belongs to <code>{'Order.place()'}</code>, and it means the rule now has two homes that can drift out of sync.</p></div>
          <div><b>MISTAKE</b><h3>Depending on the concrete interactor</h3><p>Wiring <code>{'OrderController'}</code> to reference <code>{'PlaceOrderUseCase'}</code> directly instead of <code>{'PlaceOrderInputBoundary'}</code> compiles fine but quietly deletes the boundary — the web layer now has a source-code dependency on use-case internals, not just its contract.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p><code>{'OrderController'}</code> currently returns the <code>{'Order'}</code> entity directly, serialized by Spring's default JSON converter. Name two things this couples that shouldn't be coupled, and describe the two objects you'd introduce to fix the crossing.</p>
        </div>
      </section>
    </div>
  );
}
