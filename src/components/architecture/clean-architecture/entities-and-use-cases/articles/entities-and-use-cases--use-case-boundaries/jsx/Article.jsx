export default function EntitiesAndUseCasesUseCaseBoundariesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">What actually crosses a use-case boundary matters as much as the interfaces that define it — and the rule is simple: plain data in, plain data out, never an entity and never a framework type.</p>
        <p>You now know the ports exist. This lesson is about the shape of what travels through them: <code>PlaceOrderRequest</code> and <code>PlaceOrderResponse</code>. Getting this wrong is one of the fastest ways to quietly destroy the isolation the rest of Clean Architecture worked hard to build.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Martin's guidance is blunt: <strong>never pass an Entity object across a use-case boundary.</strong> The same goes in the other direction for framework types — no <code>{'HttpServletRequest'}</code>, no JPA entity, no Spring <code>{'ResponseEntity'}</code> should ever appear in a method signature the use-case layer exposes. Instead, boundary crossings use simple, purpose-built data structures that exist for exactly one reason: to carry data across that one seam.</p>
        <h3>Why not just pass the entity?</h3>
        <p>It's tempting — <code>Order</code> already has all the data. But handing an <code>Order</code> to a controller lets that controller call <code>order.cancel()</code> or read internal state the use case never intended to expose, and it means every change to <code>Order</code>'s internals (a renamed field, a refactored collection type) now risks breaking the web layer, the CLI layer, and every other consumer directly. Passing a request/response DTO instead means the entity's internal shape can evolve freely as long as the use case still knows how to build the DTO from it.</p>
        <h3>Request and response objects are dumb on purpose</h3>
        <p><code>PlaceOrderRequest</code> and <code>PlaceOrderResponse</code> should have no behavior beyond maybe simple factory methods and no dependency on anything outside the JDK. Java <code>record</code>s are the natural fit: they're immutable, they're cheap to construct, and they can't accidentally accrete business logic the way a mutable class tends to over time.</p>
        <h3>The same rule applies at every use-case boundary</h3>
        <p>This isn't specific to <code>PlaceOrderUseCase</code> — every use case in the system gets its own request/response pair. <code>CancelOrderRequest</code> is not the same type as <code>PlaceOrderRequest</code>, even if they happen to share a field or two, because each use case's boundary shape should be driven only by what that specific use case needs, not by a shared "OrderDto" that grows a field for every use case and becomes coupled to all of them at once.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 240" role="img" aria-label="Two boxes separated by a dashed boundary line, with a small DTO crossing through a slot in the line while an Entity object is blocked with an X mark from crossing">
            <rect x="20" y="30" width="230" height="180" rx="8" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="135" y="20" textAnchor="middle" fontSize="10">Outer layer (controller)</text>

            <rect x="410" y="30" width="230" height="180" rx="8" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="525" y="20" textAnchor="middle" fontSize="10">Use-case layer</text>

            <line x1="330" y1="20" x2="330" y2="220" className="mutedStroke" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x="330" y="235" textAnchor="middle" fontSize="9">boundary</text>

            <rect x="270" y="95" width="120" height="40" rx="18" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="330" y="119" textAnchor="middle" fontSize="9">PlaceOrderRequest</text>

            <line x1="250" y1="115" x2="270" y2="115" className="accentStroke" strokeWidth="1.5" markerEnd="url(#arrowB1)" />
            <line x1="390" y1="115" x2="410" y2="115" className="accentStroke" strokeWidth="1.5" markerEnd="url(#arrowB1)" />

            <rect x="55" y="150" width="90" height="30" rx="4" className="mutedStroke" fill="none" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="100" y="169" textAnchor="middle" fontSize="9">Order (entity)</text>
            <line x1="145" y1="165" x2="325" y2="165" className="mutedStroke" strokeWidth="1.3" />
            <line x1="200" y1="150" x2="230" y2="180" className="mutedStroke" strokeWidth="2" />
            <line x1="230" y1="150" x2="200" y2="180" className="mutedStroke" strokeWidth="2" />
            <text x="215" y="200" textAnchor="middle" fontSize="8" className="mutedFill">entities never cross</text>

            <defs>
              <marker id="arrowB1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Only plain request/response data structures cross a use-case boundary — entities and framework types never do.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Request and response types for the place-order use case, kept intentionally boring:</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase;

import com.engineeringdecoded.orders.entity.CustomerId;
import com.engineeringdecoded.orders.entity.OrderId;
import java.util.List;

public record PlaceOrderRequest(
        OrderId orderId,
        CustomerId customerId,
        List<OrderLineRequest> lines) {
}

public record OrderLineRequest(String sku, int quantity, long unitPriceCents) {
}

public record PlaceOrderResponse(
        boolean accepted,
        String orderId,
        long totalCents,
        String failureReason) {

    public static PlaceOrderResponse success(String orderId, long totalCents) {
        return new PlaceOrderResponse(true, orderId, totalCents, null);
    }

    public static PlaceOrderResponse failure(String reason) {
        return new PlaceOrderResponse(false, null, 0, reason);
    }
}`}</code></pre>
        <p>Notice <code>PlaceOrderResponse</code> carries a raw <code>{'long'}</code> for cents, not a <code>Money</code> object — the entity's value types stay inside the use-case layer; what crosses out is primitive data the presenter is free to format however the UI needs.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Returning the Order entity straight from the use case</h3><p>Having <code>PlaceOrderUseCase</code> hand back an <code>Order</code> "to save a mapping step" lets the controller or presenter call mutating entity methods it has no business calling, and couples every consumer to the entity's internal shape.</p></div>
          <div><b>MISTAKE</b><h3>Accepting an HttpServletRequest as the use-case input</h3><p>Passing the raw servlet request into <code>placeOrder()</code> "to keep things simple" means the use case can no longer be called from anything but a servlet-based web layer — and it usually means someone starts reading headers or query params deep inside business logic.</p></div>
          <div><b>MISTAKE</b><h3>One shared DTO reused across every use case</h3><p>A single <code>OrderDto</code> passed to <code>placeOrder</code>, <code>cancelOrder</code>, and <code>refundOrder</code> alike grows fields for each use case's needs and becomes a de facto shared mutable structure that couples all of them together.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate suggests <code>PlaceOrderResponse</code> should just wrap the saved <code>Order</code> entity directly, since "the presenter needs all that data anyway." Walk through what breaks, concretely, the first time someone changes a private field on <code>Order</code>.</p>
        </div>
      </section>
    </div>
  );
}
