export default function AppliedCleanArchitectureFeatureBasedStructureArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">When "place an order" and "cancel an order" barely touch each other, why do their classes live three folders apart?</p>
        <p>Package-by-layer groups code by what a class <em>is</em> (an entity, a use case, an adapter). Package-by-feature groups code by what a class <em>does for the business</em> — placing an order, cancelling an order, applying a discount. This lesson walks through restructuring the orders system around features instead of layers, and shows that the Dependency Rule doesn't go away when you do this — it just applies inside each slice instead of across the whole package tree.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Slicing by use case instead of by layer</h3>
        <p>In a feature-based structure, <code>com.engineeringdecoded.orders.placeorder</code> contains everything needed to place an order: its own <code>entity</code>, <code>usecase</code>, and <code>adapter</code> sub-packages (or at least the pieces that are genuinely specific to placing an order). <code>com.engineeringdecoded.orders.cancelorder</code> is its own sibling slice with the same internal shape. Instead of opening four layer folders to trace one user-facing capability end to end, you open one feature folder and everything relevant is right there.</p>
        <h3>The Dependency Rule doesn't disappear — it moves inside the slice</h3>
        <p>This is the detail people get wrong when they first try feature-based structure: they assume "feature folders" and "Clean Architecture" are alternatives to choose between. They're not. Clean Architecture is about the direction source-code dependencies point relative to policy and detail; package-by-layer and package-by-feature are both just ways of arranging <em>where files live on disk</em>. Inside <code>placeorder</code>, the usecase code still must not depend on the adapter code, and the entity code still must not know Spring or JPA exist. You've changed the folder structure, not the rule.</p>
        <h3>Trade-offs</h3>
        <p>Package-by-layer wins when you frequently need a bird's-eye view of "all the entities" or "all the controllers" — useful in small systems, or when onboarding someone to the architecture itself. Package-by-feature wins as the system grows, because most day-to-day changes are feature-shaped: a product manager asks for a change to order cancellation, and that change should touch one folder, not four. It also makes deleting a feature nearly free — delete the <code>cancelorder</code> package and you're mostly done, versus hunting down cancel-related classes scattered across <code>entity</code>, <code>usecase</code>, and both adapter packages.</p>
        <p>The real cost of package-by-feature is <strong>shared kernel management</strong>. <code>Order</code>, <code>OrderId</code>, and <code>Money</code> are genuinely used by both <code>placeorder</code> and <code>cancelorder</code> — they can't live inside either slice without one feature depending on another's internals. The common fix is a small shared package, often literally called <code>com.engineeringdecoded.orders.shared</code> or kept as the top-level <code>entity</code> package, that both feature slices are allowed to depend on. The rule to protect is: features may depend on the shared kernel, features must never depend on each other directly.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 280" role="img" aria-label="Two feature package folders, placeorder and cancelorder, each containing their own entity, usecase, and adapter sub-slices, both depending downward on a shared kernel package">
            <rect x="30" y="20" width="270" height="150" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="44" y="42" fontSize="13">placeorder</text>
            <rect x="48" y="54" width="230" height="24" rx="3" className="mutedStroke" fill="none" strokeWidth="1" />
            <text x="58" y="70" fontSize="11">usecase (PlaceOrderUseCase)</text>
            <rect x="48" y="86" width="230" height="24" rx="3" className="mutedStroke" fill="none" strokeWidth="1" />
            <text x="58" y="102" fontSize="11">adapter.web (OrderController)</text>
            <rect x="48" y="118" width="230" height="24" rx="3" className="mutedStroke" fill="none" strokeWidth="1" />
            <text x="58" y="134" fontSize="11">adapter.persistence</text>

            <rect x="360" y="20" width="270" height="150" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="374" y="42" fontSize="13">cancelorder</text>
            <rect x="378" y="54" width="230" height="24" rx="3" className="mutedStroke" fill="none" strokeWidth="1" />
            <text x="388" y="70" fontSize="11">usecase (CancelOrderUseCase)</text>
            <rect x="378" y="86" width="230" height="24" rx="3" className="mutedStroke" fill="none" strokeWidth="1" />
            <text x="388" y="102" fontSize="11">adapter.web (OrderController)</text>
            <rect x="378" y="118" width="230" height="24" rx="3" className="mutedStroke" fill="none" strokeWidth="1" />
            <text x="388" y="134" fontSize="11">adapter.persistence</text>

            <rect x="195" y="215" width="270" height="40" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="220" y="240" fontSize="12">shared kernel: entity (Order, Money)</text>

            <line x1="165" y1="170" x2="290" y2="215" className="accentStroke" strokeWidth="1.4" markerEnd="url(#fbArrow)" />
            <line x1="495" y1="170" x2="370" y2="215" className="accentStroke" strokeWidth="1.4" markerEnd="url(#fbArrow)" />

            <line x1="300" y1="95" x2="360" y2="95" className="mutedStroke" strokeWidth="1.2" strokeDasharray="4 4" />
            <text x="305" y="88" fontSize="9" className="mutedStroke" fill="currentColor">no direct dependency</text>

            <defs>
              <marker id="fbArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Feature slices each keep their own layers internally, and only ever depend downward on the shared kernel — never on each other.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The <code>placeorder</code> feature slice, with its own use case and web adapter, depending on the shared <code>entity</code> package for <code>Order</code> and <code>Money</code>:</p>
        <pre><code>{`// com.engineeringdecoded.orders.placeorder.usecase.PlaceOrderUseCase
package com.engineeringdecoded.orders.placeorder.usecase;

import com.engineeringdecoded.orders.entity.Order;      // shared kernel
import com.engineeringdecoded.orders.entity.CustomerId;
import com.engineeringdecoded.orders.placeorder.usecase.port.OrderRepository;

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
        Order order = Order.place(new CustomerId(request.customerId()), request.lines());
        orderRepository.save(order);
        outputBoundary.present(new PlaceOrderResponse(order.id(), order.status()));
    }
}

// com.engineeringdecoded.orders.cancelorder.usecase.CancelOrderUseCase
// lives in a SIBLING package — never imports anything from .placeorder`}</code></pre>
        <p>Notice both slices import from <code>entity</code> (the shared kernel) but neither slice imports from the other — that boundary is what keeps the features independently deployable and independently understandable.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>One feature quietly importing another's internals</h3><p>Under deadline pressure, <code>cancelorder</code> reaches directly into a class inside <code>placeorder.adapter.persistence</code> because "it's right there" — now the two features can't be understood, tested, or deployed independently.</p></div>
          <div><b>MISTAKE</b><h3>No shared kernel discipline</h3><p>Instead of one well-defined shared <code>entity</code> package, teams let each feature define its own near-duplicate copy of <code>Order</code>, and the copies drift out of sync within a few sprints.</p></div>
          <div><b>MISTAKE</b><h3>Skipping the Dependency Rule inside the slice</h3><p>Because the folder is small, developers assume the layering rules don't matter here and let the feature's use case call Spring/JPA classes directly — the slice becomes a mini version of the exact tangled-controller problem Clean Architecture exists to prevent.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your <code>placeorder</code> and <code>cancelorder</code> slices both need to check whether a customer's account is in good standing. Where should that logic live so neither feature depends on the other, and what does that decision tell you about what belongs in a shared kernel versus a feature slice?</p>
        </div>
      </section>
    </div>
  );
}
