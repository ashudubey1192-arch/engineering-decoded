export default function DesignPrinciplesInterfaceSegregationPrincipleArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">No client should be forced to depend on methods it never calls.</p>
        <p>The Interface Segregation Principle is about keeping dependencies honest: if a class only ever reads data, it shouldn't be coupled to an interface that also lets it write, delete, or trigger side effects it will never use. That unused surface isn't harmless — it's a hidden coupling that forces recompilation, complicates testing, and, as the Liskov Substitution Principle lesson showed, tempts people into writing implementations that fake support for methods they can't actually honor.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Fat interfaces create false dependencies</h3>
        <p>When an interface bundles together methods that serve different kinds of clients, every implementer and every consumer is coupled to the whole interface, not just the part it needs. A class that depends on a fat interface changes — or at least needs re-review and re-testing — whenever <em>any</em> method on that interface changes, even ones it never calls. That's an artificial dependency: nothing about the class's actual behavior required it, the interface's shape did.</p>
        <h3>Splitting by client role, not by class</h3>
        <p>ISP fixes this by designing interfaces around what each <em>kind of client</em> actually needs, rather than around what one concrete implementation happens to offer. A single class can still implement several small interfaces — the split doesn't multiply implementation classes, it multiplies the number of narrow contracts a given consumer can depend on.</p>
        <h3>Reader/writer separation on the order repository</h3>
        <p>A single fat <code>{'OrderRepository'}</code> with <code>{'save(Order)'}</code>, <code>{'findById(OrderId)'}</code>, <code>{'delete(OrderId)'}</code>, and <code>{'findAllByCustomer(CustomerId)'}</code> looks convenient — one interface, one place to look. But a use case like <code>{'OrderHistoryUseCase'}</code>, which only ever reads, ends up depending on an interface that also advertises deletion and mutation. That's not just noise: a mock or fake built for testing <code>{'OrderHistoryUseCase'}</code> has to stub out methods it will never exercise, and a future refactor to <code>{'delete()'}</code>'s signature forces a recompile and re-review of code paths that never call it.</p>
        <p>Splitting into <code>{'OrderReader'}</code> (query methods only) and <code>{'OrderWriter'}</code> (mutation methods only) lets <code>{'OrderHistoryUseCase'}</code> depend on exactly <code>{'OrderReader'}</code>. It becomes impossible — not just unlikely, impossible at the type level — for that use case to accidentally call <code>{'save()'}</code> or <code>{'delete()'}</code>. A concrete class like <code>{'JpaOrderRepository'}</code> can still implement both interfaces at once and back both kinds of clients; the split costs nothing on the implementation side and removes a real dependency on the consumer side.</p>
        <h3>This is the same discipline as SRP, aimed at interfaces</h3>
        <p>Where SRP asks "does this class serve more than one actor?", ISP asks "does this interface serve more than one kind of client with genuinely different needs?" Both are really about not bundling unrelated reasons to change into one contract — SRP for implementation classes, ISP for the interfaces those classes are consumed through.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 240" role="img" aria-label="Diagram showing OrderHistoryUseCase depending on a fat OrderRepository versus depending only on a narrow OrderReader interface">
            <text x="150" y="22" textAnchor="middle" fontSize="13">Fat interface</text>
            <rect x="40" y="90" width="180" height="40" rx="6" className="mutedStroke" fill="none" />
            <text x="130" y="114" textAnchor="middle" fontSize="10">OrderHistoryUseCase</text>
            <line x1="220" y1="110" x2="270" y2="110" className="mutedStroke" strokeWidth="1" markerEnd="url(#ispArrow)" />
            <rect x="272" y="60" width="190" height="100" rx="6" className="mutedStroke" fill="none" strokeDasharray="4 3" />
            <text x="367" y="80" textAnchor="middle" fontSize="10">«interface» OrderRepository</text>
            <text x="367" y="100" textAnchor="middle" fontSize="9">findById()</text>
            <text x="367" y="116" textAnchor="middle" fontSize="9">findAllByCustomer()</text>
            <text x="367" y="132" textAnchor="middle" fontSize="9">save()  ← unused</text>
            <text x="367" y="148" textAnchor="middle" fontSize="9">delete()  ← unused</text>

            <text x="500" y="22" textAnchor="middle" fontSize="13">Segregated</text>
            <rect x="470" y="90" width="150" height="40" rx="6" className="accentStroke" fill="none" />
            <text x="545" y="114" textAnchor="middle" fontSize="9">OrderHistoryUseCase</text>
            <line x1="470" y1="110" x2="430" y2="110" className="accentStroke" strokeWidth="1" markerEnd="url(#ispArrowAccent)" />
            <rect x="330" y="90" width="100" height="40" rx="6" className="accentStroke" fill="none" strokeDasharray="4 3" />
            <text x="380" y="107" textAnchor="middle" fontSize="9">«interface»</text>
            <text x="380" y="121" textAnchor="middle" fontSize="9">OrderReader</text>

            <defs>
              <marker id="ispArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="mutedFill" />
              </marker>
              <marker id="ispArrowAccent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">A read-only use case coupled to a fat repository interface versus depending only on the narrow OrderReader it actually needs.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The fat interface first, then the segregated version that lets a read-only use case depend on exactly what it uses.</p>
        <pre><code>{`// BEFORE — one interface serving readers and writers alike
package com.engineeringdecoded.orders.usecase.port;

public interface OrderRepository {
    void save(Order order);
    void delete(OrderId id);
    Order findById(OrderId id);
    List<Order> findAllByCustomer(CustomerId customerId);
}

package com.engineeringdecoded.orders.usecase;

// Only ever reads, but depends on save() and delete() anyway
public class OrderHistoryUseCase {
    private final OrderRepository orderRepository;
    public OrderHistoryUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> execute(CustomerId customerId) {
        return orderRepository.findAllByCustomer(customerId);
    }
}

// AFTER — segregated by what each client actually does
package com.engineeringdecoded.orders.usecase.port;

public interface OrderReader {
    Order findById(OrderId id);
    List<Order> findAllByCustomer(CustomerId customerId);
}

public interface OrderWriter {
    void save(Order order);
    void delete(OrderId id);
}

// A repository can still implement both, backing every kind of client
public interface OrderRepository extends OrderReader, OrderWriter { }

package com.engineeringdecoded.orders.usecase;

// Now impossible to call save() or delete() from here, even by accident
public class OrderHistoryUseCase {
    private final OrderReader orderReader;
    public OrderHistoryUseCase(OrderReader orderReader) {
        this.orderReader = orderReader;
    }

    public List<Order> execute(CustomerId customerId) {
        return orderReader.findAllByCustomer(customerId);
    }
}

package com.engineeringdecoded.orders.usecase;

// A writer-only client is equally narrow
public class CancelOrderUseCase {
    private final OrderReader orderReader;
    private final OrderWriter orderWriter;

    public CancelOrderUseCase(OrderReader orderReader, OrderWriter orderWriter) {
        this.orderReader = orderReader;
        this.orderWriter = orderWriter;
    }

    public void execute(OrderId id) {
        Order order = orderReader.findById(id);
        order.cancel();
        orderWriter.save(order);
    }
}`}</code></pre>
        <p><code>{'JpaOrderRepository'}</code> implements <code>{'OrderRepository'}</code> (and therefore both narrower interfaces) once — the split changes what each use case is allowed to depend on, not how many classes you implement.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>One repository interface per entity, always</h3><p>Defaulting to a single CRUD-shaped interface for every entity, regardless of who consumes it, quietly recreates the fat-interface problem across an entire codebase.</p></div>
          <div><b>MISTAKE</b><h3>Splitting interfaces with no distinct client in mind</h3><p>Segregating methods for their own sake, without a real consumer that only needs a subset, adds files and indirection without removing any actual coupling.</p></div>
          <div><b>MISTAKE</b><h3>Mocking the whole fat interface in tests</h3><p>Writing a test double that stubs out unused methods just to satisfy the compiler is a strong signal the interface under test should have been segregated in the first place.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your <code>{'CancelOrderUseCase'}</code> depends on both <code>{'OrderReader'}</code> and <code>{'OrderWriter'}</code> separately, rather than on the combined <code>{'OrderRepository'}</code>. Since it needs both anyway, does depending on the combined interface instead actually cost you anything? What would you look at in the codebase to decide whether that combined dependency is harmless or a sign the use case is doing too much?</p>
        </div>
      </section>
    </div>
  );
}
