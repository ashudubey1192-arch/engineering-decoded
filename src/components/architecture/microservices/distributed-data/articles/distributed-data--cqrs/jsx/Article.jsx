import "../css/Article.css";

export default function DistributedDataCqrsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          CQRS splits the model used to change data (commands) from the model used to read it
          (queries) &mdash; instead of one schema trying to serve both writes and every read pattern
          well, each side gets a shape optimized for its own job.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The write side stays normalized and focused on enforcing business rules correctly &mdash;
          it's often the event-sourced model from the previous lesson. The read side maintains one
          or more separately-optimized, denormalized views built specifically to answer particular
          queries fast, updated asynchronously as write-side events happen. The two sides can even
          live in different kinds of storage entirely: a relational write model, a search-optimized
          or key-value read model.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code>'s write side processes <code>PlaceOrder</code> commands against a
          normalized <code>orders</code> + <code>order_items</code> schema. A separate read model,
          <code>customer_order_history</code>, is a single flat, pre-joined table built specifically
          to answer "show this customer's last 20 orders" instantly &mdash; it's rebuilt
          asynchronously every time an <code>OrderPlaced</code> event fires, so it's eventually, not
          instantly, consistent with the write side.
        </p>
        <span className="codeLabel">READ MODEL UPDATED FROM AN EVENT</span>
        <div className="codeBlock">
          <pre>{`onOrderPlaced(event) {
  customerOrderHistoryTable.upsert({
    customerId: event.customerId,
    orderId: event.orderId,
    summary: buildFlatSummary(event),   // pre-joined, read-optimized
  })
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of CQRS: a PlaceOrder command updates the normalized write model, which emits an event that asynchronously updates a separate, denormalized read model used only for fast queries.">
          <rect className="boxAccent" x="20" y="25" width="130" height="34" rx="6" />
          <text x="85" y="46" className="boxText" style={{fontSize:"7px"}}>Write model</text>
          <text x="85" y="75" className="figHint" style={{fontSize:"6px"}}>normalized, enforces rules</text>
          <rect className="box" x="270" y="25" width="130" height="34" rx="6" />
          <text x="335" y="46" className="boxText" style={{fontSize:"7px"}}>Read model</text>
          <text x="335" y="75" className="figHint" style={{fontSize:"6px"}}>denormalized, fast queries</text>
          <line className="flow" x1="150" y1="42" x2="268" y2="42" />
          <text x="210" y="30" className="figHint" style={{fontSize:"5.5px"}}>event, async</text>
        </svg>
        <figcaption>Writes go through the normalized model; reads hit a separately-shaped model kept up to date asynchronously by events from the write side.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for CQRS everywhere, even for simple entities with one obvious read pattern, adds
          real complexity (two models, an async pipeline between them, eventual consistency to
          reason about) for no real benefit. Forgetting that the read model is eventually consistent
          is the other common mistake: a customer who just placed an order and immediately refreshes
          their order history might briefly not see it yet, if the UI was built assuming reads are
          always instantly up to date with writes.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A customer places an order and immediately refreshes their order history page, which reads from the denormalized read model. Why might the new order not appear yet, and is that a bug?</p>
        </div>
      </section>
      <p className="takeaway">
        CQRS is worth its complexity when the write and read shapes genuinely pull in different
        directions &mdash; not as a default architecture for every entity in the system.
      </p>
    </div>
  );
}
