import "../css/Article.css";

export default function ScalabilityPerformanceBottlenecksArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A system is only ever as fast as its single slowest dependency on the critical path
          &mdash; finding that one bottleneck matters far more than optimizing everything else
          around it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A <b>bottleneck</b> is the component that limits overall throughput or latency even when
          every other component has spare capacity. Common culprits: a database that hasn&rsquo;t
          been indexed for its actual query pattern, a downstream service called synchronously
          when it didn&rsquo;t need to be, or a single non-scaled component sitting behind an
          otherwise horizontally-scaled fleet. The fix is always specific to the bottleneck found
          &mdash; there&rsquo;s no generic &ldquo;make it faster&rdquo; move.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>API service is scaled to 20 instances,</b> but overall throughput hasn&rsquo;t
            improved as expected.</li>
          <li><b>Trace a slow request end-to-end.</b> Nearly all of its time is spent waiting on a
            single database query.</li>
          <li><b>Inspect that query.</b> It&rsquo;s scanning a full table because the column it
            filters on isn&rsquo;t indexed.</li>
          <li><b>Add the index.</b> The database, the true bottleneck, speeds up dramatically
            &mdash; and only then does adding more API instances actually help.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a request pipeline where a scaled API layer feeds into a single unscaled database, with the database marked as the bottleneck limiting overall throughput." >
          <text x="130" y="18" className="figHint" textAnchor="middle">scaled, plenty of capacity</text>
          {[0,1,2].map(i => (<rect key={i} className="box" x={20 + i*80} y="25" width="65" height="26" rx="5" />))}
          <line className="flow" x1="130" y1="51" x2="250" y2="80" />
          <line className="flow" x1="210" y1="51" x2="250" y2="80" />
          <line className="flow" x1="290" y1="51" x2="270" y2="80" />
          <rect className="boxWarn" x="230" y="82" width="100" height="26" rx="5" /><text x="280" y="99" className="boxText" style={{fontSize:"8px"}}>DB: bottleneck</text>
        </svg>
        <figcaption>Scaling the layer above a bottleneck doesn't help until the bottleneck itself is fixed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Scaling out a layer that already has spare capacity, without first tracing where time is
          actually spent, wastes effort and cost while the real bottleneck stays untouched. Guessing
          at the bottleneck instead of measuring (adding indexes everywhere, adding caches
          everywhere) can also add complexity without fixing the actual constraint.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did adding more API service instances fail to improve throughput until the database query was fixed?</p>
        </div>
      </section>
      <p className="takeaway">
        Find the single slowest dependency on the critical path before optimizing anything else
        &mdash; every other improvement is wasted until that one bottleneck is addressed.
      </p>
    </div>
  );
}
