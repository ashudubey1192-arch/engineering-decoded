export default function FrameworksAndDriversDatabaseBoundaryArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Your use cases should be able to save an order without knowing that Hibernate, or even a relational database, exists.</p>
        <p>This lesson mirrors the web framework boundary lesson, but on the persistence side. <code>JpaOrderRepository</code> implements an interface the use-case layer owns, using Spring Data JPA underneath — and the rule is absolute: nothing in <code>usecase</code> ever imports <code>jakarta.persistence</code> or <code>org.springframework.data</code>.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The interface lives on the inside, the implementation lives on the outside</h3>
        <p>This is the clearest instance of the Dependency Inversion Principle in the whole course. <code>OrderRepository</code> is an interface defined inside <code>com.engineeringdecoded.orders.usecase.port</code> — it belongs to the use-case layer, because the use case is what needs it and gets to define its shape. <code>JpaOrderRepository</code> lives out in <code>adapter.persistence</code>, implements that interface, and is the only class in the codebase allowed to know Hibernate exists. Source-code dependencies point from the adapter inward toward the interface; runtime calls flow the other way, from the use case outward through the interface, satisfied by whatever implementation got wired in at startup.</p>
        <h3>Why "the use case never imports javax/jakarta.persistence" is the real test</h3>
        <p>It's easy to say "the database is a detail" and then quietly violate it anyway — the most common leak is annotating the domain <code>Order</code> with <code>{'@Entity'}</code> so it can double as the JPA row mapping (the subject of the Persistence Models lesson later in this section). The concrete, checkable rule for this lesson is narrower and easier to enforce: run a dependency check, or just eyeball imports, in every file under <code>usecase/</code>. If <code>jakarta.persistence.*</code> or <code>org.springframework.data.*</code> shows up anywhere in that package, the boundary has been crossed and the use case is no longer database-independent.</p>
        <h3>What the interactor actually sees</h3>
        <p>From inside <code>PlaceOrderUseCase</code>, saving an order looks like <code>orderRepository.save(order)</code> — a call to a plain Java interface method that takes a domain object and returns nothing framework-specific. Whether that call ends up as an <code>INSERT</code> via Hibernate, a write to DynamoDB, or a line appended to an in-memory list is completely invisible from where the interactor sits. That invisibility is the entire point: it's what makes the database boundary a real, load-bearing wall instead of a diagram-only aspiration.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 240" role="img" aria-label="OrderRepository interface owned by the use case layer, with a dashed boundary line, and JpaOrderRepository on the outside implementing it and depending on Hibernate">
            <rect x="240" y="90" width="180" height="70" rx="6" className="accentStroke" fill="none" />
            <text x="330" y="118" textAnchor="middle" fontSize="12">OrderRepository</text>
            <text x="330" y="136" textAnchor="middle" fontSize="10">(interface, usecase.port)</text>

            <line x1="440" y1="20" x2="440" y2="220" className="mutedStroke" strokeDasharray="5 5" />
            <text x="440" y="15" textAnchor="middle" fontSize="10">boundary</text>

            <rect x="470" y="90" width="170" height="70" rx="6" className="mutedStroke" fill="none" />
            <text x="555" y="112" textAnchor="middle" fontSize="12">JpaOrderRepository</text>
            <text x="555" y="130" textAnchor="middle" fontSize="10">Hibernate / Spring Data</text>

            <line x1="470" y1="125" x2="420" y2="125" className="mutedStroke" markerEnd="url(#arrowD)" strokeDasharray="4 4" />
            <text x="445" y="145" textAnchor="middle" fontSize="9">implements</text>

            <rect x="30" y="90" width="170" height="70" rx="6" className="accentStroke" fill="none" />
            <text x="115" y="118" textAnchor="middle" fontSize="12">PlaceOrderUseCase</text>
            <line x1="200" y1="125" x2="240" y2="125" className="accentStroke" markerEnd="url(#arrowD2)" />
            <text x="220" y="108" textAnchor="middle" fontSize="9">calls</text>

            <text x="330" y="200" textAnchor="middle" fontSize="10">no jakarta.persistence import left of the line</text>

            <defs>
              <marker id="arrowD" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
              <marker id="arrowD2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The use case calls an interface it owns; the JPA-backed implementation sits on the other side of the boundary.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The interactor depends only on <code>OrderRepository</code>. <code>JpaOrderRepository</code> is the sole place Spring Data and Hibernate appear.</p>
        <pre><code>{`// usecase/port/OrderRepository.java — owned by the use-case layer
package com.engineeringdecoded.orders.usecase.port;

public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
}

// usecase/PlaceOrderUseCase.java — no persistence import at all
package com.engineeringdecoded.orders.usecase;

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;

    public PlaceOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lineItems());
        orderRepository.save(order);
        return new PlaceOrderResponse(order.getId(), order.getStatus());
    }
}

// adapter/persistence/JpaOrderRepository.java — the only file that knows JPA exists
package com.engineeringdecoded.orders.adapter.persistence;

@Repository
public class JpaOrderRepository implements OrderRepository {

    private final SpringDataOrderJpaRepository jpaRepository;
    private final OrderEntityMapper mapper;

    public JpaOrderRepository(SpringDataOrderJpaRepository jpaRepository, OrderEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Order order) {
        jpaRepository.save(mapper.toJpaEntity(order));
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }
}`}</code></pre>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Defining the repository interface in the adapter package</h3><p>Putting <code>OrderRepository</code> next to <code>JpaOrderRepository</code> instead of in <code>usecase.port</code> inverts ownership and quietly ties the use case to whichever adapter happens to define it.</p></div>
          <div><b>MISTAKE</b><h3>Returning JPA entities from the interface</h3><p>Declaring <code>OrderRepository.save(OrderJpaEntity)</code> instead of <code>save(Order)</code> forces persistence types into every caller, including the use case.</p></div>
          <div><b>MISTAKE</b><h3>Leaking Spring Data query derivation into use cases</h3><p>Calling a generated <code>SpringDataOrderJpaRepository</code> method directly from a use case, "just this once," bypasses the boundary and makes the next database swap far more painful.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate wants <code>PlaceOrderUseCase</code> to call <code>orderRepository.findByStatusAndCreatedAtBefore(...)</code>, a method Spring Data JPA generates automatically from its name. What's wrong with adding that exact signature to the <code>OrderRepository</code> interface?</p>
        </div>
      </section>
    </div>
  );
}
