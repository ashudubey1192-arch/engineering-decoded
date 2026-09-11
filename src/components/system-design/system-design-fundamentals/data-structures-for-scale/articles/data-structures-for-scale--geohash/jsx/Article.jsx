import "../css/Article.css";

export default function DataStructuresForScaleGeohashArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Geohash encodes a latitude/longitude pair into a single short string, built so that
          nearby locations tend to share a common string prefix — turning "find things near me"
          into a simple string-based database query.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Geohash works by repeatedly halving the world's latitude and longitude ranges: each bit
          of the hash picks which half (of latitude, then longitude, alternating) the point falls
          in, narrowing the bounding box each time. Encode enough bits and you have a string like{" "}
          <code>"9q8yy"</code> that identifies a small rectangular region. Because each additional
          character narrows the box further, two nearby points usually share a long common prefix
          — which is what lets "find nearby points" become "find rows whose geohash starts with
          this prefix," a query any database can index efficiently.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Encode a location.</b> San Francisco (37.77, -122.42) encodes to a geohash like{" "}
            <code>"9q8yy"</code>.</li>
          <li><b>Store it as an indexed column.</b> Every point of interest is stored with its
            geohash string.</li>
          <li><b>Query nearby points.</b> "Find restaurants near me" becomes a prefix query:{" "}
            <code>WHERE geohash LIKE '9q8yy%'</code> — a fast, indexable operation.</li>
          <li><b>Handle the edge case.</b> Two points can be geographically close but fall just
            across a grid boundary, ending up with different prefixes — real implementations check
            a few neighboring cells too, not just an exact prefix match.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of a map area recursively divided into smaller rectangular grid cells, with each subdivision adding another character to the geohash string identifying that region.">
          <rect className="box" x="30" y="20" width="360" height="100" rx="4" />
          <line className="divider" x1="210" y1="20" x2="210" y2="120" />
          <line className="divider" x1="30" y1="70" x2="390" y2="70" />
          <rect className="boxAccent" x="210" y="20" width="90" height="50" rx="3" />
          <text x="255" y="48" className="boxText">9q8y</text>
          <line className="divider" x1="255" y1="20" x2="255" y2="70" />
          <text x="345" y="140" className="figHint" textAnchor="middle">each extra character narrows the region further</text>
        </svg>
        <figcaption>Each character of a geohash narrows the bounding box — nearby points tend to share a prefix.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Relying on exact prefix matching alone, without checking neighboring cells, misses
          legitimately nearby points that happen to fall just across a grid boundary. Geohash's
          grid cells also aren't uniformly sized (they distort near the poles), which matters for
          applications needing precise, uniform distance calculations.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can two points that are geographically very close still end up with completely different geohash prefixes?</p>
        </div>
      </section>
      <p className="takeaway">
        Geohash turns 2D proximity into a 1D string-prefix problem — simple and index-friendly,
        with the trade-off of needing extra care right at grid-cell boundaries.
      </p>
    </div>
  );
}
