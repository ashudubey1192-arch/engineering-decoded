import "../css/Article.css";

export default function DatabaseScalingTechniquesShardingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Sharding splits one logical dataset across multiple independent databases — each shard
          holds a subset of the rows — so no single machine has to store or serve all of it.
        </p>
        <p>
          Everything earlier in this section (indexing, replicas, caching, denormalization) makes
          one database work smarter. Sharding is what you reach for once one database, however
          well-tuned, can no longer hold the data or handle the write volume on its own — you add
          more machines and give each one a slice of the problem.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Every row needs a <b>shard key</b> — the value used to decide which shard it lives on
          (often a user ID or tenant ID). How you turn that key into a shard number is the whole
          game:
        </p>
        <table className="miniTable">
          <caption>THREE WAYS TO ASSIGN A ROW TO A SHARD</caption>
          <thead><tr><th>Strategy</th><th>How it decides</th><th>Weak point</th></tr></thead>
          <tbody>
            <tr><td>Range-based</td><td>A–M on shard 1, N–Z on shard 2</td><td>uneven if data isn't evenly distributed</td></tr>
            <tr><td>Hash-based</td><td><code>hash(key) % N</code></td><td>adding a shard reshuffles almost everything</td></tr>
            <tr><td>Consistent hashing</td><td>key and shards both placed on a hash ring</td><td>needs a bit more infrastructure to run</td></tr>
          </tbody>
        </table>
        <p>
          Consistent hashing (covered in Core Concepts) is usually the answer in production,
          because it avoids the mass-reshuffle problem plain hash-mod sharding has when the shard
          count changes.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A single Postgres instance holding the "events" table has hit 4TB and can no longer keep up with write throughput during peak hours, even after indexing and read replicas.</p>
        </div>
        <ol className="stepList">
          <li><b>Pick the shard key.</b> <code>user_id</code> — most queries already filter by user, so most reads stay on one shard.</li>
          <li><b>Choose a strategy.</b> Consistent hashing across 8 shards, to make future rebalancing cheap.</li>
          <li><b>Add a routing layer.</b> The application (or a proxy) hashes <code>user_id</code> and sends the query to the right shard.</li>
          <li><b>Handle cross-shard queries as a special case.</b> "Total events this week across all users" now has to fan out to all 8 shards and merge results — slower, and used sparingly.</li>
          <li><b>Plan for growth.</b> When shard 8 approaches capacity, add shard 9; consistent hashing means only ~1/9 of keys move.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 320 300" role="img" aria-label="Hash ring diagram with four database shards placed around a circle, and a new fifth shard inserted, with only the small arc of keys between the neighboring shards moving to it.">
          <circle cx="160" cy="150" r="110" fill="none" stroke="var(--muted)" opacity="0.4" />
          <circle className="ringNode" cx="160" cy="40" r="16" /><text x="160" y="45" className="ringKey" textAnchor="middle">S1</text>
          <circle className="ringNode" cx="270" cy="150" r="16" /><text x="270" y="155" className="ringKey" textAnchor="middle">S2</text>
          <circle className="ringNode" cx="160" cy="260" r="16" /><text x="160" y="265" className="ringKey" textAnchor="middle">S3</text>
          <circle className="ringNode" cx="50" cy="150" r="16" /><text x="50" y="155" className="ringKey" textAnchor="middle">S4</text>
          <circle className="boxAccent" cx="105" cy="212" r="17" /><text x="105" y="217" className="ringKey" textAnchor="middle">S5</text>
          <path d="M160,260 A110,110 0 0,1 105,212" fill="none" stroke="var(--course-accent)" strokeWidth="5" />
          <text x="95" y="284" className="figHint" textAnchor="middle">only this arc of keys</text>
          <text x="95" y="296" className="figHint" textAnchor="middle">moves to the new shard S5</text>
        </svg>
        <figcaption>Adding shard S5 remaps only the keys between S3 and S5 — S1, S2, and S4 are untouched.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The most damaging mistake is a shard key that creates hot spots — sharding by signup
          date means every new signup piles onto the newest shard while old shards sit idle.
          Close behind: reaching for sharding before exhausting simpler options (a bigger machine,
          an index, a read replica), and underestimating how much harder cross-shard joins,
          transactions, and "unique across the whole table" constraints become once data is split
          across independent databases.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>You're sharding a multi-tenant SaaS product's data by tenant_id. What could still go wrong if one tenant is 100x larger than every other tenant combined?</p>
        </div>
      </section>
      <p className="takeaway">
        Sharding removes the ceiling a single machine puts on storage and write throughput — the
        cost is that anything spanning shards (joins, transactions, global counts) gets harder,
        so pick a shard key that keeps most queries on one shard.
      </p>
    </div>
  );
}
