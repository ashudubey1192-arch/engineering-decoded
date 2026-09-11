import "../css/Article.css";

export default function DataStructuresForScaleIntroductionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          At massive scale, exact answers and general-purpose data structures often stop being
          affordable. This section covers specialized structures — probabilistic filters,
          space-indexing schemes, sketch algorithms — that trade a small, controlled amount of
          accuracy or generality for huge savings in memory or speed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Two recurring ideas run through this section. <b>Spatial indexing</b> (Geohash, Quad
          Trees, R-Trees, S2/H3) turns "find things near this location" from a scan of every point
          into a fast lookup, by encoding 2D position into a form that's easy to index and query.{" "}
          <b>Probabilistic data structures</b> (Bloom filters, Cuckoo filters, HyperLogLog,
          Count-Min Sketch, MinHash) answer questions like "have I seen this before," "how many
          unique items," or "how often does this appear" using a tiny, fixed amount of memory — by
          accepting a small, mathematically bounded chance of error in exchange for constant space,
          regardless of how much data flows through.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Exact tracking doesn't scale.</b> Counting unique visitors to a website exactly
            means storing every unique ID seen — potentially gigabytes of memory for a
            billion-visitor site.</li>
          <li><b>Trade accuracy for space.</b> HyperLogLog estimates that same count within about
            2% error, using just a few kilobytes — a difference of many orders of magnitude.</li>
          <li><b>The pattern repeats.</b> Checking "has this URL been seen before" across billions
            of URLs, or "what are nearby restaurants," all have a specialized structure in this
            section built for exactly that shape of question at scale.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram contrasting exact data structures that need memory proportional to data size against probabilistic structures that use small, fixed memory in exchange for a bounded error rate.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">EXACT</text>
          <rect className="box" x="20" y="30" width="160" height="26" rx="4" /><text x="100" y="48" className="boxText">memory grows with data</text>
          <line className="divider" x1="210" y1="10" x2="210" y2="100" />
          <text x="320" y="18" className="figLabel" textAnchor="middle">PROBABILISTIC</text>
          <rect className="boxAccent" x="240" y="30" width="160" height="26" rx="4" /><text x="320" y="48" className="boxText">fixed, tiny memory</text>
          <text x="320" y="75" className="figHint" textAnchor="middle">small, bounded error accepted</text>
        </svg>
        <figcaption>Specialized structures trade a controlled amount of accuracy or generality for massive space or speed savings.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for a probabilistic structure where an exact answer is actually required (an
          account balance, a legal record count) misapplies a tool built for a different trade-off.
          The value of these structures is specifically for high-volume, approximate,
          performance-critical questions — not as a universal replacement for exact data
          structures.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a small, bounded error rate an acceptable trade for a huge reduction in memory when counting unique website visitors?</p>
        </div>
      </section>
      <p className="takeaway">
        This section's structures all make the same kind of trade: give up exactness or
        generality, in a controlled, well-understood way, to make an otherwise-impossible-at-scale
        problem fast and cheap.
      </p>
    </div>
  );
}
