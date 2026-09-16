export default function TestingTestableDesignArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Testability isn't a separate concern you bolt on afterward — in Clean Architecture, it's the direct, structural consequence of obeying the Dependency Rule.</p>
        <p>This lesson closes the testing section by naming what all five previous lessons were actually demonstrating: because business logic in a Clean Architecture system has no framework dependencies, most of your code becomes trivially unit-testable, and the parts that genuinely need infrastructure are small, isolated, and clearly marked. That's the section's real payoff, and it's worth stating explicitly rather than leaving it implicit.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The shape of a typical framework-coupled codebase</h3>
        <p>In a system where business logic lives inside <code>@Service</code> classes that inject JPA repositories directly, or worse, inside JPA entity listeners and controller methods themselves, "writing a test" almost always means "starting a Spring context." Every test — even one meant to check a simple validation rule — pays the cost of container startup, bean wiring, and often a database connection. Teams in this position tend to write fewer tests than they should, because each one is expensive, and they lean on a handful of slow end-to-end tests to cover everything, which makes failures hard to localize and CI runs slow.</p>
        <h3>The shape of a Clean Architecture codebase</h3>
        <p>Walk back through this section's proportions. <code>Order</code>, <code>OrderLine</code>, <code>Money</code> — tested with plain JUnit, no mocks, no context, in microseconds. <code>PlaceOrderUseCase</code> — tested with a hand-written fake or a mock standing in for one interface, still no Spring context, in low milliseconds. Only <code>JpaOrderRepository</code> and <code>OrderController</code> — the adapters, a small fraction of the total codebase — need anything approaching a real framework or database, and even then, scoped tightly (a <code>@DataJpaTest</code> slice, a <code>@WebMvcTest</code> slice, a Testcontainers instance) rather than a full application context. If your business logic is 80% of your codebase, roughly 80% of your tests should be this fast and this simple.</p>
        <h3>Why this is a structural property, not a testing-discipline property</h3>
        <p>It's tempting to think "we just need better test hygiene." But you cannot unit-test <code>Order.cancel()</code> without a Spring context if <code>Order</code> is itself a <code>@Entity</code>-annotated JPA class with lazy-loaded associations — the framework dependency is baked into the class, not into how you chose to test it. Testability here is downstream of design, not a separate skill applied afterward. The Dependency Rule, obeyed consistently, produces testable code as a side effect; testing strategy documents and reminders in a wiki page can't substitute for that structural fact.</p>
        <h3>The testing pyramid, made literal by architecture</h3>
        <p>The classic "testing pyramid" advice — many fast unit tests, fewer integration tests, fewer still end-to-end tests — is usually presented as a goal to aim for through discipline. Clean Architecture makes it close to automatic: entities and use cases (the bulk of your code, and the bulk of your tests) sit at the base, fast and numerous; adapters sit in the thin middle layer, fewer and slower; true end-to-end tests are reserved for the handful of critical paths that genuinely need the whole system running. You don't have to fight your architecture to get this shape — you get it by drawing the boundaries correctly in the first place.</p>
        <h3>What to watch for as a warning sign</h3>
        <p>If your team finds itself reaching for <code>@SpringBootTest</code> as the default answer for "how do I test this class," that's usually not a testing problem — it's a signal the class under test has picked up a framework dependency it shouldn't have. The fix is rarely "write a better test"; it's almost always "move this logic somewhere that doesn't need the framework to exist."</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 280" role="img" aria-label="A pyramid split into three bands: a large bottom band labeled entities and use cases tested with plain JUnit, a smaller middle band labeled adapters tested with integration tests, and a thin top band labeled end to end tests, contrasted with a small inset showing a framework coupled codebase needing a full application context for every test">
            <polygon points="200,230 40,230 120,70" fill="none" className="accentStroke" strokeWidth="2" />
            <line x1="70" y1="180" x2="170" y2="180" className="accentStroke" strokeWidth="1.5" />
            <line x1="95" y1="130" x2="145" y2="130" className="accentStroke" strokeWidth="1.5" />

            <text x="120" y="210" textAnchor="middle" fontSize="8" className="accentFill">entities + use cases</text>
            <text x="120" y="221" textAnchor="middle" fontSize="7" className="mutedFill">plain JUnit, no context</text>

            <text x="120" y="160" textAnchor="middle" fontSize="8" className="accentFill">adapters</text>
            <text x="120" y="171" textAnchor="middle" fontSize="7" className="mutedFill">slice / integration tests</text>

            <text x="120" y="105" textAnchor="middle" fontSize="7" className="accentFill">end to end</text>

            <text x="330" y="150" textAnchor="middle" fontSize="10" className="mutedFill">vs.</text>

            <rect x="400" y="110" width="200" height="120" rx="8" className="mutedStroke" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="500" y="135" textAnchor="middle" fontSize="9" className="mutedFill">framework-coupled codebase</text>
            <text x="500" y="160" textAnchor="middle" fontSize="8" className="mutedFill">@SpringBootTest</text>
            <text x="500" y="175" textAnchor="middle" fontSize="8" className="mutedFill">for almost everything</text>
            <text x="500" y="200" textAnchor="middle" fontSize="8" className="mutedFill">slow, few tests written,</text>
            <text x="500" y="213" textAnchor="middle" fontSize="8" className="mutedFill">coverage gaps hide easily</text>

            <text x="320" y="30" textAnchor="middle" fontSize="12" className="accentFill">Testability is a shape the architecture produces, not a discipline you add on</text>
          </svg>
          <p className="diagramCaption">Most tests in a Clean Architecture codebase are fast and framework-free by construction, not by extra effort.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The same validation rule, implemented two ways, makes the difference concrete: one requires a Spring context to test, the other doesn't.</p>
        <pre><code>{`// Framework-coupled version: the rule lives inside a JPA entity annotated
// class that also carries persistence concerns, forcing every test through
// a persistence context even to check a pure business rule.
@Entity
public class OrderJpaEntity {
    @Id private String id;
    @Enumerated(EnumType.STRING) private OrderStatus status;

    public void cancel() {
        if (status == OrderStatus.SHIPPED) {
            throw new IllegalStateException("Cannot cancel a shipped order");
        }
        this.status = OrderStatus.CANCELLED;
    }
    // Testing cancel() "safely" here tends to mean @DataJpaTest at minimum,
    // because the class is entangled with JPA lifecycle and lazy fields.
}

// Clean Architecture version: the rule lives in a plain entity with a
// SEPARATE JPA-facing class (OrderJpaEntity) built by OrderEntityMapper.
package com.engineeringdecoded.orders.entity;

public final class Order {
    private OrderStatus status;

    public void cancel() {
        if (status == OrderStatus.SHIPPED) {
            throw new IllegalStateException("Cannot cancel a shipped order");
        }
        this.status = OrderStatus.CANCELLED;
    }
}

@Test
void cancellingAShippedOrderThrows() {
    Order order = Order.place(new CustomerId("c1"), someLines());
    order.markShipped();

    assertThatThrownBy(order::cancel).isInstanceOf(IllegalStateException.class);
}
// No @Entity, no @DataJpaTest, no context. Same rule, same coverage,
// a fraction of the cost — because the rule was never framework-coupled
// to begin with.`}</code></pre>
        <p>The business rule is identical in both versions. Only the second one is cheap to test, and that difference traces directly back to whether the class obeys the Dependency Rule.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Measuring test coverage without looking at test cost</h3><p>Two codebases can both report 85% coverage while one runs its suite in 20 seconds and the other in 20 minutes — the difference is almost always how much of that coverage came from framework-coupled tests versus plain-object ones.</p></div>
          <div><b>MISTAKE</b><h3>Adding testability as an afterthought via more mocking</h3><p>When a class is hard to test, reaching for heavier mocking frameworks and more elaborate test setup treats the symptom. The fix that actually holds up is usually to move logic into a class that doesn't depend on the framework in the first place.</p></div>
          <div><b>MISTAKE</b><h3>Assuming this section's lessons are only about testing</h3><p>Treating "testable design" as a testing-team concern misses the point: it's evidence the Dependency Rule is or isn't being followed. A codebase that's hard to test cheaply is, by this section's argument, also a codebase with a dependency-direction problem worth fixing at the architecture level, not just the test level.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your team's test suite is slow, and someone proposes buying a faster CI runner to fix it. Based on everything this testing section covered, what diagnostic question would you ask about the codebase before spending money on faster hardware, and why might the answer matter more than the hardware?</p>
        </div>
      </section>
    </div>
  );
}
