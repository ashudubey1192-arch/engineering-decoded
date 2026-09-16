export default function InterfaceAdaptersGatewaysArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A gateway is any interface that abstracts an external system away from the use-case layer — persistence is the most common example, but the pattern applies to payments, email, and every other outside dependency too.</p>
        <p>You've already met one gateway informally: <code>OrderRepository</code>. This lesson generalizes the concept, shows how the interface and its implementation sit on opposite sides of the Dependency Rule, and shows why "gateway" is a broader idea than "repository."</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>A <strong>gateway</strong> is an interface, owned by an inner layer, that describes an operation the use-case layer needs from the outside world, without describing <em>how</em> that operation is carried out. <code>OrderRepository</code> is a gateway for persistence: <code>save(Order)</code> and <code>findById(OrderId)</code> say nothing about SQL, JPA, or which database engine is in play. A <code>PaymentGateway</code> interface with a <code>charge(Money, PaymentMethod)</code> method would be a gateway for a payment processor. An <code>EmailGateway</code> with a <code>send(EmailMessage)</code> method would be a gateway for a notification provider. Same pattern, three different external systems.</p>
        <h3>Interface here, implementation out there</h3>
        <p>This is where the Dependency Rule gets physically enforced through Java's type system: <code>OrderRepository</code> lives in <code>com.engineeringdecoded.orders.usecase.port</code> — inside the use-case layer. Its implementation, <code>JpaOrderRepository</code>, lives in <code>com.engineeringdecoded.orders.adapter.persistence</code> — an outer layer. <code>JpaOrderRepository implements OrderRepository</code>, so the dependency arrow points from the outer adapter <em>inward</em> to the interface, even though at runtime, data flows the other way (the use case calls a method that ends up executing SQL). Source-code dependency and runtime control flow point in opposite directions — that's the whole trick, and it's called Dependency Inversion for exactly this reason.</p>
        <h3>Why the use case never sees the implementation</h3>
        <p><code>PlaceOrderUseCase</code> is constructed with an <code>OrderRepository</code> — it has no idea whether that's backed by Postgres, an in-memory map, or a REST call to another service. That ignorance is the payoff: you can swap persistence technology, or run the whole use case against a fake repository in a fast unit test, without touching a single line of business logic.</p>
        <h3>Gateways are not just for databases</h3>
        <p>It's easy to only ever think "gateway = repository" because persistence is the most common example, but the concept is general: <strong>any</strong> boundary to something outside your application's control — a third-party API, a filesystem, a message broker, the system clock — is a candidate for a gateway interface owned by the layer that needs it, implemented by an adapter in an outer layer.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="OrderRepository interface owned by the use case layer with three outer adapters pointing inward: JpaOrderRepository, a payment gateway implementation, and an email gateway implementation, illustrating the general gateway pattern">
            <rect x="250" y="20" width="160" height="50" rx="6" className="accentStroke" fill="none" strokeWidth="2" strokeDasharray="4 3" />
            <text x="330" y="40" textAnchor="middle" fontSize="9">«interface» OrderRepository</text>
            <text x="330" y="55" textAnchor="middle" fontSize="8">owned by usecase.port</text>

            <rect x="30" y="150" width="150" height="50" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="105" y="172" textAnchor="middle" fontSize="9">JpaOrderRepository</text>
            <text x="105" y="187" textAnchor="middle" fontSize="8">adapter.persistence</text>

            <rect x="255" y="150" width="150" height="50" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="330" y="172" textAnchor="middle" fontSize="9">PaymentGateway impl</text>
            <text x="330" y="187" textAnchor="middle" fontSize="8">adapter.payment</text>

            <rect x="480" y="150" width="150" height="50" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="555" y="172" textAnchor="middle" fontSize="9">EmailGateway impl</text>
            <text x="555" y="187" textAnchor="middle" fontSize="8">adapter.notification</text>

            <line x1="105" y1="150" x2="290" y2="72" className="mutedStroke" strokeWidth="1.3" strokeDasharray="3 2" markerEnd="url(#arrowGw)" />
            <line x1="330" y1="150" x2="330" y2="72" className="mutedStroke" strokeWidth="1.3" strokeDasharray="3 2" markerEnd="url(#arrowGw)" />
            <line x1="555" y1="150" x2="370" y2="72" className="mutedStroke" strokeWidth="1.3" strokeDasharray="3 2" markerEnd="url(#arrowGw)" />

            <text x="330" y="230" textAnchor="middle" fontSize="9" className="accentFill">each outer adapter implements an interface it does not own</text>
          </svg>
          <p className="diagramCaption">Gateway interfaces belong to the inner layer; every concrete integration is an outer-layer adapter pointing inward to satisfy it.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The interface lives with the use cases; a JPA-backed implementation lives in the persistence adapter package:</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase.port;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.entity.OrderId;
import java.util.Optional;

public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
}

// --- adapter.persistence package: implements the interface above ---

package com.engineeringdecoded.orders.adapter.persistence;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.entity.OrderId;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class JpaOrderRepository implements OrderRepository {

    private final OrderJpaRepository springDataRepository; // Spring Data JPA interface
    private final OrderEntityMapper mapper;

    public JpaOrderRepository(OrderJpaRepository springDataRepository, OrderEntityMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Order order) {
        springDataRepository.save(mapper.toJpaEntity(order));
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return springDataRepository.findById(id.value()).map(mapper::toDomain);
    }
}`}</code></pre>
        <p><code>PlaceOrderUseCase</code> is wired against <code>OrderRepository</code>, never <code>JpaOrderRepository</code> — swapping Hibernate for a different persistence layer means writing a new adapter, not touching the use case.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Defining the gateway interface next to its implementation</h3><p>Putting <code>OrderRepository</code> in <code>adapter.persistence</code> alongside <code>JpaOrderRepository</code> "since they're related" means the use-case layer now has to depend on the persistence package just to see the interface — the Dependency Rule is broken the moment that import appears.</p></div>
          <div><b>MISTAKE</b><h3>Leaking JPA or SQL concepts into the interface</h3><p>Adding a method like <code>{'findByCriteria(Specification<Order> spec)'}</code> to <code>OrderRepository</code> bakes a Spring Data JPA concept into an interface the use-case layer is supposed to own free of framework knowledge.</p></div>
          <div><b>MISTAKE</b><h3>Treating "gateway" as synonymous with "repository"</h3><p>Only ever reaching for this pattern when talking to a database, then reaching directly for a payment SDK or an email client's concrete class inside a use case, reintroduces the exact coupling the pattern was meant to prevent — just for a different external system.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>You need to call a third-party fraud-check API before an order can be placed. Sketch the gateway interface you'd define, which package it lives in, and which package its concrete HTTP-based implementation lives in — and explain why <code>PlaceOrderUseCase</code> should never import the HTTP client library directly.</p>
        </div>
      </section>
    </div>
  );
}
