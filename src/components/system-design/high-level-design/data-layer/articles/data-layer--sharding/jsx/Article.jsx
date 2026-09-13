import "../css/Article.css";

export default function DataLayerShardingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          When a dataset outgrows what any single machine can hold or serve &mdash; even with
          replicas &mdash; sharding splits it across multiple independent databases, each holding
          a slice of the data.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Sharding partitions data by a <b>shard key</b> (often a user ID or a hash of it), routing
          each record to one specific shard. Unlike replication &mdash; where every replica holds
          the same full data &mdash; each shard holds only its own slice, so total capacity scales
          with the number of shards. The cost is that queries spanning multiple shards (joins,
          cross-shard aggregation) become expensive or impossible, which is why the shard key must
          be chosen to match the dominant access pattern.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A single database can no longer hold</b> the full user dataset, even with read
            replicas absorbing read traffic.</li>
          <li><b>Pick a shard key.</b> Almost every query in this design looks up data by user ID
            &mdash; user ID is the natural shard key.</li>
          <li><b>Route each user&rsquo;s data</b> to one of N shards based on a hash of their user ID.</li>
          <li><b>A query for &ldquo;this user&rsquo;s data&rdquo;</b> now goes to exactly one shard
            &mdash; but a query like &ldquo;all users in this city&rdquo; now has to fan out across
            every shard, a direct cost of this shard key choice.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a router directing each user's data to one of three shards based on a hash of their user ID, with each shard holding only its own slice of the data." >
          <rect className="box" x="20" y="40" width="70" height="30" rx="5" /><text x="55" y="59" className="boxText" style={{fontSize:"9px"}}>Request</text>
          <line className="flow" x1="90" y1="55" x2="140" y2="55" />
          <rect className="boxAccent" x="150" y="40" width="70" height="30" rx="5" /><text x="185" y="59" className="boxText" style={{fontSize:"8px"}}>hash(userId)</text>
          <line className="flow" x1="220" y1="45" x2="270" y2="20" /><line className="flow" x1="220" y1="55" x2="270" y2="55" /><line className="flow" x1="220" y1="65" x2="270" y2="90" />
          {[0,1,2].map(i => (<rect key={i} className="box" x="275" y={5 + i*40} width="70" height="26" rx="5" />))}
          {[0,1,2].map(i => (<text key={i} x="310" y={22 + i*40} className="boxText" textAnchor="middle" style={{fontSize:"8px"}}>Shard {i+1}</text>))}
        </svg>
        <figcaption>Each record lives on exactly one shard, chosen by hashing the shard key.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Sharding before the estimate actually justifies it adds significant operational
          complexity for no benefit. Choosing a shard key that doesn&rsquo;t match how data is
          actually queried is the other classic mistake &mdash; it turns nearly every query into an
          expensive fan-out across all shards, defeating the purpose.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a query for "all users in this city" become expensive once data is sharded by user ID?</p>
        </div>
      </section>
      <p className="takeaway">
        Shard only once the data or load genuinely exceeds one machine&rsquo;s capacity, and choose
        the shard key to match the query pattern the design actually needs to serve fast.
      </p>
    </div>
  );
}
