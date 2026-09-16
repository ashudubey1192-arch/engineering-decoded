export default function DataAndPersistenceTransactionBoundariesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A transaction is a persistence concern wrapped around a use case — not something the use case, and certainly not the entity, should ever have to know exists.</p>
        <p>Where should <code>{'@Transactional'}</code> go? This lesson answers precisely: at the boundary that coordinates a use case's execution, not inside the interactor's business logic and never anywhere near the domain entities. Getting this placement wrong either breaks atomicity or, worse, drags a framework concept into the one place you worked hardest to keep it out of.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Entities have no concept of "transaction"</h3>
        <p><code>Order.place()</code> enforces a business invariant — you can't place an already-placed order. It has no concept of commit, rollback, or isolation level, because those are storage mechanics, not business rules. If an entity method needs to know whether it's "inside a transaction," that's a sign persistence has leaked into the innermost layer of the system. The entity's job stops at "is this transition valid"; whether the result gets durably saved, and atomically alongside other writes, is somebody else's job entirely.</p>
        <h3>The use-case interactor isn't the right place either</h3>
        <p>It's tempting to put <code>{'@Transactional'}</code> directly on <code>PlaceOrderUseCase.execute()</code>, since that's "where the work happens." But annotating the interactor with a Spring annotation reintroduces exactly the coupling this whole section exists to prevent — now <code>usecase</code> imports <code>org.springframework.transaction.annotation.Transactional</code>, and the interactor can't be constructed or tested without Spring's proxying machinery understanding it. Martin's model handles this with an application-service or use-case-coordinating boundary that sits just inside the interface-adapters layer: a thin class whose entire job is "run this use case inside a transaction," leaving the interactor itself framework-free.</p>
        <h3>Where it actually goes: the coordinating boundary</h3>
        <p>In a Spring application, the pragmatic answer is a thin coordinating class — sometimes literally called an application service, sometimes just the controller adapter itself if it's disciplined about staying thin — annotated <code>{'@Transactional'}</code>, whose method does nothing but call the use case's input boundary. Spring's proxy opens a transaction before the call and commits or rolls back after it returns or throws. The interactor underneath does its work — several repository calls that need to succeed or fail together — completely unaware that a transaction is even open. This keeps atomicity where it belongs, at the edge, coordinated by the framework that actually provides it, while the business logic in between stays exactly as framework-free as every other lesson in this course insists it should be.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 240" role="img" aria-label="A transaction boundary drawn as a dashed rectangle wrapping around a coordinating service and the use case interactor it calls, with the entity explicitly outside and unaware of the transaction">
            <rect x="40" y="40" width="420" height="150" rx="8" className="mutedStroke" fill="none" strokeDasharray="6 4" />
            <text x="250" y="30" textAnchor="middle" fontSize="11">@Transactional boundary</text>

            <rect x="60" y="70" width="160" height="55" rx="5" className="accentStroke" fill="none" />
            <text x="140" y="92" textAnchor="middle" fontSize="10">OrderApplicationService</text>
            <text x="140" y="108" textAnchor="middle" fontSize="9">@Transactional</text>

            <line x1="220" y1="97" x2="270" y2="97" className="accentStroke" markerEnd="url(#arrowT)" />

            <rect x="270" y="70" width="170" height="55" rx="5" className="accentStroke" fill="none" />
            <text x="355" y="92" textAnchor="middle" fontSize="10">PlaceOrderUseCase</text>
            <text x="355" y="108" textAnchor="middle" fontSize="9">no transaction awareness</text>

            <line x1="140" y1="125" x2="140" y2="160" className="mutedStroke" />
            <text x="140" y="175" textAnchor="middle" fontSize="9">commit / rollback</text>

            <rect x="500" y="70" width="130" height="55" rx="5" className="mutedStroke" fill="none" />
            <text x="565" y="92" textAnchor="middle" fontSize="10">Order</text>
            <text x="565" y="108" textAnchor="middle" fontSize="9">outside, unaware</text>

            <defs>
              <marker id="arrowT" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The transaction wraps the coordinating call into the use case; the entity sits entirely outside that concern.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A thin, transactional coordinating class wraps <code>PlaceOrderUseCase</code>, keeping <code>{'@Transactional'}</code> out of the interactor and out of <code>Order</code> entirely.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.application;

// The ONLY class in this flow that knows a transaction exists
@Service
public class OrderApplicationService implements PlaceOrderInputBoundary {

    private final PlaceOrderUseCase placeOrderUseCase;

    public OrderApplicationService(PlaceOrderUseCase placeOrderUseCase) {
        this.placeOrderUseCase = placeOrderUseCase;
    }

    @Override
    @Transactional
    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        return placeOrderUseCase.execute(request);
    }
}

// usecase/PlaceOrderUseCase.java — no @Transactional, no Spring import
package com.engineeringdecoded.orders.usecase;

public class PlaceOrderUseCase {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    public PlaceOrderUseCase(OrderRepository orderRepository, InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lineItems());

        // Both writes below succeed or fail together because the caller
        // opened one transaction around this whole method — this class
        // never references that fact.
        inventoryRepository.reserve(order.getLines());
        orderRepository.save(order);

        return new PlaceOrderResponse(order.getId(), order.getStatus());
    }
}`}</code></pre>
        <p><code>OrderController</code> now depends on <code>OrderApplicationService</code> through the same <code>PlaceOrderInputBoundary</code> interface — it has no idea a transactional wrapper was inserted at all.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Putting @Transactional directly on the interactor</h3><p>Annotating <code>PlaceOrderUseCase</code> itself pulls a Spring import into <code>usecase</code>, breaking the exact boundary this section spends its effort establishing.</p></div>
          <div><b>MISTAKE</b><h3>Managing transactions manually inside business logic</h3><p>Calling <code>entityManager.getTransaction().commit()</code> from within a use case couples it to a specific persistence API and makes nested or nested-plus-rollback scenarios error-prone.</p></div>
          <div><b>MISTAKE</b><h3>Transaction boundary too wide or too narrow</h3><p>Wrapping an entire HTTP request handler (including a slow external payment call) in one transaction holds database locks far longer than necessary; wrapping each repository call separately loses atomicity across the two writes that need to succeed together.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p><code>PlaceOrderUseCase.execute()</code> now also calls <code>paymentGateway.charge(...)</code>, a network call to Stripe, before saving the order. Should that call happen inside the same <code>{'@Transactional'}</code> boundary as the database writes? What goes wrong either way?</p>
        </div>
      </section>
    </div>
  );
}
