import "../css/Article.css";

export default function DatabasesTimeSeriesDatabasesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A time-series database (InfluxDB, TimescaleDB, Prometheus) is optimized for data points
          that are timestamped and mostly appended in time order — metrics, sensor readings,
          stock prices — and for queries that aggregate over time windows.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Time-series workloads are write-heavy, append-only, and rarely update old data. That
          lets these databases use compression schemes tuned for sequential timestamps and
          slowly-changing values (delta encoding), and to organize storage by time so a query like
          "average CPU over the last hour" only touches the relevant recent chunk instead of the
          whole history. Old data is often automatically downsampled or expired.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Ingest continuously.</b> Every server reports CPU usage once per second, tagged
            with a hostname.</li>
          <li><b>Store by time.</b> Data lands in the current time-bucketed chunk, compressed as
            it's written.</li>
          <li><b>Query a window.</b> "Average CPU per host over the last 15 minutes" touches only
            recent chunks.</li>
          <li><b>Downsample automatically.</b> After 30 days, per-second data is rolled up into
            per-minute averages to save space, since nobody needs second-level detail from a
            month ago.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of a time series stored in sequential time-bucketed chunks, with recent chunks kept at full resolution and older chunks downsampled.">
          <line x1="20" y1="80" x2="420" y2="80" stroke="var(--muted)" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} className={i > 4 ? "boxAccent" : "box"} x={30 + i * 48} y="55" width="38" height="25" rx="3" />
          ))}
          <text x="70" y="105" className="figHint" textAnchor="middle">downsampled, old</text>
          <text x="370" y="105" className="figHint" textAnchor="middle">full resolution, recent</text>
        </svg>
        <figcaption>Storage shrinks as data ages — recent points stay precise, old points get summarized.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using a general-purpose relational database for high-volume metrics without a
          retention/downsampling strategy leads to tables that grow forever and queries that slow
          down as history accumulates. Tagging data with high-cardinality labels (like a unique
          request ID on every point) can also blow up a time-series database's indexing.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a time-series database benefit from knowing data mostly arrives in time order, and how does that shape its storage layout?</p>
        </div>
      </section>
      <p className="takeaway">
        Time-series databases turn "append-only, timestamped, queried by time window" into their
        core assumption — and get compression and speed most general databases can't match for that shape.
      </p>
    </div>
  );
}
