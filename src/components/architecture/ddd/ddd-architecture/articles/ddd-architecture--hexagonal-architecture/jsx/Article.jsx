export default function DddArchitectureHexagonalArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Hexagonal architecture &mdash; also called ports and adapters &mdash; takes the one
          dependency reversal the previous article flagged (domain over infrastructure) and makes
          it the organizing principle of the whole system. The domain defines <b>ports</b>{" "}
          (interfaces it needs), and everything outside &mdash; databases, message brokers, REST
          controllers &mdash; is an <b>adapter</b> plugged into one.
        </p>
        <p>
          Cargoflow's <code>ShipmentRepository</code> interface, used throughout this course, has
          quietly been a port all along. This article names the pattern explicitly.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Ports and adapters, step by step</h2>
        <ol className="stepList">
          <li>
            <b>The domain and application core define ports as interfaces it needs, in its own
            vocabulary.</b> <code>ShipmentRepository.save(Shipment)</code>, not{" "}
            <code>JpaRepository&lt;ShipmentEntity, Long&gt;</code> &mdash; the port speaks the
            domain's language, not the database's.
          </li>
          <li>
            <b>Driven adapters implement outbound ports.</b>{" "}
            <code>JpaShipmentRepository</code> implements <code>ShipmentRepository</code> against
            Postgres; a future <code>InMemoryShipmentRepository</code> could implement the same
            port for tests, with zero changes to the domain.
          </li>
          <li>
            <b>Driving adapters call inbound ports.</b> A REST controller and a scheduled batch
            job can both call the same <code>BookShipmentUseCase</code> port &mdash; the use case
            does not know or care which one is calling it.
          </li>
          <li>
            <b>The core never imports an adapter.</b> Adapters depend inward on ports; the
            dependency arrow always points toward the domain, regardless of how many adapters
            exist on either side.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
            <circle className="ringKey" cx="200" cy="130" r="70" />
            <text className="boxText" x="200" y="125">Domain +</text>
            <text className="boxText" x="200" y="142">Application</text>
            <rect className="box" x="10" y="60" width="110" height="40" rx="6" />
            <text className="boxText" x="65" y="84">REST Controller</text>
            <rect className="box" x="10" y="160" width="110" height="40" rx="6" />
            <text className="boxText" x="65" y="184">Batch Job</text>
            <rect className="boxAccent" x="280" y="60" width="110" height="40" rx="6" />
            <text className="boxText" x="335" y="84">JPA Adapter</text>
            <rect className="boxAccent" x="280" y="160" width="110" height="40" rx="6" />
            <text className="boxText" x="335" y="184">Kafka Adapter</text>
            <line className="flow" x1="120" y1="80" x2="150" y2="105" />
            <line className="flow" x1="120" y1="180" x2="150" y2="155" />
            <line className="flowMuted" x1="250" y1="105" x2="280" y2="80" />
            <line className="flowMuted" x1="250" y1="155" x2="280" y2="180" />
          </svg>
          <figcaption>Driving adapters (left) call inward; driven adapters (right) are called through ports the core defines &mdash; the core depends on neither.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A port defined by the core, implemented by an adapter</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// package com.cargoflow.domain.booking -- the port, owned by the core
public interface ShipmentRepository {
    Optional<Shipment> findById(ShipmentId id);
    void save(Shipment shipment);
}

// package com.cargoflow.adapter.persistence -- the adapter, owned by infrastructure
@Repository
public class JpaShipmentRepository implements ShipmentRepository {
    private final SpringDataShipmentJpaRepo jpaRepo;
    public Optional<Shipment> findById(ShipmentId id) {
        return jpaRepo.findById(id.value()).map(ShipmentMapper::toDomain);
    }
    public void save(Shipment shipment) {
        jpaRepo.save(ShipmentMapper.toEntity(shipment));
    }
}`}</pre>
        </div>
        <p>
          Nothing in the domain package imports <code>JpaShipmentRepository</code>. Swapping
          Postgres for DynamoDB means writing a new adapter class; the port, and everything that
          depends on it, is untouched.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Defining the port in terms the adapter dictates.</b> A port shaped like{" "}
            <code>findByIdWithJoinFetch()</code> has already let a JPA concern leak into the
            core's vocabulary.
          </li>
          <li>
            <b>Only ever writing one adapter per port, then wondering why the port exists.</b> The
            value shows up at the second adapter (a test double, a different database) or the
            first time a port is deliberately mocked in a fast unit test.
          </li>
          <li>
            <b>Confusing "hexagonal" with "exactly six sides."</b> The hexagon is arbitrary; the
            invariant is only that adapters plug into ports the core owns.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What specifically makes <code>ShipmentRepository</code> a "port" rather than just an interface?</p>
          <p>
            <b>Answer:</b> It is defined by, and lives inside, the domain/application core, in the
            core's own vocabulary &mdash; adapters implement or call it from outside, but the core
            never depends on any adapter. An interface defined by the infrastructure side and
            consumed by the domain would not be a port in this sense.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Hexagonal architecture generalizes the one dependency reversal from layered architecture
        into a rule: the core defines ports in its own language, and every adapter &mdash;
        however many exist &mdash; depends inward on them, never the reverse.
      </p>
    </div>
  );
}
