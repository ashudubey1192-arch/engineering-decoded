export default function DomainsAndSubdomainsSupportingSubdomainsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A supporting subdomain is necessary for the business to run but is not what customers
          are buying. Cargoflow's billing &mdash; generating invoices, applying the pricing the
          core domain calculated, tracking payment status &mdash; is a supporting subdomain: real,
          specific to Cargoflow, but not the reason a shipper chooses Cargoflow.
        </p>
        <p>
          Supporting subdomains still deserve a real model; they just do not deserve the same
          depth of investment, staffing priority, or tolerance for architectural experimentation
          as the core domain.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core vs. supporting, side by side</h2>
        <div className="twoCol">
          <div>
            <h3>Core: route optimization</h3>
            <p>
              Differentiating, hard to copy, changes frequently as Cargoflow negotiates new
              carrier contracts. Deserves senior engineering time and a rich tactical model.
            </p>
          </div>
          <div>
            <h3>Supporting: billing</h3>
            <p>
              Necessary and Cargoflow-specific (its invoice format and payment terms are unique to
              it) but not differentiating. A shipper does not pick Cargoflow because its invoices
              are beautiful.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>WHY BILLING STILL ISN'T "GENERIC"</small>
          <p>
            Billing cannot simply be bought off the shelf the way authentication can &mdash; it
            has to understand Cargoflow's specific pricing structure, multi-leg shipments, and
            refund rules. That specificity is what separates a supporting subdomain from a
            generic one, covered next.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
            <line className="divider" x1="40" y1="120" x2="520" y2="120" />
            <text className="figHint" x="80" y="140">bought off the shelf</text>
            <text className="figHint" x="480" y="140">built custom</text>
            <circle className="ringNode" cx="440" cy="60" r="8" />
            <text className="boxText" x="440" y="42">Core: routing</text>
            <circle className="boxAccent" cx="300" cy="80" r="7" />
            <text className="boxText" x="300" y="62">Supporting: billing</text>
            <circle className="box" cx="120" cy="95" r="6" />
            <text className="boxText" x="120" y="78">Generic: auth</text>
          </svg>
          <figcaption>Supporting subdomains sit between the fully custom core and the fully generic &mdash; specific enough to need custom code, not differentiating enough to lead with.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A supporting subdomain, modeled proportionately</h2>
        <p>
          Billing gets real domain objects, but simpler ones than the core &mdash; no need for the
          same depth of strategy pattern or pluggable optimization the routing engine has:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Invoice {
    private final ShipmentId shipmentId;
    private final Money amount;
    private InvoiceStatus status;

    public void markPaid(PaymentReference reference) {
        if (status != InvoiceStatus.SENT) {
            throw new IllegalStateException("Only a sent invoice can be marked paid");
        }
        this.status = InvoiceStatus.PAID;
        DomainEvents.publish(new InvoicePaid(shipmentId, reference, Instant.now()));
    }
}`}</pre>
        </div>
        <p>
          Real invariants, real behavior &mdash; just not the elaborate multi-strategy
          optimization logic the core domain's <code>RouteOptimizer</code> justifies.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Under-modeling a supporting subdomain into an anemic CRUD layer.</b> "Not core"
            does not mean "no domain logic" &mdash; billing still has real invariants worth
            protecting.
          </li>
          <li>
            <b>Over-modeling a supporting subdomain to match the core's rigor.</b> Applying the
            same architectural ceremony everywhere dilutes the investment the core domain actually
            needs.
          </li>
          <li>
            <b>Letting supporting subdomains starve for staffing indefinitely.</b> They are
            necessary; underinvesting to zero eventually creates operational risk.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is Cargoflow's billing a supporting subdomain rather than a generic one?</p>
          <p>
            <b>Answer:</b> It requires business logic specific to Cargoflow &mdash; its pricing
            structure, multi-leg shipment handling, and refund rules &mdash; that a generic,
            off-the-shelf billing product could not fully express.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Supporting subdomains are necessary and Cargoflow-specific, so they deserve a real model
        &mdash; just proportionate investment, not the core domain's level of rigor.
      </p>
    </div>
  );
}
