export default function FoundationsTheCostOfCouplingArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Coupling is not inherently bad &mdash; every system needs its parts to work together &mdash; but uncontrolled coupling is the single biggest multiplier on the cost of every future change.</p>
        <p>This closes out the foundations section by putting a name on the enemy that everything else in this course exists to fight. Entities, use cases, boundaries, and the Dependency Rule are not abstract ideals; they are specific, practical tools for keeping coupling low and, critically, keeping it pointed in one direction instead of tangled into cycles.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Coupling is a multiplier, not a fixed cost</h3>
        <p>When module A depends on module B, a change to B can force a change to A. That alone is manageable. The cost explodes when dependencies form a dense web: a change to one low-level detail ripples outward through every module that, directly or indirectly, depends on it. The more tangled the dependency graph, the larger the blast radius of any single change, and the harder it becomes to reason about what a change will actually affect.</p>

        <h3>Cycles are the worst kind of coupling</h3>
        <p>A dependency cycle &mdash; module A depends on B, B depends on C, C depends back on A &mdash; means none of the three can be understood, tested, built, or deployed independently of the other two. They have effectively become one giant module wearing three name tags. Martin's Acyclic Dependencies Principle exists for exactly this reason: <strong>the dependency graph of packages must have no cycles.</strong> Breaking a cycle usually means introducing a new abstraction that both former cyclic partners can depend on instead of depending on each other.</p>

        <h3>Stable things should not depend on volatile things</h3>
        <p>Coupling direction matters as much as coupling existence. A component that is depended upon by many others is <em>stable</em> &mdash; hard to change without affecting a lot of code. A component with few or no dependents is <em>volatile</em> &mdash; cheap to change. The costly mistake is having a stable component depend on a volatile one, because now a cheap-to-change detail is dragging an expensive-to-change component along with it every time it moves. This is exactly why entities (very stable, depended on by everything) must never depend on frameworks (deliberately volatile, swapped often).</p>

        <h3>How this connects to the Dependency Rule</h3>
        <p>The Dependency Rule you saw in the roadmap lesson &mdash; dependencies only point inward &mdash; is coupling management applied at the scale of the whole system. By construction, it guarantees no cycles can form between rings (an outer ring can depend inward, but never the reverse), and it guarantees the most stable code (entities) never depends on the most volatile code (frameworks and drivers). Every later lesson on layers and boundaries is really teaching you how to keep this specific promise intact as the system grows.</p>

        <h3>Coupling costs compound with team size</h3>
        <p>Beyond the code itself, tight coupling has an organizational cost: when many modules are entangled, more engineers must coordinate to make a single change safely. A well-decoupled system lets teams change their own slice with confidence; a tightly coupled one forces cross-team review and synchronized releases for changes that should have been trivial and isolated.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="Two dependency graphs side by side, a tangled cyclic graph on the left and a clean acyclic layered graph on the right">
            <text x="150" y="30" fontSize="12" textAnchor="middle">Tangled (cyclic)</text>
            <circle cx="90" cy="80" r="22" className="mutedStroke" fill="none" />
            <text x="90" y="84" fontSize="10" textAnchor="middle">A</text>
            <circle cx="200" cy="80" r="22" className="mutedStroke" fill="none" />
            <text x="200" y="84" fontSize="10" textAnchor="middle">B</text>
            <circle cx="145" cy="180" r="22" className="mutedStroke" fill="none" />
            <text x="145" y="184" fontSize="10" textAnchor="middle">C</text>
            <line x1="112" y1="80" x2="178" y2="80" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#cArrow)" />
            <line x1="188" y1="100" x2="160" y2="162" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#cArrow)" />
            <line x1="130" y1="162" x2="100" y2="100" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#cArrow)" />

            <text x="510" y="30" fontSize="12" textAnchor="middle">Layered (acyclic)</text>
            <rect x="460" y="55" width="100" height="36" rx="6" className="accentStroke" fill="none" />
            <text x="510" y="77" fontSize="10" textAnchor="middle">Adapter</text>
            <rect x="460" y="115" width="100" height="36" rx="6" className="accentStroke" fill="none" />
            <text x="510" y="137" fontSize="10" textAnchor="middle">Use Case</text>
            <rect x="460" y="175" width="100" height="36" rx="6" className="accentStroke" fill="none" />
            <text x="510" y="197" fontSize="10" textAnchor="middle">Entity</text>
            <line x1="510" y1="91" x2="510" y2="113" className="accentStroke" strokeWidth="1.5" markerEnd="url(#cArrow)" />
            <line x1="510" y1="151" x2="510" y2="173" className="accentStroke" strokeWidth="1.5" markerEnd="url(#cArrow)" />

            <defs>
              <marker id="cArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">A cyclic graph means no module can change alone; a layered, acyclic graph means every arrow points toward greater stability.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here is a coupling mistake that is easy to introduce without noticing: a mapper class that depends on the adapter package for one shortcut, creating a cycle between two packages that were supposed to be independent.</p>
        <pre><code>{`// Before: a dependency cycle between adapter.persistence and adapter.web.
// OrderEntityMapper reaches into adapter.web "just to reuse a formatter",
// while OrderController already depends on adapter.persistence for lookups.
package com.engineeringdecoded.orders.adapter.persistence;

import com.engineeringdecoded.orders.adapter.web.OrderViewModel; // <-- cycle risk

public final class OrderEntityMapper {
    public OrderViewModel toViewModelShortcut(OrderJpaEntity entity) {
        // reaches "up" into the web package to save writing a second mapper
        return new OrderViewModel(entity.getId(), entity.getStatus());
    }
}

// After: break the cycle by giving each package its own, one-directional
// dependency on a shared abstraction instead of on each other.
package com.engineeringdecoded.orders.adapter.persistence;

public final class OrderEntityMapper {
    public Order toDomain(OrderJpaEntity entity) { /* maps to the entity only */ return null; }
    public OrderJpaEntity toJpaEntity(Order order) { /* maps from the entity only */ return null; }
}

package com.engineeringdecoded.orders.adapter.web;

public final class OrderPresenter {
    public OrderViewModel toViewModel(Order order) {
        // adapter.web depends on the entity, never on adapter.persistence
        return new OrderViewModel(order.id().value(), order.status().name());
    }
}`}</code></pre>
        <p>After the fix, both packages depend only on the shared <code>Order</code> entity, and the acyclic graph means either package can now be changed, tested, or even deployed separately.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Adding a "quick" import to save duplication</h3><p>Reaching across a package boundary for a one-off shortcut, as in the example above, is how most dependency cycles are born &mdash; each one looks harmless in isolation and only becomes visible once the build tooling reports a cycle.</p></div>
          <div><b>MISTAKE</b><h3>Letting a stable component depend on a volatile one</h3><p>An entity that imports a logging framework or a specific serialization library ties the most stable, most depended-upon code in the system to something the team expects to change, multiplying the cost of that eventual change.</p></div>
          <div><b>MISTAKE</b><h3>Measuring coupling by file count instead of dependency direction</h3><p>Splitting a monolithic class into ten smaller files without checking which way their dependencies point can leave you with ten tightly coupled files instead of one &mdash; more files, same underlying tangle.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>In the practical example's "before" version, which package is more stable &mdash; <code>{'adapter.persistence'}</code> or <code>{'adapter.web'}</code> &mdash; and why does having the less stable one end up depended upon by the other make the cycle worse than if the dependency ran the other way?</p>
        </div>
      </section>
    </div>
  );
}
