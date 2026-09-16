export default function AppliedDddTestingDomainModelsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A domain model shaped the way this course has built it &mdash; framework-free, as the
          Layered Architecture article insisted &mdash; should be the easiest part of a system to
          test: no database, no HTTP server, no mocks of infrastructure. This article covers
          testing entities, aggregates, and domain services directly, plus the one place mocks
          legitimately belong: at a port's boundary.
        </p>
        <p>
          Cargoflow's <code>ShipmentTest</code> runs in milliseconds and needs nothing but the
          <code> Shipment</code> class itself.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Testing the domain model, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Test invariants by asserting what the entity refuses to do, not just what it
            allows.</b> A test that only checks successful transitions misses exactly the
            protection the Business Invariants article was about.
          </li>
          <li>
            <b>Construct aggregates directly in tests, with no repository or database
            involved.</b> <code>new Shipment(...)</code> or a test factory method, never a real
            <code> ShipmentRepository</code> &mdash; the whole point of a framework-free domain
            layer is that this is possible.
          </li>
          <li>
            <b>Test domain events as an observable side effect of a method call.</b> After calling{" "}
            <code>markDelivered()</code>, assert that <code>pullPendingEvents()</code> contains a{" "}
            <code>ShipmentDelivered</code> with the right fields &mdash; the event is part of the
            entity's public contract, worth testing directly.
          </li>
          <li>
            <b>Reserve mocks for ports, and only ports.</b> A test for an application-layer use
            case may mock <code>ShipmentRepository</code>; a test for the <code>Shipment</code>{" "}
            entity itself should never need a mock of anything.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="20" y="45" width="150" height="60" rx="8" />
            <text className="boxText" x="95" y="70" fontSize="11">Shipment test</text>
            <text className="figHint" x="95" y="90">no mocks, ms runtime</text>
            <rect className="box" x="200" y="45" width="150" height="60" rx="8" />
            <text className="boxText" x="275" y="70" fontSize="11">Use case test</text>
            <text className="figHint" x="275" y="90">mocks the port</text>
            <rect className="box" x="380" y="45" width="130" height="60" rx="8" />
            <text className="boxText" x="445" y="70" fontSize="11">Integration test</text>
            <text className="figHint" x="445" y="90">real database</text>
          </svg>
          <figcaption>Only the outermost test needs real infrastructure; the entity test needs none at all.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A pure domain test, and where a mock legitimately appears</h2>
        <span className="codeLabel">JAVA &mdash; ENTITY TEST: ZERO MOCKS</span>
        <div className="codeBlock">
          <pre>{`class ShipmentTest {
    @Test
    void refusesToExceedContractedDistance() {
        Shipment shipment = Shipment.book(contractedDistance(500));
        shipment.addLeg(new Leg(origin, waypoint, 300));
        assertThrows(DistanceExceededException.class,
            () -> shipment.addLeg(new Leg(waypoint, destination, 300))); // 600 > 500
    }

    @Test
    void deliveryRecordsADomainEvent() {
        Shipment shipment = Shipment.book(contractedDistance(500));
        shipment.markDelivered(pod);
        assertThat(shipment.pullPendingEvents()).containsExactly(
            new ShipmentDelivered(shipment.id(), pod, shipment.deliveredAt()));
    }
}

// application-layer test: THIS is where a mock belongs, at the port
class DeliverShipmentUseCaseTest {
    @Test
    void savesAndPublishesOnDelivery() {
        ShipmentRepository mockRepo = mock(ShipmentRepository.class); // the port, mocked
        when(mockRepo.findById(id)).thenReturn(Optional.of(bookedShipment));
        useCase.deliverShipment(id, pod);
        verify(mockRepo).save(any());
    }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Mocking the entity itself instead of constructing a real one.</b> A mocked{" "}
            <code>Shipment</code> tests nothing about the actual invariant logic &mdash; it only
            tests that the mock was configured as expected.
          </li>
          <li>
            <b>Only testing the happy path.</b> A model's most valuable tests assert what it
            refuses, since that is where the actual business rule lives.
          </li>
          <li>
            <b>Writing every domain test through the repository and a real database, "to be
            realistic."</b> That turns a millisecond unit test into a slow integration test and
            discourages running it often, defeating the fast-feedback benefit a framework-free
            domain layer is supposed to provide.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>ShipmentTest</code> need zero mocks, while <code>DeliverShipmentUseCaseTest</code> mocks <code>ShipmentRepository</code>?</p>
          <p>
            <b>Answer:</b> <code>Shipment</code> is a pure domain entity with no dependency on
            infrastructure at all, so it can be constructed and exercised directly. The use case,
            by contrast, depends on the <code>ShipmentRepository</code> port to load and save
            shipments; mocking that port is the correct boundary for a mock, since the test is
            about the use case's orchestration, not the repository's real implementation.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A properly isolated domain model tests fast and without mocks &mdash; reserve mocks for
        ports at the application layer's boundary, and spend the resulting speed on testing what
        the model refuses, not just what it allows.
      </p>
    </div>
  );
}
