export default function DddFoundationsComplexDomainsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          DDD earns its cost on complex domains and is often overkill on simple ones. Before
          reaching for aggregates and bounded contexts, it is worth being precise about what
          "complex" means here &mdash; it is not the same as "big."
        </p>
        <p>
          A domain is complex when the business rules themselves are intricate and full of
          exceptions, not merely when there is a lot of code or a lot of traffic. A high-traffic
          CRUD app can be simple; a low-traffic pricing engine can be brutally complex.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Two axes: size and rule complexity</h2>
        <table className="miniTable">
          <caption>WHERE DOES YOUR SYSTEM SIT?</caption>
          <thead>
            <tr><th>Domain</th><th>Rule complexity</th><th>DDD payoff</th></tr>
          </thead>
          <tbody>
            <tr><td>Cargoflow pricing &amp; routing</td><td>High &mdash; surcharges, carrier contracts, SLAs</td><td>High</td></tr>
            <tr><td>Cargoflow notifications</td><td>Low &mdash; send an email on status change</td><td>Low</td></tr>
            <tr><td>A static content site</td><td>Low</td><td>Low regardless of size</td></tr>
            <tr><td>A tax-calculation engine</td><td>High even at small scale</td><td>High</td></tr>
          </tbody>
        </table>
        <p>
          Cargoflow's shipment pricing is a good example of real complexity: peak-season
          surcharges, per-carrier contract terms, multi-leg routes with different rates per leg,
          and refund rules that depend on how far into transit a shipment was when it was
          cancelled. None of that is "big" in the sense of lines of code &mdash; it is dense.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg">
            <line className="divider" x1="60" y1="170" x2="520" y2="170" />
            <line className="divider" x1="60" y1="20" x2="60" y2="170" />
            <text className="figHint" x="40" y="100">rule</text>
            <text className="figHint" x="40" y="115">complexity</text>
            <text className="figHint" x="290" y="192">size / traffic</text>
            <circle className="ringNode" cx="150" cy="140" r="7" />
            <text className="boxText" x="150" y="120">Notifications</text>
            <circle className="ringNode" cx="430" cy="150" r="7" />
            <text className="boxText" x="430" y="130">Content site (large)</text>
            <circle className="boxWarn" cx="180" cy="45" r="8" />
            <text className="boxText" x="180" y="30">Tax engine (small)</text>
            <circle className="boxWarn" cx="420" cy="55" r="9" />
            <text className="boxText" x="420" y="40">Cargoflow pricing</text>
          </svg>
          <figcaption>
            DDD payoff tracks the vertical axis &mdash; rule complexity &mdash; almost independently
            of the horizontal one.
          </figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A glimpse of Cargoflow's real complexity</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public Money surchargeFor(Leg leg, ShippingSeason season, CarrierContract contract) {
    Money base = contract.rateFor(leg.distanceKm());
    if (season == ShippingSeason.PEAK && leg.crossesBorder()) {
        base = base.plus(contract.crossBorderPeakSurcharge());
    }
    if (leg.requiresRefrigeration() && !contract.includesRefrigeration()) {
        base = base.plus(FlatFee.REFRIGERATION_ADDON);
    }
    return base;
}`}</pre>
        </div>
        <p>
          Three independent conditions combine here, each sourced from a different contract term.
          This is what "complex domain" means in practice: not a large method, but a small one
          where every line encodes a real business exception someone will ask about by name.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Equating complexity with scale.</b> A system with millions of users and simple CRUD
            rules does not need DDD's tactical patterns just because it is large.
          </li>
          <li>
            <b>Judging complexity from the outside.</b> Pricing and routing often look like "just
            a formula" to someone unfamiliar with the domain, until the eleventh exception surfaces.
          </li>
          <li>
            <b>Applying DDD uniformly once one part of the system qualifies.</b> The Domains and
            Subdomains section covers how to identify which parts deserve the investment.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Cargoflow's notification service sends templated emails with no business exceptions. Does it need DDD's tactical patterns?</p>
          <p>
            <b>Answer:</b> No. Low rule complexity means low DDD payoff regardless of how much
            traffic the notification service handles &mdash; a straightforward transaction-script
            style is appropriate there.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Complexity that justifies DDD comes from intricate business rules, not from size or
        traffic &mdash; measure the rules before reaching for the patterns.
      </p>
    </div>
  );
}
