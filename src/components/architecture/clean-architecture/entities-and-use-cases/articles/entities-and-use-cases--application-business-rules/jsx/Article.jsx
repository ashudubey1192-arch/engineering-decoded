export default function EntitiesAndUseCasesApplicationBusinessRulesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Application business rules describe how this particular system automates the business — they're the second, still-stable-but-more-volatile ring around your entities.</p>
        <p>If enterprise rules are "what the business always needed," application business rules are "what this application does about it." They're where use cases live: the orchestration that takes entities and drives them toward one specific, application-defined goal. This lesson draws the line between the two so you know exactly where to put new logic as requirements arrive.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Martin defines application business rules as the rules that "define and constrain the automation of the business rules." In other words: the business rule is "an order needs at least one line before it can be placed" (enterprise, lives on <code>Order</code>). The application rule is "when a customer submits a place-order request, check inventory, reserve stock, calculate the order total, persist the order, and notify the warehouse" (application-specific, lives in a use case).</p>
        <h3>Use cases are application business rules</h3>
        <p>A <strong>use case</strong> is the object that encodes an application business rule. In <code>{'com.engineeringdecoded.orders.usecase'}</code>, <code>PlaceOrderUseCase</code> is exactly this: it doesn't invent new truths about what an order is — it orchestrates existing entities (<code>Order</code>, and by extension <code>OrderLine</code>, <code>Money</code>) to accomplish something this specific application promises to do. A different application built on the same entities — say, an internal bulk-import tool — might automate order placement completely differently, skipping steps this use case requires, while still respecting the same enterprise rules.</p>
        <h3>Why the second ring, and why it changes more</h3>
        <p>Application rules change far more often than enterprise rules, because they're driven by product decisions, not immutable business truths: "now send an SMS instead of an email," "now check a fraud score before reserving stock," "now allow guest checkout." None of these change what an <code>Order</code> fundamentally is. They change what this application does with one. That's exactly why Clean Architecture keeps them in a separate ring, one layer further from the center — so a change to a workflow step never forces you to touch entity code, and a change to an entity invariant is something every use case must respect, never the reverse.</p>
        <h3>The dependency direction</h3>
        <p>Use cases depend on entities. Entities know nothing about use cases. <code>PlaceOrderUseCase</code> imports <code>Order</code>; <code>Order</code> never imports anything from the <code>usecase</code> package. This one-directional dependency is what lets you add, remove, or rewrite use cases freely without ever destabilizing the rules the whole business relies on.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="A use case box in the center orchestrating three entity boxes labeled Order, OrderLine, and Money, with an outer label describing this as automation specific to one application">
            <rect x="230" y="95" width="180" height="70" rx="8" className="accentStroke" fill="none" strokeWidth="2.5" />
            <text x="320" y="124" textAnchor="middle" fontSize="12">PlaceOrderUseCase</text>
            <text x="320" y="140" textAnchor="middle" fontSize="9">application business rule</text>

            <rect x="30" y="30" width="120" height="46" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="90" y="58" textAnchor="middle" fontSize="10">Order</text>

            <rect x="30" y="185" width="120" height="46" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="90" y="213" textAnchor="middle" fontSize="10">OrderLine</text>

            <rect x="490" y="105" width="120" height="46" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="550" y="133" textAnchor="middle" fontSize="10">Money</text>

            <line x1="150" y1="55" x2="228" y2="110" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowApp)" />
            <line x1="150" y1="208" x2="228" y2="150" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowApp)" />
            <line x1="410" y1="128" x2="488" y2="128" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowApp)" />

            <defs>
              <marker id="arrowApp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="mutedFill" />
              </marker>
            </defs>

            <text x="320" y="235" textAnchor="middle" fontSize="10" className="accentFill">orchestrates entities toward one application-specific goal</text>
          </svg>
          <p className="diagramCaption">A use case orchestrates entities to accomplish something specific to this application, without adding new truths to the entities themselves.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here, <code>PlaceOrderUseCase</code> encodes the application business rule for placing an order: check inventory, reserve stock, then let the entity enforce its own invariant.</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.entity.OrderLine;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;
    private final InventoryChecker inventoryChecker;
    private final PlaceOrderOutputBoundary outputBoundary;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              InventoryChecker inventoryChecker,
                              PlaceOrderOutputBoundary outputBoundary) {
        this.orderRepository = orderRepository;
        this.inventoryChecker = inventoryChecker;
        this.outputBoundary = outputBoundary;
    }

    @Override
    public void placeOrder(PlaceOrderRequest request) {
        Order order = new Order(request.orderId(), request.customerId());
        for (OrderLine line : request.lines()) {
            inventoryChecker.reserve(line.sku(), line.quantity()); // application-specific step
            order.addLine(line);
        }

        order.place(); // enterprise rule enforced by the entity itself

        orderRepository.save(order);
        outputBoundary.present(PlaceOrderResponse.success(order.id()));
    }
}`}</code></pre>
        <p>"Reserve stock before adding a line" is a decision this application makes about how it automates order placement — a different application could reasonably skip it. "An order can't be placed with zero lines" is not up for discussion; the entity enforces it regardless of which use case calls it.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Pushing enterprise rules into the use case</h3><p>Re-checking "lines must not be empty" inside <code>PlaceOrderUseCase</code> instead of trusting <code>Order.place()</code> duplicates the rule in a volatile layer, so the two copies inevitably drift apart over time.</p></div>
          <div><b>MISTAKE</b><h3>Pulling application orchestration down into entities</h3><p>Adding an <code>inventoryChecker</code> field or a "send notification" call directly to <code>Order</code> ties the most stable class in the system to a workflow decision that might change next sprint.</p></div>
          <div><b>MISTAKE</b><h3>One giant "OrderService" instead of focused use cases</h3><p>Cramming <code>placeOrder</code>, <code>cancelOrder</code>, and <code>reorder</code> into a single service class obscures which application-specific rule you're changing when a requirement shifts, and makes it easy to accidentally couple unrelated workflows.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Marketing wants a "buy one, get one free" promotion applied automatically during checkout. Does that logic belong on the <code>Order</code> entity or inside <code>PlaceOrderUseCase</code> — and what would change about your answer if the business later says "this promotion rule must always apply, in every application that touches orders, forever"?</p>
        </div>
      </section>
    </div>
  );
}
