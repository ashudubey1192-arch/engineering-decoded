export default function StrategicDesignCustomerSupplierArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Customer/Supplier describes an upstream-downstream relationship where the downstream
          team (the customer) has real influence over the upstream team's (the supplier's)
          roadmap &mdash; the supplier plans around the customer's needs, even though the customer
          does not own the code. Booking is the customer of Fleet &amp; Routing at Cargoflow.
        </p>
        <p>
          This is different from a purely one-directional dependency: the customer gets a seat at
          the planning table, not just an API to consume passively.
        </p>
      </section>
      <section id="concepts">
        <h2>1. What makes it "Customer/Supplier" and not just an API call</h2>
        <ol className="stepList">
          <li>
            <b>The supplier prioritizes the customer's needs in its backlog.</b> When Booking
            needed refrigerated-cargo routing support, Fleet &amp; Routing scheduled it as a
            planned feature, not an afterthought.
          </li>
          <li>
            <b>Breaking changes are negotiated, not unilateral.</b> Fleet &amp; Routing gives
            Booking advance notice and a migration path before changing its capacity API.
          </li>
          <li>
            <b>The relationship is still asymmetric.</b> Fleet &amp; Routing owns the final
            decision; Booking has influence, not veto power. That distinguishes it from
            Partnership, where both sides are equals.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="30" y="45" width="170" height="60" rx="8" />
            <text className="boxText" x="115" y="80">Fleet &amp; Routing</text>
            <text className="figHint" x="115" y="30">supplier (upstream)</text>
            <rect className="boxAccent" x="320" y="45" width="170" height="60" rx="8" />
            <text className="boxText" x="405" y="80">Booking</text>
            <text className="figHint" x="405" y="30">customer (downstream)</text>
            <line className="flow" x1="200" y1="65" x2="320" y2="65" />
            <line className="flowMuted" x1="320" y1="90" x2="200" y2="90" />
            <text className="figHint" x="260" y="120">planning influence, negotiated changes</text>
          </svg>
          <figcaption>Data and capability flow downstream; planning influence flows back upstream &mdash; both directions are part of the relationship.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A negotiated API, versioned for the customer's sake</h2>
        <span className="codeLabel">JAVA &mdash; FLEET &amp; ROUTING'S PUBLIC API, SHAPED BY BOOKING'S NEEDS</span>
        <div className="codeBlock">
          <pre>{`public interface CapacityLookup {
    // added specifically because Booking needed to check refrigerated capacity
    // before offering a deadline to a shipper -- negotiated during planning.
    List<CarrierCapacity> availableCapacity(Route route, CargoType cargoType);
}`}</pre>
        </div>
        <p>
          The <code>CargoType</code> parameter exists because Booking asked for it during joint
          planning, not because Fleet &amp; Routing's internal model happened to need it.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Calling any upstream/downstream pair "Customer/Supplier."</b> Without the supplier
            actually prioritizing the customer's needs, the relationship is really Conformist,
            covered next &mdash; the downstream has no real influence.
          </li>
          <li>
            <b>Letting the supplier make breaking changes without notice.</b> That collapses the
            relationship into an unmanaged dependency, regardless of what it is labeled.
          </li>
          <li>
            <b>Giving the customer veto power.</b> That would make it a Partnership, not
            Customer/Supplier &mdash; the supplier still owns the final roadmap decision.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Fleet &amp; Routing ships a breaking API change with no advance notice to Booking. Is this still a Customer/Supplier relationship?</p>
          <p>
            <b>Answer:</b> No &mdash; a defining feature of Customer/Supplier is that the supplier
            negotiates breaking changes with the customer. Shipping one unilaterally means the
            relationship has degraded into an unmanaged upstream dependency.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Customer/Supplier keeps the upstream team in control while genuinely accounting for the
        downstream team's roadmap needs &mdash; influence without ownership.
      </p>
    </div>
  );
}
