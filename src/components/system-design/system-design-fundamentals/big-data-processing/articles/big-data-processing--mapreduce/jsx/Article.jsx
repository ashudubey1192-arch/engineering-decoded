import "../css/Article.css";

export default function BigDataProcessingMapreduceArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          MapReduce is a programming model for processing huge datasets in parallel across many
          machines, by breaking work into two simple, independently-parallelizable steps: map and
          reduce.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The <b>map</b> step transforms each input record independently into zero or more
          key-value pairs — since each record is processed in isolation, this step can run on
          thousands of machines simultaneously with zero coordination between them. The
          framework then <b>shuffles</b> the output, grouping all pairs with the same key together.
          The <b>reduce</b> step then aggregates all values for each key into a final result. This
          split is what makes the whole job parallelizable: as long as your problem can be
          expressed as "transform independently, then group and combine," MapReduce can scale it
          across an enormous cluster automatically.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>Count how many times each word appears across a billion documents.</p>
        </div>
        <ol className="stepList">
          <li><b>Map (parallel, per document).</b> Each machine processes a subset of documents,
            emitting <code>(word, 1)</code> for every word it finds.</li>
          <li><b>Shuffle.</b> The framework groups all pairs by word — every{" "}
            <code>("system", 1)</code> pair, from every machine, ends up together.</li>
          <li><b>Reduce (parallel, per word).</b> For each word, sum up all its <code>1</code>{" "}
            values — <code>("system", 1)</code> appearing 4,201 times becomes{" "}
            <code>("system", 4201)</code>.</li>
          <li><b>Result.</b> A complete word-count across a billion documents, computed by
            thousands of machines working on small, independent pieces.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of the MapReduce flow: many machines mapping input records in parallel, the framework shuffling and grouping results by key, then reduce combining each key's values into a final result." >
          <text x="80" y="18" className="figLabel" textAnchor="middle">MAP</text>
          {[0, 1, 2].map((i) => (<rect key={i} className="box" x="20" y={30 + i * 30} width="90" height="22" rx="3" />))}
          <line className="flow" x1="110" y1="65" x2="170" y2="65" />
          <text x="200" y="18" className="figLabel" textAnchor="middle">SHUFFLE</text>
          <rect className="boxAccent" x="180" y="50" width="90" height="30" rx="4" /><text x="225" y="70" className="boxText">group by key</text>
          <line className="flow" x1="270" y1="65" x2="330" y2="65" />
          <text x="380" y="18" className="figLabel" textAnchor="middle">REDUCE</text>
          <rect className="box" x="340" y="50" width="80" height="30" rx="4" /><text x="380" y="70" className="boxText">sum per key</text>
        </svg>
        <figcaption>Independent parallel map, a grouping shuffle, then parallel reduce per group.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forcing a problem that's inherently sequential or iterative (where each step depends
          tightly on the previous one) into MapReduce's map-then-reduce shape often fights the
          model. The shuffle step is also often the actual bottleneck in a MapReduce job — moving
          and sorting data between machines can dominate runtime more than either the map or
          reduce computation itself.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can the map step run across thousands of machines with zero coordination between them?</p>
        </div>
      </section>
      <p className="takeaway">
        MapReduce scales by splitting work into an embarrassingly parallel map phase and a
        grouped reduce phase — a simple shape that unlocks massive parallelism for problems that
        fit it.
      </p>
    </div>
  );
}
