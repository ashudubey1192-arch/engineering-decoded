export default function FoundationsManagingChangeArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Requirements will change; the only real question an architecture answers is how much of your system has to change along with them.</p>
        <p>No system survives contact with its first year of real usage unchanged. Clean Architecture is, at its core, a strategy for managing that inevitability &mdash; isolating the parts of a system that change for different reasons, so that a new requirement touches the smallest possible slice of code instead of rippling through everything.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Change is not a failure of planning</h3>
        <p>It is tempting to treat every requirement change as a sign the original design was wrong. Martin's framing is different: change is the normal condition software lives in, not an exception to design around once. An architecture that only works as long as nothing changes was never really an architecture &mdash; it was a snapshot.</p>

        <h3>Isolate what changes for different reasons</h3>
        <p>The core technique for managing change is separating code according to <em>why</em> it would change, not according to what it happens to do today. Business rules change because the business changes. The database schema changes because storage technology or scale requirements change. The UI changes because user expectations change. These are different axes of volatility, and when code from different axes is mixed into the same class or module, a change on one axis forces you to touch code that had nothing to do with it.</p>

        <h3>Boundaries as shock absorbers</h3>
        <p>A boundary &mdash; an interface owned by the more stable side, implemented by the more volatile side &mdash; is what actually absorbs a change. When <code>OrderRepository</code> is an interface owned by the use-case layer, swapping the persistence technology behind it is a change confined entirely to one new class implementing that interface. Without the boundary, the same change means hunting through every place the concrete persistence API was called directly.</p>

        <h3>Deferring decisions is a change-management strategy</h3>
        <p>This connects directly back to the policy/detail distinction: every detail decision you can defer is a decision you have not yet locked the rest of the system into. A team that picks its message queue technology in week one, before it is forced to, has pre-committed the whole system to absorbing that choice's eventual change. A team that keeps the choice behind a boundary can defer it, and change it later, at a fraction of the cost.</p>

        <h3>Independent development and deployment</h3>
        <p>Managing change is not only about code edits &mdash; it is also about who has to coordinate to make them. When layers and use cases are properly decoupled, one team can change how orders are persisted while another team changes how orders are priced, without stepping on each other's work or requiring a synchronized release. Architecture that ignores this ends up forcing changes to be batched and coordinated even when the underlying logic did not need to be.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 240" role="img" aria-label="Two boxes side by side, PlaceOrderUseCase and a persistence implementation, separated by a dashed boundary line with an OrderRepository interface sitting on it">
            <rect x="60" y="70" width="200" height="90" rx="8" className="accentStroke" fill="none" />
            <text x="160" y="105" fontSize="12" textAnchor="middle">PlaceOrderUseCase</text>
            <text x="160" y="125" fontSize="10" textAnchor="middle" className="mutedFill">never changes when</text>
            <text x="160" y="140" fontSize="10" textAnchor="middle" className="mutedFill">storage changes</text>

            <line x1="320" y1="20" x2="320" y2="220" strokeDasharray="6,6" className="mutedStroke" strokeWidth="1.5" />

            <rect x="280" y="120" width="80" height="40" rx="6" className="accentStroke" fill="none" />
            <text x="320" y="144" fontSize="10" textAnchor="middle">OrderRepository</text>

            <rect x="380" y="70" width="200" height="90" rx="8" className="mutedStroke" fill="none" />
            <text x="480" y="105" fontSize="12" textAnchor="middle">JpaOrderRepository</text>
            <text x="480" y="125" fontSize="10" textAnchor="middle" className="mutedFill">swap for Mongo here</text>
            <text x="480" y="140" fontSize="10" textAnchor="middle" className="mutedFill">without touching the left box</text>

            <line x1="260" y1="140" x2="280" y2="140" className="accentStroke" strokeWidth="2" />
            <line x1="360" y1="140" x2="380" y2="140" className="mutedStroke" strokeWidth="2" />
          </svg>
          <p className="diagramCaption">The boundary absorbs the change: a volatile detail on the right can change freely while the left side never notices.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Suppose the business decides to move order storage from a relational database to a document store six months into the project. Because the boundary was in place from the start, the change is confined to one new class.</p>
        <pre><code>{`// The boundary, defined once by the use-case layer and never touched again.
public interface OrderRepository {
    void save(Order order);
    Order findById(OrderId id);
}

// Original detail implementation.
public final class JpaOrderRepository implements OrderRepository {
    private final SpringDataOrderJpaRepository jpa;
    private final OrderEntityMapper mapper;

    public JpaOrderRepository(SpringDataOrderJpaRepository jpa, OrderEntityMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    public void save(Order order) {
        jpa.save(mapper.toJpaEntity(order));
    }

    public Order findById(OrderId id) {
        return mapper.toDomain(jpa.findById(id.value()).orElseThrow());
    }
}

// New detail implementation, six months later, after the storage decision changed.
public final class MongoOrderRepository implements OrderRepository {
    private final OrderMongoTemplate mongo;

    public MongoOrderRepository(OrderMongoTemplate mongo) {
        this.mongo = mongo;
    }

    public void save(Order order) {
        mongo.upsert(order);
    }

    public Order findById(OrderId id) {
        return mongo.findById(id.value());
    }
}`}</code></pre>
        <p><code>PlaceOrderUseCase</code>, <code>Order</code>, and every existing test written against the interface require zero changes &mdash; only the composition root needs to wire in the new implementation.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Designing only for the requirements you have today</h3><p>Building the persistence layer with direct SQL calls scattered through use cases because "we're only ever going to use Postgres" leaves no boundary in place the day that assumption turns out to be wrong.</p></div>
          <div><b>MISTAKE</b><h3>Mixing volatility axes in one class</h3><p>Putting validation rules, formatting logic, and persistence calls in the same method means a UI wording change and a database migration both require editing the same file, increasing the odds one change breaks the other.</p></div>
          <div><b>MISTAKE</b><h3>Committing to a detail decision too early</h3><p>Locking in a specific message broker or ORM in week one, before any boundary exists around it, spends the deferral option this lesson describes before the team even knew it needed it.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A new requirement says orders must now be validated against a fraud-detection service before being placed. Using the "isolate what changes for different reasons" idea, which existing class in the running example should <em>not</em> need to change to accommodate this, and what new piece should absorb it instead?</p>
        </div>
      </section>
    </div>
  );
}
