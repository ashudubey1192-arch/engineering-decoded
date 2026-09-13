import "../css/Article.css";

export default function DistributedSystemsConsistentHashingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Whenever a design distributes data or requests across a changing set of nodes &mdash;
          shards, cache servers &mdash; consistent hashing is what keeps adding or removing one
          node from reshuffling everything else.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          With naive hashing (<code>hash(key) % N</code>), changing <code>N</code> &mdash; adding
          or removing one node &mdash; remaps almost every key to a different node. Consistent
          hashing places both nodes and keys on a fixed ring; a key belongs to the next node
          clockwise from it. Adding or removing one node then only reshuffles the keys between it
          and its neighbor, leaving everything else untouched &mdash; the property that makes it
          safe to scale a cache or shard fleet up and down.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Three cache servers</b> sit on a hash ring, each owning the keys between itself
            and the next server clockwise.</li>
          <li><b>A fourth server is added</b> to handle growing load, landing at one point on the ring.</li>
          <li><b>Only the keys between the new server and its counter-clockwise neighbor</b> move
            to it &mdash; every other key-to-server mapping is untouched.</li>
          <li><b>Contrast with naive hashing:</b> going from 3 to 4 servers with <code>hash(key) % N</code>{" "}
            would have remapped roughly three-quarters of all keys at once.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 300 300" role="img" aria-label="Diagram of a hash ring with four server nodes, showing keys assigned to the next node clockwise, with only a small arc of keys reassigned when a new node is added." >
          <circle cx="150" cy="150" r="110" fill="none" stroke="var(--line)" strokeWidth="1.5" />
          {[0,90,180,270].map((deg,i) => {
            const rad = (deg-90) * Math.PI/180;
            const x = 150 + 110*Math.cos(rad), y = 150 + 110*Math.sin(rad);
            return (<circle key={i} className={i===1?"ringNode":"box"} cx={x} cy={y} r="14" style={i===1?{}:{fill:"var(--surface-2)", stroke:"var(--muted)"}} />);
          })}
          <text x="150" y="35" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>N1</text>
          <text x="270" y="150" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>new</text>
          <text x="150" y="270" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>N3</text>
          <text x="30" y="150" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>N4</text>
          <path d="M 150 40 A 110 110 0 0 1 260 150" fill="none" stroke="var(--course-accent)" strokeWidth="4" />
          <text x="150" y="150" className="figHint" textAnchor="middle" style={{fontSize:"8px"}}>only this arc moves</text>
        </svg>
        <figcaption>Adding a node to the ring only reassigns the small arc of keys nearest to it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using naive modulo hashing for any node set that&rsquo;s expected to grow or shrink causes
          massive, unnecessary data movement on every resize. Placing too few points per node on
          the ring can also create uneven load, which is why real implementations typically use
          multiple &ldquo;virtual nodes&rdquo; per physical node to smooth the distribution.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does adding one node to a consistent-hashing ring move far fewer keys than adding one node under naive modulo hashing?</p>
        </div>
      </section>
      <p className="takeaway">
        Consistent hashing is the specific tool that makes a distributed cache or shard fleet
        elastic &mdash; safe to grow or shrink without reshuffling data that didn&rsquo;t need to move.
      </p>
    </div>
  );
}
