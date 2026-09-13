import "../css/Article.css";

export default function ServiceDecompositionDecomposeByBusinessCapabilityArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Decomposing by business capability means drawing service boundaries around what the
          business does &mdash; "Order Management," "Pricing," "Fulfillment" &mdash; rather than
          around technical roles, so each service can evolve at the pace of the business function it
          represents.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A business capability is a stable "what the org does" statement &mdash; it barely changes
          even as the org's structure or its code does. Capabilities make good service boundaries
          because they're where a single owner (a team, a stakeholder) can reasonably be
          accountable end to end: one team owns everything about "how we price an order," including
          its rules, its data, and its API, regardless of which other capabilities call into it.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A logistics company identifies its capabilities as <code>Shipment Planning</code>,
          <code>Carrier Management</code>, <code>Tracking</code>, and <code>Billing</code>. Each
          becomes one service: <code>ShipmentPlanningService</code>,
          <code>CarrierManagementService</code>, and so on. When the business adds a new capability
          &mdash; say, <code>Customs Documentation</code> &mdash; that becomes a new service, rather
          than a bag of new methods bolted onto an existing one that wasn't designed for it.
        </p>
        <span className="codeLabel">CAPABILITY MAP &rarr; SERVICE MAP</span>
        <div className="codeBlock">
          <pre>{`Shipment Planning   -> ShipmentPlanningService
Carrier Management  -> CarrierManagementService
Tracking             -> TrackingService
Billing              -> BillingService
(new) Customs Docs   -> CustomsDocumentationService`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram mapping four business capabilities, Shipment Planning, Carrier Management, Tracking, and Billing, each directly onto its own service, one to one.">
          {["Shipment\nPlanning","Carrier\nManagement","Tracking","Billing"].map((t,i) => (
            <g key={i}>
              <rect className="box" x={15 + i*100} y="20" width="85" height="34" rx="6" />
              {t.split("\n").map((line,li) => (<text key={li} x={57 + i*100} y={36 + li*12} className="boxText" style={{fontSize:"6.5px"}}>{line}</text>))}
              <line className="flow" x1={57 + i*100} y1="54" x2={57 + i*100} y2="72" />
              <rect className="boxAccent" x={15 + i*100} y="76" width="85" height="34" rx="6" />
              <text x={57 + i*100} y="97" className="boxText" style={{fontSize:"6px"}}>{t.replace("\n","")}Service</text>
            </g>
          ))}
        </svg>
        <figcaption>Each stable business capability maps to exactly one service &mdash; a new capability means a new service, not a new corner of an existing one.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Confusing an org chart with a capability map is the most common mistake &mdash; org
          structures reshuffle far more often than what the business actually does, so services
          built around today's reporting lines tend to need re-splitting whenever the org changes.
          The other mistake is capabilities defined too broadly ("Operations" covering shipment
          planning, carrier management, and tracking as one service) &mdash; that's really three
          capabilities wearing one name, and it recreates the tangled-together problem this
          technique is meant to solve.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a business capability generally make a more stable service boundary than the team's current org chart?</p>
        </div>
      </section>
      <p className="takeaway">
        Ask "what does the business do," not "who reports to whom" &mdash; capabilities outlast
        reorgs, and a service boundary built on one tends to outlast them too.
      </p>
    </div>
  );
}
