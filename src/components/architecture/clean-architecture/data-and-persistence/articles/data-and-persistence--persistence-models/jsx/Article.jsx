export default function DataAndPersistencePersistenceModelsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Your domain object and your database row are two different things wearing the same name — give them two different classes.</p>
        <p>It's tempting to put <code>{'@Entity'}</code>, <code>{'@Id'}</code>, and <code>{'@Column'}</code> straight onto the domain <code>Order</code> and skip writing a second class. This lesson explains why that shortcut costs more than it saves, and why <code>OrderJpaEntity</code> should exist as its own class, separate from <code>Order</code>, even though at first glance they look almost identical.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Two objects, two jobs</h3>
        <p>The domain <code>Order</code> exists to enforce business rules: it guarantees you can't add a line to a cancelled order, it computes a total, it protects its own invariants through methods like <code>place()</code> and <code>cancel()</code>. <code>OrderJpaEntity</code> exists for an entirely different reason: to describe how order data is laid out in a relational table so Hibernate can read and write rows. Those are two separate responsibilities, and the Single Responsibility Principle's real test — "does this class have more than one reason to change?" — says plainly they should be two separate classes. A change to your table schema (a new column, a renamed foreign key) is a reason <code>OrderJpaEntity</code> changes. A change to business rules (orders now require a minimum line count) is a reason <code>Order</code> changes. Merging them means either change can accidentally ripple into the other.</p>
        <h3>What framework annotations actually demand of a class</h3>
        <p>JPA entities have constraints the framework imposes: a no-arg constructor, mutable fields (or careful workarounds) for Hibernate to populate via reflection, identity semantics tied to <code>{'@Id'}</code>, and often lazy-loaded associations that behave differently inside and outside a session. None of those constraints have anything to do with what makes a good domain model — which usually wants immutability where possible, constructors that enforce invariants, and behavior-rich methods rather than getters and setters. Trying to satisfy both sets of constraints in one class means compromising one, usually the domain model, because the framework's requirements are non-negotiable and the domain's are "just good practice."</p>
        <h3>The mapper is the cost of this separation, and it's a cheap one</h3>
        <p>Having two classes means something has to translate between them — that's the subject of the next lesson, <code>OrderEntityMapper</code>. Some engineers see that translation code as pure overhead. It isn't: it's a small, mechanical, easily tested piece of code that buys you a domain model untouched by persistence concerns and a persistence model untouched by business rules. The alternative — one merged class — doesn't eliminate the mapping problem, it just hides it, usually until the day the database schema needs to diverge from the domain shape for a completely valid database reason, and now every business-rule change also risks silently breaking the schema, or vice versa.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 240" role="img" aria-label="Two separate boxes side by side, Order on the left with domain methods, OrderJpaEntity on the right with JPA annotations, connected by a small mapper box between them rather than merged into one class">
            <rect x="40" y="70" width="200" height="100" rx="6" className="accentStroke" fill="none" />
            <text x="140" y="95" textAnchor="middle" fontSize="12">Order</text>
            <text x="140" y="112" textAnchor="middle" fontSize="10">place() / cancel()</text>
            <text x="140" y="128" textAnchor="middle" fontSize="10">addLine() / total()</text>
            <text x="140" y="150" textAnchor="middle" fontSize="9">plain Java, no annotations</text>

            <rect x="270" y="95" width="120" height="50" rx="5" className="mutedStroke" fill="none" />
            <text x="330" y="115" textAnchor="middle" fontSize="10">OrderEntityMapper</text>
            <text x="330" y="130" textAnchor="middle" fontSize="9">toDomain / toJpaEntity</text>

            <line x1="240" y1="120" x2="270" y2="120" className="mutedStroke" markerEnd="url(#arrowP)" />
            <line x1="390" y1="120" x2="420" y2="120" className="mutedStroke" markerEnd="url(#arrowP)" />

            <rect x="420" y="70" width="200" height="100" rx="6" className="mutedStroke" fill="none" />
            <text x="520" y="95" textAnchor="middle" fontSize="12">OrderJpaEntity</text>
            <text x="520" y="112" textAnchor="middle" fontSize="10">@Entity @Id @Column</text>
            <text x="520" y="128" textAnchor="middle" fontSize="10">getters / setters</text>
            <text x="520" y="150" textAnchor="middle" fontSize="9">shaped for the table, not the rules</text>

            <defs>
              <marker id="arrowP" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Two classes, one small mapper between them — not one class trying to satisfy both jobs.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Side by side, notice how little the two classes have in common besides field names — one enforces behavior, the other describes a table row.</p>
        <pre><code>{`package com.engineeringdecoded.orders.entity;

// Domain entity — enforces invariants, zero framework knowledge
public final class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> lines = new ArrayList<>();
    private OrderStatus status;

    public Order(OrderId id, CustomerId customerId) {
        this.id = id;
        this.customerId = customerId;
        this.status = OrderStatus.DRAFT;
    }

    public void addLine(OrderLine line) {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify a placed order");
        }
        lines.add(line);
    }

    public Money total() {
        return lines.stream().map(OrderLine::lineTotal).reduce(Money.ZERO, Money::add);
    }
}

package com.engineeringdecoded.orders.adapter.persistence;

// Persistence model — describes a table row, no business rules
@Entity
@Table(name = "orders")
public class OrderJpaEntity {

    @Id
    private String id;

    @Column(name = "customer_id")
    private String customerId;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLineJpaEntity> lines = new ArrayList<>();

    protected OrderJpaEntity() { } // required by Hibernate

    public OrderJpaEntity(String id, String customerId, OrderStatus status) {
        this.id = id;
        this.customerId = customerId;
        this.status = status;
    }

    // getters and setters Hibernate uses via reflection
}`}</code></pre>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Annotating the domain entity to save a class</h3><p>Adding <code>{'@Entity'}</code> directly to <code>Order</code> forces a no-arg constructor and mutable fields onto a class designed around immutability and invariant enforcement.</p></div>
          <div><b>MISTAKE</b><h3>Letting the table schema dictate the domain model's shape</h3><p>Shaping <code>Order</code>'s fields to match normalized database columns, instead of what the business rules need, produces an anemic domain model driven by storage concerns.</p></div>
          <div><b>MISTAKE</b><h3>Calling the mapping layer "boilerplate" and cutting corners on it</h3><p>Auto-generating a naive mapper that copies every field 1:1 reintroduces the coupling the separation was meant to prevent, the moment the two models need to diverge.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>The DBA wants to split the <code>orders</code> table's address fields into a separate <code>shipping_addresses</code> table for normalization. If <code>Order</code> and <code>OrderJpaEntity</code> were the same class, what would that schema change force you to touch that it shouldn't?</p>
        </div>
      </section>
    </div>
  );
}
