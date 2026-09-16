export default function BoundariesBoundaryInterfacesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">The interface at a boundary is a contract written by the policy that needs it, not a description of the detail that happens to implement it.</p>
        <p>It's easy to treat "add an interface" as the whole job of building a boundary. It isn't. Who writes the interface, in what vocabulary, and what obligations it puts on the implementer decide whether the interface is actually doing the work of the Dependency Inversion Principle — or just sitting between two classes as decoration. This lesson is about designing that contract deliberately, from the inner side, so the outer detail has no choice but to speak the inner side's language.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Ownership determines vocabulary</h3>
        <p>Because <code>{'OrderRepository'}</code> is defined inside the use-case layer, its method signatures are written in terms the use case already understands: <code>{'save(Order order)'}</code>, <code>{'findById(OrderId id)'}</code> returning <code>{'Optional<Order>'}</code>. Nothing about SQL, connections, or transactions appears in the signature, because the use-case layer has no vocabulary for those things and shouldn't be made to acquire one. This is the Dependency Inversion Principle applied specifically to boundary interfaces: the high-level policy defines the abstraction it needs, and the low-level detail is the one that has to adapt.</p>
        <h3>The detail conforms — it doesn't negotiate</h3>
        <p><code>{'JpaOrderRepository'}</code> doesn't get to add a parameter for a JPA <code>{'EntityManager'}</code> to the interface, or throw a checked <code>{'SQLException'}</code> the use case now has to catch. If the outer implementation needs something the interface doesn't provide, that's a signal the implementation is trying to leak its own technology into the contract, not a reason to change the contract. A boundary interface that has been edited to make one particular implementation easier to write has usually stopped being a real abstraction.</p>
        <h3>Interface Segregation applies at the boundary too</h3>
        <p>A boundary interface should expose only what its actual callers need — not every operation a capable persistence technology could theoretically support. An <code>{'OrderRepository'}</code> with <code>{'save'}</code> and <code>{'findById'}</code> is easy to fake in a test and easy to reason about. An <code>{'OrderRepository'}</code> that has grown a dozen query methods for every screen that ever needed order data becomes something every implementation — including test doubles — has to fully implement, whether it needs those methods or not.</p>
        <h3>A good boundary interface is easy to fake</h3>
        <p>A practical test for whether an interface is doing its job: can you write a five-line in-memory implementation for a unit test without needing to understand the real technology behind it at all? If writing a fake requires knowing something about JPA, HTTP, or file I/O, the interface hasn't actually hidden that detail — it's just renamed it.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 240" role="img" aria-label="Socket and plug diagram: the use case layer defines the OrderRepository interface as a socket on the boundary, and the persistence layer's JpaOrderRepository must conform to it as a plug">
            <rect x="20" y="30" width="260" height="180" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="150" y="55" textAnchor="middle" fontSize="14" fontWeight="600">Use Case Layer</text>
            <text x="150" y="78" textAnchor="middle" fontSize="10" className="mutedFill">defines the contract</text>

            <rect x="60" y="110" width="180" height="30" rx="4" className="accentFill" opacity="0.15" />
            <rect x="60" y="110" width="180" height="30" rx="4" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="150" y="130" textAnchor="middle" fontSize="10">save(Order), findById(OrderId)</text>

            <path d="M240 125 L260 125" className="accentStroke" strokeWidth="3" fill="none" />
            <circle cx="270" cy="125" r="9" className="accentStroke" fill="none" strokeWidth="3" />
            <text x="270" y="105" textAnchor="middle" fontSize="9" className="mutedFill">socket</text>

            <line x1="330" y1="20" x2="330" y2="220" className="mutedStroke" strokeWidth="2" strokeDasharray="6 6" />

            <rect x="360" y="30" width="270" height="180" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="495" y="55" textAnchor="middle" fontSize="14" fontWeight="600">Persistence Layer</text>
            <text x="495" y="78" textAnchor="middle" fontSize="10" className="mutedFill">must conform, no negotiation</text>

            <circle cx="380" cy="125" r="6" className="mutedStroke" fill="none" strokeWidth="3" />
            <path d="M386 125 L410 125" className="mutedStroke" strokeWidth="3" fill="none" />
            <rect x="410" y="110" width="180" height="30" rx="4" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="500" y="130" textAnchor="middle" fontSize="10">JpaOrderRepository</text>

            <text x="330" y="235" textAnchor="middle" fontSize="11" className="mutedFill">No SQLException, no EntityManager, no ResultSet in the contract</text>
          </svg>
          <p className="diagramCaption">The inner layer defines the socket; the outer implementation is the plug that has to match it, not the other way around.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The contract is written entirely in domain vocabulary; a lightweight in-memory implementation is trivial to build for tests, proof the interface hasn't leaked any persistence detail.</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase.port;

public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
}

// A boundary interface this clean is nearly free to fake for tests.
package com.engineeringdecoded.orders.usecase;

public class InMemoryOrderRepository implements OrderRepository {

    private final Map<OrderId, Order> store = new HashMap<>();

    @Override
    public void save(Order order) {
        store.put(order.id(), order);
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return Optional.ofNullable(store.get(id));
    }
}

class PlaceOrderUseCaseTest {

    @Test
    void placesAValidOrder() {
        OrderRepository repository = new InMemoryOrderRepository();
        PlaceOrderUseCase useCase = new PlaceOrderUseCase(repository, presenter);

        useCase.execute(new PlaceOrderRequest("cust-1", List.of(lineRequest)));

        assertTrue(repository.findById(orderId).isPresent());
    }
}`}</code></pre>
        <p>No JPA, no Spring context, no database — the test runs entirely against the contract the use-case layer owns.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Letting persistence types into the signature</h3><p>Adding <code>{'throws SQLException'}</code> or a <code>{'ResultSet'}</code> parameter to <code>{'OrderRepository'}</code> to match the real implementation's needs turns the contract into a thin wrapper around JDBC — every caller, including tests, now has to deal with a vocabulary that belongs one layer out.</p></div>
          <div><b>MISTAKE</b><h3>Whoever writes the implementation first writes the interface</h3><p>When the persistence team writes <code>{'OrderRepository'}</code> alongside <code>{'JpaOrderRepository'}</code> and the use-case team just imports it, ownership has quietly inverted — the "boundary" interface now lives in, and is shaped by, the outer layer.</p></div>
          <div><b>MISTAKE</b><h3>One giant interface for every consumer</h3><p>Piling <code>{'findByCustomerAndDateRange'}</code>, <code>{'findTopSellingLines'}</code>, and a dozen other screen-specific queries onto <code>{'OrderRepository'}</code> violates Interface Segregation at the boundary — every implementation, real or fake, now has to support features most callers never use.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate proposes adding <code>{'executeCustomQuery(String sql)'}</code> to <code>{'OrderRepository'}</code> so one screen can run a special report. Given who owns this interface, what specifically goes wrong if you say yes — and what would you propose instead?</p>
        </div>
      </section>
    </div>
  );
}
