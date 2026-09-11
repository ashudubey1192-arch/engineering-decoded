import "../css/Article.css";

export default function ObservabilityCorrelationIdsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A correlation ID is a unique identifier generated at the start of a request and passed
          along to every service that request touches — letting you pull together every log line
          and trace span from a single request, across an entire microservices architecture.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          When a request enters the system (typically at the API gateway or load balancer), it's
          assigned a unique ID. That ID is included in every log line the request generates, and
          it's forwarded in every downstream call the request triggers (usually as an HTTP header),
          so every service the request touches logs with the same ID. Later, searching logs for
          that one ID across the entire log aggregation system instantly reconstructs the request's
          complete path and behavior — without a correlation ID, piecing together one request's
          story across a dozen services from unrelated log streams is nearly impossible.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Request enters at the gateway.</b> It's assigned{" "}
            <code>correlationId: "req-8871"</code>.</li>
          <li><b>Gateway calls the orders service,</b> forwarding the ID in a header; orders
            service logs everything it does with that same ID.</li>
          <li><b>Orders service calls payments and inventory,</b> forwarding the same ID onward to
            each — every service in the chain logs with{" "}
            <code>correlationId: "req-8871"</code>.</li>
          <li><b>A user reports an error.</b> Searching logs for{" "}
            <code>correlationId: "req-8871"</code> instantly pulls together every log line from
            every service that request touched, in order.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of a single correlation ID being forwarded through a chain of service calls, letting logs from every service in the chain later be pulled together by that same id." >
          <rect className="box" x="20" y="45" width="80" height="30" rx="5" /><text x="60" y="65" className="boxText">gateway</text>
          <line className="flow" x1="100" y1="60" x2="150" y2="60" /><text x="125" y="45" className="figHint">id: req-8871</text>
          <rect className="box" x="160" y="45" width="80" height="30" rx="5" /><text x="200" y="65" className="boxText">orders</text>
          <line className="flow" x1="240" y1="60" x2="290" y2="60" /><text x="265" y="45" className="figHint">id: req-8871</text>
          <rect className="boxAccent" x="300" y="45" width="90" height="30" rx="5" /><text x="345" y="65" className="boxText">payments</text>
          <text x="220" y="105" className="figHint" textAnchor="middle">same id, forwarded through every hop</text>
        </svg>
        <figcaption>The same ID travels through every downstream call, tying together the whole request's log trail.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forgetting to forward the correlation ID through every single downstream call — even one
          missed hop — breaks the chain and leaves a gap in the reconstructed request story.
          Generating a new ID partway through instead of consistently propagating the original one
          is a subtle version of the same mistake, usually caused by inconsistent middleware or
          library configuration across services.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a single missed correlation ID forward, at just one hop in a service chain, break the ability to reconstruct that request's full story?</p>
        </div>
      </section>
      <p className="takeaway">
        A correlation ID is the thread that ties one request's logs together across every service
        it touches — without it, debugging a multi-service request means piecing together
        unrelated log streams by hand.
      </p>
    </div>
  );
}
