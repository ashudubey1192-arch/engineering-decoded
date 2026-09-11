import "../css/Article.css";

export default function BigDataProcessingLambdaArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Lambda architecture runs both a batch and a streaming pipeline side by side over the
          same data — the streaming layer gives fast, approximate results; the batch layer later
          recomputes the accurate, authoritative version.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Three layers work together: the <b>speed layer</b> processes incoming data in real time,
          producing approximate, immediately-available results; the <b>batch layer</b>{" "}
          periodically reprocesses the complete historical dataset, producing a fully accurate
          result; and the <b>serving layer</b> merges both, typically favoring the batch result
          once it's available and falling back to the speed layer's estimate for the most recent
          window that the batch job hasn't caught up to yet. This gives both fast and eventually-
          accurate answers, at the cost of maintaining and keeping in sync two separate codebases
          doing conceptually the same computation.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Speed layer.</b> A streaming job computes "views per video in the last hour,"
            updating within seconds, but using simplified, approximate logic.</li>
          <li><b>Batch layer.</b> A nightly job recomputes the exact, fully-accurate view counts
            over the complete historical data using the authoritative logic.</li>
          <li><b>Serving layer merges them.</b> For anything before last night's batch run, serve
            the accurate batch numbers; for the last few hours the batch hasn't covered yet, serve
            the speed layer's approximate numbers.</li>
          <li><b>Users see both freshness and eventual accuracy</b> — approximate now, exact once
            the batch layer catches up.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of data flowing into both a speed layer producing fast approximate results and a batch layer producing accurate results, merged together in a serving layer." >
          <rect className="box" x="20" y="55" width="80" height="26" rx="4" /><text x="60" y="72" className="boxText">data</text>
          <line className="flow" x1="100" y1="65" x2="150" y2="30" /><line className="flow" x1="100" y1="65" x2="150" y2="100" />
          <rect className="boxAccent" x="160" y="15" width="110" height="28" rx="4" /><text x="215" y="34" className="boxText">speed layer</text>
          <rect className="box" x="160" y="90" width="110" height="28" rx="4" /><text x="215" y="109" className="boxText">batch layer</text>
          <line className="flow" x1="270" y1="29" x2="320" y2="60" /><line className="flow" x1="270" y1="104" x2="320" y2="70" />
          <rect className="boxAccent" x="330" y="50" width="100" height="28" rx="4" /><text x="380" y="69" className="boxText">serving layer</text>
        </svg>
        <figcaption>Fast approximate results and slower accurate results merge in the serving layer.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Maintaining two separate implementations of essentially the same business logic (once
          for the speed layer, once for the batch layer) is Lambda's most cited real-world pain
          point — they can drift apart and disagree. This exact problem is what motivated the
          Kappa architecture, covered next, as a simpler alternative.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does Lambda architecture require maintaining two separate codebases for what is conceptually the same computation?</p>
        </div>
      </section>
      <p className="takeaway">
        Lambda architecture buys both real-time and eventually-accurate results by running batch
        and streaming side by side — at the real cost of keeping two parallel pipelines in sync.
      </p>
    </div>
  );
}
