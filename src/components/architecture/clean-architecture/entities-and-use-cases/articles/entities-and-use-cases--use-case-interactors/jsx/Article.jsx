export default function EntitiesAndUseCasesUseCaseInteractorsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">An interactor is the class that actually does the work of a use case — it takes a request, orchestrates entities, and hands back a result, and it is the only place that application business rule lives.</p>
        <p>You've seen entities protect their own invariants and you've seen that use cases orchestrate them. Now you'll build the concrete class that does that orchestration end to end: <code>PlaceOrderUseCase</code>, and see exactly how it stays ignorant of both where its input comes from and where its output goes.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>An <strong>interactor</strong> is Martin's term for the concrete object that implements a use case. It's called that specifically because it's the thing that "interacts" — it pulls entities out of a repository, calls their methods in the right order, checks whatever application-specific conditions this workflow requires, and pushes the result somewhere. In our domain, <code>PlaceOrderUseCase</code> is the interactor for the "place an order" use case.</p>
        <h3>One interactor, one use case</h3>
        <p>Each interactor should correspond to exactly one use case — one reason to change. <code>PlaceOrderUseCase</code> handles placing an order; cancelling one is a different application business rule with its own actors, its own steps, and its own reasons to change, so it gets its own <code>CancelOrderUseCase</code>. Resist the urge to merge them into one "OrderUseCase" god class — that reintroduces exactly the coupling Clean Architecture is designed to prevent.</p>
        <h3>The interactor never talks to the outside world directly</h3>
        <p>This is the part people get wrong first: the interactor does not know it's being called from a web request, and it does not know its result will become a JSON response. It receives a plain input structure, calls entities and a repository <strong>port</strong>, and hands its result to an output <strong>port</strong> — never a servlet response, never a view. That's what lets the exact same interactor be driven by a REST controller today and a CLI tool or a scheduled batch job tomorrow, with no changes to <code>PlaceOrderUseCase</code> itself.</p>
        <h3>Where it sits in the flow</h3>
        <p>A request arrives at a controller (outer layer), gets translated into a plain request object, and is handed to the interactor through an interface it implements. The interactor does its work using entities and a repository port, then calls an output port with the result. Something further out — a presenter — is listening on that output port and turns the result into something a UI can render. The interactor sits exactly in the middle of that pipeline, and it is the only box in the picture that contains actual business orchestration.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 220" role="img" aria-label="A horizontal pipeline showing a Controller calling an Input Boundary interface, which the Use Case Interactor implements, calling out to an Output Boundary interface implemented by a Presenter">
            <rect x="10" y="80" width="110" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="65" y="112" textAnchor="middle" fontSize="10">OrderController</text>

            <rect x="160" y="80" width="130" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="225" y="105" textAnchor="middle" fontSize="9">«interface»</text>
            <text x="225" y="120" textAnchor="middle" fontSize="9">InputBoundary</text>

            <rect x="330" y="70" width="150" height="76" rx="6" className="accentStroke" fill="none" strokeWidth="2.5" />
            <text x="405" y="102" textAnchor="middle" fontSize="10">PlaceOrderUseCase</text>
            <text x="405" y="118" textAnchor="middle" fontSize="9">(interactor)</text>
            <text x="405" y="134" textAnchor="middle" fontSize="8">uses Order, OrderRepository</text>

            <rect x="520" y="80" width="130" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="585" y="105" textAnchor="middle" fontSize="9">«interface»</text>
            <text x="585" y="120" textAnchor="middle" fontSize="9">OutputBoundary</text>

            <line x1="120" y1="108" x2="158" y2="108" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowInt)" />
            <line x1="290" y1="108" x2="328" y2="108" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowInt)" />
            <line x1="480" y1="108" x2="518" y2="108" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowInt)" />

            <text x="65" y="150" textAnchor="middle" fontSize="8" className="mutedFill">translates HTTP → request</text>
            <text x="585" y="150" textAnchor="middle" fontSize="8" className="mutedFill">implemented by OrderPresenter</text>

            <defs>
              <marker id="arrowInt" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The interactor sits between two interfaces it does not own the implementation of — it only knows the shapes of the boundaries, never who's on the other side.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The full interactor, showing a single application business rule expressed as a sequence of steps against entities and a repository port:</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;
    private final PlaceOrderOutputBoundary outputBoundary;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              PlaceOrderOutputBoundary outputBoundary) {
        this.orderRepository = orderRepository;
        this.outputBoundary = outputBoundary;
    }

    @Override
    public void placeOrder(PlaceOrderRequest request) {
        Order order = new Order(request.orderId(), request.customerId());
        request.lines().forEach(order::addLine);

        try {
            order.place();
        } catch (IllegalStateException invalidOrder) {
            outputBoundary.presentFailure(invalidOrder.getMessage());
            return;
        }

        orderRepository.save(order);
        outputBoundary.presentSuccess(PlaceOrderResponse.from(order));
    }
}`}</code></pre>
        <p>Nothing here imports <code>{'javax.servlet'}</code>, Spring, or JPA. Swap the controller and presenter for a CLI equivalent and this class does not change at all.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Interactor returning a value instead of using the output port</h3><p>Having <code>placeOrder</code> return a <code>PlaceOrderResponse</code> directly seems simpler, but it removes the seam that lets a presenter format the result differently per delivery mechanism, and it tempts callers to skip the output boundary altogether.</p></div>
          <div><b>MISTAKE</b><h3>Injecting a framework-aware dependency into the interactor</h3><p>Passing an <code>{'HttpServletRequest'}</code> or an <code>{'EntityManager'}</code> into <code>PlaceOrderUseCase</code> "just this once" ties the use case to a delivery mechanism or a persistence framework, defeating the entire point of the boundary.</p></div>
          <div><b>MISTAKE</b><h3>One interactor per controller instead of per use case</h3><p>Naming it <code>OrderControllerService</code> and stuffing placing, cancelling, and reordering logic into it hides which application business rule you're actually touching when requirements change, and makes the class balloon over time.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Suppose a new requirement arrives: "after an order is placed, also award loyalty points." Would you add that step inside <code>PlaceOrderUseCase</code>, inside <code>Order.place()</code>, or somewhere else entirely — and why does that choice matter six months from now when a second use case also needs to award points?</p>
        </div>
      </section>
    </div>
  );
}
