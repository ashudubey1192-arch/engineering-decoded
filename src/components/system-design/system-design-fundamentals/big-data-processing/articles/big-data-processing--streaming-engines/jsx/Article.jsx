import "../css/Article.css";

export default function BigDataProcessingStreamingEnginesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Streaming engines (Apache Kafka Streams, Apache Flink, Spark Streaming) are the tools
          that actually run stream processing jobs — handling the hard parts (state, time windows,
          fault tolerance) so applications don't have to build them from scratch.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A streaming engine gives you a few core building blocks: <b>windowing</b> (grouping
          events into time-based buckets — "every 5 minutes" — since a stream never truly ends and
          you need some way to bound an aggregation), <b>state management</b> (durably tracking
          running totals, joins, or other state across events, surviving a machine failure without
          losing progress), and <b>exactly-once processing guarantees</b> (ensuring a failure and
          retry doesn't double-count an event, which is much harder to get right by hand than it
          sounds). These are exactly the pieces that make hand-rolled streaming code so error-prone
          — a mature engine has already solved them.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Define a windowed aggregation.</b> "Count events per user, in 5-minute tumbling
            windows" — the engine handles bucketing events by time automatically.</li>
          <li><b>Engine manages state.</b> Running counts per user per window are checkpointed
            durably, so a worker crash doesn't lose progress.</li>
          <li><b>A worker crashes mid-window.</b> The engine restarts processing from the last
            checkpoint, guaranteeing events aren't silently dropped or double-counted.</li>
          <li><b>Window closes.</b> The engine emits the final count for that 5-minute window,
            having handled failure recovery and state transparently the whole time.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of a continuous event stream divided into fixed time windows by a streaming engine, with state checkpointed durably so a worker failure doesn't lose progress within a window." >
          <line x1="20" y1="40" x2="420" y2="40" stroke="var(--muted)" />
          {[0, 1, 2, 3, 4, 5].map((i) => (<circle key={i} className="box" cx={40 + i * 65} cy="40" r="6" />))}
          <line className="divider" x1="150" y1="20" x2="150" y2="60" /><line className="divider" x1="280" y1="20" x2="280" y2="60" /><line className="divider" x1="410" y1="20" x2="410" y2="60" />
          <text x="215" y="18" className="figHint" textAnchor="middle">5-min window</text>
          <rect className="boxAccent" x="150" y="80" width="130" height="26" rx="4" /><text x="215" y="98" className="boxText">checkpointed state</text>
        </svg>
        <figcaption>The engine buckets events into windows and durably checkpoints state, surviving failures transparently.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Hand-rolling stream processing logic (manual buffering, manual state tracking) instead
          of using a mature engine reinvents extremely well-tested, hard-to-get-right machinery.
          Choosing "at-least-once" semantics without understanding the difference from
          "exactly-once" is another common gap — some engines default to at-least-once, which can
          double-count events unless the application logic is specifically written to be
          idempotent.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is exactly-once processing significantly harder to implement correctly by hand than it might first appear?</p>
        </div>
      </section>
      <p className="takeaway">
        Streaming engines exist because windowing, durable state, and exactly-once guarantees are
        genuinely hard to build correctly — using a mature engine avoids re-solving problems that
        are easy to get subtly wrong.
      </p>
    </div>
  );
}
