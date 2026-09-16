export default function EnterprisePatternsServiceLayerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Service Layer defines an application's set of available operations as a boundary, with
          each method representing one use case, coordinating domain objects and repositories
          underneath &mdash; giving every caller (a web controller, a scheduled job, a test) the
          same entry point instead of duplicating orchestration logic in each one.
        </p>
        <p>
          Intent: define an application's boundary with a layer of services that establishes a
          set of available operations and coordinates the application's response in each
          operation. Applicability: the same business operation (placing an order, canceling a
          subscription) needs to be triggered from more than one place &mdash; a REST controller
          and a batch job, say &mdash; and the orchestration logic shouldn't live in either.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Drawing the boundary, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify a use case, not a CRUD operation.</b> <code>placeOrder(cart, customer)</code>{" "}
            represents a business action, not just <code>OrderRepository.save()</code> renamed.
          </li>
          <li>
            <b>Put orchestration in the service, not the caller.</b> An{" "}
            <code>OrderService.placeOrder()</code> validates the cart, checks inventory, charges
            payment, and saves the order &mdash; a controller just calls it.
          </li>
          <li>
            <b>Keep the service thin over the domain, not a replacement for it.</b> Business
            rules like "an order needs at least one item" live on the <code>Order</code> domain
            object itself; the service coordinates calls, it doesn't reimplement domain logic.
          </li>
          <li>
            <b>Let every entry point share the same service method.</b> A web controller and a
            nightly batch job both call <code>orderService.placeOrder()</code>, so the
            validation and coordination logic is written, and can be fixed, in exactly one place.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="120" height="30" rx="5" />
            <text className="boxText" x="80" y="40" fontSize="9">Web controller</text>
            <rect className="box" x="20" y="60" width="120" height="30" rx="5" />
            <text className="boxText" x="80" y="80" fontSize="9">Batch job</text>
            <line className="flow" x1="140" y1="35" x2="200" y2="70" />
            <line className="flow" x1="140" y1="75" x2="200" y2="80" />
            <rect className="boxAccent" x="200" y="55" width="130" height="40" rx="6" />
            <text className="boxText" x="265" y="79" fontSize="9">OrderService</text>
            <line className="flow" x1="330" y1="75" x2="400" y2="75" />
            <text className="figHint" x="405" y="70">domain +</text>
            <text className="figHint" x="405" y="85">repositories</text>
          </svg>
          <figcaption>Every entry point calls the same service method, so orchestration logic exists in exactly one place.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One service method, two callers</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class OrderService {
    private final InventoryRepository inventory;
    private final PaymentGateway payments;
    private final OrderRepository orders;

    OrderService(InventoryRepository inventory, PaymentGateway payments, OrderRepository orders) {
        this.inventory = inventory; this.payments = payments; this.orders = orders;
    }

    Order placeOrder(Cart cart, Customer customer) {
        if (cart.isEmpty()) throw new IllegalArgumentException("cart is empty"); // domain rule
        for (CartItem item : cart.items()) {
            if (!inventory.hasStock(item.productId(), item.quantity())) {
                throw new OutOfStockException(item.productId());
            }
        }
        PaymentResult result = payments.charge(customer, cart.total());
        Order order = new Order(customer, cart.items(), result.transactionId());
        orders.save(order);
        return order;
    }
}

class OrderController { // one caller
    private final OrderService orderService;
    Order handlePlaceOrder(Cart cart, Customer customer) { return orderService.placeOrder(cart, customer); }
}

class NightlyPreorderJob { // a second, unrelated caller -- same service, same rules
    private final OrderService orderService;
    void run(List<Cart> readyCarts, List<Customer> customers) {
        for (int i = 0; i < readyCarts.size(); i++) orderService.placeOrder(readyCarts.get(i), customers.get(i));
    }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Duplicating orchestration logic in each caller instead of a shared service.</b> If
            the controller and the batch job each independently check inventory and charge
            payment, a fix to one won't reach the other.
          </li>
          <li>
            <b>Turning the service into a thin pass-through with no real logic.</b> A service
            layer method that's just <code>repository.save(x)</code> with nothing else adds a
            layer without adding value &mdash; call the repository directly in that case.
          </li>
          <li>
            <b>Moving domain rules into the service instead of the domain objects.</b> "Cart
            can't be empty" belongs on <code>Cart</code> itself where it's always enforced, not
            only inside <code>OrderService</code> where a different code path could skip it.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why do both <code>OrderController</code> and <code>NightlyPreorderJob</code> call <code>orderService.placeOrder()</code> instead of each implementing their own inventory-check-then-charge-then-save sequence?</p>
          <p>
            <b>Answer:</b> Placing an order is one business use case with fixed rules regardless
            of what triggers it. Putting that orchestration in <code>OrderService</code> means
            both callers get identical, correct behavior, and a future change to the rules (say,
            adding a fraud check) only needs to be made in one place instead of two.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Service Layer gives every caller of a use case the same entry point &mdash; worth adding
        once orchestration logic needs to be shared or is complex enough to deserve its own home,
        not for every single repository call.
      </p>
    </div>
  );
}
