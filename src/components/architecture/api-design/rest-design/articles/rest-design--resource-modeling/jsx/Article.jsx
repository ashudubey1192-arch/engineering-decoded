import "../css/Article.css";

export default function RestDesignResourceModelingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Resource modeling is deciding what the nouns in your API actually are, and how they
          relate to each other &mdash; URIs, HTTP methods, and payload shapes are all just
          consequences of getting this one decision right first.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>A resource is a thing, not an action</b> &mdash; "a shipment" is a resource; "calculate a shipping rate" is an operation on one.</li>
          <li><b>Collections vs. single resources</b> &mdash; <code>/shipments</code> is a collection; <code>/shipments/shp_9f8a</code> is one member of it.</li>
          <li><b>Containment vs. reference</b> &mdash; if resource B only exists as part of A and is deleted with it, nest it under A. If B has its own independent lifecycle and identity, link to it by ID instead of nesting.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's domain has four real nouns: <code>Shipment</code>, <code>Package</code>,
          <code>Carrier</code>, and <code>Event</code>. A shipment <i>contains</i> one or more
          packages that have no independent existence outside it &mdash; delete the shipment and
          its packages are gone too &mdash; so packages nest:
          <code>/shipments/shp_9f8a/packages</code>. A shipment <i>references</i> a carrier, which
          exists independently, has its own lifecycle, and is shared across thousands of other
          shipments &mdash; so a shipment just holds a <code>carrier_id</code>, and carriers get
          their own top-level resource: <code>/carriers/fedex</code>. Delivery events are an
          ordered, append-only log that belongs entirely to one shipment, so they nest too:
          <code>/shipments/shp_9f8a/events</code>.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 160" role="img" aria-label="Diagram of Parcelly's resource model: Shipment contains Packages and Events as nested resources, and references Carrier as an independent top-level resource shared across many shipments.">
          <rect className="boxAccent" x="170" y="15" width="100" height="34" rx="6" />
          <text x="220" y="36" className="boxText" style={{fontSize:"7.5px"}}>Shipment</text>
          <rect className="box" x="30" y="90" width="90" height="30" rx="5" />
          <text x="75" y="109" className="boxText" style={{fontSize:"6.5px"}}>Packages</text>
          <rect className="box" x="175" y="90" width="90" height="30" rx="5" />
          <text x="220" y="109" className="boxText" style={{fontSize:"6.5px"}}>Events</text>
          <rect className="box" x="320" y="90" width="90" height="30" rx="5" />
          <text x="365" y="109" className="boxText" style={{fontSize:"6.5px"}}>Carrier</text>
          <line className="flow" x1="200" y1="49" x2="90" y2="88" />
          <line className="flow" x1="220" y1="49" x2="220" y2="88" />
          <line className="flowMuted" x1="240" y1="49" x2="345" y2="88" />
          <text x="75" y="135" className="figHint" style={{fontSize:"6px"}}>contains &mdash; nested</text>
          <text x="220" y="135" className="figHint" style={{fontSize:"6px"}}>contains &mdash; nested</text>
          <text x="365" y="135" className="figHint" style={{fontSize:"6px"}}>references &mdash; shared</text>
        </svg>
        <figcaption>Solid arrows are containment (nest the URL); the dashed arrow is a reference to a resource with its own independent life.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Modeling resources directly off database tables is the most common mistake &mdash; a
          join table or a lookup table often has no business being its own top-level resource in
          the API. The opposite mistake is over-nesting: putting <code>carrier</code> under
          <code>/shipments/shp_9f8a/carrier</code> as if it belonged to the shipment, which forces
          every consumer that just wants a list of carriers to somehow first pick an arbitrary
          shipment to nest under.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does it make sense for Packages to be nested under a Shipment, but Carrier to be a top-level resource instead?</p>
        </div>
      </section>
      <p className="takeaway">
        Nest for containment, reference for anything with its own independent identity and
        lifecycle. Get this one call right per relationship, and most of your URI design decisions
        make themselves.
      </p>
    </div>
  );
}
