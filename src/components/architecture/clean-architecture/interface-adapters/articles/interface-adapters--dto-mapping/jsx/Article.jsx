export default function InterfaceAdaptersDtoMappingArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Mapping code between layers looks like boilerplate — it's actually the price tag of decoupling, paid up front so you never pay a much larger price later.</p>
        <p>Every boundary you've studied so far — use-case boundary, gateway, presenter — implies a translation step somewhere. This lesson looks straight at that translation code, using <code>OrderEntityMapper</code> as the example, and makes the case for why it earns its keep even though it can feel repetitive to write.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Whenever two layers use different data shapes on purpose — and in Clean Architecture, they always should — something has to translate between them. <code>OrderEntityMapper</code> does this at the persistence boundary: it converts a domain <code>Order</code> into an <code>OrderJpaEntity</code> (the JPA-annotated class Hibernate actually persists) and back again. That conversion code is, by definition, "boilerplate" in the literal sense — repetitive, low-complexity, field-by-field code. It is also exactly what keeps your domain model free of persistence concerns.</p>
        <h3>The alternative is tempting and it's a trap</h3>
        <p>It's always possible to skip the mapper: annotate <code>Order</code> directly with <code>{'@Entity'}</code> and let Hibernate persist your domain object as-is. This removes the mapping code today. It also means every future persistence decision — a lazy-loaded collection, a required no-arg constructor, a column rename for a migration, a schema quirk that only makes sense for the database — now has a direct line into your business logic. The two concerns were never actually the same thing; collapsing the mapper just hides that they're different until the day they collide.</p>
        <h3>What a good mapper looks like</h3>
        <p>A mapper should be dumb in the same way a view model is dumb: field-by-field conversion, no business rules, no validation beyond what's needed to construct a valid object. If <code>OrderEntityMapper</code> starts making decisions ("if the JPA entity's status is null, default it to DRAFT") that's a business rule hiding in translation code — it should either not be needed (the JPA entity should never be in that state) or it belongs somewhere more visible.</p>
        <h3>Where mapping shows up across the whole architecture</h3>
        <p>This isn't unique to persistence. The controller mapping HTTP JSON into <code>PlaceOrderRequest</code>, the presenter mapping <code>PlaceOrderResponse</code> into <code>OrderViewModel</code>, and <code>OrderEntityMapper</code> mapping <code>Order</code> to <code>OrderJpaEntity</code> are all the same pattern applied at different boundaries. Once you notice it, "how many places do I map data in this system" becomes a reasonable proxy for "how many boundaries does this system actually respect."</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 230" role="img" aria-label="OrderJpaEntity and the domain Order entity on opposite sides of OrderEntityMapper, with bidirectional arrows through the mapper, contrasted with a crossed-out direct arrow representing collapsing the two into one class">
            <rect x="20" y="80" width="150" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="95" y="103" textAnchor="middle" fontSize="9">OrderJpaEntity</text>
            <text x="95" y="118" textAnchor="middle" fontSize="7" className="mutedFill">adapter.persistence</text>

            <rect x="250" y="65" width="160" height="86" rx="8" className="accentStroke" fill="none" strokeWidth="2.5" />
            <text x="330" y="95" textAnchor="middle" fontSize="10">OrderEntityMapper</text>
            <text x="330" y="112" textAnchor="middle" fontSize="8">toDomain()</text>
            <text x="330" y="126" textAnchor="middle" fontSize="8">toJpaEntity()</text>

            <rect x="490" y="80" width="150" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="565" y="103" textAnchor="middle" fontSize="9">Order (entity)</text>
            <text x="565" y="118" textAnchor="middle" fontSize="7" className="mutedFill">domain layer</text>

            <line x1="170" y1="95" x2="248" y2="95" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowDto)" />
            <line x1="248" y1="118" x2="170" y2="118" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowDto)" />
            <line x1="410" y1="95" x2="488" y2="95" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowDto)" />
            <line x1="488" y1="118" x2="410" y2="118" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowDto)" />

            <line x1="95" y1="180" x2="565" y2="180" className="mutedStroke" strokeWidth="1.3" strokeDasharray="3 2" />
            <line x1="310" y1="170" x2="340" y2="190" className="mutedStroke" strokeWidth="2" />
            <line x1="340" y1="170" x2="310" y2="190" className="mutedStroke" strokeWidth="2" />
            <text x="330" y="205" textAnchor="middle" fontSize="8" className="mutedFill">collapsing the two classes removes this safety net</text>

            <defs>
              <marker id="arrowDto" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The mapper is a small, dedicated cost that keeps the domain entity and the persistence entity free to evolve independently.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A JPA-annotated persistence class kept entirely separate from the domain entity, with a mapper bridging the two:</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.persistence;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class OrderJpaEntity {

    @Id
    private String id;

    private String customerId;

    @Enumerated(EnumType.STRING)
    private String status;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "order")
    private List<OrderLineJpaEntity> lines = new ArrayList<>();

    protected OrderJpaEntity() { } // required by Hibernate

    // getters and setters omitted for brevity
}

// --- the mapper that bridges the two shapes above ---

package com.engineeringdecoded.orders.adapter.persistence;

import com.engineeringdecoded.orders.entity.*;
import org.springframework.stereotype.Component;

@Component
public class OrderEntityMapper {

    public OrderJpaEntity toJpaEntity(Order order) {
        OrderJpaEntity jpa = new OrderJpaEntity();
        jpa.setId(order.id().value());
        jpa.setCustomerId(order.customerId().value());
        jpa.setStatus(order.status().name());
        // map lines, omitted for brevity
        return jpa;
    }

    public Order toDomain(OrderJpaEntity jpa) {
        Order order = new Order(new OrderId(jpa.getId()), new CustomerId(jpa.getCustomerId()));
        // reconstruct lines and status via package-visible reconstitution constructor
        return order;
    }
}`}</code></pre>
        <p><code>Order</code> stays a plain object with no Hibernate footprint; <code>OrderJpaEntity</code> stays free to have a protected no-arg constructor, mutable setters, and JPA annotations — the things Hibernate needs but that have nothing to do with business rules.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Reusing the JPA entity as the domain entity to "save the mapping"</h3><p>Skipping <code>OrderEntityMapper</code> by annotating <code>Order</code> directly feels efficient at first, but every future schema change now risks rippling into business logic, and every business rule risks being weakened by a persistence-driven compromise (nullable fields for lazy loading, mutable setters for Hibernate).</p></div>
          <div><b>MISTAKE</b><h3>Letting the mapper make business decisions</h3><p>A mapper that silently defaults a missing status to <code>DRAFT</code> or clamps a negative total to zero is quietly implementing business rules in a place nobody thinks to look for them.</p></div>
          <div><b>MISTAKE</b><h3>Skipping mapper tests because "it's just boilerplate"</h3><p>Mapping bugs are exactly the kind of thing that slips through silently — a swapped field, a dropped collection — and they're cheap to catch with a simple round-trip test, so treating the mapper as untested glue code is a false economy.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Six months from now, the DBA wants to split the <code>orders</code> table into <code>orders</code> and <code>order_totals</code> for performance reasons. Walk through what changes if you have <code>OrderEntityMapper</code> in place, versus what changes if <code>Order</code> itself was the JPA entity all along.</p>
        </div>
      </section>
    </div>
  );
}
