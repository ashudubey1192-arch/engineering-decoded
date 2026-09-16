export default function StructuralPatternsFacadeArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Facade provides a simplified, higher-level interface to a complex subsystem of classes,
          so most callers can use the subsystem without learning its internal structure. It
          doesn't hide the subsystem's classes &mdash; a caller who needs fine-grained control can
          still reach them directly &mdash; it just gives everyone else a much smaller surface to
          learn.
        </p>
        <p>
          Intent: provide one unified, simpler interface to a set of interfaces in a subsystem.
          Applicability: a subsystem has many interdependent classes, and most callers only need a
          small, common subset of what it can do.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a facade, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the subsystem's real complexity.</b> Placing an order touches an{" "}
            <code>InventoryChecker</code>, a <code>PaymentGateway</code>, a{" "}
            <code>ShippingCalculator</code>, and a <code>NotificationService</code> &mdash; four
            classes, each with their own setup and sequencing rules.
          </li>
          <li>
            <b>Identify the common-case sequence most callers actually need.</b> Check inventory,
            charge payment, calculate shipping, send a confirmation &mdash; in that order, nearly
            every time an order is placed.
          </li>
          <li>
            <b>Wrap that sequence in one method on a facade class.</b>{" "}
            <code>OrderFacade.placeOrder(Order order)</code>, internally calling all four
            subsystem classes in the right order.
          </li>
          <li>
            <b>Leave the subsystem classes public, for callers who genuinely need more control.</b>{" "}
            A refund flow that only needs <code>PaymentGateway</code> directly shouldn't be forced
            through the facade's full sequence.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="55" width="130" height="40" rx="6" />
            <text className="boxText" x="85" y="78" fontSize="10">Caller</text>
            <line className="flow" x1="150" y1="75" x2="200" y2="75" />
            <rect className="boxAccent" x="200" y="55" width="130" height="40" rx="6" />
            <text className="boxText" x="265" y="78" fontSize="9">OrderFacade</text>
            <line className="flow" x1="265" y1="55" x2="265" y2="20" />
            <text className="boxText" x="330" y="20" fontSize="8">Inventory</text>
            <text className="boxText" x="330" y="35" fontSize="8">Payment</text>
            <text className="boxText" x="330" y="50" fontSize="8">Shipping</text>
            <text className="boxText" x="330" y="65" fontSize="8">Notification</text>
          </svg>
          <figcaption>Most callers only ever talk to the facade; the four subsystem classes stay reachable directly for the cases that need them.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One method, four coordinated subsystem calls</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class OrderFacade {
    private final InventoryChecker inventory;
    private final PaymentGateway payment;
    private final ShippingCalculator shipping;
    private final NotificationService notifications;

    void placeOrder(Order order) {
        if (!inventory.isAvailable(order.items())) throw new OutOfStockException();
        payment.charge(order.total());
        double shippingCost = shipping.calculate(order);
        notifications.sendConfirmation(order.customerEmail(), order, shippingCost);
    }
}

// most callers: one call, no need to know the subsystem exists
orderFacade.placeOrder(order);

// a refund flow, genuinely needing fine-grained control, bypasses the facade
paymentGateway.refund(order.paymentId()); // subsystem class still directly reachable`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Making the subsystem classes private or otherwise unreachable.</b> That turns
            Facade from "a simpler common path" into "the only path," forcing every edge case
            through an interface that wasn't designed for it.
          </li>
          <li>
            <b>Letting the facade grow business logic beyond coordination.</b> If{" "}
            <code>placeOrder()</code> starts computing discount eligibility itself instead of
            delegating to a dedicated class, the facade has stopped being a facade and become
            another god class.
          </li>
          <li>
            <b>Building a facade for a subsystem that's already simple.</b> Two classes with one
            obvious call order don't need a coordinating layer &mdash; the complexity a facade
            manages should be real, not anticipated.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the refund flow call <code>paymentGateway.refund()</code> directly instead of going through <code>OrderFacade</code>?</p>
          <p>
            <b>Answer:</b> <code>OrderFacade</code> was built for the common order-placement
            sequence, not for every possible subsystem operation. A refund needs only{" "}
            <code>PaymentGateway</code>, and Facade is explicitly meant to leave subsystem classes
            reachable directly for cases like this &mdash; forcing every operation through the
            facade's fixed sequence would make it far less useful for the cases it wasn't designed
            around.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Facade when a subsystem has real, multi-class complexity and most callers only
        need its common path &mdash; simplify that path, but leave the subsystem's own classes
        reachable for whoever genuinely needs them.
      </p>
    </div>
  );
}
