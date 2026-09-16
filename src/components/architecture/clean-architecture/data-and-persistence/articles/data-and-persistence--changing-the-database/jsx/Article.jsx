export default function DataAndPersistenceChangingTheDatabaseArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">This is the payoff lesson for the entire section: watch what happens, file by file, when the team swaps PostgreSQL for DynamoDB.</p>
        <p>Every lesson in this section — database independence, narrow repository interfaces, separate persistence models, a dedicated mapper, transactions kept at the edge — was building toward one moment: a real database migration that costs a handful of new files instead of a rewrite. This lesson walks through that migration as a narrative, showing exactly what changes and, more importantly, what doesn't.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The scenario</h3>
        <p>The order-management team has outgrown PostgreSQL's scaling story for order writes and decides to move order storage to DynamoDB, while keeping other parts of the system on Postgres. This is exactly the kind of decision the "Delayed Decisions" lesson argued you should be free to make well after the project started — and it's only cheap now because the team built the seams for it from day one.</p>
        <h3>What changes</h3>
        <p>Two new files, and one line in the composition root. First, a new persistence model: <code>OrderDynamoItem</code>, describing how an order is shaped as a DynamoDB item (partition key, sort key, attribute map) — it has nothing in common structurally with <code>OrderJpaEntity</code> and doesn't need to. Second, a new mapper, <code>OrderDynamoMapper</code>, translating between <code>Order</code> and <code>OrderDynamoItem</code>, mirroring exactly the role <code>OrderEntityMapper</code> played for JPA. Third, a new repository implementation, <code>DynamoOrderRepository</code>, implementing the same <code>OrderRepository</code> interface using the AWS SDK instead of Spring Data JPA. Finally, the composition root swaps one constructor call — <code>new DynamoOrderRepository(...)</code> instead of <code>new JpaOrderRepository(...)</code> — when wiring <code>PlaceOrderUseCase</code>.</p>
        <h3>What doesn't change</h3>
        <p>This is the list that matters. <code>Order</code>, <code>OrderLine</code>, <code>Money</code>, <code>OrderStatus</code> — untouched, because they never knew Postgres existed in the first place. <code>PlaceOrderUseCase</code>, <code>CancelOrderUseCase</code>, and every other interactor — untouched, because they depend only on the <code>OrderRepository</code> interface, which hasn't changed its method signatures at all. <code>OrderController</code> and every other driver adapter — untouched, because they depend on input boundaries, not on how orders get stored. Every use-case unit test — untouched and still green, because they run against fakes or in-memory implementations that were never coupled to JPA to begin with. In a system of this shape, the honest count on a real migration often looks like 2-3 new files and 1 changed line in the composition root, against dozens of files across entities, use cases, controllers, and tests that nobody has to open.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 280" role="img" aria-label="A diagram with a small red-bordered group of files that change, JpaOrderRepository being replaced by DynamoOrderRepository plus its mapper and item class, next to a large gray-bordered group of many files that do not change, including entity, use cases, and controllers">
            <text x="150" y="25" textAnchor="middle" fontSize="12">changes (3 files + 1 line)</text>
            <rect x="30" y="40" width="240" height="150" rx="6" className="accentStroke" fill="none" />
            <rect x="50" y="55" width="200" height="24" rx="3" className="mutedStroke" fill="none" />
            <text x="150" y="71" textAnchor="middle" fontSize="9">DynamoOrderRepository (new)</text>
            <rect x="50" y="88" width="200" height="24" rx="3" className="mutedStroke" fill="none" />
            <text x="150" y="104" textAnchor="middle" fontSize="9">OrderDynamoMapper (new)</text>
            <rect x="50" y="121" width="200" height="24" rx="3" className="mutedStroke" fill="none" />
            <text x="150" y="137" textAnchor="middle" fontSize="9">OrderDynamoItem (new)</text>
            <rect x="50" y="154" width="200" height="24" rx="3" className="mutedStroke" fill="none" />
            <text x="150" y="170" textAnchor="middle" fontSize="9">Main: one line rewired</text>

            <text x="490" y="25" textAnchor="middle" fontSize="12">unchanged (everything else)</text>
            <rect x="330" y="40" width="320" height="220" rx="6" className="mutedStroke" fill="none" />
            <text x="490" y="60" textAnchor="middle" fontSize="10">Order, OrderLine, Money, OrderStatus</text>
            <text x="490" y="85" textAnchor="middle" fontSize="10">PlaceOrderUseCase, CancelOrderUseCase</text>
            <text x="490" y="110" textAnchor="middle" fontSize="10">OrderRepository (interface, unchanged)</text>
            <text x="490" y="135" textAnchor="middle" fontSize="10">OrderController, OrderPresenter</text>
            <text x="490" y="160" textAnchor="middle" fontSize="10">PaymentGateway, StripePaymentGateway</text>
            <text x="490" y="185" textAnchor="middle" fontSize="10">every use-case unit test</text>
            <text x="490" y="210" textAnchor="middle" fontSize="10">OrderCliCommand, OrderBatchJob</text>
            <text x="490" y="240" textAnchor="middle" fontSize="9">(dozens of files, all still green)</text>
          </svg>
          <p className="diagramCaption">A real database migration touches the persistence adapter only — the rest of the system never notices.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The new adapter implements the exact same interface the old one did — the only thing wired differently is which class satisfies <code>OrderRepository</code>.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.persistence;

// New: DynamoDB-shaped persistence model, unrelated to OrderJpaEntity
public class OrderDynamoItem {
    private String pk; // "ORDER#" + orderId
    private String sk; // "METADATA"
    private String customerId;
    private String status;
    private long totalCents;
    private String currencyCode;
    private List<Map<String, AttributeValue>> lines;
    // getters/setters used by the AWS SDK's mapper
}

// New: mapper mirrors OrderEntityMapper's role for the new shape
public class OrderDynamoMapper {
    public OrderDynamoItem toItem(Order order) { /* ... */ return new OrderDynamoItem(); }
    public Order toDomain(OrderDynamoItem item) { /* ... */ return null; }
}

// New: implements the SAME interface the JPA adapter implemented
public class DynamoOrderRepository implements OrderRepository {

    private final DynamoDbClient dynamoDbClient;
    private final OrderDynamoMapper mapper;

    public DynamoOrderRepository(DynamoDbClient dynamoDbClient, OrderDynamoMapper mapper) {
        this.dynamoDbClient = dynamoDbClient;
        this.mapper = mapper;
    }

    @Override
    public void save(Order order) {
        OrderDynamoItem item = mapper.toItem(order);
        dynamoDbClient.putItem(buildPutRequest(item));
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return fetchItem(id).map(mapper::toDomain);
    }

    @Override
    public List<Order> findByCustomerId(CustomerId customerId) {
        return queryByCustomer(customerId).stream().map(mapper::toDomain).toList();
    }
}

// The ONLY line that changes in the composition root
public class Main {
    public static void main(String[] args) {
        OrderRepository orderRepository =
            new DynamoOrderRepository(DynamoDbClient.create(), new OrderDynamoMapper());
            // was: new JpaOrderRepository(jpaRepository, new OrderEntityMapper());

        PlaceOrderUseCase placeOrderUseCase = new PlaceOrderUseCase(orderRepository, /* ... */ null);
        // unchanged from here down
    }
}`}</code></pre>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Discovering leaks only during the migration</h3><p>If writing <code>DynamoOrderRepository</code> reveals that <code>PlaceOrderUseCase</code> secretly relied on a Postgres-specific behavior (auto-increment IDs, a specific null-handling quirk), that leak existed all along — the migration just exposed it.</p></div>
          <div><b>MISTAKE</b><h3>Trying to reuse OrderJpaEntity for DynamoDB "to save time"</h3><p>Forcing one persistence model to serve two very different storage technologies produces an awkward compromise that fits neither well, when a second dedicated model would have been cheap.</p></div>
          <div><b>MISTAKE</b><h3>Migrating without a parallel-run or shadow-write phase</h3><p>Flipping <code>OrderRepository</code>'s implementation in one deploy with no verification period risks discovering data or behavior mismatches only after the old database is already decommissioned.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>After deploying <code>DynamoOrderRepository</code>, one existing use-case test starts failing: it asserted that <code>findByCustomerId</code> returns orders sorted by creation date, but DynamoDB's query didn't guarantee that ordering. Whose responsibility is that failure — the use case, the interface, or the adapter — and where should the fix go?</p>
        </div>
      </section>
    </div>
  );
}
