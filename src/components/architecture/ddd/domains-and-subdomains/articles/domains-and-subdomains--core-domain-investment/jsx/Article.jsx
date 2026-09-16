export default function DomainsAndSubdomainsCoreDomainInvestmentArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Identifying the core domain is only useful if it changes what you actually do. This
          article turns "route optimization is Cargoflow's core domain" into concrete staffing,
          architecture, and process decisions &mdash; the payoff of everything in this section.
        </p>
        <p>
          Teams that classify subdomains correctly but then staff and architect them identically
          have done the exercise without collecting the benefit.
        </p>
      </section>
      <section id="concepts">
        <h2>1. What "investment" changes in practice</h2>
        <div className="twoCol">
          <div>
            <h3>Staffing</h3>
            <p>
              Cargoflow's most experienced engineers and its only domain-expert-in-residence
              (a former logistics operator) work on route optimization. New hires ramp up on
              billing or support first.
            </p>
          </div>
          <div>
            <h3>Architecture tolerance</h3>
            <p>
              The routing engine gets a hexagonal architecture with a swappable optimization
              strategy, because it will keep changing. Billing gets a simpler layered structure
              that is cheaper to maintain and change less often.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>A CONCRETE STAFFING DECISION</small>
          <p>
            When Cargoflow needed to add support for refrigerated cargo routing &mdash; a genuine
            core-domain change &mdash; the two senior engineers who best understood the existing
            optimizer were pulled off a billing refactor to do it. That is what investment
            classification is actually for: making that call obvious in advance instead of an
            argument in the moment.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="30" y="30" width="220" height="120" rx="10" />
            <text className="figLabel" x="140" y="55">CORE: ROUTING</text>
            <text className="boxText" x="140" y="85">Senior engineers</text>
            <text className="boxText" x="140" y="107">Flexible architecture</text>
            <text className="boxText" x="140" y="129">Frequent domain-expert time</text>
            <rect className="box" x="330" y="30" width="220" height="120" rx="10" />
            <text className="figLabel" x="440" y="55">SUPPORTING: BILLING</text>
            <text className="boxText" x="440" y="85">Mixed-level engineers</text>
            <text className="boxText" x="440" y="107">Stable, simpler architecture</text>
            <text className="boxText" x="440" y="129">Occasional domain-expert time</text>
          </svg>
          <figcaption>Classification only matters once it visibly changes staffing and architectural investment.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Architecture tolerance, expressed in code</h2>
        <p>
          The core domain's optimizer is built behind a strategy interface specifically because it
          is expected to change often; billing is not:
        </p>
        <span className="codeLabel">JAVA &mdash; CORE: DESIGNED FOR CHANGE</span>
        <div className="codeBlock">
          <pre>{`public interface RoutingStrategy {
    RouteOption findBestRoute(ShipmentRequest request, List<CarrierCapacity> available);
}
// Swappable: CheapestRouteStrategy, FastestRouteStrategy, RefrigeratedCargoStrategy...`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; SUPPORTING: DESIGNED FOR STABILITY</span>
        <div className="codeBlock">
          <pre>{`public final class InvoiceGenerator {
    public Invoice generate(Shipment shipment, PricingResult pricing) {
        return new Invoice(shipment.id(), pricing.total(), InvoiceStatus.DRAFT);
    }
}
// One implementation; the pricing rules already live in the core domain's output.`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Classifying subdomains but staffing by availability instead of priority.</b> If the
            core domain gets whichever engineer happens to be free, the classification exercise
            was decorative.
          </li>
          <li>
            <b>Over-engineering supporting subdomains "to be safe."</b> Building billing with the
            same pluggable-strategy architecture as routing spends flexibility budget where it is
            not needed.
          </li>
          <li>
            <b>Never revisiting investment as the business changes.</b> If a supporting subdomain
            becomes genuinely differentiating, its investment level should rise with it.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the routing engine use a swappable <code>RoutingStrategy</code> interface while billing uses one concrete class?</p>
          <p>
            <b>Answer:</b> The core domain is expected to change frequently as Cargoflow refines
            its competitive edge, so it is architected for flexibility. Billing changes rarely
            enough that the added indirection would be pure cost with no payoff.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Classification only pays off when it visibly changes staffing and architecture &mdash;
        put your best people and most flexible design where the business actually differentiates.
      </p>
    </div>
  );
}
