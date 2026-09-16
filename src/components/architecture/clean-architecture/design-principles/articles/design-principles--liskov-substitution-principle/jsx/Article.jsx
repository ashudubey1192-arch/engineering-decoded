export default function DesignPrinciplesLiskovSubstitutionPrincipleArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">If code works with a base type, it must keep working when handed any subtype — no surprises, no exceptions.</p>
        <p>The Liskov Substitution Principle says subtypes must be substitutable for their base type without altering the correctness of the program. It sounds abstract until it bites you: an interface implementation that quietly throws where callers expect success is an LSP violation, and it's one of the sneakiest bugs in an architecture because the code compiles fine and only breaks at runtime, often in production, on a path nobody unit-tested for that specific implementation.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Substitutability is a behavioral contract, not just a type signature</h3>
        <p>Java's type system already enforces that a class implementing an interface provides every method with a matching signature. LSP asks for something the compiler can't check: that every implementation honors the <em>behavioral</em> promises callers reasonably make about that interface — what it returns, what exceptions are expected versus surprising, what side effects happen. A subtype that technically compiles but silently does less, or throws where the contract implies it won't, breaks every piece of code written against the base type.</p>
        <h3>The classic violation: a "read-only" implementation of a read/write interface</h3>
        <p>Imagine <code>{'OrderRepository'}</code> declares both <code>{'save(Order)'}</code> and <code>{'findById(OrderId)'}</code>. Now imagine a reporting feature needs an <code>{'OrderRepository'}</code> that reads from a read-replica database where writes aren't possible. The tempting shortcut is a <code>{'ReadOnlyOrderRepository'}</code> that implements the full interface but throws <code>{'UnsupportedOperationException'}</code> from <code>{'save()'}</code>. It compiles. It satisfies the interface. And it silently breaks any code — including code written long after this class existed — that receives an <code>{'OrderRepository'}</code> reference and calls <code>{'save()'}</code> on it, not knowing which implementation it actually got at runtime.</p>
        <h3>Why this is worse than a compile error</h3>
        <p>A compile error is cheap — you find it in seconds. An LSP violation surfaces as a runtime exception, possibly deep in production, triggered only when some caller happens to exercise the unsupported path against this particular implementation. Worse, it usually means whoever wrote the calling code had to know, out of band, which concrete implementations are "safe" to call <code>{'save()'}</code> on — exactly the kind of hidden coupling polymorphism is supposed to eliminate.</p>
        <h3>The fix is almost always ISP, not a workaround</h3>
        <p>The correct fix isn't to make <code>{'save()'}</code> "fail gracefully" or document the exception — it's to recognize that <code>{'OrderRepository'}</code> was never one honest contract for a read-only consumer. Split it into <code>{'OrderReader'}</code> (just <code>{'findById'}</code>) and <code>{'OrderWriter'}</code> (just <code>{'save'}</code>), let the full read/write repository implement both, and let the read-replica implementation honestly implement only <code>{'OrderReader'}</code>. Now there is no method to violate — the type system itself prevents the caller from ever calling <code>{'save()'}</code> on something that can't do it. This is exactly why LSP and the Interface Segregation Principle are so often fixed together: a fat interface is what tempts you into an LSP-violating "partial" implementation in the first place.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="Diagram contrasting a ReadOnlyOrderRepository that throws on save versus splitting the interface into OrderReader and OrderWriter">
            <text x="150" y="22" textAnchor="middle" fontSize="13">Violates LSP</text>
            <rect x="60" y="40" width="180" height="34" rx="6" className="mutedStroke" fill="none" strokeDasharray="4 3" />
            <text x="150" y="61" textAnchor="middle" fontSize="10">«interface» OrderRepository</text>
            <text x="150" y="86" textAnchor="middle" fontSize="9">save(Order), findById(id)</text>
            <line x1="150" y1="94" x2="150" y2="128" className="mutedStroke" strokeWidth="1" markerEnd="url(#lspArrow)" />
            <rect x="60" y="130" width="180" height="44" rx="6" className="mutedStroke" fill="none" />
            <text x="150" y="150" textAnchor="middle" fontSize="10">ReadOnlyOrderRepository</text>
            <text x="150" y="166" textAnchor="middle" fontSize="9">save() throws!</text>
            <text x="150" y="200" textAnchor="middle" fontSize="9">callers of save() break</text>
            <text x="150" y="215" textAnchor="middle" fontSize="9">only for this subtype</text>

            <text x="480" y="22" textAnchor="middle" fontSize="13">Follows LSP</text>
            <rect x="390" y="40" width="90" height="30" rx="6" className="accentStroke" fill="none" strokeDasharray="4 3" />
            <text x="435" y="59" textAnchor="middle" fontSize="9">OrderReader</text>
            <rect x="490" y="40" width="90" height="30" rx="6" className="accentStroke" fill="none" strokeDasharray="4 3" />
            <text x="535" y="59" textAnchor="middle" fontSize="9">OrderWriter</text>

            <line x1="420" y1="70" x2="420" y2="128" className="accentStroke" strokeWidth="1" markerEnd="url(#lspArrowAccent)" />
            <line x1="480" y1="70" x2="440" y2="128" className="accentStroke" strokeWidth="1" markerEnd="url(#lspArrowAccent)" />
            <rect x="360" y="130" width="140" height="34" rx="6" className="accentStroke" fill="none" />
            <text x="430" y="151" textAnchor="middle" fontSize="9">JpaOrderRepository</text>

            <line x1="500" y1="70" x2="560" y2="128" className="mutedStroke" strokeWidth="1" markerEnd="url(#lspArrow)" />
            <rect x="500" y="130" width="130" height="34" rx="6" className="mutedStroke" fill="none" />
            <text x="565" y="151" textAnchor="middle" fontSize="9">ReadReplicaReader</text>
            <text x="565" y="200" textAnchor="middle" fontSize="9">no save() to violate</text>

            <defs>
              <marker id="lspArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="mutedFill" />
              </marker>
              <marker id="lspArrowAccent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">A read-only class forced to implement save() breaks callers; splitting into OrderReader/OrderWriter removes the broken promise entirely.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The violation first, then the fix that removes the broken contract instead of hiding it.</p>
        <pre><code>{`// VIOLATION — compiles fine, breaks at runtime for any caller that saves
package com.engineeringdecoded.orders.usecase.port;

public interface OrderRepository {
    void save(Order order);
    Order findById(OrderId id);
}

package com.engineeringdecoded.orders.adapter.persistence;

public class ReadOnlyOrderRepository implements OrderRepository {

    private final ReadReplicaDataSource dataSource;
    public ReadOnlyOrderRepository(ReadReplicaDataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Order findById(OrderId id) {
        return dataSource.query(id);
    }

    @Override
    public void save(Order order) {
        // Read replicas can't be written to — but the interface demanded this method
        throw new UnsupportedOperationException("This repository is read-only");
    }
}

// A use case written against OrderRepository has no way to know this will blow up:
public class RefundOrderUseCase {
    private final OrderRepository orderRepository; // might be the read-only one!

    public void execute(OrderId id) {
        Order order = orderRepository.findById(id);
        order.refund();
        orderRepository.save(order); // detonates only for some implementations
    }
}

// FIX — split the fat interface so the broken promise can't exist
package com.engineeringdecoded.orders.usecase.port;

public interface OrderReader {
    Order findById(OrderId id);
}

public interface OrderWriter {
    void save(Order order);
}

public interface OrderRepository extends OrderReader, OrderWriter { }

package com.engineeringdecoded.orders.adapter.persistence;

public class ReadReplicaOrderReader implements OrderReader {
    private final ReadReplicaDataSource dataSource;
    public ReadReplicaOrderReader(ReadReplicaDataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Order findById(OrderId id) {
        return dataSource.query(id);
    }
    // no save() to lie about — the class only promises what it can deliver
}

// A read-only use case now depends only on OrderReader — save() isn't even reachable
public class OrderHistoryUseCase {
    private final OrderReader orderReader;
    public OrderHistoryUseCase(OrderReader orderReader) { this.orderReader = orderReader; }

    public Order execute(OrderId id) {
        return orderReader.findById(id);
    }
}`}</code></pre>
        <p>After the fix, <code>{'RefundOrderUseCase'}</code> would only ever be given something implementing <code>{'OrderWriter'}</code> — there is no longer a code path where it receives an object that silently can't fulfil that contract.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Throwing UnsupportedOperationException to "satisfy" an interface</h3><p>Implementing every method just to compile, then throwing on the ones you can't honestly support, moves a design problem into a runtime landmine for whoever calls that method next.</p></div>
          <div><b>MISTAKE</b><h3>Strengthening preconditions in a subtype</h3><p>A subclass that suddenly requires extra validation the base type never demanded (e.g. rejecting inputs the base type accepted) breaks any code that was written, correctly, against the base type's contract.</p></div>
          <div><b>MISTAKE</b><h3>Weakening postconditions or return guarantees</h3><p>A subtype that returns null where the base type's contract implied a non-null result, or skips a side effect callers rely on, is substitutable in name only — every caller now has to special-case it.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A colleague proposes fixing <code>{'ReadOnlyOrderRepository'}</code> by having <code>{'save()'}</code> silently do nothing instead of throwing, so it "won't crash." Is a no-op save() actually LSP-compliant, or does it just trade a loud failure for a quiet, harder-to-debug one? What does that suggest about whether the real fix is ever a change to the implementation, versus a change to the interface it was forced to implement?</p>
        </div>
      </section>
    </div>
  );
}
