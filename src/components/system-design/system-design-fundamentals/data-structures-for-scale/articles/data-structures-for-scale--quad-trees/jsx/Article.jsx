import "../css/Article.css";

export default function DataStructuresForScaleQuadTreesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A quad tree indexes 2D points by recursively splitting space into four quadrants,
          subdividing further only where points are dense — giving fast spatial queries without
          uniform-grid waste in empty areas.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each node represents a rectangular region; when a region holds more than some threshold
          of points, it splits into four equal quadrants, each becoming its own node, recursively.
          Dense areas (a crowded city center) end up finely subdivided; sparse areas (open ocean,
          a rural area) stay as one large node — the tree's structure naturally adapts to where the
          data actually is, instead of using the same fine grid everywhere like a naive fixed grid
          would. Searching "what's in this region" walks down only the branches whose bounding box
          overlaps the query, skipping huge swaths of empty space entirely.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start with one region.</b> The whole map is a single quad tree node.</li>
          <li><b>Points arrive, region fills up.</b> Once a node exceeds its capacity, it splits
            into four child quadrants: NW, NE, SW, SE.</li>
          <li><b>Recurse where it's crowded.</b> A busy downtown quadrant keeps splitting further;
            a quiet suburban quadrant stays as one node.</li>
          <li><b>Query a region.</b> "Points within this rectangle" walks only the nodes whose
            bounding box overlaps the query rectangle — sparse regions are skipped as whole
            subtrees in one check.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 160" role="img" aria-label="Diagram of a square region recursively subdivided into four quadrants, with a dense quadrant further subdivided into four smaller quadrants while sparse quadrants remain undivided.">
          <rect className="box" x="30" y="20" width="340" height="120" rx="4" />
          <line className="divider" x1="200" y1="20" x2="200" y2="140" />
          <line className="divider" x1="30" y1="80" x2="370" y2="80" />
          <line className="divider" x1="30" y1="50" x2="200" y2="50" /><line className="divider" x1="115" y1="20" x2="115" y2="80" />
          {[[55, 30], [165, 30], [55, 60], [160, 65]].map(([x, y], i) => (<circle key={i} className="boxAccent" cx={x} cy={y} r="4" />))}
          <text x="115" y="15" className="figHint" textAnchor="middle">dense → subdivided further</text>
          <text x="285" y="85" className="figHint" textAnchor="middle">sparse → left as one node</text>
        </svg>
        <figcaption>Subdivision follows point density — fine detail where it's crowded, coarse elsewhere.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Setting the split threshold too low creates excessive tree depth and overhead for modest
          benefit; too high, and dense regions degrade back toward a slow linear scan. Quad trees
          also assume a roughly 2D, boundable space — they're a poor fit for point sets with
          wildly varying density at every scale without careful tuning.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a quad tree subdivide a crowded downtown area much more than a sparse rural one?</p>
        </div>
      </section>
      <p className="takeaway">
        Quad trees adapt their resolution to where the data actually is, giving fast spatial
        queries without wasting structure on empty regions the way a uniform grid would.
      </p>
    </div>
  );
}
