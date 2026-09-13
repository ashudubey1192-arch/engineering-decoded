import "../css/Article.css";

export default function MicroservicesFoundationsWhatAreMicroservicesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A microservice is a service that a team can design, deploy, and scale on its own
          schedule, without coordinating a release with any other team &mdash; everything else
          people say about microservices is really just a consequence of that one property.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>Four characteristics show up together whenever a service genuinely qualifies:</p>
        <ul className="stepList">
          <li><b>Single responsibility at the business level</b> &mdash; it owns one cohesive capability (like "Inventory" or "Notifications"), not one technical layer.</li>
          <li><b>Owns its data exclusively</b> &mdash; no other service ever queries its database directly; they ask it through its API instead.</li>
          <li><b>Deploys independently</b> &mdash; a new version ships without requiring any other service to redeploy in lockstep.</li>
          <li><b>Fails in isolation</b> &mdash; when it goes down, callers see one dependency fail, not the whole application.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>InventoryService</code> at a retailer owns the <code>stock_levels</code> table
          outright. When <code>CheckoutService</code> needs to know if an item is in stock, it
          calls <code>GET /items/{"{id}"}/availability</code> on <code>InventoryService</code> &mdash;
          it never runs a query against <code>stock_levels</code> itself, even though both services
          might sit in the same cloud account. That one rule &mdash; ask, don't query &mdash; is what
          keeps the two services actually independent instead of secretly coupled through a shared
          table.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of CheckoutService calling InventoryService's API to check availability, rather than querying InventoryService's stock_levels database table directly.">
          <rect className="box" x="20" y="45" width="110" height="34" rx="6" />
          <text x="75" y="66" className="boxText" style={{fontSize:"7.5px"}}>CheckoutService</text>
          <rect className="boxAccent" x="270" y="45" width="120" height="34" rx="6" />
          <text x="330" y="66" className="boxText" style={{fontSize:"7.5px"}}>InventoryService</text>
          <rect className="box" x="290" y="95" width="80" height="24" rx="5" />
          <text x="330" y="111" className="figHint" style={{fontSize:"6px"}}>stock_levels</text>
          <line className="flow" x1="130" y1="58" x2="268" y2="58" />
          <text x="200" y="46" className="figHint" style={{fontSize:"6.5px"}}>GET /items/id/availability</text>
          <line className="flowMuted" x1="330" y1="79" x2="330" y2="93" />
          <line className="flowMuted" x1="150" y1="90" x2="290" y2="107" />
          <text x="180" y="122" className="figHint" style={{fontSize:"6px"}}>never a direct query</text>
        </svg>
        <figcaption>CheckoutService only ever reaches InventoryService through its API; the muted crossed-out path is the direct database query that never happens.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating "microservice" as a size target &mdash; splitting until each one is a few hundred
          lines &mdash; produces dozens of tiny deployables that still call each other constantly and
          still share data, which is more operational overhead for none of the independence benefit.
          The other common mistake is drawing the split along technical layers (an "API layer
          service", a "business logic service", a "data access service") instead of business
          capability; that just distributes one monolith's coupling across a network instead of
          removing it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>CheckoutService and InventoryService are separate deployables, but CheckoutService runs its own SQL queries directly against InventoryService's stock_levels table when it needs fresher data. Which defining property of a microservice is actually violated here?</p>
        </div>
      </section>
      <p className="takeaway">
        The test for "is this really a microservice" isn't its size &mdash; it's whether another
        team can change its internals, including its schema, without asking anyone's permission.
      </p>
    </div>
  );
}
