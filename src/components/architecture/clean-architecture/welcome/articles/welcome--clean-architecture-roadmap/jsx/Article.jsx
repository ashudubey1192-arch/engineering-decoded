export default function WelcomeCleanArchitectureRoadmapArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Every lesson ahead is a step toward one destination: business rules that sit at the center of your system, protected by concentric rings that only ever point inward.</p>
        <p>Before diving into details, it helps to see the whole map at once. This lesson gives you the concentric-circle picture of Clean Architecture that every later section will build on, plus a preview of how "tangled code" actually turns into "layered code" in practice &mdash; not as theory, but as a concrete before/after you will recognize from real projects.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Robert C. Martin's Clean Architecture is usually drawn as four concentric rings. The exact number of rings in your own system can vary, but the rule that governs them does not.</p>

        <h3>The four rings</h3>
        <ul>
          <li><strong>Entities</strong> &mdash; the innermost ring. Enterprise-wide business rules that would still make sense even if this particular application did not exist. In our running example, this is <code>Order</code>, <code>OrderLine</code>, and <code>Money</code>.</li>
          <li><strong>Use Cases</strong> &mdash; application-specific business rules. This is where <em>this system's</em> behavior lives: <code>PlaceOrderUseCase</code> orchestrates entities to accomplish something a user wants done.</li>
          <li><strong>Interface Adapters</strong> &mdash; translators. Controllers, presenters, and repository implementations that convert data between the shape use cases want and the shape the outside world (HTTP, JSON, SQL) speaks.</li>
          <li><strong>Frameworks &amp; Drivers</strong> &mdash; the outermost ring. Spring, Hibernate, your database, your web server. Glue and detail, kept as far from the center as possible.</li>
        </ul>

        <h3>The Dependency Rule</h3>
        <p>The single rule that makes the rings mean anything: <strong>source code dependencies can only point inward.</strong> Nothing in an inner ring can know the name of anything in an outer ring. <code>Order</code> cannot import a Spring annotation. <code>PlaceOrderUseCase</code> cannot import <code>JpaOrderRepository</code> &mdash; it can only know about the <code>OrderRepository</code> interface it defines for itself. This is what lets you replace Spring, replace your database, or replace your UI without touching a single business rule.</p>

        <h3>Where this course takes you</h3>
        <p>The <strong>Foundations</strong> section right after this one grounds these rings in Martin's actual reasoning: what architecture is for, why policy and detail need to be separated, and why coupling is the real cost this whole discipline is fighting. Later sections then walk outward from the center &mdash; entities first, then use cases, then adapters, then frameworks &mdash; before pulling everything together with composition roots and testing strategy.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 280" role="img" aria-label="Four concentric circles labeled Entities, Use Cases, Interface Adapters, and Frameworks and Drivers, with an arrow showing the Dependency Rule pointing inward">
            <circle cx="320" cy="140" r="120" className="mutedStroke" fill="none" />
            <circle cx="320" cy="140" r="90" className="mutedStroke" fill="none" />
            <circle cx="320" cy="140" r="60" className="mutedStroke" fill="none" />
            <circle cx="320" cy="140" r="30" className="accentStroke" fill="none" />

            <text x="320" y="144" fontSize="11" textAnchor="middle">Entities</text>
            <text x="320" y="84" fontSize="11" textAnchor="middle">Use Cases</text>
            <text x="320" y="54" fontSize="11" textAnchor="middle">Interface Adapters</text>
            <text x="320" y="24" fontSize="11" textAnchor="middle">Frameworks &amp; Drivers</text>

            <path d="M 460 140 L 410 140" className="accentStroke" strokeWidth="2" markerEnd="url(#roadmapArrow)" />
            <text x="470" y="144" fontSize="11">Dependency Rule: inward only</text>

            <defs>
              <marker id="roadmapArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The map for the whole course: four rings, one rule &mdash; dependencies only ever point toward the center.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here is the kind of transformation this course teaches, shown as a before/after in one listing: first a tangled method mixing business rule, persistence, and formatting, then the same behavior already split along Clean Architecture lines &mdash; the shape every later lesson will teach you to build directly, not refactor into.</p>
        <pre><code>{`// Before: business rule, SQL, and HTTP response all tangled together
@PostMapping("/orders/{id}/cancel")
public String cancelOrder(@PathVariable String id) {
    var row = jdbcTemplate.queryForMap(
        "SELECT * FROM orders WHERE id = ?", id);
    if (row.get("status").equals("SHIPPED")) {
        return "{\\"error\\": \\"cannot cancel a shipped order\\"}";
    }
    jdbcTemplate.update(
        "UPDATE orders SET status = 'CANCELLED' WHERE id = ?", id);
    return "{\\"status\\": \\"cancelled\\"}";
}

// After: the rule lives on the entity, the flow lives in the use case
public final class Order {
    private OrderStatus status;

    public void cancel() {
        if (status == OrderStatus.SHIPPED) {
            throw new IllegalStateException("cannot cancel a shipped order");
        }
        this.status = OrderStatus.CANCELLED;
    }
}

public final class CancelOrderUseCase implements CancelOrderInputBoundary {
    private final OrderRepository orders;

    public CancelOrderUseCase(OrderRepository orders) {
        this.orders = orders;
    }

    public void execute(OrderId id) {
        Order order = orders.findById(id);
        order.cancel();
        orders.save(order);
    }
}`}</code></pre>
        <p>The controller now just calls <code>{'execute(id)'}</code> and translates the result &mdash; it no longer knows what "cancel" means, and the rule no longer knows HTTP or SQL exist.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Memorizing the rings, not the rule</h3><p>Engineers draw four perfect circles in a design doc and then let a repository interface leak into an entity anyway. The rings are a consequence of the Dependency Rule, not a decoration &mdash; enforce the rule and the rings take care of themselves.</p></div>
          <div><b>MISTAKE</b><h3>Expecting exactly four layers always</h3><p>Martin is explicit that the number of rings is illustrative, not sacred. Forcing a tiny service into four rigid packages just to match the diagram adds ceremony without adding safety.</p></div>
          <div><b>MISTAKE</b><h3>Treating the roadmap as a one-time refactor</h3><p>This course is a way of designing going forward, not a single cleanup pass. Teams that "do Clean Architecture" once and then stop enforcing the Dependency Rule slide right back into tangled code within a few releases.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Looking at the four rings, which ring would <code>{'OrderRepository'}</code> (the interface, not the JPA implementation) belong in, and why does that placement &mdash; not the implementation's placement &mdash; determine which direction the dependency actually points?</p>
        </div>
      </section>
    </div>
  );
}
