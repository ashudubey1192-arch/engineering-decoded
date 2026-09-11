import "../css/Article.css";

export default function BigDataProcessingBatchVsStreamProcessingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Batch processing runs on a large, bounded chunk of already-collected data all at once;
          stream processing handles data continuously, as each event arrives. The choice shapes
          latency, complexity, and how "up to date" your results can be.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Batch jobs run on a schedule (hourly, nightly) over a complete, known dataset — simpler
          to reason about and easy to reprocess if logic changes, but results are only as fresh as
          the last run. Stream processing processes each event within seconds of it happening,
          giving near-real-time results, at the cost of real complexity: handling out-of-order
          events, defining time windows, and managing state that spans an unbounded, never-ending
          input.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Monthly billing report → batch.</b> Runs once a month over the complete month's
            data — no need for it to be real-time, and a complete dataset makes the logic simpler.</li>
          <li><b>Fraud detection → stream.</b> Must flag a suspicious transaction within seconds,
            not wait for the next nightly batch run.</li>
          <li><b>Many systems use both.</b> A streaming layer gives fast, approximate real-time
            numbers; a nightly batch job recomputes the authoritative, fully accurate version —
            this hybrid is exactly what the Lambda architecture (later in this section) formalizes.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting batch processing running periodically over a large accumulated dataset versus stream processing handling each event continuously as it arrives." >
          <text x="100" y="18" className="figLabel" textAnchor="middle">BATCH</text>
          <rect className="box" x="20" y="30" width="160" height="40" rx="5" /><text x="100" y="54" className="boxText">accumulated data</text>
          <line className="flow" x1="100" y1="70" x2="100" y2="95" />
          <text x="100" y="112" className="figHint" textAnchor="middle">runs once, on a schedule</text>
          <line className="divider" x1="210" y1="10" x2="210" y2="120" />
          <text x="330" y="18" className="figLabel" textAnchor="middle">STREAM</text>
          {[0, 1, 2, 3].map((i) => (<circle key={i} className="boxAccent" cx={250 + i * 45} cy="50" r="8" />))}
          <line className="flow" x1="230" y1="50" x2="420" y2="50" />
          <text x="330" y="90" className="figHint" textAnchor="middle">processed continuously, event by event</text>
        </svg>
        <figcaption>Batch waits for a full dataset; streaming reacts to each event as it happens.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Defaulting to streaming for problems that don't need real-time results adds significant
          operational complexity (state management, windowing, out-of-order handling) for no real
          benefit. Conversely, forcing a genuinely real-time requirement (fraud alerts, live
          dashboards) into a batch schedule delivers results too stale to be useful.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does stream processing need to explicitly handle out-of-order events in a way batch processing generally doesn't?</p>
        </div>
      </section>
      <p className="takeaway">
        Batch trades freshness for simplicity over a complete dataset; streaming trades
        complexity for near-real-time results on data that never stops arriving — pick based on
        how fresh the answer actually needs to be.
      </p>
    </div>
  );
}
