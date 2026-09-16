export default function DataAndPersistenceDatabaseIndependenceArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Your domain shouldn't be able to tell you whether it's backed by PostgreSQL, MongoDB, or a plain Java list.</p>
        <p>This lesson opens the Data and Persistence section by stating the goal the rest of the section works toward: database independence. Not "database agnostic" in some vague marketing sense, but a specific, testable property — no class in <code>entity</code> or <code>usecase</code> can be shown, by its imports or its behavior, to know which storage technology is running underneath it.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Independence is enforced by a single seam</h3>
        <p>Database independence isn't achieved by writing "portable" SQL or by picking a database that claims compatibility with several vendors — it's achieved architecturally, through the <code>OrderRepository</code> interface. The domain layer (<code>Order</code>, <code>OrderLine</code>, <code>Money</code>) has zero persistence awareness at all; it doesn't even know an <code>OrderRepository</code> exists. The use-case layer knows exactly one thing about persistence: the shape of the <code>OrderRepository</code> port it depends on. Everything about <em>how</em> that port gets satisfied — SQL dialect, document schema, indexing strategy — lives entirely on the other side of that interface, in the adapter layer.</p>
        <h3>What "not caring" actually looks like in code</h3>
        <p>Concretely: <code>PlaceOrderUseCase</code> calls <code>orderRepository.save(order)</code> and <code>orderRepository.findById(id)</code>. It never writes a SQL string, never references a table or collection name, never checks whether a save succeeded via a row-count or an acknowledgment flag specific to one database. If tomorrow the team swaps the relational schema for a MongoDB collection, or a DynamoDB table, the method signatures on <code>OrderRepository</code> don't have to change — only the adapter implementing them does. If a database swap ever requires touching <code>usecase</code> code, database independence has already failed, whatever the diagrams claim.</p>
        <h3>Independence is a spectrum you can test for</h3>
        <p>A useful exercise: could you run your entire use-case test suite against two wildly different <code>OrderRepository</code> implementations — an in-memory one and a real JPA-backed one — and have every test pass unmodified against both? If yes, you have real database independence. If the tests need to know which implementation is active, or if behavior subtly differs (transaction semantics, ordering guarantees, null-handling) in ways your use case actually depends on, independence is only cosmetic — the interface exists, but the dependency leaked around it rather than through it.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 250" role="img" aria-label="Three concentric layers: entity and use case in the center knowing nothing about databases, an OrderRepository interface as the only seam, with three interchangeable database adapters fanning out below it labeled Postgres, MongoDB, and in-memory">
            <rect x="230" y="20" width="200" height="70" rx="6" className="accentStroke" fill="none" />
            <text x="330" y="48" textAnchor="middle" fontSize="11">Order / PlaceOrderUseCase</text>
            <text x="330" y="65" textAnchor="middle" fontSize="10">zero persistence knowledge</text>

            <line x1="330" y1="90" x2="330" y2="115" className="accentStroke" markerEnd="url(#arrowI)" />

            <rect x="230" y="115" width="200" height="45" rx="6" className="accentStroke" fill="none" />
            <text x="330" y="142" textAnchor="middle" fontSize="11">OrderRepository (port)</text>

            <line x1="270" y1="160" x2="120" y2="205" className="mutedStroke" strokeDasharray="4 4" />
            <line x1="330" y1="160" x2="330" y2="205" className="mutedStroke" strokeDasharray="4 4" />
            <line x1="390" y1="160" x2="540" y2="205" className="mutedStroke" strokeDasharray="4 4" />

            <rect x="40" y="205" width="160" height="35" rx="4" className="mutedStroke" fill="none" />
            <text x="120" y="227" textAnchor="middle" fontSize="10">JpaOrderRepository (Postgres)</text>

            <rect x="250" y="205" width="160" height="35" rx="4" className="mutedStroke" fill="none" />
            <text x="330" y="227" textAnchor="middle" fontSize="10">MongoOrderRepository</text>

            <rect x="460" y="205" width="160" height="35" rx="4" className="mutedStroke" fill="none" />
            <text x="540" y="227" textAnchor="middle" fontSize="10">InMemoryOrderRepository</text>

            <defs>
              <marker id="arrowI" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Every storage technology is interchangeable behind one interface the business logic never looks past.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The same <code>PlaceOrderUseCase</code> code, and the same test, run correctly whether <code>OrderRepository</code> is backed by Postgres or nothing at all.</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase;

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository; // the only thing this class knows about storage

    public PlaceOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lineItems());
        orderRepository.save(order);
        return new PlaceOrderResponse(order.getId(), order.getStatus());
    }
}

// This single test class runs unmodified against ANY OrderRepository
@ParameterizedTest
@MethodSource("repositoryImplementations")
void placingAnOrderPersistsIt(OrderRepository repository) {
    PlaceOrderUseCase useCase = new PlaceOrderUseCase(repository);

    PlaceOrderResponse response = useCase.execute(
        new PlaceOrderRequest(new CustomerId("cust-9"), List.of(new OrderLineRequest("sku-1", 1)))
    );

    assertThat(repository.findById(response.orderId())).isPresent();
}

static Stream<OrderRepository> repositoryImplementations() {
    return Stream.of(
        new InMemoryOrderRepository(),
        new JpaOrderRepository(testJpaRepository(), new OrderEntityMapper())
    );
}`}</code></pre>
        <p>If this parameterized test can't pass against both implementations without special-casing, that's the signal database independence has quietly broken somewhere.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Relying on database-specific behavior in a use case</h3><p>Writing logic that depends on auto-generated IDs being sequential, or on a specific isolation level, ties the use case to one database's quirks even though it never imports its driver.</p></div>
          <div><b>MISTAKE</b><h3>Special-casing tests per database</h3><p>Writing separate assertions for the Postgres-backed test versus the in-memory test is a sign the abstraction leaks — genuinely independent code shouldn't need it.</p></div>
          <div><b>MISTAKE</b><h3>Believing "we only ever use Postgres" makes independence pointless</h3><p>Independence pays off even with one database in production, because fast in-memory tests and easy local development don't require ever actually swapping vendors.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your team runs the full use-case test suite against both <code>InMemoryOrderRepository</code> and <code>JpaOrderRepository</code>, and three tests fail only against the JPA version. What does that failure most likely reveal about your architecture, not just about those three tests?</p>
        </div>
      </section>
    </div>
  );
}
