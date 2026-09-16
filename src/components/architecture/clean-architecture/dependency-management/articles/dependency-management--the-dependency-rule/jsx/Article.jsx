export default function DependencyManagementTheDependencyRuleArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Source code dependencies may point in only one direction: inward. Everything else in Clean Architecture is a consequence of this one rule.</p>
        <p>Every other idea in this course — entities, use cases, ports, adapters, the Main component — exists to make one thing possible: keeping source code dependencies pointing toward the center, no matter which way control actually flows at runtime. This lesson names the rule explicitly and shows what it looks like to obey it and to break it in the same codebase.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The rule itself</h3>
        <p>Robert C. Martin states it plainly: <strong>source code dependencies must point only inward, toward higher-level policies</strong>. Picture the architecture as concentric circles — Entities at the center, then Use Cases, then Interface Adapters, then Frameworks &amp; Drivers on the outside. Nothing in an inner circle can know <em>anything</em> about an outer circle. Not the name of a function, not the name of a class, not the name of a variable, not which framework is in use, not even that a database exists.</p>
        <p>This isn't a vague guideline about "layering" — it's a mechanical, checkable constraint on imports. If you can find a single <code>import</code> statement in <code>com.engineeringdecoded.orders.entity.Order</code> that references anything under <code>com.engineeringdecoded.orders.adapter</code> or a Spring/JPA package, the rule is broken, full stop.</p>
        <h3>Why "higher-level policy" is the right mental model</h3>
        <p>Martin's justification isn't aesthetic — it's about volatility and value. Entities encode business rules that would exist even without software: what makes an order valid, when it can be cancelled. Frameworks and databases are details — replaceable, likely to change, and far less valuable than the business rules they serve. The Dependency Rule keeps the things that matter most (and change least) from being entangled with the things that matter least (and change most).</p>
        <h3>What crossing the boundary the wrong way actually looks like</h3>
        <p>In the order-management system, a violation would look like <code>Order</code> importing <code>OrderJpaEntity</code>, or <code>PlaceOrderUseCase</code> importing <code>OrgSpringFramework.stereotype.Service</code> and using <code>@Service</code> directly. Both compile fine. Both pass code review if nobody's watching for this specifically. Both quietly weld your business rules to a framework you will eventually want to change, upgrade past, or test around.</p>
        <h3>The rule is about source dependencies, not control flow</h3>
        <p>This is the part that trips people up first: obeying the Dependency Rule does <em>not</em> mean control never flows outward. It obviously does — a use case has to reach a database eventually. What the rule constrains is which direction the <em>source code</em> depends, i.e. which direction you'd have to follow imports to compile the inner circle. The next lesson on compile-time dependencies makes this literal; the one after that resolves the apparent contradiction between "control flows out" and "dependencies point in" using dependency inversion.</p>
        <h3>Enforcing it, not just hoping for it</h3>
        <p>Discipline erodes under deadline pressure. A junior engineer needs one field from a JPA entity inside a use case and takes the two-minute shortcut instead of the twenty-minute refactor. This is why later lessons in this section cover Main components, composition roots, and — in the testing section — architecture tests that fail the build automatically when someone crosses the line. The rule only holds long-term if something enforces it besides good intentions.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 300" role="img" aria-label="Four concentric circles labeled Entities, Use Cases, Interface Adapters, and Frameworks and Drivers, with arrows crossing every ring boundary pointing only inward">
            <circle cx="320" cy="150" r="130" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="150" r="98" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="150" r="66" fill="none" className="accentStroke" strokeWidth="1.5" />
            <circle cx="320" cy="150" r="34" fill="none" className="accentStroke" strokeWidth="2" />

            <text x="320" y="150" textAnchor="middle" fontSize="11">Entities</text>
            <text x="320" y="100" textAnchor="middle" fontSize="11">Use Cases</text>
            <text x="320" y="64" textAnchor="middle" fontSize="11">Interface Adapters</text>
            <text x="320" y="30" textAnchor="middle" fontSize="11">Frameworks &amp; Drivers</text>

            <defs>
              <marker id="ruleArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>

            <line x1="320" y1="20" x2="320" y2="52" className="accentStroke" strokeWidth="2" markerEnd="url(#ruleArrow)" />
            <line x1="320" y1="84" x2="320" y2="116" className="accentStroke" strokeWidth="2" markerEnd="url(#ruleArrow)" />
            <line x1="320" y1="150" x2="320" y2="150" className="accentStroke" />

            <line x1="140" y1="150" x2="188" y2="150" className="accentStroke" strokeWidth="2" markerEnd="url(#ruleArrow)" />
            <line x1="500" y1="150" x2="452" y2="150" className="accentStroke" strokeWidth="2" markerEnd="url(#ruleArrow)" />

            <text x="320" y="270" textAnchor="middle" fontSize="12" className="accentFill">The Dependency Rule: every arrow points inward, never outward</text>
          </svg>
          <p className="diagramCaption">Source code dependencies cross ring boundaries in one direction only — toward Entities.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here's the rule obeyed and the rule broken, side by side, using the same use case class. Only one of these compiles cleanly against the architecture's intent.</p>
        <pre><code>{`// entity/Order.java — innermost circle: no imports beyond java.* and its own package
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

// usecase/PlaceOrderUseCase.java — depends only on entities and its own port
package com.engineeringdecoded.orders.usecase;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.usecase.port.OrderRepository; // an interface

public final class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository orderRepository; // interface, not JpaOrderRepository

    public PlaceOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lines());
        orderRepository.save(order);
        return new PlaceOrderResponse(order.id());
    }
}

// VIOLATION — do not do this:
// import com.engineeringdecoded.orders.adapter.persistence.JpaOrderRepository;
// import org.springframework.stereotype.Service;
// A use case that imports either of these has broken the Dependency Rule,
// even though the code compiles and even passes most code reviews.`}</code></pre>
        <p><code>PlaceOrderUseCase</code> depends on <code>OrderRepository</code>, an interface it owns. It has never heard of <code>JpaOrderRepository</code>, <code>@Service</code>, or Spring — that knowledge belongs strictly further out.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>"It's just one field, I'll import it directly"</h3><p>An engineer under deadline pressure pulls a getter off a JPA entity straight into a use case instead of mapping it. The import compiles, ships, and becomes the template the next three engineers copy.</p></div>
          <div><b>MISTAKE</b><h3>Treating the rule as about packages, not imports</h3><p>Some teams believe putting classes in an <code>entity</code> package satisfies the rule regardless of what those classes import. The rule is about the actual dependency graph — package names are only a convention for organizing it, not a substitute for checking it.</p></div>
          <div><b>MISTAKE</b><h3>Confusing "the rule" with "no framework code anywhere"</h3><p>Frameworks are fine — even necessary — in the outer circles. The mistake is assuming the rule bans frameworks entirely rather than constraining exactly where they may be referenced from.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate argues that since <code>OrderRepository</code> lives in the <code>usecase.port</code> package and <code>JpaOrderRepository</code> implements it, the dependency between the use case and the database is "basically inward already." Using the Dependency Rule's actual definition, explain precisely why this is wrong — and which class's imports you'd inspect to prove it.</p>
        </div>
      </section>
    </div>
  );
}
