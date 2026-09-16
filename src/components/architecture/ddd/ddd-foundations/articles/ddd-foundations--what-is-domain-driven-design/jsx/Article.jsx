export default function DddFoundationsWhatIsDomainDrivenDesignArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Domain-Driven Design is an approach to building software where the software's structure
          and vocabulary are derived directly from the business domain it models &mdash; not from
          the database schema, not from a framework's conventions, and not from whatever the first
          engineer happened to name things.
        </p>
        <p>
          Eric Evans coined the term in 2003, but the core idea is older and simpler than the
          jargon around it suggests: put the domain and domain logic at the center of the design,
          and base that design on a model that reflects a deep understanding of the business.
        </p>
        <div className="scenarioBox">
          <small>CARGOFLOW, BEFORE AND AFTER</small>
          <p>
            Before DDD, Cargoflow's <code>ShipmentService.updateStatus(id, "DELIVERED")</code>{" "}
            accepted any string, and three other services had their own copy of "what counts as
            delivered." After applying DDD, <code>Shipment.markDelivered(ProofOfDelivery pod)</code>{" "}
            is the only path to that state, and it lives on the object that owns the rule.
          </p>
        </div>
      </section>
      <section id="concepts">
        <h2>1. Three ideas underneath the term</h2>
        <div className="twoCol">
          <div>
            <h3>A model, not a diagram</h3>
            <p>
              The "model" in Domain-Driven Design is not a UML picture kept in a wiki. It is the
              actual code &mdash; classes, method names, types &mdash; treated as the living
              expression of how the team understands the business.
            </p>
          </div>
          <div>
            <h3>Domain over infrastructure</h3>
            <p>
              Business rules are the reason the software exists. Database access, HTTP handling,
              and message queues are supporting detail that should not dictate how the domain
              classes are shaped.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>THE THIRD IDEA</small>
          <p>
            <b>Continuous collaboration with domain experts.</b> The model is not designed once by
            engineers and handed to the business for approval; it is refined through repeated
            conversation, because the first version is always wrong in some subtle way.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 210" xmlns="http://www.w3.org/2000/svg">
            <circle className="ringNode" cx="300" cy="105" r="8" />
            <text className="ringKey" x="300" y="130">Shared model</text>
            <rect className="boxAccent" x="30" y="20" width="150" height="50" rx="8" />
            <text className="boxText" x="105" y="50">Domain expert</text>
            <rect className="boxAccent" x="420" y="20" width="150" height="50" rx="8" />
            <text className="boxText" x="495" y="50">Engineer</text>
            <rect className="box" x="225" y="150" width="150" height="45" rx="8" />
            <text className="boxText" x="300" y="177">Code &amp; language</text>
            <line className="flow" x1="105" y1="70" x2="290" y2="100" />
            <line className="flow" x1="495" y1="70" x2="310" y2="100" />
            <line className="flowMuted" x1="300" y1="113" x2="300" y2="150" />
          </svg>
          <figcaption>
            The model sits between the domain expert's language and the engineer's code &mdash;
            fed by conversation, expressed in the code itself.
          </figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The same rule, with and without a domain model</h2>
        <span className="codeLabel">JAVA &mdash; WITHOUT A DOMAIN MODEL</span>
        <div className="codeBlock">
          <pre>{`// Rule enforced only by convention, scattered across callers.
public void updateStatus(String shipmentId, String newStatus) {
    Shipment row = repository.find(shipmentId);
    row.setStatus(newStatus); // nothing stops "DELIVERED" -> "BOOKED"
    repository.save(row);
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; WITH A DOMAIN MODEL</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private ShipmentStatus status;

    public void markDelivered(ProofOfDelivery pod) {
        if (status != ShipmentStatus.IN_TRANSIT) {
            throw new IllegalStateException("Only an in-transit shipment can be delivered");
        }
        this.status = ShipmentStatus.DELIVERED;
        DomainEvents.publish(new ShipmentDelivered(id, pod, Instant.now()));
    }
}`}</pre>
        </div>
        <p>
          The rule "only an in-transit shipment can be delivered" moved from being a convention
          every caller must remember into a fact the object itself enforces.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Calling any object-oriented code "DDD."</b> DDD specifically means the model
            reflects deep business understanding gained through collaboration, not just that
            classes have methods.
          </li>
          <li>
            <b>Confusing the model with a diagram artifact.</b> A model that lives only in
            documentation and not in the running code has already drifted from reality.
          </li>
          <li>
            <b>Applying DDD uniformly across an entire system.</b> The next few articles explain
            why some parts of Cargoflow deserve this investment and others do not.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What makes Domain-Driven Design different from "well-organized object-oriented code"?</p>
          <p>
            <b>Answer:</b> DDD specifically ties the model's shape to continuous collaboration with
            domain experts, and treats the code itself &mdash; not a separate diagram &mdash; as
            the living expression of that shared understanding.
          </p>
        </div>
      </section>
      <p className="takeaway">
        DDD is a model of the business, expressed directly in code, kept accurate through ongoing
        conversation with the people who understand the business.
      </p>
    </div>
  );
}
