export default function DesignPrinciplesSingleResponsibilityPrincipleArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A module should have one reason to change — not one job, one <strong>stakeholder</strong>.</p>
        <p>The Single Responsibility Principle is the most misquoted rule in software design, and getting it wrong quietly wrecks your architecture: classes that "do one thing" on the surface still end up being edited by two unrelated teams for two unrelated reasons, and every shared edit becomes a coordination risk. Clean Architecture leans on SRP constantly — it is the reasoning behind separating entities from use cases, and use cases from presentation — so getting the real definition straight now pays off in every later lesson.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>"One reason to change" means "one actor"</h3>
        <p>Robert C. Martin's own correction to the popular but wrong reading of SRP is explicit: SRP is <strong>not</strong> "a class should do only one thing." It is "a module should be responsible to one, and only one, actor." An actor here means a person or group who can request a change to the code — a business stakeholder, a DBA, a compliance team, an ops team. If two different actors can each force you to edit the same class for two different reasons, that class has more than one responsibility, even if every method in it is short and single-purpose in the naive sense.</p>
        <h3>Why mixing actors is dangerous, not just untidy</h3>
        <p>The danger isn't aesthetic. When one class serves two actors, a change requested by actor A can accidentally break behavior that actor B depends on, because both changes live in the same source file and share state. Two developers on two different initiatives now also collide on the same class in source control, and neither can deploy independently. SRP is really about decoupling the <strong>rates and reasons things change</strong> so that unrelated changes stay unrelated.</p>
        <h3>A concrete failure mode</h3>
        <p>Consider a single <code>{'Order'}</code> class that both enforces business rules (can this order be placed? is this line valid?) <em>and</em> knows how to persist itself to a database, <em>and</em> knows how to format itself for a printed invoice. Three actors now share this file: the business/product owner (who owns the placement rules), the DBA or persistence team (who owns schema and storage concerns), and whoever owns invoice formatting (often finance or a reporting team). A schema migration forces an edit here. So does a new discount rule. So does a change to invoice layout. Every one of those edits risks breaking the other two concerns because they live in the same class.</p>
        <p>The fix is not to explode the class into many tiny classes for their own sake — it's to separate along actor boundaries: keep <code>{'Order'}</code> as a pure entity that only knows business invariants, and move persistence and formatting to their own classes that depend on it, not the other way around. This is exactly the Entities-vs-everything-else split Clean Architecture insists on: the entity should be the last thing that changes when the database or the report format changes.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 280" role="img" aria-label="Diagram contrasting one Order class serving three actors versus three actor-aligned classes each depending on a plain Order entity">
            <text x="150" y="24" textAnchor="middle" fontSize="13">Violating SRP</text>
            <rect x="60" y="40" width="180" height="110" rx="6" className="mutedStroke" fill="none" />
            <text x="150" y="65" textAnchor="middle" fontSize="12">Order</text>
            <text x="150" y="86" textAnchor="middle" fontSize="10">business rules</text>
            <text x="150" y="102" textAnchor="middle" fontSize="10">persistence logic</text>
            <text x="150" y="118" textAnchor="middle" fontSize="10">invoice formatting</text>
            <text x="20" y="60" fontSize="10">Business ⟶</text>
            <text x="20" y="95" fontSize="10">DBA ⟶</text>
            <text x="20" y="130" fontSize="10">Finance ⟶</text>
            <line x1="60" y1="200" x2="240" y2="200" className="mutedStroke" strokeWidth="1" strokeDasharray="4 4" />
            <text x="150" y="220" textAnchor="middle" fontSize="10">3 actors, 1 class, 3 reasons to change</text>

            <text x="480" y="24" textAnchor="middle" fontSize="13">Following SRP</text>
            <rect x="410" y="130" width="140" height="40" rx="6" className="accentStroke" fill="none" />
            <text x="480" y="154" textAnchor="middle" fontSize="12">Order (entity)</text>

            <rect x="410" y="40" width="140" height="34" rx="6" className="mutedStroke" fill="none" />
            <text x="480" y="61" textAnchor="middle" fontSize="10">OrderRepository</text>
            <line x1="480" y1="74" x2="480" y2="128" className="mutedStroke" strokeWidth="1" markerEnd="url(#srpArrow)" />

            <rect x="230" y="200" width="140" height="34" rx="6" className="mutedStroke" fill="none" />
            <text x="300" y="221" textAnchor="middle" fontSize="10">InvoiceFormatter</text>
            <line x1="330" y1="200" x2="440" y2="172" className="mutedStroke" strokeWidth="1" markerEnd="url(#srpArrow)" />

            <rect x="560" y="200" width="70" height="34" rx="6" className="mutedStroke" fill="none" />
            <text x="595" y="221" textAnchor="middle" fontSize="9">Rules</text>
            <line x1="580" y1="200" x2="510" y2="172" className="mutedStroke" strokeWidth="1" markerEnd="url(#srpArrow)" />

            <defs>
              <marker id="srpArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">One class serving three actors versus three actor-aligned classes that all depend on a plain Order entity.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Below, a bloated <code>{'Order'}</code> mixes business rules with persistence and invoice formatting. The refactor pulls those concerns out into their own classes, leaving <code>{'Order'}</code> answerable only to the business actor.</p>
        <pre><code>{`// BEFORE — one class, three actors, three reasons to change
package com.engineeringdecoded.orders.entity;

public class Order {
    private OrderId id;
    private CustomerId customerId;
    private List<OrderLine> lines = new ArrayList<>();
    private OrderStatus status;

    public void addLine(OrderLine line) {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify a placed order");
        }
        lines.add(line);
    }

    // Persistence concern — the DBA's reason to change this file
    public void saveTo(Connection connection) throws SQLException {
        try (var stmt = connection.prepareStatement(
                "INSERT INTO orders (id, customer_id, status) VALUES (?, ?, ?)")) {
            stmt.setString(1, id.value());
            stmt.setString(2, customerId.value());
            stmt.setString(3, status.name());
            stmt.executeUpdate();
        }
    }

    // Formatting concern — finance's reason to change this file
    public String toInvoiceText() {
        StringBuilder sb = new StringBuilder("INVOICE for " + customerId.value() + "\\n");
        for (OrderLine line : lines) {
            sb.append(line.description()).append(" x").append(line.quantity()).append("\\n");
        }
        return sb.toString();
    }
}

// AFTER — Order only answers to the business actor
package com.engineeringdecoded.orders.entity;

public class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> lines = new ArrayList<>();
    private OrderStatus status = OrderStatus.DRAFT;

    public Order(OrderId id, CustomerId customerId) {
        this.id = id;
        this.customerId = customerId;
    }

    public void addLine(OrderLine line) {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify a placed order");
        }
        lines.add(line);
    }

    public void place() {
        if (lines.isEmpty()) {
            throw new IllegalStateException("Cannot place an order with no lines");
        }
        status = OrderStatus.PLACED;
    }

    public List<OrderLine> lines() { return List.copyOf(lines); }
    public OrderId id() { return id; }
    public CustomerId customerId() { return customerId; }
    public OrderStatus status() { return status; }
}

// Persistence now lives with the DBA's actor, outside the entity
package com.engineeringdecoded.orders.usecase.port;

public interface OrderRepository {
    void save(Order order);
    Order findById(OrderId id);
}

// Formatting now lives with finance's actor, outside the entity
package com.engineeringdecoded.orders.adapter.reporting;

public class OrderInvoiceFormatter {
    public String format(Order order) {
        StringBuilder sb = new StringBuilder("INVOICE for " + order.customerId().value() + "\\n");
        for (OrderLine line : order.lines()) {
            sb.append(line.description()).append(" x").append(line.quantity()).append("\\n");
        }
        return sb.toString();
    }
}`}</code></pre>
        <p>Notice <code>{'Order'}</code> no longer imports <code>{'java.sql.Connection'}</code> or knows anything about invoice text — a schema change or a new invoice layout now touches only the class owned by the actor who asked for it.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Reading SRP as "one method" or "small class"</h3><p>Engineers split a class into many tiny classes purely to shrink line counts, without asking who actually requests changes to each piece — this adds indirection without reducing coupling between actors.</p></div>
          <div><b>MISTAKE</b><h3>Letting persistence leak into the entity "for convenience"</h3><p>Adding a <code>{'save()'}</code> or JPA annotations directly on <code>{'Order'}</code> feels efficient short-term, but it means a database migration and a business rule change now both risk breaking the same class.</p></div>
          <div><b>MISTAKE</b><h3>Ignoring who actually asks for the change</h3><p>Teams design classes around technical categories (data vs. logic) instead of around organizational actors, then are surprised when two "unrelated" tickets from different teams conflict in the same file.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your <code>{'OrderInvoiceFormatter'}</code> and your <code>{'OrderRepository'}</code> implementation both currently read fields directly off <code>{'Order'}</code>. If the finance team asks for a new invoice field that requires no new persisted column, and the DBA later renames a column with no visible change to invoice output, does either change now risk touching the other's class? Why does keeping these as two separate classes — rather than two methods on one class — matter for that answer?</p>
        </div>
      </section>
    </div>
  );
}
