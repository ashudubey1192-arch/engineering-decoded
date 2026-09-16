export default function DddArchitectureCleanArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Clean architecture draws the same dependency rule as hexagonal architecture &mdash;
          dependencies point inward, toward the domain &mdash; as a set of concentric rings:
          entities at the center, use cases around them, then interface adapters, then frameworks
          and drivers at the edge. This course has a dedicated Clean Architecture track for the
          full pattern; here the focus stays narrow: what it specifically buys a DDD domain model.
        </p>
        <p>
          The short version: hexagonal names two sides (inside, outside); clean architecture names
          several concentric layers on the way out. Both forbid the same thing &mdash; an inner
          ring knowing about an outer one.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The rings, mapped onto Cargoflow</h2>
        <ol className="stepList">
          <li>
            <b>Entities (innermost).</b> <code>Shipment</code>, <code>Leg</code>,{" "}
            <code>Money</code> &mdash; the entities and value objects this course has built,
            carrying business rules with zero outward knowledge.
          </li>
          <li>
            <b>Use cases.</b> <code>BookShipmentUseCase</code>, orchestrating entities to fulfill
            one application-specific operation, exactly like the application layer from the
            Layered Architecture article.
          </li>
          <li>
            <b>Interface adapters.</b> Controllers, presenters, and gateways &mdash;{" "}
            <code>ShipmentController</code>, and the repository implementations from the
            Hexagonal Architecture article, all live here.
          </li>
          <li>
            <b>Frameworks and drivers (outermost).</b> Spring, the servlet container, the JDBC
            driver &mdash; the most volatile, most replaceable ring, kept as thin and outward as
            possible.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
            <circle className="ringNode" cx="160" cy="160" r="140" fill="none" />
            <circle className="ringNode" cx="160" cy="160" r="100" fill="none" />
            <circle className="ringNode" cx="160" cy="160" r="60" fill="none" />
            <circle className="ringKey" cx="160" cy="160" r="25" />
            <text className="boxText" x="160" y="164">Entities</text>
            <text className="figLabel" x="160" y="115">Use cases</text>
            <text className="figLabel" x="160" y="75">Interface adapters</text>
            <text className="figLabel" x="160" y="35">Frameworks &amp; drivers</text>
          </svg>
          <figcaption>Every arrow between rings points inward &mdash; the same rule as hexagonal architecture, drawn with more layers.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Crossing a ring boundary with a DTO, not an entity</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// interface adapters ring: controller never exposes the entity directly
@RestController
public class ShipmentController {
    private final BookShipmentUseCase bookShipment; // use-case ring

    @PostMapping("/shipments")
    public ShipmentResponse book(@RequestBody BookShipmentRequest request) {
        Shipment shipment = bookShipment.execute(request.toCommand()); // entities ring
        return ShipmentResponse.from(shipment); // mapped back out, entity never crosses the wire
    }
}`}</pre>
        </div>
        <p>
          <code>Shipment</code> itself never appears in <code>ShipmentResponse</code>; a boundary
          DTO carries only what the outer ring needs, so changes to the entity's internal shape
          don't ripple into the HTTP contract, and vice versa.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Serializing entities directly as API responses.</b> This silently makes the HTTP
            contract and the domain model the same shape, so a refactor of one breaks the other.
          </li>
          <li>
            <b>Treating "four rings" as mandatory rather than illustrative.</b> A small service
            might collapse interface adapters and frameworks into one practical layer; the
            invariant is the dependency direction, not the exact ring count.
          </li>
          <li>
            <b>Re-litigating clean vs. hexagonal as if they conflict.</b> They express the same
            dependency-inversion idea at different granularities; picking one is a documentation
            choice, not an architectural one.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>ShipmentController</code> return a <code>ShipmentResponse</code> instead of the <code>Shipment</code> entity itself?</p>
          <p>
            <b>Answer:</b> Returning the entity directly would couple the outer HTTP contract to
            the inner domain model's shape &mdash; a change made for domain reasons would break
            API consumers, and API versioning needs would pressure the domain model. The DTO
            keeps the ring boundary a real boundary.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Clean architecture and hexagonal architecture enforce the same rule at different
        granularities: draw a boundary DTO at every ring crossing, and never let an entity leak
        past the edge of the core.
      </p>
    </div>
  );
}
