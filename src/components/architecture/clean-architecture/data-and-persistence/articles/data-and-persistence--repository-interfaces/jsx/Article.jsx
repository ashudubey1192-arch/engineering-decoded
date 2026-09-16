export default function DataAndPersistenceRepositoryInterfacesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A repository interface should list exactly the operations your use cases perform — nothing a generic CRUD framework could generate for you "just in case."</p>
        <p>Database independence told you the interface is the seam. This lesson gets specific about what belongs on that interface. <code>OrderRepository</code> isn't a data-access object with a method for every possible query; it's a narrow, use-case-driven contract, and keeping it narrow is what connects this section back to the Interface Segregation Principle.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Shaped by callers, not by the underlying table</h3>
        <p>The instinct many engineers bring from ORMs and scaffolding tools is to generate a repository with a method for every CRUD operation, every filter, every sort order the underlying table could support. Clean Architecture's answer is the opposite: <code>OrderRepository</code> should only have the methods that <code>usecase</code> code actually calls. If no use case needs to delete an order, <code>OrderRepository</code> has no <code>delete</code> method — even though the database obviously supports <code>DELETE</code>. The interface's shape is a direct reflection of what the application does, not of what the storage engine can do.</p>
        <h3>Why this is Interface Segregation applied to persistence</h3>
        <p>ISP says no client should be forced to depend on methods it doesn't use. A single bloated <code>OrderRepository</code> with two dozen methods — some used by order placement, some only by an internal admin report, some only by a nightly reconciliation job — forces every implementation (including every test fake) to implement all two dozen, and forces every caller's mental model to include methods irrelevant to it. The fix, as in the design-principles section, is to split by client: perhaps <code>OrderRepository</code> stays narrow for the checkout flow (<code>save</code>, <code>findById</code>), while a separate <code>OrderQueryRepository</code> — or even a dedicated read-model interface — serves reporting needs, each owned by the use-case code that actually needs it.</p>
        <h3>Typical shape for this domain</h3>
        <p>For the order-management system this course uses throughout, a realistic <code>OrderRepository</code> stays close to three methods: <code>save(Order)</code> to persist a new or updated order, <code>findById(OrderId)</code> because the checkout and cancellation flows need to look up a specific order, and <code>findByCustomerId(CustomerId)</code> because "show me my orders" is a real use case in this domain. Each of those exists because a specific interactor calls it — not because it seemed like a reasonable thing a repository "should" have.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 250" role="img" aria-label="Before and after comparison: a bloated OrderRepository with many methods used by different unrelated clients, versus two narrow interfaces each matched to the client that actually uses it">
            <text x="150" y="25" textAnchor="middle" fontSize="12">before: one fat interface</text>
            <rect x="40" y="40" width="220" height="120" rx="6" className="mutedStroke" fill="none" />
            <text x="150" y="60" textAnchor="middle" fontSize="10">OrderRepository</text>
            <text x="150" y="78" textAnchor="middle" fontSize="9">save / findById / delete</text>
            <text x="150" y="94" textAnchor="middle" fontSize="9">findAllPaged / findByDateRange</text>
            <text x="150" y="110" textAnchor="middle" fontSize="9">countByStatus / archiveOld</text>
            <line x1="30" y1="185" x2="120" y2="160" className="mutedStroke" />
            <line x1="270" y1="185" x2="180" y2="160" className="mutedStroke" />
            <text x="20" y="200" fontSize="9">Checkout</text>
            <text x="230" y="200" fontSize="9">Admin report</text>

            <text x="500" y="25" textAnchor="middle" fontSize="12">after: two narrow ports</text>
            <rect x="380" y="40" width="140" height="55" rx="5" className="accentStroke" fill="none" />
            <text x="450" y="60" textAnchor="middle" fontSize="9">OrderRepository</text>
            <text x="450" y="76" textAnchor="middle" fontSize="9">save / findById</text>
            <line x1="450" y1="95" x2="450" y2="185" className="accentStroke" />
            <text x="450" y="200" textAnchor="middle" fontSize="9">Checkout</text>

            <rect x="540" y="40" width="140" height="55" rx="5" className="accentStroke" fill="none" />
            <text x="610" y="60" textAnchor="middle" fontSize="9">OrderQueryRepository</text>
            <text x="610" y="76" textAnchor="middle" fontSize="9">findByDateRange</text>
            <line x1="610" y1="95" x2="610" y2="185" className="accentStroke" />
            <text x="610" y="200" textAnchor="middle" fontSize="9">Admin report</text>
          </svg>
          <p className="diagramCaption">Split the repository along its actual clients instead of along what the database can theoretically do.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A checkout-scoped <code>OrderRepository</code> next to a deliberately separate query port for a reporting use case.</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase.port;

// Narrow: exactly what the checkout and cancellation flows need
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
    List<Order> findByCustomerId(CustomerId customerId);
}

// A separate interface for a separate client — not bolted onto OrderRepository
public interface OrderQueryRepository {
    List<OrderSummary> findPlacedBetween(Instant from, Instant to);
}

// usecase/CancelOrderUseCase.java depends only on what it needs
public class CancelOrderUseCase implements CancelOrderInputBoundary {

    private final OrderRepository orderRepository;

    public CancelOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void execute(CancelOrderRequest request) {
        Order order = orderRepository.findById(request.orderId())
            .orElseThrow(() -> new OrderNotFoundException(request.orderId()));
        order.cancel();
        orderRepository.save(order);
    }
}`}</code></pre>
        <p><code>CancelOrderUseCase</code> only ever sees the three methods it could plausibly need — never a <code>delete</code>, an <code>archiveOld</code>, or a paging query meant for a completely different feature.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Generating a generic CrudRepository-style interface</h3><p>Extending a framework's generic repository interface (with <code>findAll</code>, <code>deleteAll</code>, <code>count</code>, etc.) pulls dozens of unused methods into your use-case-owned port and often the framework's types along with them.</p></div>
          <div><b>MISTAKE</b><h3>Adding a method "since it'll probably be needed"</h3><p>Speculative methods on <code>OrderRepository</code> with no current caller rot untested and unverified, and widen every implementation's surface for no real benefit.</p></div>
          <div><b>MISTAKE</b><h3>One repository interface serving unrelated features</h3><p>Letting a reporting feature's query methods live on the same <code>OrderRepository</code> as checkout forces the checkout code's tests and fakes to deal with reporting concerns.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A new admin dashboard needs to list the 50 most recent orders across all customers, paginated. Does that method belong on <code>OrderRepository</code>, or somewhere else? Explain using the clients that would depend on it.</p>
        </div>
      </section>
    </div>
  );
}
