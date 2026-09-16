export default function DddArchitectureCqrsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          CQRS &mdash; Command Query Responsibility Segregation &mdash; splits the model used to
          change state (commands, routed through aggregates) from the model used to read state
          (queries, which can bypass aggregates entirely). Cargoflow's <code>Shipment</code>{" "}
          aggregate is well-shaped for enforcing the invariants this course has built; it is a
          poor shape for rendering an operations dashboard showing 10,000 shipments at once.
          CQRS says: stop making one model do both jobs.
        </p>
        <p>
          This is not a mandate to add message queues or eventual consistency everywhere &mdash;
          the simplest form of CQRS is just two methods on one repository.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Applying CQRS, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Start by noticing the two models are already fighting each other.</b> The
            <code> Shipment</code> aggregate loads its full <code>Leg</code> collection to enforce
            invariants; a dashboard query loading the same way to show a shipment list is loading
            far more than it displays.
          </li>
          <li>
            <b>Route every write through the aggregate, unchanged.</b> Commands like{" "}
            <code>deliverShipment()</code> still go through <code>Shipment.markDelivered()</code>{" "}
            &mdash; CQRS never weakens write-side invariant enforcement.
          </li>
          <li>
            <b>Give reads their own model, shaped for the screen or report that needs it.</b> A
            flat <code>ShipmentSummaryView</code> queried directly, with no aggregate
            reconstruction at all.
          </li>
          <li>
            <b>Decide separately whether the read model is refreshed synchronously or
            asynchronously.</b> A same-database SQL view can stay synchronous; a search-optimized
            read store usually updates asynchronously off domain events, reintroducing the
            eventual consistency from two articles ago.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="140" height="40" rx="6" />
            <text className="boxText" x="90" y="45">Command</text>
            <line className="flow" x1="160" y1="40" x2="230" y2="40" />
            <rect className="boxWarn" x="230" y="20" width="140" height="40" rx="6" />
            <text className="boxText" x="300" y="45">Shipment aggregate</text>
            <line className="flow" x1="370" y1="40" x2="440" y2="40" />
            <rect className="box" x="440" y="20" width="100" height="40" rx="6" />
            <text className="boxText" x="490" y="45">Write store</text>
            <rect className="box" x="20" y="130" width="140" height="40" rx="6" />
            <text className="boxText" x="90" y="155">Query</text>
            <line className="flow" x1="160" y1="150" x2="440" y2="150" />
            <rect className="boxAccent" x="440" y="130" width="100" height="40" rx="6" />
            <text className="boxText" x="490" y="155">Read model</text>
          </svg>
          <figcaption>Commands still flow through the aggregate's invariants; queries read a separately shaped model that never touches it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One repository, two shapes</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// write side, unchanged from earlier articles
public interface ShipmentRepository {
    Optional<Shipment> findById(ShipmentId id); // full aggregate, for commands
    void save(Shipment shipment);
}

// read side, a separate, flatter model
public record ShipmentSummaryView(ShipmentId id, String status, String origin, String destination) {}

public interface ShipmentSummaryReader {
    List<ShipmentSummaryView> findRecentByOperator(OperatorId operatorId); // no aggregate involved
}

@Repository
class JdbcShipmentSummaryReader implements ShipmentSummaryReader {
    public List<ShipmentSummaryView> findRecentByOperator(OperatorId operatorId) {
        return jdbcTemplate.query(
            "select id, status, origin, destination from shipment_summary where operator_id = ?",
            summaryRowMapper, operatorId.value()); // flat query, no Leg reconstruction at all
    }
}`}</pre>
        </div>
        <p>
          <code>ShipmentSummaryView</code> never becomes a <code>Shipment</code>; the dashboard
          reads exactly the columns it displays, straight from a query built for that purpose.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Adopting full asynchronous CQRS with a separate read database before it's
            needed.</b> Most teams get the real benefit from splitting the two models in code
            first; the infrastructure split is a later, separate decision.
          </li>
          <li>
            <b>Letting write-side commands read from the read model to save a query.</b> That
            reintroduces exactly the model confusion CQRS exists to remove, and risks enforcing
            invariants against stale data.
          </li>
          <li>
            <b>Applying CQRS uniformly across a whole system.</b> The Shipment aggregate may
            deserve it; a small reference-data lookup with no complex invariants usually does not.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>JdbcShipmentSummaryReader</code> query flat columns directly instead of loading a <code>Shipment</code> and reading its fields?</p>
          <p>
            <b>Answer:</b> Loading the full aggregate means reconstructing its entire invariant-
            protecting structure (its <code>Leg</code> collection and internal rules) just to
            display a few fields &mdash; wasted work the aggregate's shape was never optimized
            for. A flat query shaped for the screen skips that reconstruction entirely.
          </p>
        </div>
      </section>
      <p className="takeaway">
        CQRS is permission to stop forcing one model to serve both invariant-protecting writes and
        display-shaped reads &mdash; start by splitting the code, and only add asynchronous
        infrastructure once that split earns it.
      </p>
    </div>
  );
}
