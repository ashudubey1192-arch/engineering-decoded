export default function DesignPrinciplesStableAbstractionsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">The components everything depends on must also be the easiest to extend without touching — stability demands abstraction.</p>
        <p>The Stable Abstractions Principle (SAP) is the natural partner to the Stable Dependencies Principle, and it's the one that explains a fact about Clean Architecture that otherwise looks arbitrary: why entities — the innermost, most depended-upon layer — are also the layer made of pure policy, interfaces, and invariants, with none of the concrete, technology-bound detail you find in the outer layers. SAP says that's not a style choice. It's the only way a highly stable component avoids becoming a liability.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Recap: stability is about how hard something is to change</h3>
        <p>As the Stable Dependencies lesson covered, a component's stability comes from how many things depend on it versus how many things it depends on. High fan-in and low fan-out makes a component stable — lots depends on it, so changing it is expensive and risky. That's fine, even desirable, for your most foundational code. But stability creates a new problem on its own: if a stable component is also full of concrete, specific implementation detail, it becomes something you can never safely modify (too many dependents) yet also can't extend (there's no seam, just concrete code). That combination — hard to change, impossible to extend — is the worst place a component can be.</p>
        <h3>What "abstractness" means</h3>
        <p>Abstractness is, roughly, how much of a component is made of interfaces and abstract types stating <em>what</em> should happen, versus concrete classes stating <em>how</em> it happens with a specific mechanism. A component built almost entirely of interfaces and small policy declarations is highly abstract — there's little in it that a change to some outside detail could invalidate, and everything in it is a seam other code can implement or extend. A component built of concrete classes wired to specific technology — a specific database driver, a specific web framework — is the opposite: any decision baked into that mechanism is also baked into every line depending on the concrete class, with no seam to substitute a different mechanism later.</p>
        <h3>The principle: stability should track abstractness</h3>
        <p>SAP says a component's abstractness should rise together with its stability. A highly stable component (many dependents, hard to change) should also be highly abstract, so that "hard to change" doesn't mean "frozen" — new behavior can still be added by implementing the abstraction, exactly the seam the Open-Closed Principle relies on. Symmetrically, a highly unstable component (few or no dependents) is <em>allowed</em> to be concrete, because nothing of consequence depends on it — if it needs to change, or even be thrown away and rewritten, almost nothing downstream notices.</p>
        <h3>Two failure zones worth naming</h3>
        <p>A component that is stable <em>and</em> concrete sits in what Robert Martin calls the "zone of pain": everything depends on it, so you can't safely modify it, and it offers no abstraction to extend instead — you're stuck. This is precisely what would happen if the <code>{'Order'}</code> entity from earlier lessons were left full of persistence calls and formatting logic: dozens of components would depend on that concrete mess, and every one of them would be exposed to every future change to it. A component that is unstable <em>and</em> abstract sits in the opposite failure mode, the "zone of uselessness": an interface nobody implements and nothing depends on — abstraction with no payoff, pure ceremony.</p>
        <h3>Why this makes entities the way they are</h3>
        <p>In the order-management domain, <code>{'Order'}</code>, <code>{'OrderLine'}</code>, and <code>{'Money'}</code> are the most depended-upon types in the system — nearly every layer touches them. SAP says that weight demands they stay abstract in the relevant sense: free of framework detail, expressing only business policy (invariants like "an order needs at least one line to be placed") rather than mechanism. The interfaces that sit at the same stability tier — <code>{'OrderRepository'}</code>, <code>{'DiscountPolicy'}</code>, <code>{'PlaceOrderInputBoundary'}</code> — are, quite literally, abstract types: nothing about them commits to Hibernate, Spring, or any specific pricing algorithm. That's exactly why DIP has the use-case layer <em>own</em> these interfaces rather than consume concrete ones: it keeps the most-depended-upon tier of the system abstract enough to be extended safely, instead of concrete enough to become the zone of pain.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 300" role="img" aria-label="Diagram plotting instability against abstractness, with a main sequence diagonal, a zone of pain near stable-and-concrete, a zone of uselessness near unstable-and-abstract, and Order/OrderRepository plotted near the abstract-stable end">
            <line x1="70" y1="30" x2="70" y2="250" className="mutedStroke" strokeWidth="1" />
            <line x1="70" y1="250" x2="580" y2="250" className="mutedStroke" strokeWidth="1" />
            <text x="30" y="35" fontSize="9">A</text>
            <text x="30" y="48" fontSize="8">(abstract)</text>
            <text x="30" y="255" fontSize="9">0</text>
            <text x="565" y="270" fontSize="9">I (unstable)</text>
            <text x="60" y="270" fontSize="8">0</text>
            <text x="60" y="285" fontSize="8">(stable)</text>

            <line x1="70" y1="30" x2="580" y2="250" className="mutedStroke" strokeWidth="1" strokeDasharray="4 3" />
            <text x="300" y="130" fontSize="9" transform="rotate(-24 300 130)">main sequence</text>

            <rect x="80" y="200" width="120" height="45" rx="4" className="mutedStroke" fill="none" />
            <text x="140" y="218" textAnchor="middle" fontSize="9">zone of pain</text>
            <text x="140" y="232" textAnchor="middle" fontSize="8">stable + concrete</text>

            <rect x="460" y="40" width="120" height="45" rx="4" className="mutedStroke" fill="none" />
            <text x="520" y="58" textAnchor="middle" fontSize="9">zone of uselessness</text>
            <text x="520" y="72" textAnchor="middle" fontSize="8">unstable + abstract</text>

            <circle cx="130" cy="55" r="5" className="accentFill" />
            <text x="142" y="50" fontSize="9">Order, OrderRepository</text>
            <text x="142" y="63" fontSize="9">(stable + abstract — on the sequence)</text>

            <circle cx="500" cy="225" r="5" className="accentFill" />
            <text x="345" y="220" fontSize="9">OrderController</text>
            <text x="345" y="233" fontSize="9">(unstable + concrete — on the sequence)</text>
          </svg>
          <p className="diagramCaption">Healthy components sit near the main sequence; a stable-but-concrete Order would fall into the zone of pain instead.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The unhealthy version pulls <code>{'Order'}</code> — already the most depended-upon class in the system — toward the zone of pain by binding it to a concrete mechanism. The healthy version keeps that stable tier abstract and pushes the concrete mechanism out to an unstable adapter, where it belongs.</p>
        <pre><code>{`// UNHEALTHY — stable component (everything depends on Order) made concrete
package com.engineeringdecoded.orders.entity;

import javax.persistence.Entity;      // framework detail baked into the
import javax.persistence.Id;          // most-depended-upon class in the system
import javax.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    private String id;

    private String status; // even the enum concept is now flattened for JPA

    // Any change to the ORM mapping now risks every use case, controller,
    // and formatter that depends on Order — the zone of pain in practice.
}

// HEALTHY — the stable tier stays abstract; the mechanism moves outward
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

    public void place() {
        if (lines.isEmpty()) {
            throw new IllegalStateException("Cannot place an order with no lines");
        }
        status = OrderStatus.PLACED;
    }
    // Pure policy: no persistence annotations, no framework types, no mechanism.
}

// The concrete, volatile mapping lives in an unstable, low-abstractness
// adapter instead — nothing of consequence depends on THIS class
package com.engineeringdecoded.orders.adapter.persistence;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "orders")
public class OrderJpaEntity {
    @Id
    private String id;
    private String status;
    // getters/setters for Hibernate; mapped to/from Order by OrderEntityMapper
}`}</code></pre>
        <p><code>{'OrderJpaEntity'}</code> has almost no dependents (low fan-in, high instability) and is fully concrete — exactly where SAP says concreteness belongs. <code>{'Order'}</code> stays abstract enough to match its high stability.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Adding framework annotations to a heavily-depended-upon class</h3><p>Putting <code>{'@Entity'}</code>, <code>{'@RestController'}</code>, or similar annotations directly on domain classes saves a mapping step today but drags a stable, widely-used class into the zone of pain.</p></div>
          <div><b>MISTAKE</b><h3>Making unstable, leaf-level code needlessly abstract</h3><p>Introducing an interface for a concrete adapter that has exactly one implementation and no dependents adds ceremony for no benefit — that's the zone of uselessness, abstraction with nothing to justify it.</p></div>
          <div><b>MISTAKE</b><h3>Treating abstractness as "uses interfaces somewhere"</h3><p>A package can technically contain an interface and still be concrete in the sense that matters, if that interface is riddled with framework-specific types in its method signatures — the mechanism leaks in even without a concrete class.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Suppose <code>{'DiscountPolicy'}</code> stays a clean interface, but its single method signature is changed to accept a Spring <code>{'HttpServletRequest'}</code> parameter so implementations can read custom headers. It's still technically an interface — has its abstractness, in the sense SAP cares about, actually stayed the same? What would you expect to happen to the rest of the use-case layer's stability if that signature change ships?</p>
        </div>
      </section>
    </div>
  );
}
