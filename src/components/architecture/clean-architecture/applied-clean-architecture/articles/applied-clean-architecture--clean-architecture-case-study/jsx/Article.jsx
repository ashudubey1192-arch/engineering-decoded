export default function AppliedCleanArchitectureCleanArchitectureCaseStudyArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Every piece of the orders system you've seen across this course, assembled into one working "place an order" flow, end to end.</p>
        <p>This is the graduation lesson. No new concepts — just the complete picture: a request arrives at <code>OrderController</code>, flows inward through <code>PlaceOrderUseCase</code> and the <code>Order</code> entity, back out through <code>OrderRepository</code> and its JPA implementation, and finally out to the caller through <code>OrderPresenter</code> and <code>OrderViewModel</code>. Watching control flow cross the same boundaries that source-code dependencies refuse to cross is the whole point of Clean Architecture, made concrete.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The full cast</h3>
        <p>Seven classes carry the entire "place an order" journey: <code>OrderController</code> (interface adapter, web), <code>PlaceOrderUseCase</code> (application layer, implementing <code>PlaceOrderInputBoundary</code>), <code>Order</code> (entity), <code>OrderRepository</code> (a port — an interface owned by the use-case layer), <code>JpaOrderRepository</code> (interface adapter, persistence, implementing that port), <code>OrderPresenter</code> (interface adapter, implementing <code>PlaceOrderOutputBoundary</code>), and <code>OrderViewModel</code> (a plain data holder shaped exactly for the view). Every one of these has appeared earlier in the course individually; this lesson is about seeing them cooperate.</p>
        <h3>Two flows, one direction rule</h3>
        <p>The thing that makes this diagram worth staring at is that <strong>control flow and source-code dependency direction are not the same thing</strong>, and Clean Architecture is precisely the discipline of keeping them different on purpose. Control flow during a request: <code>OrderController</code> calls into <code>PlaceOrderUseCase</code>, which calls <code>Order</code>'s factory method, then calls out to <code>OrderRepository</code> to persist, then calls <code>OrderPresenter</code> to report the result, which builds an <code>OrderViewModel</code> the controller renders. That's a straight line across all four rings and back.</p>
        <p>Source-code dependency direction is not a straight line — it bends at every port. <code>PlaceOrderUseCase</code> depends on the <em>interface</em> <code>OrderRepository</code>, not on <code>JpaOrderRepository</code>; <code>JpaOrderRepository</code> is the one that depends on <code>OrderRepository</code>, by implementing it. Likewise <code>PlaceOrderUseCase</code> depends on <code>PlaceOrderOutputBoundary</code>, and <code>OrderPresenter</code> depends on that same interface by implementing it — the dependency arrow points from the adapter back toward the use case, opposite to the direction data is flowing at runtime. This is the Dependency Inversion Principle doing its job at architectural scale: the use case dictates the contract, the outer layers conform to it, and you could swap <code>JpaOrderRepository</code> for an in-memory fake or a different ORM entirely without <code>PlaceOrderUseCase</code> changing by one line.</p>
        <h3>Why this shape survives change</h3>
        <p>Trace what happens if the team switches from Spring MVC to a different web framework, or from Hibernate to a different persistence library: <code>OrderController</code> and <code>JpaOrderRepository</code> get rewritten. <code>Order</code>, <code>PlaceOrderUseCase</code>, <code>OrderRepository</code>, and <code>PlaceOrderOutputBoundary</code> — the actual business rules and the contracts they depend on — don't change at all. That's not a coincidence; it's the entire system deliberately shaped so that the classes most likely to change (frameworks, delivery mechanisms) are the ones with the fewest other classes depending on them, and the classes least likely to change (the business rules) are the ones everything else ultimately serves.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 320" role="img" aria-label="The full place order flow: OrderController, PlaceOrderUseCase, Order entity, OrderRepository port, JpaOrderRepository, OrderPresenter, and OrderViewModel, with solid arrows showing control flow around the loop and dashed arrows showing source dependencies pointing inward at each port">
            <rect x="20" y="30" width="140" height="40" rx="5" className="accentStroke" fill="none" strokeWidth="1.3" />
            <text x="30" y="54" fontSize="10">OrderController</text>

            <rect x="250" y="10" width="150" height="40" rx="5" className="accentStroke" fill="none" strokeWidth="1.3" />
            <text x="262" y="34" fontSize="10">PlaceOrderUseCase</text>

            <rect x="480" y="30" width="150" height="40" rx="5" className="accentStroke" fill="none" strokeWidth="1.3" />
            <text x="500" y="54" fontSize="10">Order (entity)</text>

            <rect x="250" y="90" width="150" height="34" rx="5" className="mutedStroke" fill="none" strokeWidth="1.1" />
            <text x="262" y="111" fontSize="9">OrderRepository (port)</text>

            <rect x="480" y="90" width="150" height="34" rx="5" className="accentStroke" fill="none" strokeWidth="1.3" />
            <text x="494" y="111" fontSize="10">JpaOrderRepository</text>

            <rect x="250" y="150" width="150" height="34" rx="5" className="mutedStroke" fill="none" strokeWidth="1.1" />
            <text x="256" y="171" fontSize="9">PlaceOrderOutputBoundary</text>

            <rect x="20" y="150" width="150" height="34" rx="5" className="accentStroke" fill="none" strokeWidth="1.3" />
            <text x="42" y="171" fontSize="10">OrderPresenter</text>

            <rect x="20" y="210" width="150" height="34" rx="5" className="accentStroke" fill="none" strokeWidth="1.3" />
            <text x="38" y="231" fontSize="10">OrderViewModel</text>

            <line x1="160" y1="50" x2="250" y2="35" className="accentStroke" strokeWidth="1.4" markerEnd="url(#csArrow)" />
            <line x1="400" y1="30" x2="480" y2="45" className="accentStroke" strokeWidth="1.4" markerEnd="url(#csArrow)" />
            <line x1="325" y1="50" x2="325" y2="90" className="accentStroke" strokeWidth="1.4" markerEnd="url(#csArrow)" />
            <line x1="400" y1="107" x2="480" y2="107" className="accentStroke" strokeWidth="1.4" markerEnd="url(#csArrow)" />
            <line x1="325" y1="124" x2="325" y2="150" className="accentStroke" strokeWidth="1.4" markerEnd="url(#csArrow)" />
            <line x1="250" y1="167" x2="170" y2="167" className="accentStroke" strokeWidth="1.4" markerEnd="url(#csArrow)" />
            <line x1="95" y1="184" x2="95" y2="210" className="accentStroke" strokeWidth="1.4" markerEnd="url(#csArrow)" />

            <line x1="480" y1="100" x2="404" y2="100" className="mutedStroke" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#csArrowMuted)" />
            <line x1="170" y1="158" x2="246" y2="158" className="mutedStroke" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#csArrowMuted)" />

            <text x="230" y="280" fontSize="10">solid = control flow (runtime)</text>
            <text x="230" y="298" fontSize="10" className="mutedStroke" fill="currentColor">dashed = source dependency (implements)</text>

            <defs>
              <marker id="csArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
              <marker id="csArrowMuted" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Control flow loops through all seven classes; source dependencies (dashed) still point only inward at every port, even where control flow moves outward.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The full loop, trimmed to what matters: a request comes in, the use case orchestrates the entity and the repository port, and the result comes back out through the presenter.</p>
        <pre><code>{`// 1. adapter.web — receives HTTP, knows nothing of JPA or business rules
@RestController
@RequestMapping("/orders")
public class OrderController {
    private final PlaceOrderInputBoundary placeOrder;

    public OrderController(PlaceOrderInputBoundary placeOrder) {
        this.placeOrder = placeOrder;
    }

    @PostMapping
    public OrderViewModel create(@RequestBody OrderRequestDto body) {
        return placeOrder.placeOrder(
            new PlaceOrderRequest(body.customerId(), body.lines()));
    }
}

// 2. usecase — orchestrates entity + port, depends on interfaces only
public class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository orderRepository;         // port
    private final PlaceOrderOutputBoundary outputBoundary; // port

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              PlaceOrderOutputBoundary outputBoundary) {
        this.orderRepository = orderRepository;
        this.outputBoundary = outputBoundary;
    }

    @Override
    public OrderViewModel placeOrder(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lines()); // 3. entity
        orderRepository.save(order);                                     // 4. port call
        return outputBoundary.present(
            new PlaceOrderResponse(order.id(), order.status(), order.total())); // 5.
    }
}

// 4a. adapter.persistence — implements the port, the ONLY class that knows JPA exists
@Repository
public class JpaOrderRepository implements OrderRepository {
    private final SpringDataOrderJpaRepository springData;
    private final OrderEntityMapper mapper;
    // save(Order) delegates to springData.save(mapper.toJpaEntity(order))
}

// 5a. adapter.web — implements the output boundary, shapes the view model
public class OrderPresenter implements PlaceOrderOutputBoundary {
    @Override
    public OrderViewModel present(PlaceOrderResponse response) {
        return new OrderViewModel(
            response.orderId().value(),
            response.status().name(),
            response.total().formatted());
    }
}`}</code></pre>
        <p>Nothing here imports Spring inside the use case or the entity — <code>@RestController</code> and <code>@Repository</code> only appear on the outermost classes, exactly where the framework belongs.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Controller building the OrderViewModel directly</h3><p>Skipping <code>OrderPresenter</code> and letting <code>OrderController</code> shape the view model itself puts presentation decisions in the adapter that's supposed to just relay HTTP, and duplicates that logic the next time another delivery mechanism needs the same data.</p></div>
          <div><b>MISTAKE</b><h3>Use case returning the entity instead of a response DTO</h3><p>Returning <code>Order</code> straight out of <code>PlaceOrderUseCase</code> instead of a <code>PlaceOrderResponse</code> couples every caller to the entity's internal shape, so a later change to <code>Order</code> ripples out to the controller and presenter too.</p></div>
          <div><b>MISTAKE</b><h3>Treating the repository port as optional for "just this one query"</h3><p>Adding a one-off JPA query straight into <code>PlaceOrderUseCase</code> "because it's faster than going through the port" reintroduces the exact coupling the whole seven-class structure was built to eliminate.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Trace what would need to change, and what would stay untouched, if the team replaced Spring Data JPA with a hand-written SQL layer for persistence. Use the seven classes in this lesson to explain exactly where the line falls.</p>
        </div>
      </section>
    </div>
  );
}
