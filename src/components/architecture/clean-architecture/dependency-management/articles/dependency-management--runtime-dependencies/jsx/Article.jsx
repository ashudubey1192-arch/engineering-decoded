export default function DependencyManagementRuntimeDependenciesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">At runtime, control absolutely flows outward into the database and the framework — the trick is that the source code never had to say so.</p>
        <p>The previous lesson proved, by reading imports, that <code>PlaceOrderUseCase</code> has zero compile-time knowledge of <code>JpaOrderRepository</code>. And yet when the application runs, calling <code>orderRepository.save(order)</code> absolutely does end up executing <code>JpaOrderRepository</code>'s actual code, which absolutely does talk to a real database. This lesson resolves that apparent contradiction.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Two different graphs, easily confused</h3>
        <p>There are two separate dependency graphs in any running system, and Clean Architecture only makes a claim about one of them:</p>
        <ul>
          <li><strong>The source (compile-time) dependency graph</strong> — which classes a file's imports reference. This is what the Dependency Rule constrains, and it points inward.</li>
          <li><strong>The runtime control-flow graph</strong> — which object's method actually executes, in what order, when the program runs. This routinely points outward, and it has to: a use case that never talked to a repository would never persist anything.</li>
        </ul>
        <p>Confusing these two is the single most common misreading of Clean Architecture. "The use case calls the repository, so the use case depends on the repository, so how can dependencies point inward?" — the resolution is that the use case depends on an <em>interface</em> it owns, and something else, at runtime, supplies an object that happens to implement it.</p>
        <h3>Dependency inversion is the hinge</h3>
        <p>This is the Dependency Inversion Principle doing its job at the architecture level. <code>OrderRepository</code> is an interface that lives in the use case layer — the use case layer defines the contract it needs. <code>JpaOrderRepository</code>, out in the adapter layer, implements that contract. So the <em>source</em> dependency between the interface and its implementer points from the outer class (<code>JpaOrderRepository</code>) inward to the inner one (<code>OrderRepository</code>) — exactly obeying the rule — while at runtime, a call on that interface still ends up inside <code>JpaOrderRepository</code>'s method body. Inversion doesn't eliminate the outward call; it inverts which side owns the contract that call is made through.</p>
        <h3>Following one call through both graphs</h3>
        <p>Trace <code>PlaceOrderUseCase.execute()</code>. In source form, it calls <code>this.orderRepository.save(order)</code> where <code>orderRepository</code> is typed as the interface <code>OrderRepository</code> — the use case's own code never names <code>JpaOrderRepository</code>. At runtime, the object actually sitting in that field, placed there by whatever wired the system up, is a live <code>JpaOrderRepository</code> instance. The JVM dispatches the call polymorphically to that concrete object's <code>save</code> method, which opens a Hibernate session and writes rows. Control absolutely flowed outward, into infrastructure, across an actual JDBC connection — through a door the use case's compiled code never had to open by name.</p>
        <h3>Why this matters practically</h3>
        <p>This is what makes swapping infrastructure a same-day exercise instead of a rewrite. Replace <code>JpaOrderRepository</code> with an in-memory <code>FakeOrderRepository</code> for a test, or with a <code>DynamoOrderRepository</code> for a migration, and <code>PlaceOrderUseCase</code> — the file, the compiled bytecode — does not change one character. Only the object handed to its constructor changes, and that wiring decision lives entirely outside the use case, in the composition root you'll meet in a later lesson.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="A use case box and a JpaOrderRepository box separated by an OrderRepository interface, with one arrow labeled control flow pointing outward and another arrow labeled source dependency pointing inward">
            <rect x="60" y="90" width="170" height="70" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="145" y="120" textAnchor="middle" fontSize="11">PlaceOrderUseCase</text>
            <text x="145" y="136" textAnchor="middle" fontSize="9" className="mutedFill">use case layer</text>

            <rect x="270" y="100" width="100" height="50" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="320" y="122" textAnchor="middle" fontSize="10">OrderRepository</text>
            <text x="320" y="136" textAnchor="middle" fontSize="9" className="mutedFill">interface</text>

            <rect x="410" y="90" width="170" height="70" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="495" y="120" textAnchor="middle" fontSize="11" className="mutedFill">JpaOrderRepository</text>
            <text x="495" y="136" textAnchor="middle" fontSize="9" className="mutedFill">adapter layer</text>

            <defs>
              <marker id="rdOut" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
              <marker id="rdIn" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="mutedFill" />
              </marker>
            </defs>

            <line x1="230" y1="105" x2="405" y2="105" className="accentStroke" strokeWidth="2" markerEnd="url(#rdOut)" />
            <text x="317" y="97" textAnchor="middle" fontSize="9" className="accentFill">control flow (runtime call)</text>

            <line x1="405" y1="145" x2="230" y2="145" className="mutedStroke" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#rdIn)" />
            <text x="317" y="163" textAnchor="middle" fontSize="9" className="mutedFill">source dependency (implements)</text>

            <text x="320" y="30" textAnchor="middle" fontSize="12" className="accentFill">Control flows out. Source dependencies point in.</text>
          </svg>
          <p className="diagramCaption">The runtime call crosses outward through the interface; the implements relationship still points inward.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The same interface, seen from the use case that calls it and the adapter that implements it, makes the split obvious.</p>
        <pre><code>{`// usecase/port/OrderRepository.java — owned by the use case layer
package com.engineeringdecoded.orders.usecase.port;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.entity.OrderId;
import java.util.Optional;

public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
}

// usecase/PlaceOrderUseCase.java — calls the interface, never the implementation
package com.engineeringdecoded.orders.usecase;

public final class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository orderRepository; // source dependency: inward

    public PlaceOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lines());
        orderRepository.save(order); // runtime control flow: outward, into whichever
                                      // implementation was injected
        return new PlaceOrderResponse(order.id());
    }
}

// adapter/persistence/JpaOrderRepository.java — implements the interface
package com.engineeringdecoded.orders.adapter.persistence;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.usecase.port.OrderRepository; // source dependency: inward
import org.springframework.stereotype.Repository;

@Repository
public final class JpaOrderRepository implements OrderRepository {
    // ... talks to Hibernate/JPA here; this is where the call actually lands
}`}</code></pre>
        <p>At compile time, only <code>JpaOrderRepository</code> mentions the other side by name — via <code>implements</code>. At runtime, the call in <code>PlaceOrderUseCase</code> lands inside exactly that class.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>"The use case calls the database, so it depends on it"</h3><p>Conflating a runtime call with a source dependency leads engineers to conclude the Dependency Rule is impossible to satisfy for anything that touches infrastructure — it isn't; the interface is the whole trick.</p></div>
          <div><b>MISTAKE</b><h3>Believing dependency inversion eliminates outward calls</h3><p>It doesn't, and shouldn't — the system still has to persist data. Inversion changes who owns the contract the call goes through, not whether the call happens.</p></div>
          <div><b>MISTAKE</b><h3>Putting the interface in the adapter package "since that's where it's implemented"</h3><p>If <code>OrderRepository</code> lived in <code>adapter.persistence</code> instead of <code>usecase.port</code>, the use case would have to import the adapter package to even see the interface — quietly reintroducing the outward source dependency the whole pattern exists to avoid.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>At runtime, a profiler shows the call stack going <code>PlaceOrderUseCase.execute()</code> → <code>JpaOrderRepository.save()</code> → Hibernate → JDBC. A colleague says this proves the use case "depends on" JPA. Explain precisely what's wrong with that claim, distinguishing the two graphs this lesson covers.</p>
        </div>
      </section>
    </div>
  );
}
