export default function AppliedCleanArchitectureModularMonolithsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">You don't need a network call to get a real module boundary — you need a compiler that refuses to let two modules touch each other's insides.</p>
        <p>A modular monolith is a single deployable application (one process, one build, one deploy pipeline) that's internally organized into strongly-bounded modules — <code>orders</code>, <code>inventory</code>, <code>payments</code> — each of which independently follows Clean Architecture's layering, and each of which exposes the rest of the system only a narrow, explicit interface. This lesson shows how that looks in the orders system, and why "modular" has to mean something stronger than "we put things in different packages."</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>One deployable, many modules</h3>
        <p>The modular monolith sits between two extremes. On one side is the tangled monolith, where any class can call any other class and the whole codebase becomes one giant ball of mutual dependencies. On the other side is a microservices architecture, where module boundaries are enforced by the network — you physically cannot call another service's private method because it's running in a different process. The modular monolith tries to get microservices' boundary discipline without paying for the network: everything ships and deploys together, but internally the module boundary is enforced as strictly as if it were a service boundary.</p>
        <h3>Each module is its own mini Clean Architecture</h3>
        <p>The <code>orders</code> module isn't just a package — it's a self-contained slice with its own entity, use case, and adapter layers, exactly like a full application would have. So does <code>inventory</code>. So does <code>payments</code>. Each module has its own inner Dependency Rule pointing toward its own entities. What's new at this scale is the rule <em>between</em> modules: <code>orders</code> is allowed to ask <code>inventory</code> "is this SKU in stock?" but it is never allowed to import <code>inventory</code>'s JPA entities, reach into its database tables, or call its use case interactors directly by constructing them. All cross-module communication goes through an explicit, narrow, published interface — often literally called a module API.</p>
        <h3>Module-level ports, not shared database tables</h3>
        <p>The single biggest tell of a fake modular monolith is a shared database schema that every module reads and writes freely. If <code>orders</code> and <code>inventory</code> both write to the same <code>stock_levels</code> table without going through each other's code, they are coupled at the data layer no matter how clean the Java package structure looks — a migration or an invariant change in one module can silently corrupt the other's assumptions. A genuinely modular monolith gives each module its own schema (or at minimum its own tables) and requires other modules to go through a published interface — an in-process port, like <code>InventoryLookupPort</code> — to get data instead of querying the table directly. This is exactly the same discipline a microservice boundary forces via the network, self-imposed without the network.</p>
        <p>This also means each module can, in principle, be pulled out into its own microservice later with far less pain — you already know its true boundaries because you've been enforcing them all along, you're just replacing an in-process interface call with a network call.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 300" role="img" aria-label="One large outer box representing the single deployable application, containing three module boxes for orders, inventory, and payments, each with its own small set of nested rings, connected by narrow module API arrows">
            <rect x="14" y="14" width="632" height="272" rx="8" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="28" y="34" fontSize="12" className="mutedStroke" fill="currentColor">single deployable application</text>

            <rect x="34" y="52" width="170" height="200" rx="6" className="accentStroke" fill="none" strokeWidth="1.4" />
            <text x="48" y="70" fontSize="12">orders module</text>
            <circle cx="119" cy="150" r="60" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="119" cy="150" r="40" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="119" cy="150" r="20" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="90" y="230" fontSize="9">entity/usecase/adapter</text>

            <rect x="245" y="52" width="170" height="200" rx="6" className="accentStroke" fill="none" strokeWidth="1.4" />
            <text x="259" y="70" fontSize="12">inventory module</text>
            <circle cx="330" cy="150" r="60" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="330" cy="150" r="40" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="330" cy="150" r="20" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="301" y="230" fontSize="9">entity/usecase/adapter</text>

            <rect x="456" y="52" width="170" height="200" rx="6" className="accentStroke" fill="none" strokeWidth="1.4" />
            <text x="470" y="70" fontSize="12">payments module</text>
            <circle cx="541" cy="150" r="60" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="541" cy="150" r="40" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="541" cy="150" r="20" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="512" y="230" fontSize="9">entity/usecase/adapter</text>

            <line x1="204" y1="152" x2="245" y2="152" className="accentStroke" strokeWidth="1.4" markerEnd="url(#mmArrow)" />
            <text x="196" y="145" fontSize="8">InventoryLookupPort</text>
            <line x1="415" y1="152" x2="456" y2="152" className="accentStroke" strokeWidth="1.4" markerEnd="url(#mmArrow)" />
            <text x="407" y="145" fontSize="8">PaymentPort</text>

            <defs>
              <marker id="mmArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Each module is its own mini Clean Architecture; modules talk to each other only through narrow published ports, never by reaching into internals.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The <code>orders</code> module needs to check stock before placing an order. Instead of querying the inventory module's tables, it depends on a port that the inventory module implements and publishes:</p>
        <pre><code>{`// Published by the inventory module, consumed by orders — this is
// the ENTIRE surface area orders is allowed to see of inventory.
package com.engineeringdecoded.orders.inventory.api;

public interface InventoryLookupPort {
    boolean isInStock(Sku sku, int quantity);
}

// Inside the orders module's use case layer
package com.engineeringdecoded.orders.orders.usecase;

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;
    private final InventoryLookupPort inventoryLookup; // module port, not a table
    private final PlaceOrderOutputBoundary outputBoundary;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              InventoryLookupPort inventoryLookup,
                              PlaceOrderOutputBoundary outputBoundary) {
        this.orderRepository = orderRepository;
        this.inventoryLookup = inventoryLookup;
        this.outputBoundary = outputBoundary;
    }

    @Override
    public void placeOrder(PlaceOrderRequest request) {
        for (var line : request.lines()) {
            if (!inventoryLookup.isInStock(line.sku(), line.quantity())) {
                outputBoundary.presentOutOfStock(line.sku());
                return;
            }
        }
        Order order = Order.place(request.customerId(), request.lines());
        orderRepository.save(order);
        outputBoundary.present(new PlaceOrderResponse(order.id(), order.status()));
    }
}`}</code></pre>
        <p>Both modules can run in the same JVM, in the same deployment, sharing nothing but this one interface — which is exactly what makes either one extractable into a separate service later without a rewrite.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Shared database tables across modules</h3><p>Letting <code>orders</code> and <code>inventory</code> both write to the same table "for convenience" recreates tight coupling at the data layer, no matter how clean the package structure looks above it.</p></div>
          <div><b>MISTAKE</b><h3>Reaching into another module's package for a shortcut</h3><p>Someone imports <code>inventory.usecase.CheckStockUseCase</code> directly from <code>orders</code> instead of going through the published port, because it saves writing an interface — this is the module-boundary equivalent of skipping the Dependency Rule.</p></div>
          <div><b>MISTAKE</b><h3>Calling "packages" modules without enforcing the boundary</h3><p>Teams draw module boxes on an architecture diagram but never actually restrict cross-package visibility or run a dependency-boundary check in CI, so the modules exist on paper only and erode within a few quarters.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate proposes that the <code>payments</code> module read order totals directly from the <code>orders</code> module's database tables "just for a reporting query, it's read-only." Why does that still break the modular monolith's boundary, and what would you propose instead?</p>
        </div>
      </section>
    </div>
  );
}
