export default function EntitiesAndUseCasesEnterpriseBusinessRulesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Enterprise business rules are the truths of the business itself — they would still be true if you deleted every line of code you've ever written.</p>
        <p>This is the innermost, most stable ring of Clean Architecture. Before you write a single use case or controller, the business already has rules it lives by, on paper, in people's heads, in spreadsheets. Your job in this lesson is to learn to spot those rules and isolate them from everything that depends on the fact that you happen to be building software to automate them.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Robert C. Martin calls these the <strong>critical business rules</strong> and the <strong>critical business data</strong>. They are "critical" because the business could not function without them, and they are rules the business would still need even if it processed orders with a paper ledger and a fax machine instead of a web application. An order management company has always needed a rule like "an order cannot be placed with zero lines" — that's true whether orders are tracked in <code>{'com.engineeringdecoded.orders'}</code> or in a notebook.</p>
        <h3>How to recognize one</h3>
        <p>Ask: <strong>"would this rule survive if we threw away the software?"</strong> If yes, it's an enterprise business rule and belongs on an <strong>entity</strong>. If the rule only makes sense because of how this particular application automates the workflow — for example, "send a confirmation email after checkout" — it's an application business rule instead, which you'll cover in the next lesson. Enterprise rules are few, small, and change rarely. They are the rules a domain expert states with total confidence and no hesitation.</p>
        <h3>Where they live</h3>
        <p>In the <code>{'com.engineeringdecoded.orders.entity'}</code> package, enterprise rules are enforced by the entities themselves — <code>Order</code>, <code>OrderLine</code>, <code>Money</code> — never by a service class, a controller, or a database constraint. A rule enforced only by a UI form or a database trigger is not protected; it can be bypassed by any other caller. A rule enforced inside <code>Order.addLine()</code> cannot be bypassed by anyone, because there is no other way to add a line to an order.</p>
        <h3>Why isolate them</h3>
        <p>Enterprise rules change the least often and for the fewest reasons — usually only when the business itself changes ("we now allow backorders"). Everything else in the system — frameworks, databases, even the specific use cases — changes far more often, for reasons that have nothing to do with the business ("we migrated from REST to GraphQL"). Clean Architecture puts the most stable thing at the center precisely so that volatile decisions never force changes onto stable ones.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 280" role="img" aria-label="Four concentric rings labeled Frameworks and Drivers, Interface Adapters, Use Cases, and Entities, with the innermost Entities ring highlighted and labeled as enterprise business rules that exist independent of software">
            <circle cx="320" cy="145" r="120" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <circle cx="320" cy="145" r="92" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <circle cx="320" cy="145" r="64" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <circle cx="320" cy="145" r="36" className="accentStroke" fill="none" strokeWidth="3" />
            <text x="320" y="145" textAnchor="middle" fontSize="11">Entities</text>
            <text x="320" y="158" textAnchor="middle" fontSize="9">enterprise rules</text>
            <text x="320" y="45" textAnchor="middle" fontSize="10">Frameworks &amp; Drivers</text>
            <text x="320" y="73" textAnchor="middle" fontSize="10">Interface Adapters</text>
            <text x="320" y="101" textAnchor="middle" fontSize="10">Use Cases</text>
            <line x1="50" y1="240" x2="230" y2="180" className="accentStroke" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="50" y="255" fontSize="11" className="accentFill">"true even with no computer at all"</text>
          </svg>
          <p className="diagramCaption">Enterprise business rules occupy the innermost, most stable ring — they predate and outlive any particular software system.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The rule "an order cannot be placed with zero lines" and "a cancelled order cannot be modified" are enterprise rules. They belong on the <code>Order</code> entity, not in a service or a form validator:</p>
        <pre><code>{`package com.engineeringdecoded.orders.entity;

import java.util.ArrayList;
import java.util.List;

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
            throw new IllegalStateException("Cannot add lines to a " + status + " order");
        }
        lines.add(line);
    }

    // Enterprise rule: an order with no lines is not a real order.
    public void place() {
        if (lines.isEmpty()) {
            throw new IllegalStateException("Cannot place an order with zero lines");
        }
        status = OrderStatus.PLACED;
    }

    // Enterprise rule: a cancelled order is final.
    public void cancel() {
        if (status == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is already cancelled");
        }
        status = OrderStatus.CANCELLED;
    }
}`}</code></pre>
        <p>Notice there is no <code>{'@Entity'}</code>, no <code>{'@Service'}</code>, nothing that knows this code will eventually run inside a Spring web application. A domain expert could read this class's method names and agree with every rule in it.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Enforcing rules only at the database</h3><p>Putting "order must have at least one line" as a database <code>{'CHECK'}</code> constraint means every path that bypasses the ORM — a script, a data fix, a different service — can silently violate it. The rule needs a home in code that every caller must go through.</p></div>
          <div><b>MISTAKE</b><h3>Confusing enterprise rules with workflow steps</h3><p>"Reserve inventory before confirming the order" is not an enterprise rule — it's a decision about how this particular application automates fulfillment. Putting it on the <code>Order</code> entity pulls application-specific orchestration into the most stable layer, where it doesn't belong.</p></div>
          <div><b>MISTAKE</b><h3>Letting a framework annotation sneak in "for convenience"</h3><p>Adding <code>{'@Entity'}</code> or a Lombok annotation to <code>Order</code> because "it's just easier" quietly couples the most stable class in the system to a persistence framework's release cycle and quirks.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your product manager asks for a new rule: "orders over $10,000 require manager approval before they can be placed." Is this an enterprise business rule that belongs on <code>Order</code>, or something else? What question would you ask the domain expert to decide?</p>
        </div>
      </section>
    </div>
  );
}
