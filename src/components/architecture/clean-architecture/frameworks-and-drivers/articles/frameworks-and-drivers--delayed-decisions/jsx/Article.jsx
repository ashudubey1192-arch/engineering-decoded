export default function FrameworksAndDriversDelayedDecisionsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A good architecture is one that lets you postpone the decisions you're least equipped to make well on day one.</p>
        <p>This closes out the Frameworks and Drivers section with one of Robert Martin's central claims: which database, which web framework, which cloud provider — these are details, and a good architecture keeps them from having to be decided before you understand the problem. This lesson shows what that looks like in practice, starting a real project against an in-memory <code>OrderRepository</code> before any database has been chosen at all.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>"Last responsible moment," not "never decide"</h3>
        <p>Delaying a decision isn't procrastination — it's deferring it until you have the most information and the decision is cheapest to make. Early in a project you know the least about your actual query patterns, scale requirements, and team expertise. Martin's argument is that architecture's job is to keep options open long enough that these decisions get made with real evidence instead of guesses, and to make sure guessing wrong doesn't sink the project. A team that picks PostgreSQL on day one because "we'll need a database eventually" has made a detail decision before the architecture even forces them to.</p>
        <h3>What makes delay possible: the boundary, not willpower</h3>
        <p>You can't delay a decision just by intending to — you delay it by building a seam that makes the decision swappable later. That seam is exactly the <code>OrderRepository</code> interface from the earlier lessons in this section. Because the use-case layer depends on the interface and not on Hibernate or PostgreSQL directly, the team can start writing and testing <code>PlaceOrderUseCase</code> against a trivial in-memory implementation on day one, ship a working vertical slice, and only bring in a real database — and decide which one — once they understand their actual access patterns.</p>
        <h3>What you get for free</h3>
        <p>An in-memory <code>OrderRepository</code> means the first weeks of development need no running database, no schema migrations, no connection pooling — new engineers clone the repo and run the tests immediately. It also means the eventual choice of database is informed by real requirements (do orders need complex relational queries, or simple key-value lookups at massive scale?) rather than whatever the team was comfortable with before the project started. The same logic applies to the web framework and even the cloud provider: none of them need to be locked in before the business rules are proven correct.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 250" role="img" aria-label="A timeline showing PlaceOrderUseCase developed against InMemoryOrderRepository first, with the real database decision deferred to a later point on the timeline, both implementing the same OrderRepository interface">
            <line x1="40" y1="200" x2="620" y2="200" className="mutedStroke" markerEnd="url(#arrowDD)" />
            <text x="330" y="222" textAnchor="middle" fontSize="10">project timeline</text>

            <rect x="60" y="120" width="160" height="50" rx="5" className="accentStroke" fill="none" />
            <text x="140" y="142" textAnchor="middle" fontSize="10">Week 1</text>
            <text x="140" y="158" textAnchor="middle" fontSize="10">InMemoryOrderRepository</text>
            <line x1="140" y1="170" x2="140" y2="200" className="accentStroke" />

            <rect x="440" y="120" width="160" height="50" rx="5" className="mutedStroke" fill="none" />
            <text x="520" y="142" textAnchor="middle" fontSize="10">Week 12</text>
            <text x="520" y="158" textAnchor="middle" fontSize="10">PostgresOrderRepository</text>
            <line x1="520" y1="170" x2="520" y2="200" className="mutedStroke" />

            <rect x="230" y="30" width="200" height="50" rx="5" className="accentStroke" fill="none" />
            <text x="330" y="50" textAnchor="middle" fontSize="10">OrderRepository</text>
            <text x="330" y="66" textAnchor="middle" fontSize="10">(interface — decided early)</text>

            <line x1="270" y1="80" x2="150" y2="120" className="mutedStroke" strokeDasharray="4 4" />
            <line x1="390" y1="80" x2="510" y2="120" className="mutedStroke" strokeDasharray="4 4" />

            <defs>
              <marker id="arrowDD" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The interface is decided early; which class implements it is decided as late as the architecture allows.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A minimal in-memory repository is enough to develop and test <code>PlaceOrderUseCase</code> fully, weeks before anyone opens a database console.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.persistence;

// No database chosen yet — this satisfies the port so use cases
// can be built, run, and tested today.
public class InMemoryOrderRepository implements OrderRepository {

    private final Map<OrderId, Order> orders = new ConcurrentHashMap<>();

    @Override
    public void save(Order order) {
        orders.put(order.getId(), order);
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return Optional.ofNullable(orders.get(id));
    }
}

// Test written and passing before any real database exists
class PlaceOrderUseCaseTest {

    @Test
    void placesAndPersistsAnOrder() {
        OrderRepository repository = new InMemoryOrderRepository();
        PlaceOrderUseCase useCase = new PlaceOrderUseCase(repository, new FakePaymentGateway());

        PlaceOrderResponse response = useCase.execute(
            new PlaceOrderRequest(new CustomerId("cust-1"), List.of(
                new OrderLineRequest("sku-42", 2)
            ))
        );

        assertThat(response.status()).isEqualTo(OrderStatus.PLACED);
        assertThat(repository.findById(response.orderId())).isPresent();
    }
}

// Composition root: swapping the database later is a one-line change
public class Main {
    public static void main(String[] args) {
        OrderRepository repository = new InMemoryOrderRepository(); // becomes PostgresOrderRepository later
        PlaceOrderInputBoundary placeOrder = new PlaceOrderUseCase(repository, new StripePaymentGateway(StripeClient.create()));
        // ...wire remaining drivers
    }
}`}</code></pre>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Choosing the database before writing a single use case</h3><p>Picking PostgreSQL or MongoDB in a kickoff meeting, before the team knows the real access patterns, locks in a detail decision the architecture was designed to let them defer.</p></div>
          <div><b>MISTAKE</b><h3>Mistaking "in-memory repository" for "not production-ready thinking"</h3><p>Treating the in-memory implementation as throwaway prototyping code, rather than a legitimate first implementation of a real port, causes teams to skip designing the interface carefully.</p></div>
          <div><b>MISTAKE</b><h3>Confusing delay with indecision</h3><p>Never committing to a database because "we might change it" stalls delivery — the goal is deferring the decision to the last <em>responsible</em> moment, not avoiding it indefinitely.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your team is under pressure to "just pick Postgres now and move on." What concrete evidence would justify deciding today rather than deferring, and what evidence would justify waiting?</p>
        </div>
      </section>
    </div>
  );
}
