export default function DddFoundationsWhenToUseDddArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          DDD is not free. Bounded contexts, aggregates, and domain events all cost design time
          and add indirection. That cost is worth paying on Cargoflow's pricing and routing logic.
          It is not worth paying on the internal admin tool three people use to reset test data.
        </p>
        <p>
          This article gives a concrete checklist for deciding, so "should we use DDD here"
          becomes a fifteen-minute conversation instead of a philosophical debate.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A checklist for justifying the investment</h2>
        <ol className="stepList">
          <li>
            <b>Are there real business rules, not just data transformations?</b> Cargoflow's
            surcharge calculation qualifies; a service that just proxies a request to a third-party
            API does not.
          </li>
          <li>
            <b>Will the rules keep changing?</b> A domain the business actively negotiates and
            renegotiates &mdash; carrier contracts, pricing tiers &mdash; benefits from a model
            that isolates change. A rule frozen by regulation for the next decade needs less.
          </li>
          <li>
            <b>Does getting it wrong cost real money or trust?</b> An incorrect refund calculation
            has a direct financial and reputational cost that justifies the extra rigor.
          </li>
          <li>
            <b>Is there a domain expert available to collaborate with?</b> Without one, DDD's
            central mechanism &mdash; knowledge crunching &mdash; cannot happen.
          </li>
        </ol>
        <div className="twoCol">
          <div>
            <h3>Good fit</h3>
            <p>Cargoflow pricing, routing, refunds, carrier contract enforcement &mdash; complex, changing, expensive to get wrong.</p>
          </div>
          <div>
            <h3>Poor fit</h3>
            <p>Internal admin tooling, a static reporting dashboard, a thin proxy over a third-party API &mdash; simple, stable, or someone else's business rules.</p>
          </div>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 560 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="40" width="220" height="90" rx="10" />
            <text className="boxText" x="140" y="70">Rules + change + cost</text>
            <text className="boxText" x="140" y="92">+ expert access</text>
            <text className="figLabel" x="140" y="112">= use DDD</text>
            <rect className="box" x="310" y="40" width="220" height="90" rx="10" />
            <text className="boxText" x="420" y="80">Missing two or more</text>
            <text className="figLabel" x="420" y="112">= skip it here</text>
          </svg>
          <figcaption>Score each area against the four checklist items before committing to bounded contexts and aggregates.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Two Cargoflow services, two different answers</h2>
        <span className="codeLabel">JAVA &mdash; SURCHARGE CALCULATION: DDD FITS</span>
        <div className="codeBlock">
          <pre>{`public final class SurchargePolicy {
    public Money surchargeFor(Leg leg, CarrierContract contract, ShippingSeason season) {
        // several independently-changing business rules combine here
    }
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; ADMIN TEST-DATA RESET: DDD DOES NOT FIT</span>
        <div className="codeBlock">
          <pre>{`@PostMapping("/admin/reset-test-data")
public void resetTestData() {
    jdbcTemplate.update("DELETE FROM shipment WHERE is_test = true");
    // no business rule here worth modeling; a transaction script is fine
}`}</pre>
        </div>
        <p>
          Forcing the second example into an aggregate with a repository and domain events would
          add ceremony with no corresponding business rule to protect.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Applying DDD as an organizational mandate.</b> "We are a DDD shop now" applied
            uniformly ignores that most systems have a mix of complex and simple subdomains.
          </li>
          <li>
            <b>Under-investing in the one part that needed it.</b> The opposite mistake is just as
            common: skipping DDD everywhere, including the pricing engine that actually needed it.
          </li>
          <li>
            <b>Deciding once and never revisiting.</b> A subdomain can grow in complexity over
            time; the checklist is worth rerunning when a "simple" area starts accumulating
            exceptions.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>A Cargoflow reporting dashboard just aggregates numbers that already exist elsewhere, with no independent business rules. Should it get its own bounded context with aggregates?</p>
          <p>
            <b>Answer:</b> No. It fails the "real business rules" and "cost of getting it wrong"
            checks &mdash; a straightforward read-model or reporting service is the appropriate
            level of investment.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Run the checklist per subdomain, not once for the whole system &mdash; DDD pays off where
        rules are real, changing, and expensive to get wrong, and costs unnecessary ceremony
        everywhere else.
      </p>
    </div>
  );
}
