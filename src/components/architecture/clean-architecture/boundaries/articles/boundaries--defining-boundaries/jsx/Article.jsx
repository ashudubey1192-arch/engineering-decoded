export default function BoundariesDefiningBoundariesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A boundary is a line you draw on purpose, not a line you discover by accident — and the question that decides where it goes is always "what changes together, and what doesn't?"</p>
        <p>Every non-trivial system already has seams in it: business rules, persistence, web frameworks, third-party services. The question this lesson answers is where you deliberately reinforce one of those seams into an architectural boundary — a place where you formally separate code so that a change on one side can never force a change on the other. Get this decision right and your core logic stays stable while everything around it churns. Get it wrong and you either pay for boundaries that protect nothing, or you skip the one boundary that would have saved you a rewrite.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The axis of change</h3>
        <p>Robert C. Martin's guidance is blunt: boundaries exist along the lines where the rate and reason for change differs. If two pieces of code always change together, for the same reason, at the same time, a boundary between them buys you nothing but ceremony. If they change for different reasons — one because the business changed a policy, the other because a database vendor changed a driver version — that is exactly where a boundary earns its keep. This is the same axis the Single Responsibility Principle uses at the class level; boundaries are SRP applied at the scale of modules, layers, and services.</p>
        <h3>The litmus test</h3>
        <p>Before drawing a line, ask a concrete question: will this thing change for a different actor, at a different time, than that thing? "Actor" here means the person or force that drives the change — a product manager reprioritizing checkout rules is a different actor than a DBA migrating to a new database, who is a different actor again than a designer reworking a screen. In the order-management domain, order placement rules (can this order be placed, what does a valid <code>{'OrderLine'}</code> look like) change because the business changes its mind. How an <code>{'Order'}</code> is persisted changes because infrastructure changes. Those are different axes, so they get different boundaries.</p>
        <h3>Boundaries protect stability from volatility</h3>
        <p>The direction matters as much as the placement. A boundary should isolate the stable, high-value policy (the business rules that make your system worth building) from the volatile, low-value detail (which web framework, which database, which UI toolkit). That asymmetry is what later lessons call the Dependency Rule: source code dependencies point toward the stable side, never the other way. Defining a boundary in the wrong place — or in a place that doesn't correspond to a real axis of change — gives you the file-count and interface-count of a well-architected system without any of the protection.</p>
        <h3>Boundaries are a decision with a cost, not a default</h3>
        <p>Not every seam deserves a formal boundary today. Drawing one means an interface, a data-crossing shape, and at least one more moving part to understand. The skill this section builds toward is judging, lesson by lesson, which seams are volatile enough, soon enough, to justify that cost — starting here with simply learning to see the axes in the first place.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="Three areas of a system — business rules, database, and UI — separated by dashed boundary lines, each labeled with a different reason and rate of change">
            <text x="330" y="28" textAnchor="middle" fontSize="14">Different reasons to change, different rates of change</text>

            <rect x="20" y="55" width="180" height="130" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="110" y="90" textAnchor="middle" fontSize="15" fontWeight="600">Business Rules</text>
            <text x="110" y="115" textAnchor="middle" fontSize="11">changes when the</text>
            <text x="110" y="131" textAnchor="middle" fontSize="11">business changes</text>
            <text x="110" y="160" textAnchor="middle" fontSize="11" className="mutedFill">rate: slow</text>

            <line x1="225" y1="40" x2="225" y2="200" className="mutedStroke" strokeWidth="2" strokeDasharray="6 6" />

            <rect x="250" y="55" width="160" height="130" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="330" y="90" textAnchor="middle" fontSize="15" fontWeight="600">Database</text>
            <text x="330" y="115" textAnchor="middle" fontSize="11">changes when</text>
            <text x="330" y="131" textAnchor="middle" fontSize="11">storage tech changes</text>
            <text x="330" y="160" textAnchor="middle" fontSize="11" className="mutedFill">rate: fast</text>

            <line x1="435" y1="40" x2="435" y2="200" className="mutedStroke" strokeWidth="2" strokeDasharray="6 6" />

            <rect x="460" y="55" width="180" height="130" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="550" y="90" textAnchor="middle" fontSize="15" fontWeight="600">Web UI</text>
            <text x="550" y="115" textAnchor="middle" fontSize="11">changes when</text>
            <text x="550" y="131" textAnchor="middle" fontSize="11">screens/UX change</text>
            <text x="550" y="160" textAnchor="middle" fontSize="11" className="mutedFill">rate: fast</text>

            <text x="330" y="225" textAnchor="middle" fontSize="12" className="mutedFill">Same axis test at every scale: would this change for a different actor, at a different time?</text>
          </svg>
          <p className="diagramCaption">Business rules, persistence, and UI sit on different axes of change — that difference, not folder structure, is what justifies a boundary.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here the order-placement rule lives entirely inside <code>{'Order'}</code>, decoupled from how (or whether) an order ever reaches a database — because "can this order be placed" and "how do we store an order" are on different axes of change.</p>
        <pre><code>{`package com.engineeringdecoded.orders.entity;

public final class Order {

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

    // Business rule: an order needs at least one line before it can be placed.
    // Nothing here knows, or should know, whether "placed" ever touches a database.
    public void place() {
        if (lines.isEmpty()) {
            throw new IllegalStateException("Cannot place an order with no lines");
        }
        this.status = OrderStatus.PLACED;
    }

    public Money total() {
        return lines.stream()
            .map(OrderLine::lineTotal)
            .reduce(Money.ZERO, Money::add);
    }
}`}</code></pre>
        <p>Notice what is absent: no SQL, no JPA annotations, no HTTP concepts. That absence is the boundary — <code>{'Order'}</code> changes only when the business's definition of a valid order changes, and nothing else.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Drawing every seam as a boundary</h3><p>Teams that just learned about boundaries often wrap every class in an interface "to be safe." This multiplies files and indirection for code that will only ever change alongside its caller, and it trains the team to ignore boundaries because most of them protect nothing.</p></div>
          <div><b>MISTAKE</b><h3>Splitting along technical layout instead of change axis</h3><p>Organizing packages by type — all "services" together, all "utils" together — looks like separation but isn't; a rule change and a formatting change can still ripple through the same "service" package. The split has to follow who causes the change, not what the code happens to be named.</p></div>
          <div><b>MISTAKE</b><h3>Ignoring a seam that's already volatile</h3><p>Coupling business rules directly to a specific ORM or a specific vendor's SDK because "we'll probably never switch" is a bet, not an analysis. If the actor driving that dependency (vendors, compliance, cost) changes on its own schedule, the seam was volatile all along — the team just didn't test it against the axis-of-change question.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Product wants a "loyalty points" feature that changes only how order totals are displayed to the customer — it doesn't touch whether an order can be placed or how it's validated. Using the axis-of-change test, does this justify a new boundary around order-placement logic, around the presentation of totals, both, or neither — and why?</p>
        </div>
      </section>
    </div>
  );
}
