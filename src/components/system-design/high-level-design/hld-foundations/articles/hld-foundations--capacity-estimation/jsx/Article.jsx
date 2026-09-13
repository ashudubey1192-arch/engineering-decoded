import "../css/Article.css";

export default function HldFoundationsCapacityEstimationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Rough back-of-envelope math &mdash; how many requests per second, how much data per year
          &mdash; decides whether a single server is plenty or a distributed system is unavoidable,
          well before any component gets drawn.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Capacity estimation converts a user count into three numbers that actually drive design
          decisions: <b>queries per second</b> (does this need one server or a fleet behind a load
          balancer?), <b>storage growth</b> (does this fit on one disk, or does it need sharding
          within a year?), and <b>bandwidth</b> (is this text-sized or video-sized traffic?). The
          goal is the right <i>order of magnitude</i> &mdash; thousands vs. millions vs. billions
          &mdash; not a precise figure.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>Estimating for a URL shortener with 100M new URLs created per month:</p>
        <table className="miniTable">
          <caption>Back-of-envelope estimate</caption>
          <thead><tr><th>Quantity</th><th>Rough math</th><th>Result</th></tr></thead>
          <tbody>
            <tr><td>Write QPS</td><td>100M / (30 &times; 86,400s)</td><td>~40 writes/sec</td></tr>
            <tr><td>Read QPS</td><td>100:1 read:write ratio</td><td>~4,000 reads/sec</td></tr>
            <tr><td>Storage/year</td><td>1.2B URLs &times; ~500 bytes</td><td>~600 GB/year</td></tr>
          </tbody>
        </table>
        <p style={{marginTop: "14px", fontSize: "13px", color: "var(--muted)"}}>
          40 writes/sec is trivial for one database. 4,000 reads/sec is what actually justifies
          adding a cache. 600GB/year is comfortably within a single modern disk&rsquo;s reach for
          years &mdash; sharding isn&rsquo;t justified by storage size alone here.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Arguing over precision (&ldquo;is it 38 or 42 writes per second?&rdquo;) misses the point
          entirely &mdash; the estimate exists to pick an order of magnitude, not a precise value.
          The other common mistake is skipping estimation altogether and jumping straight to
          &ldquo;we need Kafka and a sharded database,&rdquo; a decision that specific numbers might
          not actually support.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an estimate of 4,000 reads/sec against 40 writes/sec point specifically toward adding a cache, rather than toward sharding the database?</p>
        </div>
      </section>
      <p className="takeaway">
        Capacity estimation turns &ldquo;is this a big system?&rdquo; into concrete numbers that
        justify &mdash; or rule out &mdash; specific architecture decisions later in the design.
      </p>
    </div>
  );
}
