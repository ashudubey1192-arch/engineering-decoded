export default function TestingTestingEntitiesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Entities are the cheapest thing in your system to test well — and if they aren't, something upstream has already broken the architecture.</p>
        <p>This lesson opens the testing section by starting at the center of the circle: <code>Order</code>, <code>OrderLine</code>, <code>Money</code>. Because entities have zero framework dependencies by construction, testing them requires nothing but JUnit and the object under test — no mocks, no Spring context, no database. That simplicity isn't an accident of this particular example; it's the payoff of everything the Dependency Management section just covered.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Entities are plain Java objects, so their tests are plain Java tests</h3>
        <p>An entity like <code>Order</code> has no <code>@Entity</code> annotation, no <code>@Autowired</code> field, no reference to anything outside <code>java.*</code> and its own package. That means a test for it needs nothing beyond <code>new Order(...)</code> and assertions — no test slice, no <code>@SpringBootTest</code>, no container to start. This is the direct, practical consequence of the Dependency Rule: because <code>Order.java</code>'s compile-time dependencies point nowhere but inward, the test for it inherits that same simplicity.</p>
        <h3>What an entity test should actually verify</h3>
        <p>Entity tests exist to prove the business rules the entity enforces — invariants, valid state transitions, calculations. For <code>Order</code>: can you cancel a shipped order (no, and it should throw)? Does adding a line to a cancelled order fail? Does the order total sum its lines correctly, respecting currency? These are pure functions of state and input — no I/O, no timing, no external system — which makes them fast (microseconds, not milliseconds) and deterministic (the same input always produces the same result, forever).</p>
        <h3>No mocks, and that's a feature, not a gap</h3>
        <p>Mocking exists to stand in for a collaborator you don't want the real version of in a test. Entities mostly don't have collaborators — <code>Order</code> doesn't call out to <code>OrderRepository</code> or any port; it just holds and validates its own state. If you find yourself reaching for Mockito inside an entity test, that's usually a sign the entity has picked up a dependency it shouldn't have (a repository reference, a clock service, a framework type) — worth investigating rather than mocking around.</p>
        <h3>Why this matters beyond the entity itself</h3>
        <p>Entity tests are the cheapest, fastest, most reliable tests in the whole suite, which makes them the right place to push as much business-rule coverage as possible. A codebase where validation logic has leaked into controllers or JPA entity listeners loses this — suddenly testing "can you cancel a shipped order" requires a running web layer or a database, for a rule that has nothing to do with either. Keeping that rule inside <code>Order.cancel()</code> is what keeps its test this simple.</p>
        <h3>What "green" here actually proves</h3>
        <p>A passing entity test suite tells you the business rules are internally consistent — it does not tell you the system persists orders correctly, or that the API accepts the right JSON. Those are separate concerns tested by separate strategies later in this section (adapters, boundaries). Entity tests are necessary but not sufficient, and knowing exactly what they do and don't prove is part of using them well.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="Four concentric circles with only the innermost Entities ring in accent color and a JUnit test icon pointed directly at it, the other three rings muted and grayed out">
            <circle cx="320" cy="130" r="110" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="130" r="82" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="130" r="54" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="130" r="26" fill="none" className="accentStroke" strokeWidth="2.5" />

            <text x="320" y="133" textAnchor="middle" fontSize="9" className="accentFill">Entities</text>
            <text x="320" y="92" textAnchor="middle" fontSize="9" className="mutedFill">Use Cases</text>
            <text x="320" y="64" textAnchor="middle" fontSize="9" className="mutedFill">Adapters</text>
            <text x="320" y="36" textAnchor="middle" fontSize="9" className="mutedFill">Frameworks</text>

            <rect x="270" y="200" width="100" height="34" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="320" y="222" textAnchor="middle" fontSize="10" className="accentFill">JUnit 5 test</text>

            <defs>
              <marker id="teArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="320" y1="200" x2="320" y2="158" className="accentStroke" strokeWidth="2" markerEnd="url(#teArrow)" />

            <text x="320" y="20" textAnchor="middle" fontSize="12" className="accentFill">No mocks, no Spring context — just the object and the test</text>
          </svg>
          <p className="diagramCaption">A plain JUnit test reaches only the innermost ring; the outer three layers are irrelevant to it.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A JUnit 5 test for <code>Order.cancel()</code>, covering both the valid path and the invariant that a shipped order can't be cancelled.</p>
        <pre><code>{`package com.engineeringdecoded.orders.entity;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderTest {

    @Test
    void cancellingAPendingOrderMarksItCancelled() {
        Order order = Order.place(new CustomerId("cust-1"), someLines());

        order.cancel();

        assertThat(order.status()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void cancellingAShippedOrderThrows() {
        Order order = Order.place(new CustomerId("cust-1"), someLines());
        order.markShipped(); // moves the order into SHIPPED for this test

        assertThatThrownBy(order::cancel)
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Cannot cancel a shipped order");
    }

    @Test
    void placingAnOrderWithNoLinesThrows() {
        assertThatThrownBy(() -> Order.place(new CustomerId("cust-1"), List.of()))
            .isInstanceOf(IllegalArgumentException.class);
    }

    private List<OrderLine> someLines() {
        return List.of(new OrderLine("SKU-1", 2, Money.of(19, 99)));
    }
}

// No @SpringBootTest. No @Mock. No database. Runs in under a millisecond.`}</code></pre>
        <p>Every assertion here checks a business rule stated in <code>Order</code> itself — nothing about HTTP, persistence, or Spring appears anywhere in the test.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Reaching for @SpringBootTest out of habit</h3><p>Copy-pasting a Spring test slice onto an entity test because "that's how we always write tests" adds seconds of container startup to a test that needs none of it, and multiplies across hundreds of entity tests into minutes of wasted CI time.</p></div>
          <div><b>MISTAKE</b><h3>Mocking collaborators the entity doesn't actually have</h3><p>If a test mocks something to construct an <code>Order</code>, check whether <code>Order</code> has picked up a dependency it shouldn't — a well-formed entity rarely needs a mock at all.</p></div>
          <div><b>MISTAKE</b><h3>Testing getters and setters instead of behavior</h3><p>Asserting that <code>order.getStatus()</code> returns whatever was just set provides near-zero value. The tests that matter exercise the entity's actual invariants and transitions, like the invalid-cancellation case above.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate writes a test for <code>Order</code> that needs to mock an <code>OrderRepository</code> to make the test pass. What does that tell you about where <code>Order</code>'s code actually lives architecturally, and what would you look for first to fix it?</p>
        </div>
      </section>
    </div>
  );
}
