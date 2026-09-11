import "../css/Article.css";

export default function TradeoffsConcurrencyVsParallelismArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Concurrency is structuring a program to deal with many things at once; parallelism is
          actually doing many things at the exact same instant. You can have one without the
          other, and the distinction changes how you reason about correctness and speed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A single-core CPU can be <b>concurrent</b> — rapidly switching between tasks so they
          appear to make progress together — without ever being <b>parallel</b>, since only one
          instruction executes at any instant. Parallelism requires multiple cores (or machines)
          genuinely executing at the same time. Concurrency is about structure and coordination
          (avoiding races, deadlocks); parallelism is about throughput (using more hardware to go
          faster).
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Concurrent, not parallel.</b> A single-threaded web server uses an event loop to
            juggle thousands of open connections, switching between them while waiting on I/O — one
            core, many things "in flight."</li>
          <li><b>Parallel, not concurrent.</b> A single large matrix multiplication is split across
            8 CPU cores, each computing a different chunk simultaneously, with no coordination
            needed between chunks until the end.</li>
          <li><b>Both together.</b> A web server handles thousands of concurrent requests, and each
            request's image-resizing work is parallelized across multiple cores.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram contrasting concurrency as one core rapidly switching between three tasks versus parallelism as three cores executing three tasks at the same instant.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">CONCURRENCY (1 core)</text>
          <rect className="box" x="30" y="35" width="30" height="24" rx="3" /><rect className="boxAccent" x="65" y="35" width="30" height="24" rx="3" /><rect className="box" x="100" y="35" width="30" height="24" rx="3" />
          <text x="80" y="75" className="figHint" textAnchor="middle">interleaved on one core over time</text>
          <line className="divider" x1="200" y1="10" x2="200" y2="140" />
          <text x="330" y="18" className="figLabel" textAnchor="middle">PARALLELISM (3 cores)</text>
          <rect className="box" x="240" y="35" width="50" height="24" rx="3" /><rect className="boxAccent" x="240" y="65" width="50" height="24" rx="3" /><rect className="box" x="240" y="95" width="50" height="24" rx="3" />
          <text x="360" y="47" className="figHint">core 1</text><text x="360" y="77" className="figHint">core 2</text><text x="360" y="107" className="figHint">core 3</text>
          <text x="330" y="130" className="figHint" textAnchor="middle">all running at the same instant</text>
        </svg>
        <figcaption>Concurrency is about structure over time; parallelism is about simultaneous execution.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming concurrent code is automatically faster is a common confusion — on a single
          core, concurrency can even add overhead from context switching. The other classic mistake
          is adding threads for parallelism without protecting shared state, introducing race
          conditions that concurrency-safe design would have avoided.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Can a single-core CPU be concurrent without being parallel? Explain why or why not.</p>
        </div>
      </section>
      <p className="takeaway">
        Concurrency is a way of structuring work; parallelism is a way of executing it faster with
        more hardware — a system can have either, both, or neither.
      </p>
    </div>
  );
}
