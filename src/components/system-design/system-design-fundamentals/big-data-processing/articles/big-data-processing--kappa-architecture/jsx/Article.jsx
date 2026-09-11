import "../css/Article.css";

export default function BigDataProcessingKappaArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Kappa architecture simplifies Lambda's two-pipeline design down to one: everything runs
          through a single streaming pipeline, and "batch reprocessing" just means replaying
          historical events through that same stream again.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Kappa's key enabler is a log-based message system (like Kafka) that retains events for a
          long time, or indefinitely, rather than just briefly passing them through. Instead of
          maintaining separate batch and streaming codebases computing the same thing, there's only
          one streaming job. When the processing logic needs to change, or a bug needs fixing, you
          don't run a different batch pipeline — you simply replay the retained historical events
          from the log through a new instance of the (corrected) streaming job, and swap it in once
          it's caught up.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>All events go through one stream.</b> A single streaming job computes video view
            counts as events arrive, continuously.</li>
          <li><b>A bug is found</b> in the view-counting logic — some views were being
            double-counted.</li>
          <li><b>Fix the logic,</b> and deploy a new version of the same streaming job.</li>
          <li><b>Replay history.</b> The new job reads from the beginning of the retained event
            log, reprocessing everything with the corrected logic, until it catches up to live —
            at which point it becomes the new source of truth. No separate batch system was ever
            needed.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a single retained event log being replayed from the beginning through a corrected streaming job to reprocess history, instead of maintaining a separate batch pipeline." >
          <rect className="box" x="20" y="45" width="200" height="30" rx="5" /><text x="120" y="65" className="boxText">retained event log</text>
          <line className="flow" x1="220" y1="60" x2="270" y2="60" />
          <rect className="boxAccent" x="280" y="45" width="120" height="30" rx="5" /><text x="340" y="65" className="boxText">streaming job</text>
          <text x="120" y="95" className="figHint" textAnchor="middle">replay from the start to reprocess history</text>
        </svg>
        <figcaption>One pipeline, replayed from a retained log, replaces the need for a separate batch system.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Underestimating the storage cost and retention requirements of keeping a long or
          indefinite event log is a real practical constraint Kappa depends on. Some problems also
          genuinely benefit from true batch-style processing over a complete, static dataset (like
          certain machine learning training jobs) — Kappa isn't a universal replacement for every
          batch use case, just for the specific "keep two pipelines in sync" pain Lambda has.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does Kappa architecture avoid the need for a separate batch codebase that Lambda architecture requires?</p>
        </div>
      </section>
      <p className="takeaway">
        Kappa trades Lambda's two-pipeline complexity for a single streaming pipeline plus
        replayable history — simpler to maintain, as long as retaining that history is practical.
      </p>
    </div>
  );
}
