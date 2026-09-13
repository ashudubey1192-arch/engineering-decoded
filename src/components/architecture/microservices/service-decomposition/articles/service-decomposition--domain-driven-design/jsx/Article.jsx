import "../css/Article.css";

export default function ServiceDecompositionDomainDrivenDesignArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Domain-Driven Design gives service decomposition its actual toolkit &mdash; bounded
          contexts, ubiquitous language, and aggregates &mdash; for figuring out where one coherent
          model ends and another begins, instead of guessing at boundaries from a database diagram.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Ubiquitous language</b> &mdash; the team and the code use the exact same words for the same concepts, inside one bounded context.</li>
          <li><b>Aggregate</b> &mdash; a cluster of objects (like an Order and its line items) that must stay consistent together and is always loaded and saved as one unit.</li>
          <li><b>Aggregate root</b> &mdash; the one object in an aggregate that everything outside it is allowed to reference directly.</li>
        </ul>
        <p>
          A service usually owns one or a small number of aggregates; the aggregate boundary is
          frequently the most reliable signal for where a transaction (and therefore a service) has
          to end.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          In <code>OrderService</code>, <code>Order</code> is the aggregate root; its line items only
          ever get modified through methods on <code>Order</code> (like
          <code>order.addLineItem(...)</code>), never updated directly by another service. That rule
          is what guarantees an order's total always matches the sum of its line items &mdash;
          nothing outside the aggregate can change one without the other.
        </p>
        <span className="codeLabel">AGGREGATE BOUNDARY IN CODE</span>
        <div className="codeBlock">
          <pre>{`class Order {              // aggregate root
  #lineItems = []
  addLineItem(item) {
    this.#lineItems.push(item)
    this.total = recompute(this.#lineItems)
  }
}
// other services never do: order.lineItems.push(item) directly`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of the Order aggregate: the Order root object and its line items grouped inside one consistency boundary, with all outside access going through the root, never directly to the line items.">
          <rect className="boxAccent" x="130" y="20" width="140" height="90" rx="8" />
          <text x="200" y="38" className="figLabel">ORDER AGGREGATE</text>
          <rect className="box" x="150" y="48" width="100" height="24" rx="5" />
          <text x="200" y="64" className="boxText" style={{fontSize:"7px"}}>Order (root)</text>
          <rect className="box" x="150" y="80" width="100" height="20" rx="5" />
          <text x="200" y="94" className="figHint" style={{fontSize:"6px"}}>line items</text>
          <rect className="box" x="20" y="48" width="90" height="24" rx="5" />
          <text x="65" y="64" className="boxText" style={{fontSize:"6.5px"}}>Another service</text>
          <line className="flow" x1="110" y1="60" x2="148" y2="60" />
          <line className="flowMuted" x1="65" y1="72" x2="150" y2="90" />
        </svg>
        <figcaption>Everything outside the aggregate goes through the root; the muted crossed path directly into line items never happens.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Modeling one giant aggregate that spans what should be several services &mdash; a
          <code>Customer</code> aggregate that includes billing history, support tickets, and
          marketing preferences &mdash; forces one service to own all three concerns and makes every
          load and save unnecessarily heavy. The opposite mistake, splitting one true aggregate
          (like <code>Order</code> and its line items) across two services, breaks the consistency
          guarantee entirely: nothing stops the two halves from disagreeing after a partial failure.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why would splitting Order and its line items into two separate services make it possible for an order's stored total to stop matching the sum of its line items?</p>
        </div>
      </section>
      <p className="takeaway">
        Let the aggregate boundary tell you where a service boundary can safely go &mdash; splitting
        inside one true aggregate breaks the very consistency guarantee it exists to provide.
      </p>
    </div>
  );
}
