export default function DataAndPersistenceMappingDomainObjectsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">The mapper is the small piece of code that makes the last lesson's separation actually pay off — write it carelessly and you've bought two classes for nothing.</p>
        <p>Now that <code>Order</code> and <code>OrderJpaEntity</code> are genuinely separate classes, something has to translate between them. That something is <code>OrderEntityMapper</code>, and this lesson walks through what it actually does, where it lives, and why getting it right is what makes the next lesson — swapping the database entirely — cheap instead of terrifying.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The mapper lives in the adapter layer, next to the repository it serves</h3>
        <p><code>OrderEntityMapper</code> belongs in <code>adapter.persistence</code>, alongside <code>JpaOrderRepository</code> — not in <code>usecase</code>, and not in <code>entity</code>. It's the one class, besides the repository implementation itself, that's allowed to know about both the domain shape and the JPA shape simultaneously. It exposes two directions: <code>toDomain(OrderJpaEntity)</code> for reading, and <code>toJpaEntity(Order)</code> for writing. <code>JpaOrderRepository</code> calls both, but never does the translation inline — keeping that logic in one dedicated, testable class instead of scattered across every repository method.</p>
        <h3>Mapping is where mismatches get resolved, not hidden</h3>
        <p>The two models rarely line up field-for-field once a system matures. <code>Order</code> might represent money as a <code>Money</code> value object wrapping a <code>BigDecimal</code> and a currency; <code>OrderJpaEntity</code> might store that as two separate columns, <code>amount_cents</code> and <code>currency_code</code>, because that's what indexes and reporting queries want. <code>Order</code> enforces that a <code>DRAFT</code> order has no <code>placedAt</code> timestamp; <code>OrderJpaEntity</code> might just have a nullable column. The mapper is exactly where these representational differences get reconciled — it's allowed to contain logic, not just field copies, and that logic is precisely what keeps the mismatch from leaking into either the domain or the schema.</p>
        <h3>Why this is what makes "changing the database" cheap</h3>
        <p>Because every translation between the domain and the stored representation funnels through one mapper class per repository implementation, a database swap only ever requires writing a new mapper (<code>OrderDynamoMapper</code>, say) alongside a new repository implementation. <code>Order</code> doesn't change. <code>PlaceOrderUseCase</code> doesn't change. The old <code>OrderJpaEntity</code> and <code>OrderEntityMapper</code> simply stop being wired into the composition root. Without a dedicated mapper, that translation logic tends to be smeared across repository methods, DTOs, and sometimes the domain object itself — and there's no longer one clear place to replace.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 230" role="img" aria-label="Order and OrderJpaEntity on opposite sides with OrderEntityMapper in between showing two labeled arrows, toDomain going left and toJpaEntity going right">
            <rect x="40" y="80" width="170" height="70" rx="6" className="accentStroke" fill="none" />
            <text x="125" y="110" textAnchor="middle" fontSize="12">Order</text>
            <text x="125" y="128" textAnchor="middle" fontSize="9">domain, entity layer</text>

            <rect x="245" y="70" width="170" height="90" rx="6" className="mutedStroke" fill="none" />
            <text x="330" y="95" textAnchor="middle" fontSize="11">OrderEntityMapper</text>
            <text x="330" y="115" textAnchor="middle" fontSize="9">toDomain(entity)</text>
            <text x="330" y="132" textAnchor="middle" fontSize="9">toJpaEntity(order)</text>

            <rect x="450" y="80" width="170" height="70" rx="6" className="mutedStroke" fill="none" />
            <text x="535" y="110" textAnchor="middle" fontSize="12">OrderJpaEntity</text>
            <text x="535" y="128" textAnchor="middle" fontSize="9">adapter.persistence</text>

            <line x1="245" y1="100" x2="210" y2="100" className="accentStroke" markerEnd="url(#arrowM1)" />
            <text x="228" y="90" textAnchor="middle" fontSize="8">toDomain</text>

            <line x1="415" y1="130" x2="450" y2="130" className="mutedStroke" markerEnd="url(#arrowM2)" />
            <text x="432" y="150" textAnchor="middle" fontSize="8">toJpaEntity</text>

            <defs>
              <marker id="arrowM1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="accentFill" />
              </marker>
              <marker id="arrowM2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">One mapper, two directions — all representational mismatches are resolved in this one place.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p><code>OrderEntityMapper</code> reconciles a value-object <code>Money</code> against two flat JPA columns, and rebuilds <code>Order</code>'s invariants correctly on the way back.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.persistence;

public class OrderEntityMapper {

    public OrderJpaEntity toJpaEntity(Order order) {
        OrderJpaEntity entity = new OrderJpaEntity(
            order.getId().value(),
            order.getCustomerId().value(),
            order.getStatus()
        );
        entity.setAmountCents(order.total().cents());
        entity.setCurrencyCode(order.total().currencyCode());

        for (OrderLine line : order.getLines()) {
            entity.addLine(new OrderLineJpaEntity(
                line.sku(), line.quantity(), line.unitPrice().cents()
            ));
        }
        return entity;
    }

    public Order toDomain(OrderJpaEntity entity) {
        Order order = new Order(
            new OrderId(entity.getId()),
            new CustomerId(entity.getCustomerId())
        );

        for (OrderLineJpaEntity lineEntity : entity.getLines()) {
            order.addLine(new OrderLine(
                lineEntity.getSku(),
                lineEntity.getQuantity(),
                Money.ofCents(lineEntity.getUnitPriceCents())
            ));
        }

        order.restoreStatus(entity.getStatus()); // reconstitution, not a business transition
        return order;
    }
}`}</code></pre>
        <p>Notice <code>restoreStatus</code> is a distinct method from <code>place()</code> or <code>cancel()</code> — reading a persisted status back isn't a business transition and shouldn't run through the same validation as one.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Inlining mapping logic inside the repository</h3><p>Building <code>OrderJpaEntity</code> objects field-by-field directly inside <code>JpaOrderRepository.save()</code> scatters translation logic across every method instead of centralizing it where it can be tested and reused.</p></div>
          <div><b>MISTAKE</b><h3>Reusing the domain's business-transition methods during reconstitution</h3><p>Calling <code>order.place()</code> while rebuilding an already-placed order from storage re-runs validation meant for a live transition and can throw on perfectly valid historical data.</p></div>
          <div><b>MISTAKE</b><h3>Letting the mapper leak framework types back out</h3><p>A <code>toDomain</code> method that returns anything referencing <code>OrderJpaEntity</code> fields directly (instead of a fully-formed <code>Order</code>) re-couples callers to the persistence shape it was supposed to hide.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p><code>Order</code> represents an order's total as a single <code>Money</code> value object, but the DBA insists on separate <code>amount_cents</code> and <code>currency_code</code> columns for reporting. Where exactly does that reconciliation happen, and why shouldn't <code>Order</code> itself change to match the columns?</p>
        </div>
      </section>
    </div>
  );
}
