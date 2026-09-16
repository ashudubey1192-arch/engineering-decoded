export default function TacticalModelingRepositoriesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A repository gives the domain model the illusion of an in-memory collection of
          aggregates, hiding the database behind a small, domain-language interface. Cargoflow's
          <code> ShipmentRepository</code> looks like a collection you can add to and query, not a
          set of SQL statements.
        </p>
        <p>
          The interface lives in the domain layer; the implementation &mdash; JPA, JDBC, whatever
          &mdash; lives in infrastructure. That split is what the DDD Architecture section, later
          in this course, calls the dependency inversion at the heart of hexagonal architecture.
        </p>
      </section>
      <section id="concepts">
        <h2>1. What belongs on a repository interface, and what does not</h2>
        <div className="twoCol">
          <div>
            <h3>Belongs</h3>
            <p>
              Methods named in domain language that return whole aggregates: <code>findById</code>,
              <code> save</code>, <code>shipmentsAwaitingCarrierAssignment()</code>.
            </p>
          </div>
          <div>
            <h3>Does not belong</h3>
            <p>
              SQL fragments, pagination tokens tied to a specific database, or partial-object
              projections that leak the storage schema into the domain layer.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>ONE REPOSITORY PER AGGREGATE ROOT</small>
          <p>
            Cargoflow has a <code>ShipmentRepository</code> but no separate
            <code> LegRepository</code> &mdash; because <code>Leg</code> is not an aggregate root
            (covered next section), it is only ever reached through its owning
            <code> Shipment</code>. This rule &mdash; repositories exist only for aggregate roots
            &mdash; is one of the clearest signals of a well-drawn aggregate boundary.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="45" width="180" height="55" rx="8" />
            <text className="boxText" x="120" y="78">Domain code</text>
            <rect className="box" x="260" y="45" width="200" height="55" rx="8" />
            <text className="boxText" x="360" y="70">ShipmentRepository</text>
            <text className="figHint" x="360" y="88">interface, domain layer</text>
            <rect className="boxWarn" x="500" y="45" width="70" height="55" rx="8" />
            <text className="boxText" x="535" y="78">JPA</text>
            <line className="flow" x1="210" y1="72" x2="260" y2="72" />
            <line className="flowMuted" x1="460" y1="72" x2="500" y2="72" />
            <text className="figHint" x="480" y="115">implementation, infrastructure layer</text>
          </svg>
          <figcaption>Domain code depends only on the interface; the database-specific implementation is swappable behind it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A domain-language repository interface</h2>
        <span className="codeLabel">JAVA &mdash; DOMAIN LAYER</span>
        <div className="codeBlock">
          <pre>{`public interface ShipmentRepository {
    Optional<Shipment> findById(ShipmentId id);
    void save(Shipment shipment);
    List<Shipment> awaitingCarrierAssignment(); // named in domain language, not SQL
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; INFRASTRUCTURE LAYER</span>
        <div className="codeBlock">
          <pre>{`@Repository
class JpaShipmentRepository implements ShipmentRepository {
    private final SpringDataShipmentJpaRepo jpaRepo;

    public List<Shipment> awaitingCarrierAssignment() {
        return jpaRepo.findByCarrierIdIsNullAndStatus(ShipmentStatusEntity.BOOKED)
            .stream().map(ShipmentMapper::toDomain).toList();
    }
}`}</pre>
        </div>
        <p>
          Domain code that calls <code>awaitingCarrierAssignment()</code> never sees a SQL query
          or a JPA entity &mdash; the translation happens entirely inside the infrastructure
          implementation.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Exposing query-building methods that leak the database's shape.</b> A method like
            <code> findByRawSqlFilter(String sql)</code> defeats the entire purpose of the
            abstraction.
          </li>
          <li>
            <b>Creating a repository for every entity, not just aggregate roots.</b> A
            <code> LegRepository</code> would let callers bypass the <code>Shipment</code>{" "}
            aggregate's invariants by modifying a <code>Leg</code> directly.
          </li>
          <li>
            <b>Returning partial or lazily-loaded objects that can silently throw later.</b> A
            repository should return complete, valid aggregates or nothing at all.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why doesn't Cargoflow have a <code>LegRepository</code> even though <code>Leg</code> is a real class with real data?</p>
          <p>
            <b>Answer:</b> <code>Leg</code> is not an aggregate root &mdash; it is only ever
            reached through its owning <code>Shipment</code>. A separate repository for it would
            let code modify a Leg outside the Shipment's invariant checks.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A repository is a domain-language collection interface, one per aggregate root, with its
        database-specific implementation kept entirely out of the domain layer.
      </p>
    </div>
  );
}
