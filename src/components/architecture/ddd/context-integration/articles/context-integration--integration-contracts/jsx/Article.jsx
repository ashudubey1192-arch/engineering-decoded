export default function ContextIntegrationIntegrationContractsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An integration contract is the explicit agreement about what crosses a bounded context
          boundary: which fields, which types, which guarantees. The Context Mapping article named
          the relationship patterns between contexts (Partnership, Customer-Supplier, and so on);
          this section is about the concrete mechanics of integrating across whichever
          relationship applies. A contract is what keeps that integration from silently breaking.
        </p>
        <p>
          Cargoflow's Booking-to-Billing integration is a Customer-Supplier relationship with one
          contract: the <code>ShipmentDelivered</code> event's shape.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Designing a contract, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Decide what the contract actually promises &mdash; and what it deliberately does
            not.</b> <code>ShipmentDelivered</code> promises a shipment ID, a delivery timestamp,
            and proof of delivery. It does not promise anything about <code>Leg</code> details,
            which Billing has never needed.
          </li>
          <li>
            <b>Version the contract explicitly, from day one, even before a second version
            exists.</b> Cargoflow's events carry an implicit version 1; the day a field needs to
            change, the contract becomes <code>ShipmentDeliveredV2</code>, not a silent field
            addition that assumes every consumer reads defensively.
          </li>
          <li>
            <b>Write the contract down somewhere both teams can see, not just in code.</b> A
            schema file or a shared document, reviewed by both the Booking and Billing teams
            before it ships, not discovered by Billing when a deploy breaks their handler.
          </li>
          <li>
            <b>Test the contract itself, separately from either side's implementation.</b> A
            contract test that fails the moment Booking publishes a shape Billing did not agree
            to, independent of whether either service's own unit tests still pass.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="140" height="50" rx="8" />
            <text className="boxText" x="90" y="80">Booking (supplier)</text>
            <rect className="boxAccent" x="190" y="55" width="120" height="40" rx="6" />
            <text className="boxText" x="250" y="80" fontSize="12">Contract</text>
            <rect className="box" x="340" y="50" width="140" height="50" rx="8" />
            <text className="boxText" x="410" y="80">Billing (consumer)</text>
            <line className="flow" x1="160" y1="75" x2="190" y2="75" />
            <line className="flow" x1="310" y1="75" x2="340" y2="75" />
            <text className="figHint" x="250" y="35">reviewed by both teams, tested independently</text>
          </svg>
          <figcaption>The contract sits explicitly between the two sides &mdash; neither team's internal model, agreed and tested on its own.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A contract as a shared, versioned type</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// shared contract module, owned jointly, imported by both Booking and Billing
public record ShipmentDeliveredV1(
    String shipmentId,
    Instant deliveredAt,
    String proofOfDeliveryUrl
) {}

// contract test, lives with the publisher, fails the build if the shape drifts
class ShipmentDeliveredContractTest {
    @Test
    void publishedEventMatchesAgreedSchema() {
        ShipmentDeliveredV1 event = bookingService.deliverShipment(testShipmentId);
        assertThat(event).hasAllNullableFieldsOrPropertiesExcept(); // no undocumented fields
        assertThat(event.shipmentId()).isNotBlank();
    }
}`}</pre>
        </div>
        <p>
          The contract type lives in a shared module both teams depend on; changing its shape
          means both teams see the compile error, not just the team that happened to change it.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Treating "we're in the same monorepo" as a substitute for an explicit contract.</b>{" "}
            Proximity in source control does not stop one team from changing a shape the other
            depends on without noticing.
          </li>
          <li>
            <b>Adding fields to a contract without a version bump, assuming consumers won't
            mind.</b> A required field added later can break a consumer that validates strictly,
            even though nothing was "removed."
          </li>
          <li>
            <b>Letting the contract mirror one side's internal model exactly.</b> A contract
            shaped like Booking's internal <code>Shipment</code> entity couples Billing to
            Booking's implementation details, not to an intentional agreement.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does Cargoflow give <code>ShipmentDeliveredV1</code> an explicit version number even before a second version exists?</p>
          <p>
            <b>Answer:</b> It establishes from day one that the contract can change deliberately
            and visibly &mdash; a future breaking change becomes <code>V2</code>, forcing an
            explicit migration conversation, rather than a silent, undocumented mutation of{" "}
            <code>V1</code> that consumers have no warning about.
          </p>
        </div>
      </section>
      <p className="takeaway">
        An integration contract is an explicit, versioned, jointly-owned agreement about what
        crosses a context boundary &mdash; write it down, test it independently, and never let it
        silently mirror either side's internal model.
      </p>
    </div>
  );
}
