import "../css/Article.css";

export default function BigDataProcessingEtlPipelinesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          ETL (Extract, Transform, Load) is the standard pattern for moving data from where it's
          produced into a system built for analysis — pulling data out, cleaning and reshaping it,
          then loading it into its destination.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Extract</b> pulls raw data from source systems (application databases, third-party
          APIs, logs). <b>Transform</b> cleans, validates, and reshapes it — fixing inconsistent
          formats, joining reference data, aggregating — into a form suited for analysis.{" "}
          <b>Load</b> writes the transformed result into its destination, typically a data
          warehouse. A related variant, <b>ELT</b>, loads raw data first and transforms it inside
          the destination system afterward — increasingly common now that warehouses have enough
          compute power to do transformation themselves, keeping the raw data available for
          re-transformation later.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Extract.</b> Pull yesterday's orders from the production database and
            yesterday's page views from an events log.</li>
          <li><b>Transform.</b> Standardize timestamps to UTC, join orders with customer
            reference data, filter out known bot traffic, and aggregate page views into daily
            per-user counts.</li>
          <li><b>Load.</b> Write the cleaned, joined, aggregated tables into the data warehouse.</li>
          <li><b>Analysts query the warehouse,</b> never touching the messy, high-volume raw
            production data directly.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of the ETL pipeline: extracting raw data from source systems, transforming and cleaning it, then loading the result into a data warehouse for analysis." >
          <rect className="box" x="20" y="40" width="100" height="30" rx="5" /><text x="70" y="60" className="boxText">sources</text>
          <line className="flow" x1="120" y1="55" x2="170" y2="55" /><text x="145" y="45" className="figHint">extract</text>
          <rect className="boxAccent" x="180" y="40" width="100" height="30" rx="5" /><text x="230" y="60" className="boxText">transform</text>
          <line className="flow" x1="280" y1="55" x2="330" y2="55" /><text x="305" y="45" className="figHint">load</text>
          <rect className="box" x="340" y="40" width="100" height="30" rx="5" style={{opacity:0}} />
          <rect className="box" x="335" y="40" width="90" height="30" rx="5" /><text x="380" y="60" className="boxText">warehouse</text>
        </svg>
        <figcaption>Raw data is extracted, cleaned and reshaped, then loaded into an analysis-ready destination.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping data validation during transform lets bad data (nulls where they shouldn't be,
          duplicate records, broken joins) silently corrupt downstream analysis and dashboards.
          Not making pipelines idempotent (safely re-runnable) is another common gap — a pipeline
          that fails partway through and can't simply be re-run without creating duplicates causes
          real operational pain.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the key difference between ETL and ELT, and why has ELT become more common as warehouses got more powerful?</p>
        </div>
      </section>
      <p className="takeaway">
        ETL (or its ELT variant) is the standard path from messy operational data to clean,
        analysis-ready data — the transform step is where most of the real data-quality work
        happens.
      </p>
    </div>
  );
}
