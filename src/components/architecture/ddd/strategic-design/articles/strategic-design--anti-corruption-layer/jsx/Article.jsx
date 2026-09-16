export default function StrategicDesignAntiCorruptionLayerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An anti-corruption layer (ACL) is a translation boundary that protects a bounded
          context's clean model from another context's messier or incompatible one, without
          requiring the upstream to change. Cargoflow's Support context reads shipment data from
          Fleet &amp; Routing through an ACL, so routing's internal churn never reaches Support's
          case model.
        </p>
        <p>
          It is the deliberate opposite of Conformist: instead of absorbing the upstream's shape,
          an ACL translates at the border and lets your own context keep a model that is entirely
          its own.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Where the translation boundary sits</h2>
        <p>
          The ACL lives entirely on the downstream side. Fleet &amp; Routing does not know or care
          that Support exists; Support absorbs the cost of translation so its own domain model
          stays clean.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 600 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="45" width="170" height="60" rx="8" />
            <text className="boxText" x="105" y="72">Fleet &amp; Routing</text>
            <text className="figHint" x="105" y="90">internal, churning model</text>
            <rect className="box" x="240" y="45" width="130" height="60" rx="8" />
            <text className="boxText" x="305" y="72">ACL</text>
            <text className="figHint" x="305" y="90">translator</text>
            <rect className="boxAccent" x="420" y="45" width="160" height="60" rx="8" />
            <text className="boxText" x="500" y="72">Support</text>
            <text className="figHint" x="500" y="90">clean, stable model</text>
            <line className="flow" x1="190" y1="75" x2="240" y2="75" />
            <line className="flow" x1="370" y1="75" x2="420" y2="75" />
          </svg>
          <figcaption>The ACL absorbs upstream churn so it never reaches Support's own domain objects.</figcaption>
        </figure>
        <div className="scenarioBox">
          <small>WHY SUPPORT NEEDS ONE HERE</small>
          <p>
            Fleet &amp; Routing's internal <code>RouteLeg</code> model changes shape every time
            the optimization engine is refactored &mdash; it is not a stable contract, because it
            was never designed to be one. Support cannot afford its case-tracking model to churn
            every time routing ships an unrelated internal change.
          </p>
        </div>
      </section>
      <section id="example">
        <h2>2. A translator, isolating the churn</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Support's stable, own-context model.
public record ShipmentTrackingInfo(String shipmentId, String currentLocation, boolean delayed) {}

// The anti-corruption layer: the only class that knows about Fleet & Routing's internals.
public final class RoutingAntiCorruptionLayer {
    private final FleetRoutingClient routingClient;

    public ShipmentTrackingInfo trackingFor(String shipmentId) {
        RouteLegDto raw = routingClient.currentLeg(shipmentId); // routing's churning shape
        return new ShipmentTrackingInfo(
            shipmentId,
            raw.currentStopName(),
            raw.etaMillis() > raw.deadlineMillis()
        );
    }
}`}</pre>
        </div>
        <p>
          When Fleet &amp; Routing next refactors <code>RouteLegDto</code>, only this one class
          needs to change &mdash; Support's <code>ShipmentTrackingInfo</code> and everything built
          on it stays untouched.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the upstream's DTOs leak past the ACL.</b> If <code>RouteLegDto</code>{" "}
            shows up anywhere in Support's domain logic, the ACL has failed at its one job.
          </li>
          <li>
            <b>Building an ACL where a simple Customer/Supplier relationship would do.</b> ACLs
            add real translation cost; reserve them for genuinely messy or unstable upstreams.
          </li>
          <li>
            <b>Forgetting the ACL is downstream-owned.</b> Only Support needs to maintain it;
            Fleet &amp; Routing has no obligation to know it exists.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>How is an Anti-Corruption Layer different from being a Conformist toward the same upstream?</p>
          <p>
            <b>Answer:</b> A conformist absorbs the upstream's model shape directly into its own
            domain. An ACL translates at the border instead, so the downstream context keeps a
            model entirely its own, insulated from upstream churn.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Use an anti-corruption layer when an upstream's model is messy or unstable and you can
        afford translation &mdash; it protects your own model at the cost of maintaining the
        translator.
      </p>
    </div>
  );
}
