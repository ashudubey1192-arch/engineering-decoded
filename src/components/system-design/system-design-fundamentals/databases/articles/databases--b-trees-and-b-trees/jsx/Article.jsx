import "../css/Article.css";

export default function DatabasesBTreesAndBTreesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          B-Trees and B+ Trees are the balanced, disk-friendly tree structures behind most
          relational database indexes — designed so that finding a row takes only a handful of
          reads, even across millions of rows.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Unlike a binary tree (2 children per node), a B-Tree node holds many keys and many
          children — often hundreds — so the tree stays extremely shallow even with huge amounts of
          data. That matters because each level of the tree is roughly one disk read, so a shallow
          tree means a fast lookup. A <b>B+ Tree</b> (what most database indexes actually use) goes
          further: all actual data lives only in the leaf nodes, and the leaves are linked together
          in a chain — so a range scan ("all orders between two dates") just walks the leaf chain
          instead of re-traversing the tree.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Index a column.</b> <code>CREATE INDEX ON orders(customer_id)</code> builds a B+
            Tree keyed on <code>customer_id</code>.</li>
          <li><b>Point lookup.</b> Finding customer 42's orders starts at the root, and each node
            tells you which child to follow next — 3-4 hops reach the right leaf even with
            millions of rows.</li>
          <li><b>Range scan.</b> "All orders for customers 100-200" finds the first match, then
            walks the linked leaves forward — no repeated root-to-leaf traversals.</li>
          <li><b>Stays balanced.</b> As rows are inserted, nodes split automatically to keep every
            path from root to leaf the same length — lookups never degrade to a slow path.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 190" role="img" aria-label="Diagram of a B+ Tree with a root node, internal nodes, and leaf nodes linked together in a chain for fast range scans.">
          <rect className="boxAccent" x="190" y="15" width="80" height="30" rx="5" /><text x="230" y="35" className="boxText">root</text>
          <line className="flow" x1="210" y1="45" x2="110" y2="80" />
          <line className="flow" x1="250" y1="45" x2="350" y2="80" />
          <rect className="box" x="70" y="85" width="80" height="28" rx="5" /><text x="110" y="103" className="boxText">internal</text>
          <rect className="box" x="310" y="85" width="80" height="28" rx="5" /><text x="350" y="103" className="boxText">internal</text>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line className="flow" x1={110 + (i < 2 ? 0 : 240)} y1="113" x2={40 + i * 130} y2="150" />
              <rect className="box" x={20 + i * 130} y="155" width="90" height="26" rx="4" />
              <text x={65 + i * 130} y="172" className="boxText">leaf {i + 1}</text>
            </g>
          ))}
          <line className="flowMuted" x1="110" y1="168" x2="440" y2="168" />
          <text x="230" y="188" className="figHint" textAnchor="middle">leaves linked → fast range scans without revisiting the root</text>
        </svg>
        <figcaption>Shallow tree for fast point lookups; linked leaves for fast range scans.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Indexing every column "just in case" slows down writes (each index needs updating on
          every insert) for indexes that queries never use. It's also easy to forget that an index
          on <code>(a, b)</code> speeds up queries filtering on <code>a</code> or{" "}
          <code>(a, b)</code>, but not one filtering on <code>b</code> alone — column order in a
          composite index matters.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why do B+ Trees link their leaf nodes together, and which kind of query does that specifically speed up?</p>
        </div>
      </section>
      <p className="takeaway">
        B+ Trees stay shallow for fast point lookups and keep leaves linked for fast range scans —
        the two access patterns a database index needs to support well.
      </p>
    </div>
  );
}
