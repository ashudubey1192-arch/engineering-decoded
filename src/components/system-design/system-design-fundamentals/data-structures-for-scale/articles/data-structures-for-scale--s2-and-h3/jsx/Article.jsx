import "../css/Article.css";

export default function DataStructuresForScaleS2AndH3Article() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          S2 (Google) and H3 (Uber) are modern spatial indexing systems that cover the globe with
          cells — square-ish for S2, hexagonal for H3 — solving distortion problems that simpler
          schemes like Geohash run into near the poles and across large areas.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Geohash's rectangular lat/lng grid distorts badly near the poles (cells shrink) and has
          awkward boundary behavior. S2 instead projects the globe onto a cube and indexes cells on
          each cube face, giving much more uniform cell sizes worldwide. H3 uses a hexagonal grid
          instead of squares — hexagons have a useful property squares don't: every neighboring
          cell is exactly the same distance from the center, which makes "find nearby cells" and
          distance-based reasoning cleaner than with square cells (where diagonal neighbors are
          farther than edge neighbors).
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Uber needs uniform "nearby driver" zones.</b> Hexagonal H3 cells give every
            driver's cell the same set of equally-spaced neighbors, unlike a square grid.</li>
          <li><b>Index each driver's location</b> as an H3 cell ID at an appropriate resolution
            (H3 supports multiple zoom levels, like Geohash's string length).</li>
          <li><b>Query "drivers near this rider."</b> Look up the rider's cell and its immediate
            hexagonal neighbors — a small, well-defined ring around the query point.</li>
          <li><b>Aggregate at coarser resolution</b> for city-wide dashboards, using the same
            hexagonal grid at a lower zoom level — the same indexing scheme serves both fine-grained
            queries and broad aggregation.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram of a hexagonal grid where a center cell has six equally-distant neighbors, contrasted with a square grid where diagonal neighbors are farther away than edge neighbors.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">HEXAGONAL (H3)</text>
          {[[100, 60], [135, 80], [135, 120], [100, 140], [65, 120], [65, 80]].map(([x, y], i) => (<circle key={i} className="box" cx={x} cy={y} r="16" />))}
          <circle className="boxAccent" cx="100" cy="100" r="18" />
          <text x="100" y="105" className="boxText" textAnchor="middle">·</text>
          <text x="100" y="8" className="figHint" textAnchor="middle" style={{opacity:0}}>-</text>
          <line className="divider" x1="220" y1="10" x2="220" y2="150" />
          <text x="330" y="18" className="figLabel" textAnchor="middle">SQUARE GRID</text>
          {[[300, 60], [330, 60], [360, 60], [300, 100], [360, 100], [300, 140], [330, 140], [360, 140]].map(([x, y], i) => (<rect key={i} className="box" x={x - 14} y={y - 14} width="28" height="28" rx="3" />))}
          <rect className="boxAccent" x="316" y="86" width="28" height="28" rx="3" />
        </svg>
        <figcaption>Hexagons keep every neighbor equidistant; a square grid's diagonal neighbors sit farther away.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Defaulting to Geohash for an application that needs uniform cell sizes across large or
          global areas (ride-hailing, logistics) can introduce subtle distance and coverage bugs
          near cell boundaries and at high latitudes — H3 or S2 are usually the better fit. These
          systems also have a steeper learning curve than a simple string-based Geohash, which is
          worth weighing against how much the uniformity actually matters for the use case.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a hexagonal grid make "find nearby cells" more consistent than a square grid?</p>
        </div>
      </section>
      <p className="takeaway">
        S2 and H3 fix the distortion and neighbor-distance problems simpler spatial indexes run
        into at global scale — H3's hexagons in particular make uniform, distance-consistent
        proximity queries much cleaner.
      </p>
    </div>
  );
}
