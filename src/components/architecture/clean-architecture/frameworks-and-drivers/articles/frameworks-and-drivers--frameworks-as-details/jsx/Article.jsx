export default function FrameworksAndDriversFrameworksAsDetailsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A framework is a tool you use, not a foundation you build your business rules on top of.</p>
        <p>This lesson opens the outermost ring of Clean Architecture: Frameworks and Drivers. Spring, Hibernate, React, Kafka clients — all of it belongs out here, at arm's length from your entities and use cases. The point isn't that frameworks are bad; it's that they're replaceable implementation details, and the moment your business logic can't survive without one, you've inverted the relationship that's supposed to protect you.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The framework author's opinion isn't your architecture</h3>
        <p>Every framework has an opinion about how your application should be structured — where classes go, what they extend, what annotations they need. Robert C. Martin's warning in <em>Clean Architecture</em> is blunt: frameworks are not architectures, and if you let a framework's conventions dictate your object model, you've handed your architecture over to a third party you don't control and didn't design. That third party has its own release cycle, its own opinions about upgrades, and its own reasons to eventually break compatibility.</p>
        <p>The tell is what Martin calls <strong>marrying the framework</strong>: entities that extend a framework base class, domain objects annotated with <code>{'@Entity'}</code> so Hibernate can manage them, services wired together only through <code>{'@Autowired'}</code> fields that can't be constructed without a Spring container running. Once you've done that, you can no longer instantiate an <code>Order</code> in a plain unit test without booting infrastructure. You can't move the class to another project without dragging the framework's dependency graph with it. You can't swap frameworks later without rewriting the very code that encodes your business rules — the code that should have been the most stable, most protected part of the system.</p>
        <h3>Use it, don't marry it</h3>
        <p>The alternative isn't "avoid Spring" — it's "keep Spring at the edges." Let Spring MVC handle HTTP, let Spring Data JPA handle SQL, let Spring's dependency injection wire your composition root. None of that requires your <code>Order</code> entity or your <code>PlaceOrderUseCase</code> interactor to know Spring exists. Framework annotations belong on adapter classes that exist specifically to talk to the framework — never on the plain Java objects that express what an order <em>is</em> and what placing one <em>means</em>.</p>
        <p>This is also a late-binding decision in disguise (covered in more depth later in this section): treating a framework as a detail is what lets you defer choosing it, upgrade it independently of your business rules, or rip it out entirely, because nothing at the center of the system has a compile-time dependency pointing outward at it.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="A framework box at the outer edge with a one-way arrow pointing away from the business rules, showing the framework depends on nothing at the center">
            <rect x="40" y="90" width="160" height="80" rx="6" className="mutedStroke" fill="none" />
            <text x="120" y="120" textAnchor="middle">Spring MVC</text>
            <text x="120" y="140" textAnchor="middle" fontSize="11">Hibernate / JPA</text>
            <text x="120" y="60" textAnchor="middle" fontSize="12">frameworks &amp; drivers</text>

            <line x1="200" y1="130" x2="300" y2="130" className="mutedStroke" markerEnd="url(#arrow1)" strokeDasharray="4 4" />
            <text x="250" y="118" textAnchor="middle" fontSize="10">config only</text>

            <rect x="320" y="90" width="160" height="80" rx="6" className="accentStroke" fill="none" />
            <text x="400" y="120" textAnchor="middle">Order</text>
            <text x="400" y="140" textAnchor="middle" fontSize="11">PlaceOrderUseCase</text>
            <text x="400" y="60" textAnchor="middle" fontSize="12">business rules</text>

            <line x1="480" y1="130" x2="580" y2="130" className="mutedStroke" strokeDasharray="4 4" />
            <text x="530" y="118" textAnchor="middle" fontSize="10">no dependency</text>
            <text x="560" y="150" fontSize="16">✕</text>

            <defs>
              <marker id="arrow1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Frameworks configure the business rules from the outside; the business rules never reach back to depend on the framework.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Compare a married entity with a plain one. The first can't exist without Spring and Hibernate on the classpath; the second is just Java.</p>
        <pre><code>{`// DON'T — the entity is married to the framework
@Entity
@Table(name = "orders")
public class OrderMarriedToFramework {
    @Id
    @GeneratedValue
    private Long id;

    @Autowired
    private transient EmailService emailService; // field injection into a domain object

    public void place() {
        // business rule tangled with a framework-managed dependency
        emailService.send("Order placed");
    }
}

// DO — the entity has zero framework knowledge
package com.engineeringdecoded.orders.entity;

public final class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private OrderStatus status;

    public Order(OrderId id, CustomerId customerId) {
        this.id = id;
        this.customerId = customerId;
        this.status = OrderStatus.DRAFT;
    }

    public void place() {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Only a draft order can be placed");
        }
        this.status = OrderStatus.PLACED;
    }
}`}</code></pre>
        <p>The plain <code>Order</code> constructs and tests in milliseconds, no Spring context required, and can be reused unchanged if the team ever migrates off Spring entirely.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Annotating entities for convenience</h3><p>Slapping <code>{'@Entity'}</code> on the domain <code>Order</code> to save writing a mapper class seems efficient today and costs a rewrite the day the database changes.</p></div>
          <div><b>MISTAKE</b><h3>Field-injecting into business objects</h3><p>Using <code>{'@Autowired'}</code> fields inside entities or interactors makes them impossible to construct without a running container, killing fast unit tests.</p></div>
          <div><b>MISTAKE</b><h3>Treating the framework's structure as "the architecture"</h3><p>Organizing packages around Spring's conventions (<code>controller</code>, <code>service</code>, <code>repository</code>) instead of around dependency direction hides where the real boundaries are.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your <code>Order</code> entity currently has no framework annotations, but a teammate proposes adding <code>{'@Entity'}</code> directly to it "just to save writing <code>OrderJpaEntity</code>." What specifically breaks, six months from now, if the team agrees?</p>
        </div>
      </section>
    </div>
  );
}
