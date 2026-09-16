export default function DomainsAndSubdomainsCoreDomainArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The core domain is the part of the business that is the actual reason customers choose
          you over a competitor. For Cargoflow, that is route optimization and carrier
          matching &mdash; finding the fastest, cheapest, most reliable combination of carriers
          and legs for a shipment. Everything else in the system exists to support that.
        </p>
        <p>
          Identifying the core domain correctly matters because it tells you where to spend your
          best engineers and your most careful modeling. Getting it wrong means investing DDD's
          heaviest tools in a part of the system that was never going to differentiate you.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The test for "is this the core domain?"</h2>
        <ol className="stepList">
          <li>
            <b>Would customers switch to a competitor if this were mediocre?</b> If Cargoflow's
            routing were slow or expensive compared to a rival, shippers would leave. If its email
            notifications were plain-text instead of styled HTML, almost nobody would notice.
          </li>
          <li>
            <b>Could you buy this off the shelf?</b> Authentication, payment processing, and email
            delivery can all be bought. Route optimization tuned to Cargoflow's specific carrier
            network cannot.
          </li>
          <li>
            <b>Is it where the hardest, most interesting problems live?</b> The core domain
            usually has the most intricate rules and the most active debate about how to do it
            better.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>CARGOFLOW'S CORE DOMAIN</small>
          <p>
            Route optimization: given a shipment's origin, destination, deadline, and cargo type,
            find the combination of carriers and legs that minimizes cost while meeting the
            deadline and any special handling requirements. This is where Cargoflow's senior
            engineers and its most detailed domain model belong.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 190" xmlns="http://www.w3.org/2000/svg">
            <circle className="boxWarn" cx="290" cy="95" r="55" />
            <text className="boxText" x="290" y="90">Core domain</text>
            <text className="boxText" x="290" y="108">route optimization</text>
            <rect className="box" x="20" y="30" width="130" height="45" rx="8" />
            <text className="boxText" x="85" y="57">Notifications</text>
            <rect className="box" x="20" y="120" width="130" height="45" rx="8" />
            <text className="boxText" x="85" y="147">Authentication</text>
            <rect className="box" x="430" y="30" width="130" height="45" rx="8" />
            <text className="boxText" x="495" y="57">Billing</text>
            <rect className="box" x="430" y="120" width="130" height="45" rx="8" />
            <text className="boxText" x="495" y="147">Support tooling</text>
          </svg>
          <figcaption>The core domain sits at the center of investment; supporting and generic subdomains orbit it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. What the investment looks like in code</h2>
        <p>
          The core domain gets a genuinely rich model, tuned for expressing trade-offs precisely
          &mdash; not just data holders:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class RouteOptimizer {
    public RouteOption optimize(ShipmentRequest request, List<CarrierCapacity> available) {
        return available.stream()
            .flatMap(capacity -> candidateRoutes(request, capacity))
            .filter(route -> route.meetsDeadline(request.deadline()))
            .filter(route -> route.supportsCargoType(request.cargoType()))
            .min(Comparator.comparing(RouteOption::totalCost))
            .orElseThrow(() -> new NoViableRouteException(request));
    }
}`}</pre>
        </div>
        <p>
          Compare that investment level to a generic subdomain, covered in a later article, where
          a third-party library is a perfectly reasonable substitute for custom code.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Assuming the core domain is whatever is hardest to build.</b> A notoriously fiddly
            integration with a legacy carrier API is annoying, not differentiating &mdash;
            competitors likely fight the same integration.
          </li>
          <li>
            <b>Letting the core domain be decided by whoever asks loudest.</b> The billing team's
            requests are not automatically core just because they are frequent; test against the
            three questions above.
          </li>
          <li>
            <b>Treating the core domain as fixed forever.</b> What counts as core can shift as the
            business strategy shifts &mdash; revisit the identification periodically.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Cargoflow's payment processing is objectively hard to build correctly. Is it automatically the core domain?</p>
          <p>
            <b>Answer:</b> No. Payment processing can be bought (Stripe, Adyen) and getting it
            "merely adequate" would not cause shippers to switch carriers &mdash; it fails the
            core-domain test even though it is hard.
          </p>
        </div>
      </section>
      <p className="takeaway">
        The core domain is whatever makes customers choose you and cannot be bought off the shelf
        &mdash; invest your best modeling and your best engineers there first.
      </p>
    </div>
  );
}
