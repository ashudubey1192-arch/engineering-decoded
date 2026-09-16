export default function ContextIntegrationTranslationLayersArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A translation layer converts one bounded context's model into another's at the
          boundary, so neither context's internal vocabulary leaks into the other. This is the
          concrete mechanism behind the Anti-Corruption Layer pattern from the Strategic Design
          section &mdash; that article named the relationship; this one builds the code that
          implements it.
        </p>
        <p>
          Cargoflow's Routing context consumes a third-party carrier API that calls a shipment a
          "consignment" and its status an integer code. The translation layer is where "1" becomes
          <code> ShipmentStatus.IN_TRANSIT</code>, once, in one place.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a translation layer, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Name the two vocabularies explicitly before writing any conversion code.</b> The
            carrier API's language ("consignment," status codes 0-5); Cargoflow's language
            (<code>Shipment</code>, <code>ShipmentStatus</code>).
          </li>
          <li>
            <b>Put every conversion behind one narrow interface, called from exactly one place.</b>{" "}
            A single <code>CarrierApiTranslator</code> that the rest of Routing calls; nothing
            else in the codebase parses a raw carrier status code.
          </li>
          <li>
            <b>Let the translator absorb the external model's ugliness, not just its shape.</b> If
            the carrier API sends null for "unknown status," the translator decides how that maps
            to a domain-meaningful value &mdash; the domain model never sees a raw null with
            unclear meaning.
          </li>
          <li>
            <b>Test the translator against the external contract, not against Cargoflow's own
            model.</b> Its tests assert "status code 3 becomes <code>DELAYED</code>," pinned to
            the carrier's documented codes.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="45" width="140" height="50" rx="8" />
            <text className="boxText" x="90" y="72" fontSize="12">Carrier API</text>
            <text className="figHint" x="90" y="88">"consignment", code 3</text>
            <rect className="boxAccent" x="195" y="45" width="140" height="50" rx="8" />
            <text className="boxText" x="265" y="72" fontSize="12">Translator</text>
            <rect className="box" x="370" y="45" width="140" height="50" rx="8" />
            <text className="boxText" x="440" y="72" fontSize="12">Shipment</text>
            <text className="figHint" x="440" y="88">DELAYED</text>
            <line className="flow" x1="160" y1="70" x2="195" y2="70" />
            <line className="flow" x1="335" y1="70" x2="370" y2="70" />
          </svg>
          <figcaption>Every carrier-shaped value passes through one translator before it can reach a Cargoflow domain type.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One class, one job: translate</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public class CarrierApiTranslator {
    // the only place in Cargoflow that knows the carrier's raw status codes
    public ShipmentStatus toDomainStatus(int carrierStatusCode) {
        return switch (carrierStatusCode) {
            case 0, 1 -> ShipmentStatus.BOOKED;
            case 2 -> ShipmentStatus.IN_TRANSIT;
            case 3 -> ShipmentStatus.DELAYED;
            case 4 -> ShipmentStatus.DELIVERED;
            default -> throw new UnrecognizedCarrierStatusException(carrierStatusCode);
        };
    }

    public Shipment toDomainShipment(CarrierConsignmentDto dto) {
        return Shipment.reconstitute(
            new ShipmentId(dto.consignmentRef()),
            toDomainStatus(dto.statusCode())
        );
    }
}`}</pre>
        </div>
        <p>
          Nothing else in Routing ever sees a <code>CarrierConsignmentDto</code> or a raw status
          integer; every other class works only with <code>Shipment</code> and{" "}
          <code>ShipmentStatus</code>.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the external DTO leak past the translator, "just this once."</b> One
            controller that reads <code>CarrierConsignmentDto</code> directly is one place the
            external vocabulary has re-entered the domain.
          </li>
          <li>
            <b>Writing a translator with no explicit handling for unrecognized values.</b> A
            silent default for an unknown status code hides a real integration problem instead of
            surfacing it.
          </li>
          <li>
            <b>Duplicating translation logic in multiple call sites instead of one shared
            translator.</b> Two slightly different mappings of the same status code is a bug
            waiting to be found in production.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>toDomainStatus()</code> throw on an unrecognized carrier status code instead of returning a default value?</p>
          <p>
            <b>Answer:</b> A silent default would hide a real integration problem &mdash; either
            the carrier introduced a new code Cargoflow doesn't know about, or a bug is sending
            garbage. Throwing surfaces the mismatch immediately instead of quietly misclassifying
            a shipment's status.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A translation layer is the code that makes an Anti-Corruption Layer real &mdash; funnel
        every external model through one narrow, well-tested translator, and let nothing else in
        the codebase speak the external vocabulary.
      </p>
    </div>
  );
}
