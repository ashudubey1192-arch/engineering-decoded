export default function AppliedCleanArchitectureRefactoringALegacySystemArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Nobody gets to start with a clean slate — most Clean Architecture happens as a strangler fig grown around code that already works.</p>
        <p>Every lesson so far has assumed you're building fresh. In reality, you'll spend far more of your career pulling a tangled controller apart a few lines at a time than writing a greenfield use case. This lesson walks a realistic <code>OrderController</code> — HTTP handling, business rules, and raw JDBC all mashed into one class — through an incremental strangler-fig extraction into entity, use-case, and adapter pieces, behind tests the whole way.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The strangler fig pattern</h3>
        <p>Named after the strangler fig vine, which grows around a host tree until it can stand on its own without ever felling the tree outright, the strangler fig pattern in software means growing new, well-factored code alongside the old code, redirecting callers to the new code piece by piece, until the legacy implementation can be deleted. The opposite approach — a big-bang rewrite — is tempting but dangerous: you stop shipping features for months, the rewrite inevitably drifts from what the legacy system actually does (including its undocumented edge cases), and you end up debugging two systems at once during the final cutover.</p>
        <h3>Where to cut first</h3>
        <p>The entity is almost always the safest place to start, because it has no framework dependencies to untangle — you're just giving business rules that are currently scattered through a controller a proper home. From there, extract the use case (the orchestration: "what has to happen, in what order, for this operation to succeed"), and only then peel the persistence and web concerns into adapters. Each extraction should be small enough to land as its own commit, and each one should keep the system working identically from the outside — that's what "behind tests" buys you: a characterization test written against the old behavior first, so you can refactor with a safety net that tells you the moment you've changed behavior instead of just structure.</p>
        <h3>Keep both paths callable during the transition</h3>
        <p>A realistic migration doesn't flip a switch. You often keep the legacy method reachable (maybe behind a feature flag, or simply unused once the new path is wired in) until you're confident the new path handles every case the old one did — cancelled orders, partial shipments, whatever edge cases accreted over the years. Only once the new <code>PlaceOrderUseCase</code> path has run in production successfully do you delete the old JDBC code. This is slower than a rewrite and that's the point — slow and reversible beats fast and irreversible when real orders and real money are on the line.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="A before box showing one tangled OrderController class doing HTTP, business logic, and JDBC, with an arrow through three incremental extraction steps to an after box showing separated entity, use case, and adapter classes">
            <rect x="20" y="70" width="180" height="120" rx="6" className="mutedStroke" fill="none" strokeWidth="1.4" />
            <text x="34" y="92" fontSize="12">BEFORE</text>
            <text x="34" y="114" fontSize="10">OrderController</text>
            <text x="44" y="132" fontSize="9">HTTP parsing</text>
            <text x="44" y="148" fontSize="9">business rules</text>
            <text x="44" y="164" fontSize="9">raw JDBC calls</text>

            <line x1="205" y1="130" x2="255" y2="130" className="accentStroke" strokeWidth="1.4" markerEnd="url(#rlArrow)" />
            <text x="208" y="122" fontSize="8">step 1: extract entity</text>

            <line x1="255" y1="130" x2="305" y2="130" className="accentStroke" strokeWidth="1.4" markerEnd="url(#rlArrow)" strokeDasharray="0" />
            <text x="255" y="112" fontSize="8">step 2: extract use case</text>

            <line x1="305" y1="130" x2="355" y2="130" className="accentStroke" strokeWidth="1.4" markerEnd="url(#rlArrow)" />
            <text x="305" y="150" fontSize="8">step 3: extract adapters</text>

            <rect x="440" y="30" width="200" height="46" rx="5" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="454" y="58" fontSize="10">entity.Order (rules)</text>

            <rect x="440" y="90" width="200" height="46" rx="5" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="454" y="118" fontSize="10">usecase.PlaceOrderUseCase</text>

            <rect x="440" y="150" width="200" height="46" rx="5" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="454" y="172" fontSize="9">adapter.web.OrderController</text>
            <text x="454" y="186" fontSize="9">adapter.persistence.Jpa...</text>

            <text x="480" y="215" fontSize="10">AFTER</text>

            <defs>
              <marker id="rlArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Three incremental extractions turn one tangled controller into entity, use-case, and adapter classes — each step lands behind a passing test suite.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here's a believable legacy <code>OrderController</code>: it parses the request, enforces business rules inline, and talks to the database directly with JDBC.</p>
        <pre><code>{`// BEFORE — everything in one class
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final JdbcTemplate jdbc;

    public OrderController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> body) {
        String customerId = (String) body.get("customerId");
        List<Map<String, Object>> lines = (List<Map<String, Object>>) body.get("lines");

        if (lines == null || lines.isEmpty()) {
            return ResponseEntity.badRequest().body("Order must have at least one line");
        }
        BigDecimal total = BigDecimal.ZERO;
        for (var line : lines) {
            BigDecimal price = new BigDecimal(line.get("price").toString());
            int qty = (int) line.get("quantity");
            total = total.add(price.multiply(BigDecimal.valueOf(qty)));
        }
        if (total.compareTo(new BigDecimal("10000")) > 0) {
            return ResponseEntity.badRequest().body("Order exceeds maximum allowed total");
        }

        String orderId = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO orders (id, customer_id, status, total) VALUES (?, ?, ?, ?)",
                orderId, customerId, "PLACED", total);
        return ResponseEntity.ok(Map.of("orderId", orderId));
    }
}

// AFTER (extraction step one) — entity owns the invariants,
// with zero framework dependencies
package com.engineeringdecoded.orders.entity;

public final class Order {
    private static final Money MAX_ORDER_TOTAL = Money.of("10000");

    private final OrderId id;
    private final CustomerId customerId;
    private final List<OrderLine> lines;
    private OrderStatus status;

    public static Order place(CustomerId customerId, List<OrderLine> lines) {
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one line");
        }
        Order order = new Order(OrderId.generate(), customerId, lines, OrderStatus.PLACED);
        if (order.total().isGreaterThan(MAX_ORDER_TOTAL)) {
            throw new IllegalStateException("Order exceeds maximum allowed total");
        }
        return order;
    }

    public Money total() {
        return lines.stream().map(OrderLine::subtotal).reduce(Money.zero(), Money::add);
    }
    // constructor, getters omitted
}

// PlaceOrderUseCase now orchestrates: build the Order, persist it via
// OrderRepository, report the result via the output boundary — and
// OrderController shrinks to parsing HTTP and calling the use case.`}</code></pre>
        <p>Each half can land as its own commit behind a characterization test that first pins down the old controller's exact behavior (including the $10,000 cap), so the refactor is provably behavior-preserving, not just "looks the same."</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Big-bang rewrite in a side branch</h3><p>Teams spend months rewriting in isolation, the branch drifts from production behavior, and the eventual merge either breaks silently or gets abandoned entirely.</p></div>
          <div><b>MISTAKE</b><h3>Refactoring without a characterization test first</h3><p>Extracting classes before pinning down current behavior means you can't tell whether a passing test suite reflects the legacy system's real edge cases or just the ones someone remembered to write.</p></div>
          <div><b>MISTAKE</b><h3>Extracting layers in the wrong order</h3><p>Starting with the persistence adapter before the entity and use case exist means the "extraction" just moves JDBC calls to a new class without actually separating business rules from framework code.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>After extracting <code>Order.place()</code>, you discover the legacy controller silently allowed orders with a negative quantity line, and nobody noticed for two years. Do you preserve that behavior in the new entity to stay "behavior-preserving," or fix it as part of the refactor — and how does a characterization test change that answer?</p>
        </div>
      </section>
    </div>
  );
}
