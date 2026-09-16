export default function TestingTestingUseCasesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A use case test still needs no Spring context — it just needs a fake standing in for the one interface the use case actually depends on.</p>
        <p>Use cases are one ring out from entities, and they do have a collaborator — a repository, a gateway — but critically, that collaborator is an interface the use case layer itself owns. This lesson shows how that fact turns "testing business logic that touches persistence" into a plain, fast, frameworkless unit test.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>What makes a use case testable without infrastructure</h3>
        <p><code>PlaceOrderUseCase</code> depends on <code>OrderRepository</code> — an interface with methods like <code>save</code> and <code>findById</code>. Because it's an interface, any class that implements it will do, including one written purely for tests. Swap in a fake, exercise the use case's real logic, and assert on what the fake recorded. None of this requires Hibernate, a running database, or a Spring context — the use case's own constructor takes plain objects.</p>
        <h3>Hand-written fake vs. Mockito mock</h3>
        <p>Two common approaches, both valid:</p>
        <ul>
          <li>A <strong>hand-written fake</strong> — a small class implementing <code>OrderRepository</code> with an in-memory <code>Map</code>. It behaves like a real (if trivial) repository: <code>save</code> then <code>findById</code> actually returns what you saved. Fakes tend to produce more realistic, less brittle tests because they encode real behavior instead of pre-programmed answers.</li>
          <li>A <strong>Mockito mock</strong> — <code>mock(OrderRepository.class)</code>, then <code>verify(orderRepository).save(any())</code>. Faster to write for one-off assertions, but easy to over-specify (asserting on exact call sequences that shouldn't matter) or under-specify (never actually checking what got saved).</li>
        </ul>
        <p>Both approaches share the essential property that matters here: neither one requires a real database, and neither requires the interface's real implementation to exist yet.</p>
        <h3>The layer boundary this test respects</h3>
        <p>A use case test exercises real entity code (<code>Order.place()</code> genuinely runs) plus the real use case logic, while only the repository — the one thing actually pointing at outside infrastructure — gets replaced. This is precisely the boundary the Dependency Rule draws: everything inward of the port is real in the test; the port's real implementation, which lives outward, is not needed to prove the use case's logic is correct.</p>
        <h3>What this test proves, and what it doesn't</h3>
        <p>A green use case test proves: given a request, the use case constructs the right domain objects, applies the right rules, and calls the repository with the right arguments in the right circumstances. It does not prove that <code>JpaOrderRepository</code> actually persists correctly against a real database — that's the next lesson's job, and deliberately a different kind of test.</p>
        <h3>Why no Spring context is needed here either</h3>
        <p>Because <code>PlaceOrderUseCase</code> takes its dependencies through a plain constructor (see the Dependency Injection lesson), a test can call <code>new PlaceOrderUseCase(fakeRepository)</code> directly. No <code>@SpringBootTest</code>, no <code>ApplicationContext</code>, no component scanning — the same fact that makes constructor injection good production design makes it good test design for free.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="Four concentric circles with Entities and Use Cases in accent color and Adapters and Frameworks muted, with a fake OrderRepository box sitting at the use case ring boundary standing in for the real adapter">
            <circle cx="320" cy="130" r="110" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="130" r="82" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="130" r="54" fill="none" className="accentStroke" strokeWidth="2" />
            <circle cx="320" cy="130" r="26" fill="none" className="accentStroke" strokeWidth="2" />

            <text x="320" y="133" textAnchor="middle" fontSize="9" className="accentFill">Entities</text>
            <text x="320" y="92" textAnchor="middle" fontSize="9" className="accentFill">Use Cases</text>
            <text x="320" y="64" textAnchor="middle" fontSize="9" className="mutedFill">Adapters</text>
            <text x="320" y="36" textAnchor="middle" fontSize="9" className="mutedFill">Frameworks</text>

            <rect x="415" y="112" width="140" height="36" rx="6" className="accentStroke" fill="none" strokeWidth="2" strokeDasharray="4 3" />
            <text x="485" y="132" textAnchor="middle" fontSize="9" className="accentFill">FakeOrderRepository</text>

            <defs>
              <marker id="tuArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="415" y1="130" x2="376" y2="130" className="accentStroke" strokeWidth="1.5" markerEnd="url(#tuArrow)" />

            <text x="320" y="20" textAnchor="middle" fontSize="12" className="accentFill">Real entities, real use case, a fake standing in at the port</text>
          </svg>
          <p className="diagramCaption">The test swaps only the OrderRepository implementation; entity and use-case code run unmodified.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A hand-written fake repository, followed by a use case test built on it — no Spring, no Mockito required, though Mockito would work equally well here.</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.entity.OrderId;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

final class FakeOrderRepository implements OrderRepository {
    private final Map<OrderId, Order> orders = new HashMap<>();

    @Override
    public void save(Order order) {
        orders.put(order.id(), order);
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return Optional.ofNullable(orders.get(id));
    }

    Order savedOrder() {
        return orders.values().iterator().next();
    }
}

class PlaceOrderUseCaseTest {

    private final FakeOrderRepository orderRepository = new FakeOrderRepository();
    private final PlaceOrderUseCase useCase = new PlaceOrderUseCase(orderRepository);

    @Test
    void placingAnOrderSavesItWithTheRequestedLines() {
        PlaceOrderRequest request = new PlaceOrderRequest(
            "cust-42", List.of(new OrderLineRequest("SKU-1", 3)));

        PlaceOrderResponse response = useCase.execute(request);

        Order saved = orderRepository.savedOrder();
        assertThat(saved.id()).isEqualTo(response.orderId());
        assertThat(saved.lines()).hasSize(1);
    }

    @Test
    void placingAnOrderWithNoLinesDoesNotReachTheRepository() {
        PlaceOrderRequest request = new PlaceOrderRequest("cust-42", List.of());

        assertThatThrownBy(() -> useCase.execute(request))
            .isInstanceOf(IllegalArgumentException.class);
        assertThat(orderRepository.savedOrder()).isNull(); // never called save()
    }
}`}</code></pre>
        <p>No <code>@SpringBootTest</code>, no test container, no real database — <code>PlaceOrderUseCaseTest</code> runs as fast as a plain JUnit test because that's exactly what it is.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Spinning up a real database "to be safe"</h3><p>Standing up Testcontainers just to test <code>PlaceOrderUseCase</code>'s validation logic tests the wrong thing at the wrong layer, and slows the suite down for zero added confidence about the use case's actual behavior.</p></div>
          <div><b>MISTAKE</b><h3>Over-specifying interaction order with a mock</h3><p>Asserting the exact sequence and number of calls to <code>orderRepository.save()</code> when the use case's contract doesn't actually promise an order — locking the test to an implementation detail that will break on a harmless refactor.</p></div>
          <div><b>MISTAKE</b><h3>Skipping the use case layer and only writing entity and adapter tests</h3><p>Entity tests prove rules hold in isolation; adapter tests prove persistence works. Neither one proves the use case actually calls the repository correctly at the right moments — that coverage only exists if you write it here.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p><code>PlaceOrderUseCaseTest</code> passes using <code>FakeOrderRepository</code>. Does this test give you any confidence that <code>JpaOrderRepository</code>, the real production implementation, correctly persists an order? Explain what this test does and doesn't cover, and name the lesson topic that closes the gap.</p>
        </div>
      </section>
    </div>
  );
}
