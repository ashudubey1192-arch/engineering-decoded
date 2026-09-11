import "../css/Article.css";

export default function DatabaseScalingTechniquesVerticalPartitioningArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Vertical partitioning splits a single table by columns, moving some columns into a
          separate table (or separate database) rather than splitting rows.
        </p>
        <p>
          It's the counterpart to the horizontal splitting you'll meet later in this section
          under Sharding — horizontal splits distribute <em>rows</em> across machines, vertical
          splits distribute <em>columns</em>. They solve different problems and are often
          combined.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Before</h3>
            <p>
              One <code>users</code> table with id, name, email, password_hash, bio, avatar_url,
              preferences_json, last_login. Every row read pulls all of it, even when you only
              needed the name for a comment byline.
            </p>
          </div>
          <div>
            <h3>After</h3>
            <p>
              <code>users_core</code> keeps id, name, email, password_hash — small, hot, read on
              every request. <code>users_profile</code> keeps bio, avatar_url, preferences_json —
              larger, read only on profile pages.
            </p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Identify hot vs. cold columns.</b> Log which columns are actually selected by
            your busiest queries.</li>
          <li><b>Group them.</b> Frequently-together, small columns go in one table; large or
            rarely-read columns (bios, JSON blobs, images) go in another.</li>
          <li><b>Split the table.</b> Create <code>users_core</code> and <code>users_profile</code>,
            both keyed by the same <code>user_id</code>.</li>
          <li><b>Update queries.</b> The auth path now reads a much smaller row; profile pages
            join in the second table only when needed.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 480 160" role="img" aria-label="Diagram of one wide users table splitting into a small core table and a larger profile table, both keyed by the same user id.">
          <rect className="box" x="20" y="20" width="140" height="100" rx="6" />
          <text x="90" y="15" className="figLabel" textAnchor="middle">USERS (WIDE)</text>
          <text x="90" y="45" className="boxText">id</text>
          <text x="90" y="63" className="boxText">name, email</text>
          <text x="90" y="81" className="boxText">bio, avatar</text>
          <text x="90" y="99" className="boxText">preferences</text>
          <line className="flow" x1="165" y1="70" x2="220" y2="70" />
          <rect className="boxAccent" x="230" y="20" width="110" height="45" rx="6" />
          <text x="285" y="15" className="figLabel" textAnchor="middle">users_core</text>
          <text x="285" y="42" className="boxText">id, name, email</text>
          <rect className="box" x="230" y="80" width="110" height="45" rx="6" />
          <text x="285" y="75" className="figLabel" textAnchor="middle">users_profile</text>
          <text x="285" y="102" className="boxText">id, bio, avatar</text>
          <text x="400" y="50" className="figHint">read on</text>
          <text x="400" y="62" className="figHint">every request</text>
          <text x="400" y="105" className="figHint">read on</text>
          <text x="400" y="117" className="figHint">profile page</text>
        </svg>
        <figcaption>Splitting by column keeps the frequently-read row small.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Splitting too eagerly just adds joins back for data that's almost always read together —
          measure access patterns before you split. And moving a column that a unique constraint
          or foreign key depends on can quietly break integrity checks that used to live in one
          table.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>How is vertical partitioning different from sharding, and why might you use both on the same table?</p>
        </div>
      </section>
      <p className="takeaway">
        Vertical partitioning shrinks the row your hottest queries have to read — it doesn't add
        machines, it just stops carrying cold columns along for the ride.
      </p>
    </div>
  );
}
