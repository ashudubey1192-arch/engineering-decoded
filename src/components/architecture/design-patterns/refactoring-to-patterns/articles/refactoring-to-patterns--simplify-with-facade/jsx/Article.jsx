export default function RefactoringToPatternsSimplifyWithFacadeArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Simplify with Facade takes calling code that has to coordinate several subsystem
          objects directly &mdash; in the right order, with the right error handling, repeated at
          every call site &mdash; and moves that coordination behind one simpler entry point,
          the same structure covered in Structural Patterns' Facade article, applied here as a
          refactoring move.
        </p>
        <p>
          Applicability: multiple call sites each independently orchestrate the same sequence of
          calls across several subsystem classes, meaning the coordination logic (and any bugs
          in it) is duplicated everywhere that sequence is needed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The refactoring, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Find call sites orchestrating the same subsystem sequence.</b> Both the web
            checkout handler and the admin "resend order" tool each call{" "}
            <code>inventory.reserve()</code>, then <code>payments.charge()</code>, then{" "}
            <code>shipping.schedule()</code>, in the same order.
          </li>
          <li>
            <b>Create a facade class wrapping the subsystems.</b> An <code>OrderFacade</code>{" "}
            holding references to <code>InventoryService</code>, <code>PaymentGateway</code>, and{" "}
            <code>ShippingService</code>.
          </li>
          <li>
            <b>Move the orchestration sequence into one facade method.</b>{" "}
            <code>OrderFacade.placeOrder(cart, customer)</code> contains the exact
            reserve-charge-schedule sequence, written once.
          </li>
          <li>
            <b>Replace each call site with a single call to the facade.</b> Both the checkout
            handler and the admin tool now call <code>orderFacade.placeOrder(cart, customer)</code>{" "}
            instead of repeating the three-step sequence themselves.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="15" width="150" height="30" rx="5" />
            <text className="boxText" x="95" y="34" fontSize="7">Checkout: reserve, charge, ship</text>
            <rect className="boxWarn" x="20" y="55" width="150" height="30" rx="5" />
            <text className="boxText" x="95" y="74" fontSize="7">Admin tool: reserve, charge, ship</text>
            <line className="flow" x1="170" y1="30" x2="240" y2="55" />
            <line className="flow" x1="170" y1="70" x2="240" y2="60" />
            <rect className="boxAccent" x="240" y="40" width="130" height="35" rx="6" />
            <text className="boxText" x="305" y="62" fontSize="8">OrderFacade</text>
          </svg>
          <figcaption>Two call sites duplicating the same three-step sequence collapse into one facade method, called from both.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Before and after</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Before: the same three-step sequence duplicated across two call sites
class CheckoutHandler {
    void handleCheckout(Cart cart, Customer customer) {
        inventory.reserve(cart.items());
        String txId = payments.charge(customer, cart.total());
        shipping.schedule(cart.items(), customer.address());
    }
}
class AdminResendOrderTool {
    void resend(Cart cart, Customer customer) {
        inventory.reserve(cart.items());          // duplicated
        String txId = payments.charge(customer, cart.total()); // duplicated
        shipping.schedule(cart.items(), customer.address());   // duplicated
    }
}

// After: one facade method, called from both places
class OrderFacade {
    private final InventoryService inventory;
    private final PaymentGateway payments;
    private final ShippingService shipping;

    void placeOrder(Cart cart, Customer customer) {
        inventory.reserve(cart.items());
        String txId = payments.charge(customer, cart.total());
        shipping.schedule(cart.items(), customer.address());
    }
}

class CheckoutHandler {
    void handleCheckout(Cart cart, Customer customer) { orderFacade.placeOrder(cart, customer); }
}
class AdminResendOrderTool {
    void resend(Cart cart, Customer customer) { orderFacade.placeOrder(cart, customer); } // no duplication
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Introducing a facade for a sequence that's only ever called from one place.</b>{" "}
            With a single call site, there's no duplication to eliminate, and the facade is just
            an extra layer to navigate.
          </li>
          <li>
            <b>Building a facade that still requires callers to reach around it for edge cases.</b>{" "}
            If half the call sites need direct access to <code>InventoryService</code> anyway
            because the facade doesn't cover their case, the facade hasn't actually simplified
            anything for them.
          </li>
          <li>
            <b>Letting the facade accumulate unrelated operations over time.</b> A facade should
            stay focused on the one coordinated workflow it was introduced for, not slowly become
            a second, informal service layer for everything.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Before this refactoring, if the correct order of operations changed (say, payment needed to be charged before inventory is reserved), how many places would need to be updated? How many after?</p>
          <p>
            <b>Answer:</b> Before: both <code>CheckoutHandler</code> and{" "}
            <code>AdminResendOrderTool</code> would need to be found and edited, since each
            duplicates the sequence independently &mdash; and any other call site doing the same
            thing would also need updating. After: only <code>OrderFacade.placeOrder()</code>{" "}
            needs to change, since every caller now goes through that single method.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Simplify with Facade collapses duplicated subsystem-coordination logic into one entry
        point &mdash; the value comes specifically from eliminating duplication across multiple
        call sites, not from wrapping a subsystem that's only ever used in one place.
      </p>
    </div>
  );
}
