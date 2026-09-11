import "../css/Article.css";

export default function DataStructuresForScaleBloomFiltersArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A Bloom filter answers "have I possibly seen this before" using a tiny bit array instead
          of storing every item — it can have false positives (says "maybe seen" for something
          new) but never false negatives (if it says "definitely not seen," that's always true).
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A Bloom filter is a bit array, all zeros to start. Adding an item runs it through several
          independent hash functions, each producing a position, and sets the bits at all those
          positions to 1. To check membership, hash the query item the same way and check if{" "}
          <i>all</i> those bit positions are 1 — if even one is 0, the item was definitely never
          added. If all are 1, the item was probably added, but it's also possible other items'
          hashes happened to set exactly those same bits — a false positive. More hash functions
          and a bigger bit array reduce the false-positive rate, at the cost of more memory and
          compute per check.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A web crawler needs to avoid re-crawling the same URL out of billions, without storing every URL seen.</p>
        </div>
        <ol className="stepList">
          <li><b>Initialize a bit array</b> of, say, 1 billion bits — all zeros.</li>
          <li><b>Crawl a URL, add it.</b> Hash it 3 ways, set those 3 bit positions to 1.</li>
          <li><b>See a new URL, check it first.</b> Hash it the same 3 ways and check those bits.</li>
          <li><b>All 3 bits are 1 → skip it</b> (probably already crawled — accept the small
            chance this is a false positive). <b>Any bit is 0 → crawl it</b> (definitely new).</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of a bit array where adding an item sets three bit positions from three hash functions, and checking membership fails only if the item hashes to at least one zero bit." >
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} className={[3, 7, 12].includes(i) ? "boxAccent" : "box"} x={20 + i * 26} y="30" width="20" height="26" rx="3" />
          ))}
          <text x="220" y="20" className="figHint" textAnchor="middle">bit array — 3 bits set by 3 hash functions</text>
          <text x="220" y="90" className="figHint" textAnchor="middle">query: all 3 of its bits = 1 → "maybe seen" · any = 0 → "definitely not"</text>
        </svg>
        <figcaption>A handful of set bits per item is enough to answer membership with a small, bounded false-positive rate.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using a Bloom filter where a false positive is unacceptable (like a security allow-list)
          misapplies it — the false-positive rate is a fundamental property, not a bug to
          eliminate. Standard Bloom filters also don't support deletion (unsetting a bit could
          break other items sharing that bit) — deleting requires a variant like a counting Bloom
          filter or switching to a Cuckoo filter.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a Bloom filter guarantee zero false negatives but not zero false positives?</p>
        </div>
      </section>
      <p className="takeaway">
        Bloom filters trade a small, tunable false-positive rate for massive memory savings on
        membership checks — ideal wherever "definitely not seen" needs to be fast and certain, and
        occasional false "maybe"s are acceptable.
      </p>
    </div>
  );
}
