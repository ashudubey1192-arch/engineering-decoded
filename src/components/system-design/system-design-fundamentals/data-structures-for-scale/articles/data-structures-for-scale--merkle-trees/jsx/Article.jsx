import "../css/Article.css";

export default function DataStructuresForScaleMerkleTreesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A Merkle tree lets you verify a huge dataset's integrity, or find exactly where two
          replicas of it differ, by comparing a small tree of hashes instead of the data itself —
          the foundation behind Git, blockchains, and anti-entropy replica repair in databases
          like Cassandra and DynamoDB.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each leaf of the tree is the hash of one chunk of data; each parent node is the hash of
          its children's hashes concatenated together, all the way up to a single{" "}
          <b>root hash</b> that depends on every byte of the underlying data — change one bit
          anywhere, and the root hash changes. Comparing two datasets' root hashes instantly tells
          you if they're identical. If they differ, comparing one level down tells you{" "}
          <i>which half</i> differs, and recursing narrows it down to the exact differing chunk in
          O(log n) comparisons — without ever transferring or scanning the full dataset.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>Two database replicas need to find which few rows, out of millions, have drifted out of sync.</p>
        </div>
        <ol className="stepList">
          <li><b>Both build a Merkle tree</b> over their data, chunked the same way.</li>
          <li><b>Compare root hashes.</b> They differ — something is out of sync somewhere.</li>
          <li><b>Compare one level down.</b> The left subtree's hash matches; the right subtree's
            doesn't — the difference is narrowed to the right half.</li>
          <li><b>Recurse into just the right subtree,</b> repeating until the exact mismatched
            chunk (a small handful of rows) is found — then only that chunk needs to be
            resynced, not the whole dataset.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram of a Merkle tree where a mismatched root hash is narrowed down level by level to the exact differing leaf, without comparing the full underlying data." >
          <rect className="boxWarn" x="180" y="10" width="60" height="26" rx="4" /><text x="210" y="27" className="boxText">root ✕</text>
          <line className="flow" x1="200" y1="36" x2="130" y2="65" /><line className="flow" x1="220" y1="36" x2="290" y2="65" />
          <rect className="box" x="100" y="70" width="60" height="24" rx="4" /><text x="130" y="86" className="boxText">✓ match</text>
          <rect className="boxWarn" x="260" y="70" width="60" height="24" rx="4" /><text x="290" y="86" className="boxText">✕ differs</text>
          <line className="flow" x1="280" y1="94" x2="255" y2="120" /><line className="flow" x1="300" y1="94" x2="330" y2="120" />
          <rect className="box" x="220" y="125" width="70" height="22" rx="3" /><text x="255" y="140" className="boxText">leaf ✓</text>
          <rect className="boxWarn" x="300" y="125" width="70" height="22" rx="3" /><text x="335" y="140" className="boxText">leaf ✕</text>
        </svg>
        <figcaption>Each mismatch halves the search space — the exact differing chunk is found in O(log n) steps.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Rebuilding the entire Merkle tree from scratch on every small update, instead of
          updating only the hashes along the path from the changed leaf to the root, throws away
          most of the structure's efficiency. Choosing a chunk size that's too small also creates
          an unnecessarily deep, high-overhead tree; too large, and a detected mismatch still
          requires resyncing a large chunk even for a one-row difference.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can comparing Merkle tree hashes find the exact differing chunk between two large datasets in only a handful of comparisons?</p>
        </div>
      </section>
      <p className="takeaway">
        Merkle trees turn "are these two huge things the same, and if not, where do they differ"
        into a small number of hash comparisons — the mechanism behind Git's integrity checks and
        efficient replica repair in distributed databases.
      </p>
    </div>
  );
}
