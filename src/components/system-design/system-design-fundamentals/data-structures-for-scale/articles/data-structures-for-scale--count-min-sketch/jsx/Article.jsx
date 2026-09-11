import "../css/Article.css";

export default function DataStructuresForScaleCountMinSketchArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A Count-Min Sketch estimates how many times each item has appeared in a massive stream —
          "how many times was this product viewed" — using a small fixed-size grid instead of a
          counter per distinct item.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The structure is a 2D grid of counters, one row per hash function. To record an item,
          hash it once per row (each row uses a different hash function), and increment the
          counter at that column in every row. To estimate an item's count, hash it the same way
          and take the <i>minimum</i> value across its row-positions — taking the minimum
          specifically cancels out most of the inflation caused by hash collisions with other
          items, which is why the estimate can only ever be an overestimate, never an
          underestimate.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A trending-products feature needs approximate view counts for millions of products without a counter per product.</p>
        </div>
        <ol className="stepList">
          <li><b>Product X is viewed.</b> Hash "X" with 4 different hash functions, incrementing
            one counter in each of the 4 rows.</li>
          <li><b>This repeats for every view</b> of every product, sharing the same fixed-size
            grid — other products' hashes sometimes collide into the same cells.</li>
          <li><b>Estimate X's count later.</b> Hash "X" the same 4 ways, look up the 4
            corresponding counters, and take the minimum of the 4.</li>
          <li><b>The minimum filters out collisions</b> — any single row might be inflated by a
            colliding popular product, but it's unlikely all 4 rows are inflated by the same
            amount, so the smallest value is the closest to the truth.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of a grid of counters with four rows, where an item hashes to one column per row, and its estimated count is the minimum value across its four row positions." >
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              {[0, 1, 2, 3, 4].map((c) => (
                <rect key={c} className={[[1, 0], [3, 1], [0, 2], [2, 3]][r][0] === c ? "boxAccent" : "box"} x={30 + c * 70} y={20 + r * 26} width="60" height="20" rx="3" />
              ))}
            </g>
          ))}
          <text x="210" y="130" className="figHint" textAnchor="middle">item's 4 positions (highlighted) — estimate = min of the 4 values</text>
        </svg>
        <figcaption>Each item touches one cell per row; the minimum across rows is the count estimate.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Sizing the grid too small for the actual volume of distinct items causes heavy hash
          collisions and inflated estimates across the board — the grid dimensions need to be
          chosen based on expected data volume and acceptable error. It's also worth remembering
          the estimate is always biased upward (never under the true count), which matters for
          how the numbers should be interpreted downstream.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does taking the minimum across rows, rather than any single row's value, produce a more accurate count estimate?</p>
        </div>
      </section>
      <p className="takeaway">
        Count-Min Sketch trades a small, one-directional (over-)estimation error for the ability
        to track approximate frequencies of millions of distinct items in a small, fixed amount of
        memory.
      </p>
    </div>
  );
}
