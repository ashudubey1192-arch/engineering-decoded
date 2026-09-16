export default function DesignPrinciplesDependencyInversionPrincipleArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">High-level policy should never depend on low-level detail — both should depend on an abstraction the high-level side owns.</p>
        <p>The Dependency Inversion Principle is the one SOLID principle that Clean Architecture is, quite literally, built out of. Every other lesson in this course — the Dependency Rule, ports and adapters, the humble object pattern — is DIP applied at the scale of an entire system. If you understand this lesson, the rest of the architecture stops looking like a set of arbitrary rules and starts looking like the inevitable consequence of one idea.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>What "inversion" actually inverts</h3>
        <p>Without DIP, the natural way to write software has high-level policy (business logic) calling directly into low-level detail (a database driver, an HTTP client, a file system). Source-code dependencies point the same direction control flows: your use case calls the database code, so your use case's source depends on the database code's source. DIP inverts that: the high-level module defines an abstraction (an interface) that expresses what it needs, the low-level module implements that abstraction, and now the low-level module's source depends on the high-level module's interface — not the other way around. Control still flows from use case to database at runtime, but the source-code dependency arrow now points backwards, toward the high-level policy that owns the interface.</p>
        <h3>Ownership matters as much as the interface itself</h3>
        <p>A common misreading of DIP is "just use an interface." That's necessary but not sufficient — what matters is <em>who defines it</em>. In Clean Architecture, <code>{'OrderRepository'}</code> is declared inside the use-case package (<code>{'com.engineeringdecoded.orders.usecase.port'}</code>), not inside the persistence package. The use-case layer is the high-level policy; it decides, on its own terms, what a repository needs to do for it. The persistence layer — Spring Data JPA, Hibernate, whatever's fashionable next year — implements that interface from the outside. If the interface lived in the persistence package instead, the use case would still be depending on persistence-owned code, and you'd have gained nothing.</p>
        <h3>PlaceOrderUseCase and JpaOrderRepository</h3>
        <p><code>{'PlaceOrderUseCase'}</code> depends only on the <code>{'OrderRepository'}</code> interface — it has no idea Spring or Hibernate exist. <code>{'JpaOrderRepository'}</code> lives in <code>{'com.engineeringdecoded.orders.adapter.persistence'}</code> and implements that interface, translating between the domain <code>{'Order'}</code> and a JPA entity. At runtime, when <code>{'PlaceOrderUseCase'}</code> calls <code>{'orderRepository.save(order)'}</code>, control flows outward into <code>{'JpaOrderRepository'}</code> and down into Hibernate. But in source code, <code>{'JpaOrderRepository'}</code> imports and depends on <code>{'OrderRepository'}</code> — <code>{'PlaceOrderUseCase'}</code> never imports anything from the persistence package. You could delete <code>{'JpaOrderRepository'}</code> entirely, write <code>{'InMemoryOrderRepository'}</code> or <code>{'MongoOrderRepository'}</code> instead, and <code>{'PlaceOrderUseCase'}</code> would not need a single line changed or even a recompile.</p>
        <h3>Why this is the linchpin of the Dependency Rule</h3>
        <p>Clean Architecture's Dependency Rule — source-code dependencies always point inward, toward entities and use cases, never outward toward frameworks and drivers — is only achievable because of DIP. Without it, use cases would necessarily depend directly on frameworks, and "swap the database" or "swap the web framework" would mean rewriting business logic. DIP is the mechanism; the Dependency Rule is DIP applied consistently across every layer boundary in the system.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="Diagram showing PlaceOrderUseCase depending on the OrderRepository interface it owns, with JpaOrderRepository implementing it from below, control flow pointing one way and source dependency pointing the other">
            <rect x="220" y="30" width="200" height="44" rx="6" className="accentStroke" fill="none" />
            <text x="320" y="57" textAnchor="middle" fontSize="12">PlaceOrderUseCase</text>
            <text x="320" y="14" textAnchor="middle" fontSize="10">high-level policy</text>

            <rect x="210" y="120" width="220" height="40" rx="6" className="accentStroke" fill="none" strokeDasharray="4 3" />
            <text x="320" y="140" textAnchor="middle" fontSize="10">«interface» OrderRepository</text>
            <text x="320" y="154" textAnchor="middle" fontSize="9">owned by usecase.port</text>

            <rect x="220" y="210" width="200" height="40" rx="6" className="mutedStroke" fill="none" />
            <text x="320" y="234" textAnchor="middle" fontSize="10">JpaOrderRepository</text>
            <text x="320" y="196" textAnchor="middle" fontSize="9">low-level detail</text>

            <line x1="150" y1="52" x2="150" y2="230" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#dipArrowMuted)" />
            <text x="70" y="145" fontSize="10">control flow</text>

            <line x1="470" y1="230" x2="470" y2="150" className="accentStroke" strokeWidth="1.5" markerEnd="url(#dipArrowAccent)" />
            <text x="480" y="200" fontSize="10">source dependency</text>
            <text x="480" y="214" fontSize="10">(implements)</text>

            <line x1="320" y1="74" x2="320" y2="118" className="accentStroke" strokeWidth="1.5" markerEnd="url(#dipArrowAccent)" />
            <text x="330" y="98" fontSize="9">depends on (owns)</text>

            <defs>
              <marker id="dipArrowMuted" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="mutedFill" />
              </marker>
              <marker id="dipArrowAccent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Control flows from use case down to JPA at runtime; source-code dependency points the opposite way, toward the interface the use case owns.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The interface is declared in the use-case layer and owned by it; the JPA implementation depends on that interface, never the reverse.</p>
        <pre><code>{`// Owned by the high-level policy — lives in the use-case layer
package com.engineeringdecoded.orders.usecase.port;

public interface OrderRepository {
    void save(Order order);
    Order findById(OrderId id);
}

// The high-level module: knows nothing about JPA, Hibernate, or SQL
package com.engineeringdecoded.orders.usecase;

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;
    private final PlaceOrderOutputBoundary outputBoundary;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              PlaceOrderOutputBoundary outputBoundary) {
        this.orderRepository = orderRepository;
        this.outputBoundary = outputBoundary;
    }

    @Override
    public void execute(PlaceOrderRequest request) {
        Order order = new Order(request.orderId(), request.customerId());
        request.lines().forEach(order::addLine);
        order.place();

        orderRepository.save(order); // depends only on the interface above
        outputBoundary.present(new PlaceOrderResponse(order.id(), order.total()));
    }
}

// The low-level module: depends INWARD on the interface it implements
package com.engineeringdecoded.orders.adapter.persistence;

import com.engineeringdecoded.orders.usecase.port.OrderRepository;

public class JpaOrderRepository implements OrderRepository {

    private final SpringDataOrderJpaRepository jpaRepository;
    private final OrderEntityMapper mapper;

    public JpaOrderRepository(SpringDataOrderJpaRepository jpaRepository, OrderEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Order order) {
        OrderJpaEntity entity = mapper.toJpaEntity(order);
        jpaRepository.save(entity);
    }

    @Override
    public Order findById(OrderId id) {
        OrderJpaEntity entity = jpaRepository.findById(id.value())
                .orElseThrow(() -> new OrderNotFoundException(id));
        return mapper.toDomain(entity);
    }
}

// Composition root — the only place that knows both sides exist
package com.engineeringdecoded.orders;

@Configuration
public class OrderModuleConfig {
    @Bean
    public PlaceOrderUseCase placeOrderUseCase(OrderRepository orderRepository,
                                                PlaceOrderOutputBoundary outputBoundary) {
        return new PlaceOrderUseCase(orderRepository, outputBoundary);
    }

    @Bean
    public OrderRepository orderRepository(SpringDataOrderJpaRepository jpaRepository,
                                            OrderEntityMapper mapper) {
        return new JpaOrderRepository(jpaRepository, mapper);
    }
}`}</code></pre>
        <p>Note the import direction: <code>{'JpaOrderRepository'}</code> imports from <code>{'usecase.port'}</code>; nothing in <code>{'usecase'}</code> imports from <code>{'adapter.persistence'}</code>. That single asymmetry is DIP.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Defining the interface next to its implementation</h3><p>Putting <code>{'OrderRepository'}</code> in the persistence package "because that's where repositories live" means the use case still depends on a persistence-owned artifact — the interface exists, but the inversion never happened.</p></div>
          <div><b>MISTAKE</b><h3>Injecting the interface but importing the concrete class elsewhere</h3><p>A use case that takes <code>{'OrderRepository'}</code> in its constructor but references <code>{'JpaOrderRepository'}</code>-specific behavior (a cast, an instanceof check) anywhere in its body has quietly broken the abstraction it appeared to depend on.</p></div>
          <div><b>MISTAKE</b><h3>Treating DIP as only about databases</h3><p>Engineers apply this discipline to repositories and stop there, while letting use cases call a framework's HTTP client, email SDK, or logging library directly — any concrete, volatile dependency deserves the same inversion.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>If <code>{'OrderRepository'}</code> were instead declared inside <code>{'com.engineeringdecoded.orders.adapter.persistence'}</code>, and <code>{'PlaceOrderUseCase'}</code> imported it from there, every method signature could look identical to the example above. What would actually be broken, and how would you notice it the first time someone tries to swap Hibernate for a different persistence technology?</p>
        </div>
      </section>
    </div>
  );
}
