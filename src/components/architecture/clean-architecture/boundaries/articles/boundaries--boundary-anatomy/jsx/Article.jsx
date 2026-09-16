export default function BoundariesBoundaryAnatomyArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Every real boundary has the same three moving parts — an interface owned by the inner side, an implementation on the outer side, and data that crosses as plain structures, never as entities.</p>
        <p>Once you've decided where a boundary belongs, you still have to build it correctly, and that's a mechanical skill, not a judgment call. This lesson takes the boundary apart into its anatomy: who owns the contract, who implements it, which direction the source code points, and what's actually allowed to travel across the line. Understanding this shape is what lets you look at any two collaborating classes and tell, at a glance, whether there's a real boundary between them or just an interface-shaped illusion of one.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The interface belongs to the inner side</h3>
        <p>In Clean Architecture, the higher-level, more policy-rich side of a boundary owns the interface — not the side that happens to implement it. <code>{'PlaceOrderUseCase'}</code> needs to persist an <code>{'Order'}</code>, so the use-case layer defines <code>{'OrderRepository'}</code> as an interface, in its own package. The persistence layer doesn't get a vote on the contract's shape; it only gets to satisfy it. Ownership here isn't a style preference — it's what makes the use case compilable and testable without a database ever existing.</p>
        <h3>Control flow and source code point in opposite directions</h3>
        <p>At runtime, control still flows from the use case outward: the interactor calls a method on <code>{'OrderRepository'}</code>, and execution jumps into whatever implementation was wired in — say, <code>{'JpaOrderRepository'}</code>. But the source-code dependency runs the other way: <code>{'JpaOrderRepository'}</code> imports and implements the <code>{'OrderRepository'}</code> interface; the interface never imports anything from the persistence package. This split is achieved through ordinary dynamic polymorphism — no framework magic required, just an interface and a class that implements it, wired together elsewhere. It's the mechanism that lets you draw a boundary in the first place: without it, calling "outward" would force a source dependency outward too, and the whole point of the boundary collapses.</p>
        <h3>Data crosses as simple structures, not entities</h3>
        <p>What travels across the boundary matters as much as which direction the arrows point. A repository method takes and returns domain-shaped values — an <code>{'Order'}</code>, an <code>{'OrderId'}</code> — not a framework's live, lazy-loading, annotation-laden entity. The moment a <code>{'@Entity'}</code>-annotated JPA class crosses back into use-case code, the "boundary" is cosmetic: the use case is now coupled to Hibernate's behavior whether or not it imports Hibernate's package directly.</p>
        <h3>Why this shape, specifically</h3>
        <p>Put together, these three rules guarantee something concrete: you can compile, instantiate, and unit-test <code>{'PlaceOrderUseCase'}</code> with a hand-written fake <code>{'OrderRepository'}</code> and never touch a database, a connection pool, or Spring. That's the practical payoff of getting the anatomy right, and it's the test you can run on any boundary you're unsure about — can the inner side run alone?</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="Boundary anatomy diagram: the use case layer owns the OrderRepository interface on the boundary line, the persistence layer implements it, control flows rightward while the source code dependency arrow points back left">
            <rect x="20" y="40" width="260" height="170" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="150" y="65" textAnchor="middle" fontSize="14" fontWeight="600">Use Case Layer</text>
            <text x="150" y="105" textAnchor="middle" fontSize="12">PlaceOrderUseCase</text>

            <rect x="255" y="130" width="150" height="46" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="330" y="149" textAnchor="middle" fontSize="11" fontWeight="600">OrderRepository</text>
            <text x="330" y="163" textAnchor="middle" fontSize="10" className="mutedFill">interface (owned here)</text>

            <line x1="410" y1="30" x2="410" y2="220" className="mutedStroke" strokeWidth="2" strokeDasharray="6 6" />

            <rect x="420" y="40" width="220" height="170" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="530" y="65" textAnchor="middle" fontSize="14" fontWeight="600">Persistence Layer</text>
            <rect x="450" y="125" width="160" height="46" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="530" y="144" textAnchor="middle" fontSize="11" fontWeight="600">JpaOrderRepository</text>
            <text x="530" y="158" textAnchor="middle" fontSize="10" className="mutedFill">implementation</text>

            <path d="M150 153 L255 153" className="accentStroke" strokeWidth="2" markerEnd="url(#flowArrow)" fill="none" />
            <text x="195" y="145" textAnchor="middle" fontSize="9" className="mutedFill">control flow</text>

            <path d="M450 190 C 360 210, 340 190, 335 178" className="mutedStroke" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#depArrow)" fill="none" />
            <text x="400" y="210" textAnchor="middle" fontSize="9" className="mutedFill">implements (source dependency)</text>

            <text x="330" y="235" textAnchor="middle" fontSize="11" className="mutedFill">Data crossing both ways: Order, OrderId — never OrderJpaEntity</text>

            <defs>
              <marker id="flowArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0 0 L8 4 L0 8 Z" className="accentFill" />
              </marker>
              <marker id="depArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0 0 L8 4 L0 8 Z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Control flows outward at runtime; the source-code dependency arrow points back inward through the interface the use case owns.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The interface lives in the use-case layer's own port package; the implementation lives in the outer persistence package and depends inward on it — never the reverse.</p>
        <pre><code>{`// use-case layer — owns the contract
package com.engineeringdecoded.orders.usecase.port;

public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
}

// persistence layer — depends inward, implements the contract
package com.engineeringdecoded.orders.adapter.persistence;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.entity.OrderId;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;

public class JpaOrderRepository implements OrderRepository {

    private final SpringDataOrderJpaRepository jpaRepository;
    private final OrderEntityMapper mapper;

    public JpaOrderRepository(SpringDataOrderJpaRepository jpaRepository,
                               OrderEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Order order) {
        jpaRepository.save(mapper.toJpaEntity(order));
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.value())
            .map(mapper::toDomain);
    }
}`}</code></pre>
        <p><code>{'OrderEntityMapper'}</code> is the seam that keeps <code>{'OrderJpaEntity'}</code> from ever crossing back into the use-case layer — only the plain <code>{'Order'}</code> does.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Interface defined in the wrong package</h3><p>Putting <code>{'OrderRepository'}</code> in the persistence package "because that's where repositories live" flips ownership — the use case now imports from the persistence layer, and the dependency points the wrong way even though the code still runs.</p></div>
          <div><b>MISTAKE</b><h3>Letting the JPA entity leak inward</h3><p>Returning <code>{'OrderJpaEntity'}</code> straight from a repository method saves writing a mapper today, but it means the use-case layer now implicitly depends on Hibernate's lazy-loading and annotation behavior — the interface stopped being a real boundary the moment that type crossed it.</p></div>
          <div><b>MISTAKE</b><h3>Treating the inversion as optional ceremony</h3><p>Skipping the interface and having <code>{'PlaceOrderUseCase'}</code> call <code>{'JpaOrderRepository'}</code> directly "since there's only one implementation anyway" removes the only thing making the use case unit-testable without a database, and removes the seam the next lesson's crossing depends on.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>If <code>{'OrderRepository'}</code> were moved into <code>{'com.engineeringdecoded.orders.adapter.persistence'}</code> instead of <code>{'usecase.port'}</code>, the code would still compile and behave identically. What, specifically, breaks about the boundary's anatomy, and what would you no longer be able to do with <code>{'PlaceOrderUseCase'}</code> as a result?</p>
        </div>
      </section>
    </div>
  );
}
