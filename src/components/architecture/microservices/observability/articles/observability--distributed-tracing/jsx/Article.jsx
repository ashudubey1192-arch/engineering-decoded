import "../css/Article.css";

export default function ObservabilityDistributedTracingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A correlation ID tells you which log lines belong to the same request; distributed
          tracing goes further and reconstructs the actual call tree and timing &mdash; turning
          "checkout felt slow" into "340 of the request's 900 milliseconds were spent in one
          specific downstream call."
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A <b>trace</b> represents one request's entire journey. It's made up of <b>spans</b>,
          each representing one unit of work &mdash; a service call, a database query &mdash; with
          its own start time, duration, and a reference to its parent span. Stitched together by
          shared trace and span IDs, these form a tree that a tracing system can render as a
          waterfall: every hop, in order, with exactly how long each one took.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A checkout request takes 900ms end to end. Without tracing, that's all you know. With
          tracing, the waterfall shows the request spent 300ms in <code>PaymentService</code> and
          then, sequentially afterward, 400ms in <code>InventoryService</code> &mdash; nearly half
          the total request time in one call that turns out to be doing an unindexed lookup.
        </p>
        <span className="codeLabel">CREATING A CHILD SPAN</span>
        <div className="codeBlock">
          <pre>{`const span = tracer.startSpan("inventory.checkStock", { parent: parentSpan })
const result = await inventoryClient.checkStock(items)
span.end()   // recorded duration: 400ms`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Waterfall diagram of a distributed trace: a 900 millisecond Gateway span contains an 850 millisecond Checkout span, which contains a 300 millisecond Payment span followed sequentially by a 400 millisecond Inventory span, revealing that Inventory accounts for nearly half the total request time.">
          <rect className="box" x="20" y="15" width="380" height="20" rx="4" />
          <text x="30" y="29" className="boxText" style={{fontSize:"6px"}}>Gateway</text>
          <text x="390" y="29" className="figHint" style={{fontSize:"5.5px"}} textAnchor="end">900ms</text>
          <rect className="box" x="35" y="45" width="345" height="20" rx="4" />
          <text x="45" y="59" className="boxText" style={{fontSize:"6px"}}>Checkout</text>
          <text x="375" y="59" className="figHint" style={{fontSize:"5.5px"}} textAnchor="end">850ms</text>
          <rect className="box" x="50" y="75" width="130" height="20" rx="4" />
          <text x="58" y="89" className="boxText" style={{fontSize:"6px"}}>Payment</text>
          <text x="175" y="89" className="figHint" style={{fontSize:"5px"}} textAnchor="end">300ms</text>
          <rect className="boxAccent" x="185" y="75" width="195" height="20" rx="4" />
          <text x="193" y="89" className="boxText" style={{fontSize:"6px"}}>Inventory</text>
          <text x="375" y="89" className="figHint" style={{fontSize:"5px"}} textAnchor="end">400ms</text>
        </svg>
        <figcaption>The waterfall shows Payment and Inventory run sequentially, not in parallel &mdash; Inventory alone accounts for nearly half the total 900ms.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Not propagating trace context across an asynchronous boundary &mdash; publishing to a
          message queue without forwarding the trace ID &mdash; means the consumer starts a brand
          new, disconnected trace, and the work it does becomes invisible in the original request's
          waterfall. Sampling every single request at 100% in a high-traffic service is the other
          common issue: it's rarely necessary and creates a volume and cost problem of its own, so
          most systems sample a small percentage of normal traffic while still capturing 100% of
          errors.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A trace shows Payment and Inventory as sequential spans taking 300ms and 400ms within an 850ms Checkout span. What does this reveal that a single correlation ID across log lines could not?</p>
        </div>
      </section>
      <p className="takeaway">
        A correlation ID tells you the log lines belong together; a trace tells you exactly where
        the time went, hop by hop &mdash; that's the difference between "it was slow" and "this
        specific call was slow."
      </p>
    </div>
  );
}
