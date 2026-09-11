import "../css/Article.css";

export default function DataStructuresForScaleRTreesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An R-Tree indexes spatial objects — points, but also rectangles, lines, polygons — by
          grouping nearby objects into progressively larger bounding boxes, forming a balanced
          tree tuned for "what overlaps this area" queries.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Unlike a quad tree's fixed spatial subdivisions, an R-Tree groups objects bottom-up by
          proximity: nearby objects share a parent node whose bounding box just covers all of
          them, and those parent boxes are themselves grouped into even larger bounding boxes, up
          to a root. To search, you start at the root and only descend into child boxes that
          overlap your query — boxes that don't overlap (and everything inside them) are skipped
          entirely. Because it works on arbitrary shapes, not just points, an R-Tree is the
          standard spatial index inside most real-world databases (PostGIS, most GIS systems).
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Insert building footprints.</b> Each building's rectangular bounding box is
            inserted as a leaf entry.</li>
          <li><b>Group into parent boxes.</b> Nearby buildings' entries share a parent node
            whose bounding box tightly covers all of them.</li>
          <li><b>Grow the tree upward.</b> Parent boxes group further into a small number of
            top-level regions, up to the root.</li>
          <li><b>Query "buildings overlapping this map view."</b> Starting at the root, only
            descend into child boxes that overlap the view — most of the tree, covering the rest
            of the world, is skipped without ever being examined.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram of small object bounding boxes grouped into a medium bounding box, which is itself grouped with another region into a large root bounding box, forming a hierarchical spatial index." >
          <rect className="box" x="30" y="80" width="30" height="24" rx="3" /><rect className="box" x="70" y="70" width="26" height="20" rx="3" /><rect className="box" x="60" y="105" width="24" height="20" rx="3" />
          <rect x="25" y="60" width="80" height="75" rx="4" fill="none" style={{ stroke: "var(--course-accent)", strokeWidth: 2, strokeDasharray: "4 3" }} />
          <text x="65" y="150" className="figHint" textAnchor="middle">grouped into a parent box</text>
          <rect className="box" x="280" y="30" width="26" height="20" rx="3" /><rect className="box" x="320" y="45" width="24" height="20" rx="3" />
          <rect x="270" y="20" width="90" height="60" rx="4" fill="none" style={{ stroke: "var(--course-accent)", strokeWidth: 2, strokeDasharray: "4 3" }} />
          <rect x="10" y="10" width="400" height="130" rx="6" fill="none" style={{ stroke: "var(--muted)", strokeWidth: 1.5, strokeDasharray: "2 4" }} />
          <text x="210" y="12" className="figHint" textAnchor="middle">root bounding box covers everything</text>
        </svg>
        <figcaption>Objects group into tighter parent boxes bottom-up, forming a searchable hierarchy of bounding boxes.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Letting sibling bounding boxes overlap significantly (a natural risk as an R-Tree is
          built and updated) degrades query performance, since a query may need to check multiple
          overlapping branches for the same region — this is exactly what R-Tree variants like the
          R*-tree specifically optimize for. Choosing R-Trees for pure point data with no need for
          extent (width/height) is also sometimes unnecessary complexity versus a simpler
          structure.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an R-Tree query skip large parts of the tree without ever examining the objects inside them?</p>
        </div>
      </section>
      <p className="takeaway">
        R-Trees generalize spatial indexing beyond points to any bounded shape, by organizing
        objects into a hierarchy of tightening bounding boxes — the backbone of most real-world
        GIS and spatial database systems.
      </p>
    </div>
  );
}
