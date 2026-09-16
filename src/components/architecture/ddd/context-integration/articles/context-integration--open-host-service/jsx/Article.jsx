export default function ContextIntegrationOpenHostServiceArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An open host service exposes one bounded context's capabilities through a well-defined
          protocol built for many consumers at once, rather than negotiating a bespoke contract
          with each one. Where a published language standardizes the interchange format across
          several parties, an open host service is the concrete API a context builds and owns as
          that shared access point.
        </p>
        <p>
          Cargoflow's Booking context exposes a stable, versioned REST API that Billing, Routing,
          the mobile app, and an external customer portal all consume &mdash; one API, four very
          different consumers.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Designing an open host service, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Design the protocol for the general case, not any one consumer's current need.</b>{" "}
            The Booking API returns a full shipment representation, not a trimmed shape that
            happens to match what the mobile app's first screen needed.
          </li>
          <li>
            <b>Version it explicitly and support old versions for a real deprecation window.</b>{" "}
            Cargoflow's <code>/v1/shipments</code> stays live for six months after{" "}
            <code>/v2/shipments</code> ships, so four independent consumer teams aren't forced to
            migrate on the publisher's schedule.
          </li>
          <li>
            <b>Publish the contract as a schema (OpenAPI, in Cargoflow's case), not tribal
            knowledge.</b> A new consumer team should be able to integrate from the schema alone,
            without a meeting with the Booking team.
          </li>
          <li>
            <b>Resist adding one-off fields or endpoints for a single consumer's convenience.</b>{" "}
            A field that exists only because the mobile app asked for it quietly turns an open
            host service back into a bespoke contract wearing a shared API's clothes.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="70" width="140" height="50" rx="8" />
            <text className="boxText" x="250" y="100" fontSize="12">Booking API (OHS)</text>
            <rect className="box" x="20" y="10" width="100" height="35" rx="6" />
            <text className="boxText" x="70" y="32" fontSize="10">Billing</text>
            <rect className="box" x="20" y="145" width="100" height="35" rx="6" />
            <text className="boxText" x="70" y="167" fontSize="10">Routing</text>
            <rect className="box" x="380" y="10" width="100" height="35" rx="6" />
            <text className="boxText" x="430" y="32" fontSize="10">Mobile app</text>
            <rect className="box" x="380" y="145" width="100" height="35" rx="6" />
            <text className="boxText" x="430" y="167" fontSize="10">Customer portal</text>
            <line className="flow" x1="120" y1="27" x2="180" y2="85" />
            <line className="flow" x1="120" y1="162" x2="180" y2="105" />
            <line className="flow" x1="380" y1="27" x2="320" y2="85" />
            <line className="flow" x1="380" y1="162" x2="320" y2="105" />
          </svg>
          <figcaption>One protocol, designed generally, serves four consumers &mdash; none of whom negotiated their own bespoke contract.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A versioned, generally-shaped API</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`@RestController
@RequestMapping("/v2/shipments") // explicit version, v1 still live and supported
public class ShipmentOpenHostController {

    @GetMapping("/{id}")
    public ShipmentResource get(@PathVariable String id) {
        Shipment shipment = bookingFacade.findShipment(new ShipmentId(id));
        return ShipmentResource.from(shipment); // general shape, not tailored to one consumer
    }
}

// documented once, consumed by every team from the same OpenAPI schema
public record ShipmentResource(
    String id, String status, String origin, String destination,
    Instant bookedAt, Instant estimatedDelivery
) {}`}</pre>
        </div>
        <p>
          <code>ShipmentResource</code> carries every field a reasonable consumer might need, not
          only what today's first consumer asked for &mdash; the cost of that generality is paid
          once, by the publishing team, instead of four times by four consumer-specific contracts.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Building the "open" host service around one consumer's exact needs, then bolting
            on others later.</b> The result is a contract shaped like a Customer-Supplier
            relationship wearing an open host service's name.
          </li>
          <li>
            <b>Breaking the old version the moment the new one ships.</b> Without a real
            deprecation window, an open host service just forces every consumer onto the
            publisher's release schedule.
          </li>
          <li>
            <b>Leaving the schema undocumented and answering integration questions in chat
            instead.</b> That reintroduces exactly the bespoke, high-coordination cost an open
            host service exists to remove.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the Booking team keep <code>/v1/shipments</code> live for six months after shipping <code>/v2/shipments</code>?</p>
          <p>
            <b>Answer:</b> An open host service serves multiple independent consumer teams
            (Billing, Routing, the mobile app, the customer portal); forcing all of them to
            migrate the instant a new version ships would defeat the point of having one shared,
            general-purpose API. A real deprecation window lets each consumer migrate on its own
            schedule.
          </p>
        </div>
      </section>
      <p className="takeaway">
        An open host service is a protocol built for many consumers at once &mdash; design it
        generally, version and document it explicitly, and give consumers real time to migrate
        rather than optimizing it for whichever team asked first.
      </p>
    </div>
  );
}
