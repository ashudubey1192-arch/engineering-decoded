import "../css/Article.css";

export default function BigDataProcessingDataLakesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A data lake stores raw data of any type — structured, semi-structured, unstructured — in
          its original form, without requiring a schema upfront, in contrast to a data warehouse's
          structured, pre-modeled tables.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A data lake is typically built on cheap object storage and takes a{" "}
          <b>schema-on-read</b> approach: data is dumped in as-is (JSON logs, CSVs, images,
          Parquet files) with no upfront modeling required, and the structure is applied later,
          at query time, by whatever tool reads it. This makes lakes cheap and flexible for storing
          huge volumes of varied data whose eventual use isn't fully known yet — the tradeoff is
          that without governance, a lake can become a "data swamp": a pile of undocumented,
          untrustworthy files nobody can confidently use.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Dump raw data as it arrives.</b> Clickstream JSON, server logs, and exported CSVs
            all land in the lake in their native format, with no transformation required first.</li>
          <li><b>Data scientists explore it later.</b> A researcher reads the raw clickstream data
            for an exploratory analysis nobody had planned for at ingest time.</li>
          <li><b>A defined pipeline reads a subset,</b> applies structure, and loads a clean,
            modeled version into a data warehouse for regular business reporting.</li>
          <li><b>The lake keeps the raw originals</b> — if the pipeline's transformation logic
            needs to change later, it can be rerun from the untouched original data.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of varied raw data types flowing into a data lake in their native format, with structure applied later at query time rather than upfront." >
          {["JSON", "CSV", "images", "logs"].map((t, i) => (
            <rect key={t} className="box" x={20 + i * 100} y="20" width="80" height="26" rx="4" />
          ))}
          {["JSON", "CSV", "images", "logs"].map((t, i) => (<text key={t} x={60 + i * 100} y="38" className="boxText" textAnchor="middle">{t}</text>))}
          {[0, 1, 2, 3].map((i) => (<line key={i} className="flow" x1={60 + i * 100} y1="46" x2="210" y2="75" />))}
          <rect className="boxAccent" x="140" y="80" width="140" height="30" rx="5" /><text x="210" y="100" className="boxText">data lake (raw, as-is)</text>
          <text x="210" y="125" className="figHint" textAnchor="middle">structure applied later, at query/read time</text>
        </svg>
        <figcaption>Varied raw data lands unchanged; structure is applied later, only when it's actually read.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating a data lake as a substitute for data governance — no cataloging, no ownership,
          no documentation of what's in it — is how lakes turn into unusable "data swamps." Loading
          everything into a lake without any lifecycle policy also lets storage costs and clutter
          grow indefinitely, even for data nobody will ever query again.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does "schema-on-read" make a data lake more flexible than a data warehouse, and what governance risk does that flexibility introduce?</p>
        </div>
      </section>
      <p className="takeaway">
        Data lakes trade upfront structure for flexibility and low-cost storage of any data type —
        valuable for unplanned future uses, but only with real governance to avoid becoming an
        unusable swamp.
      </p>
    </div>
  );
}
