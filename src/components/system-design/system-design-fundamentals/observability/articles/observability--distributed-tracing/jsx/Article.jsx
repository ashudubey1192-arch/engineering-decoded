import "../css/Article.css";

export default function ObservabilityDistributedTracingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Distributed tracing follows a single request as it travels across every service it
          touches, recording how long each step took — turning "why was this one request slow" in
          a microservices architecture from a guessing game into a visual timeline.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A trace is made up of <b>spans</b> — each span represents one unit of work (a service
          handling a request, a database call) with a start time, duration, and a parent span,
          forming a tree that mirrors the actual call graph. This builds directly on the
          correlation ID idea, but goes further: instead of just tying log lines together, each
          hop's exact timing is captured, so a tracing UI can render a visual, nested timeline
          showing exactly which service (or which specific call within a service) consumed the
          most time for a given request.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A slow checkout request</b> takes 1.2 seconds total — a metric flagged it, but
            not which part was slow.</li>
          <li><b>Pull up its trace.</b> The root span (gateway) took 1.2s; its child span (orders
            service) took 1.1s of that.</li>
          <li><b>Drill into the orders span's children.</b> A call to the inventory service took
            just 50ms, but a call to the payments service took 980ms — clearly the dominant cost.</li>
          <li><b>Root cause is visually obvious</b> from the timeline — payments service latency,
            not orders or inventory — without manually correlating separate log streams by hand.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a trace timeline with nested spans, showing a gateway span containing an orders span, which contains a short inventory span and a much longer payments span that dominates the total request time." >
          <rect className="box" x="20" y="15" width="400" height="24" rx="4" /><text x="30" y="31" className="boxText" style={{fontSize:"10px"}}>gateway — 1.2s</text>
          <rect className="box" x="35" y="45" width="370" height="22" rx="4" /><text x="45" y="60" className="boxText" style={{fontSize:"10px"}}>orders — 1.1s</text>
          <rect className="box" x="50" y="75" width="60" height="20" rx="3" /><text x="80" y="89" className="boxText" style={{fontSize:"9px"}}>inv 50ms</text>
          <rect className="boxAccent" x="120" y="75" width="280" height="20" rx="3" /><text x="260" y="89" className="boxText" style={{fontSize:"9px"}}>payments — 980ms</text>
        </svg>
        <figcaption>Nested spans render as a visual timeline — the dominant cost is immediately obvious.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Tracing every single request at 100% sampling can add real overhead and storage cost at
          high traffic volumes — most systems sample a percentage of requests, or trace 100% only
          of error/slow requests specifically. Forgetting to propagate trace context through an
          asynchronous hop (a message queue, a background job) is another common gap that breaks
          the trace into disconnected fragments right at that boundary.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a distributed trace's nested span structure make it easy to see which specific service dominated a slow request's total time?</p>
        </div>
      </section>
      <p className="takeaway">
        Distributed tracing extends correlation IDs with precise per-hop timing, rendering a
        request's full path as a visual timeline — the fastest way to find exactly where time went
        in a multi-service call.
      </p>
    </div>
  );
}
