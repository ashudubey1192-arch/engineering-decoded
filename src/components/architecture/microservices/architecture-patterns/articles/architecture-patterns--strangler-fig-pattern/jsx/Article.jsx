import "../css/Article.css";

export default function ArchitecturePatternsStranglerFigPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The strangler fig pattern migrates a monolith to microservices gradually, one capability at
          a time, routing an increasing share of traffic to new services while the monolith keeps
          handling everything not yet migrated &mdash; named for the vine that envelops and eventually
          replaces the tree it grows on, without the tree ever being felled outright.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A routing layer sits in front of the monolith and inspects each incoming request, forwarding
          it either to the monolith (the default, for anything not yet migrated) or to a new
          microservice (for whichever capability has already been extracted). Over time, more routes
          point to new services, and the monolith's remaining responsibility shrinks, until eventually
          there's little or nothing left to route to it at all.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A retailer extracts <code>InventoryService</code> first. The routing layer sends every
          request matching <span className="badge">/inventory/*</span> to the new service, while
          every other path &mdash; <code>/orders/*</code>, <code>/customers/*</code> &mdash; still
          goes to the monolith exactly as before. From the outside, callers see no difference at all
          during the transition.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of a routing layer splitting traffic between a shrinking monolith, which still handles most paths, and a new InventoryService handling only the inventory path, with the split shifting further toward new services over time.">
          <rect className="box" x="150" y="15" width="100" height="26" rx="5" />
          <text x="200" y="32" className="boxText" style={{fontSize:"6.5px"}}>Routing layer</text>
          <rect className="boxAccent" x="30" y="80" width="140" height="35" rx="6" />
          <text x="100" y="100" className="boxText" style={{fontSize:"6.5px"}}>Monolith</text>
          <text x="100" y="112" className="figHint" style={{fontSize:"5px"}}>/orders/*, /customers/*, ...</text>
          <rect className="box" x="230" y="80" width="140" height="35" rx="6" />
          <text x="300" y="100" className="boxText" style={{fontSize:"6.5px"}}>InventoryService</text>
          <text x="300" y="112" className="figHint" style={{fontSize:"5px"}}>/inventory/*</text>
          <line className="flow" x1="180" y1="41" x2="105" y2="78" />
          <line className="flow" x1="220" y1="41" x2="295" y2="78" />
        </svg>
        <figcaption>Only /inventory/* is routed to the new service today &mdash; every other path still goes to the monolith, exactly as it did before the migration started.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Extracting a service's code without also migrating its data out of the monolith's shared
          database creates a hidden coupling that undermines the whole point of extraction &mdash;
          the new service isn't truly independent if it's still reading and writing the monolith's
          own tables directly. Treating the migration as having no real end point, so the routing
          layer and the shrinking monolith persist indefinitely, means carrying the operational cost
          of two systems far longer than necessary.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>InventoryService is extracted as its own deployable service, but it still reads and writes the monolith's original database tables directly. Why does this undermine the extraction, even though the code itself has moved?</p>
        </div>
      </section>
      <p className="takeaway">
        The strangler fig pattern migrates traffic gradually, one route at a time &mdash; but the
        migration is only real once a service's data moves with its code, not just the code alone.
      </p>
    </div>
  );
}
