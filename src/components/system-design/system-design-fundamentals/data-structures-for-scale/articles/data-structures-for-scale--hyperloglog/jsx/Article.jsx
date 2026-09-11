import "../css/Article.css";

export default function DataStructuresForScaleHyperloglogArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          HyperLogLog estimates the number of <i>distinct</i> items in a massive stream — unique
          visitors, unique search queries — using just a few kilobytes of memory, regardless of
          whether the true count is a thousand or a billion.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The core trick: hash each item to a pseudo-random binary string, then look at how many
          leading zeros that hash has. A long run of leading zeros is statistically rare — seeing
          one at all is a clue that <i>many</i> distinct items have been hashed (since you needed
          many random tries to eventually produce a rare pattern). HyperLogLog tracks the{" "}
          <i>longest</i> run of leading zeros seen (across many small buckets, to reduce variance)
          and uses that to estimate the total distinct count — all without storing any of the
          actual items, just a small array of small numbers.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Hash each visitor ID</b> as it arrives, and look at the binary representation.</li>
          <li><b>Track the longest run of leading zeros</b> seen so far, split across, say, 1024
            small buckets for accuracy (each item routes to one bucket based on part of its hash).</li>
          <li><b>More unique visitors → longer runs become likely.</b> Seeing a run of 20 leading
            zeros suggests roughly a million distinct items have been hashed.</li>
          <li><b>Estimate the count</b> from the pattern of longest runs across all buckets — accurate
            to within about 2%, using only a few KB total, whether a thousand or a billion
            visitors have been counted.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of hashed values shown as binary strings, with longer runs of leading zeros being rarer and therefore indicating a larger number of distinct items have been seen." >
          <text x="20" y="30" className="boxText">0110...</text><text x="150" y="30" className="figHint">short run — common</text>
          <text x="20" y="60" className="boxText">0001...</text><text x="150" y="60" className="figHint">longer run — less common</text>
          <text x="20" y="90" className="boxText">00001...</text><text x="150" y="90" className="figHint">longest seen → estimates distinct count</text>
        </svg>
        <figcaption>The rarest leading-zero run observed is a statistical clue to how many distinct items were hashed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using HyperLogLog where an exact count is legally or financially required (like billable
          usage) misapplies an approximate tool. It's also easy to forget that merging two
          HyperLogLog sketches (a very useful property — say, combining daily counts into a
          monthly estimate) requires actually using the sketch structure's merge operation, not
          just adding the two estimated counts together, which would double-count overlapping
          items.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does observing a long run of leading zeros in a hash suggest that many distinct items have been processed?</p>
        </div>
      </section>
      <p className="takeaway">
        HyperLogLog turns a rare statistical pattern in hashed values into a memory-tiny estimate
        of distinct count — accurate enough for analytics at a scale exact counting simply
        couldn't afford.
      </p>
    </div>
  );
}
