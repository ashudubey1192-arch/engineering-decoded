import "../css/Article.css";

export default function ObjectsAndDataObjectsVsDataStructuresArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Objects and data structures are near-opposites in what they make easy to change.
          Confusing the two &mdash; adding behavior to a data structure, or adding fields to an
          object without behavior &mdash; produces code that resists exactly the kind of change you
          most often need to make.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Objects hide data, expose behavior</b> &mdash; you ask an object to do something (<code>invoice.markPaid()</code>); you do not reach in and set its fields directly.</li>
          <li><b>Data structures expose data, have little behavior</b> &mdash; a plain record (<code>{"{ id, total, status }"}</code>) is meant to be read and written directly by code that operates on it externally.</li>
          <li><b>The dual known as the "expression problem"</b> &mdash; objects make it easy to add new types (implement the interface) but hard to add new operations (touch every type); data structures are the reverse &mdash; easy to add operations, hard to add new shapes without touching every operation.</li>
          <li><b>Pick deliberately, don't mix by accident</b> &mdash; a "hybrid" &mdash; half-encapsulated, half-exposed &mdash; tends to get the worst of both: hard to add types safely, and hard to add operations cleanly.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Two valid designs for the same idea in Ledgerly, chosen deliberately for different
          reasons:
        </p>
        <span className="codeLabel">OBJECT: BEHAVIOR-CENTERED, USED THROUGHOUT THE APP</span>
        <div className="codeBlock">
          <pre>{`class Invoice {
  #status = "draft";
  markPaid() { this.#status = "paid"; }
  isPaid() { return this.#status === "paid"; }
  // adding a new operation (e.g. "refund") touches only this class
}`}</pre>
        </div>
        <span className="codeLabel">DATA STRUCTURE: SHAPE-CENTERED, USED FOR THE EXPORT API</span>
        <div className="codeBlock">
          <pre>{`// a plain, exposed shape returned from the public export endpoint —
// deliberately not an object, so any client can read every field
// without depending on Ledgerly's internal behavior
function toExportRecord(invoice) {
  return { id: invoice.id, total: invoice.total, status: invoice.status };
}`}</pre>
        </div>
        <p>
          <code>Invoice</code> is an object because Ledgerly's own code needs to safely add new
          operations on it over time. The export record is a plain data structure on purpose
          &mdash; external API clients need to read every field directly, and locking that behind
          object methods would make the export API needlessly awkward to consume.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram contrasting objects, which hide fields and expose behavior making it easy to add new types, with data structures, which expose fields and offer little behavior making it easy to add new external operations.">
          <rect className="box" x="20" y="15" width="170" height="80" rx="6" />
          <text x="105" y="32" className="boxText" style={{fontSize:"5.5px"}}>Object: Invoice</text>
          <text x="105" y="48" className="figHint" style={{fontSize:"4.5px"}}>fields hidden</text>
          <text x="105" y="60" className="figHint" style={{fontSize:"4.5px"}}>behavior exposed</text>
          <text x="105" y="75" className="figHint" style={{fontSize:"4.5px"}}>easy: add new invoice types</text>
          <rect className="boxAccent" x="230" y="15" width="170" height="80" rx="6" />
          <text x="315" y="32" className="boxText" style={{fontSize:"5.5px"}}>Data: export record</text>
          <text x="315" y="48" className="figHint" style={{fontSize:"4.5px"}}>fields exposed</text>
          <text x="315" y="60" className="figHint" style={{fontSize:"4.5px"}}>little behavior</text>
          <text x="315" y="75" className="figHint" style={{fontSize:"4.5px"}}>easy: add new export formats</text>
        </svg>
        <figcaption>Two deliberate, opposite designs for two different needs &mdash; internal behavior versus external data exchange.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adding a handful of public getters and setters to an object "just in case" turns it
          into an accidental hybrid: behavior that assumes controlled internal state, sitting
          next to fields anyone can mutate directly and invalidate that same state. If external
          code needs raw field access, make that decision explicit with a real data structure,
          rather than slowly eroding an object's encapsulation one getter at a time.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why was a plain data structure, not an object, the right choice for Ledgerly's export API record?</p>
        </div>
      </section>
      <p className="takeaway">
        Objects and data structures solve different problems &mdash; objects make new types easy to
        add, data structures make new operations easy to add. Choose deliberately based on
        which kind of change you expect, rather than drifting into an unplanned mix of both.
      </p>

    </div>
  );
}
