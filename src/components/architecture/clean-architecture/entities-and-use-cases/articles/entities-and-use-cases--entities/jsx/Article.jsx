export default function EntitiesAndUseCasesEntitiesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">An entity is a plain Java object that owns its own rules and refuses to enter an invalid state — no framework required.</p>
        <p>This lesson gets concrete about what actually goes inside the innermost circle. You'll build out the <code>{'com.engineeringdecoded.orders.entity'}</code> package: <code>Order</code>, <code>OrderLine</code>, <code>Money</code>, <code>OrderStatus</code>, <code>CustomerId</code>, and <code>OrderId</code>, and see how each one protects its own invariants instead of trusting callers to be careful.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>An entity in Clean Architecture is not "whatever class has <code>{'@Entity'}</code> on it" — that's a JPA entity, a completely different (and outer-layer) concept, and conflating the two is one of the most common architectural mistakes in Java codebases. A Clean Architecture entity is an object that encapsulates enterprise business rules and the critical data those rules operate on, with <strong>zero</strong> dependency on any framework, database, or UI concern.</p>
        <h3>Small, focused value objects</h3>
        <p>Not every entity needs to be a mutable class with behavior. <code>OrderId</code>, <code>CustomerId</code>, and <code>Money</code> are naturally immutable value objects — perfect fits for Java <code>record</code>s. Giving each concept its own type (instead of passing raw <code>{'String'}</code>s and <code>{'BigDecimal'}</code>s everywhere) means the compiler catches mistakes like passing a customer ID where an order ID was expected, and it gives you one obvious place to enforce rules like "money amounts are never negative."</p>
        <h3>Behavior lives with the data it protects</h3>
        <p><code>Order</code> is the aggregate root: it owns a list of <code>OrderLine</code>s and an <code>OrderStatus</code>, and every state transition — adding a line, placing the order, cancelling it — goes through a method on <code>Order</code> itself, never through a setter. This is the difference between an <strong>anemic domain model</strong> (a data bag with getters and setters, and the real logic scattered across services) and a proper entity: if <code>Order</code> exposes <code>setStatus(OrderStatus)</code>, any code anywhere can put it into <code>CANCELLED</code> without going through <code>cancel()</code>'s rules. Remove the setter, and the only door left is the one guarded by the invariant.</p>
        <h3>Invalid transitions throw, they don't silently succeed</h3>
        <p>When a caller tries to do something the business rules don't allow — add a line to a placed order, cancel an already-cancelled order — the entity throws <code>{'IllegalStateException'}</code> rather than quietly ignoring the request or returning a boolean. This makes illegal states impossible to miss: the failure surfaces immediately, at the exact point the rule was violated, instead of manifesting later as corrupted data.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 250" role="img" aria-label="A state diagram showing Order transitioning from Draft to Placed to Cancelled, with guard conditions labeled on each transition and an illegal transition back to Draft blocked">
            <circle cx="110" cy="120" r="46" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="110" y="124" textAnchor="middle" fontSize="11">DRAFT</text>

            <circle cx="330" cy="120" r="46" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="330" y="124" textAnchor="middle" fontSize="11">PLACED</text>

            <circle cx="550" cy="120" r="46" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="550" y="124" textAnchor="middle" fontSize="10">CANCELLED</text>

            <line x1="156" y1="120" x2="284" y2="120" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowEnt)" />
            <text x="220" y="105" textAnchor="middle" fontSize="9">place() — lines not empty</text>

            <line x1="376" y1="120" x2="504" y2="120" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowEnt)" />
            <text x="440" y="105" textAnchor="middle" fontSize="9">cancel()</text>

            <path d="M330,74 C330,20 110,20 110,74" fill="none" className="mutedStroke" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrowEnt)" />
            <text x="220" y="30" textAnchor="middle" fontSize="9">addLine() blocked once PLACED</text>

            <line x1="550" y1="166" x2="550" y2="200" className="mutedStroke" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x="550" y="215" textAnchor="middle" fontSize="9">cancel() again → throws</text>

            <defs>
              <marker id="arrowEnt" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Order's state machine: every transition is guarded by a method the entity itself controls, not a setter a caller can misuse.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The supporting value types are small and framework-free, and <code>Order</code> composes them while guarding its own transitions:</p>
        <pre><code>{`package com.engineeringdecoded.orders.entity;

public record OrderId(String value) {
    public OrderId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("OrderId cannot be blank");
        }
    }
}

public record CustomerId(String value) { }

public record Money(long cents, String currency) {
    public Money {
        if (cents < 0) {
            throw new IllegalArgumentException("Money cannot be negative");
        }
    }

    public Money add(Money other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(cents + other.cents, currency);
    }
}

public enum OrderStatus { DRAFT, PLACED, CANCELLED }

public class OrderLine {
    private final String sku;
    private final int quantity;
    private final Money unitPrice;

    public OrderLine(String sku, int quantity, Money unitPrice) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        this.sku = sku;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public Money lineTotal() {
        Money total = new Money(0, unitPrice.currency());
        for (int i = 0; i < quantity; i++) {
            total = total.add(unitPrice);
        }
        return total;
    }
}`}</code></pre>
        <p>Every rule — no blank IDs, no negative money, no zero-or-negative quantities, no mismatched currencies — is enforced at the exact point an object is constructed or mutated, so an invalid <code>Order</code> simply cannot exist in memory.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Reusing the JPA entity as the domain entity</h3><p>Annotating <code>Order</code> with <code>{'@Entity'}</code> and <code>{'@Table'}</code> collapses two different concerns into one class. Now your business rules are entangled with Hibernate's lifecycle, lazy-loading quirks, and no-arg-constructor requirements.</p></div>
          <div><b>MISTAKE</b><h3>Public setters on aggregate state</h3><p>Adding <code>setStatus(OrderStatus)</code> "just to make testing easier" hands every caller a way to bypass <code>place()</code> and <code>cancel()</code> entirely, silently defeating every invariant you wrote.</p></div>
          <div><b>MISTAKE</b><h3>Primitive obsession for identifiers and money</h3><p>Passing raw <code>{'String'}</code> and <code>{'long'}</code> instead of <code>OrderId</code> and <code>Money</code> means the compiler can't stop you from swapping a customer ID and an order ID at a call site — a bug that only surfaces at runtime, if at all.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate proposes adding a <code>toJson()</code> method directly on <code>Order</code> "so we don't need a separate serializer." Using what you've learned about entities, explain what's wrong with that idea and where that logic should actually live instead.</p>
        </div>
      </section>
    </div>
  );
}
