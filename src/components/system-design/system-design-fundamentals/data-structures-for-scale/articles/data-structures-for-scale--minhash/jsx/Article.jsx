import "../css/Article.css";

export default function DataStructuresForScaleMinhashArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          MinHash estimates how similar two large sets are — like how much two documents' word
          sets overlap — without ever comparing the sets directly, by comparing a small "signature"
          computed from each one.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The similarity measure being estimated is <b>Jaccard similarity</b>: the size of the
          intersection of two sets divided by the size of their union. MinHash's trick: apply the
          same hash function to every element of a set, and keep only the <i>minimum</i> hash
          value — that single minimum value has a specific mathematical property, that the
          probability two sets share the same minimum hash value under a given hash function
          exactly equals their Jaccard similarity. Repeating this with many independent hash
          functions and counting what fraction agree gives a reliable estimate of that similarity
          — using a small, fixed-size signature instead of the full sets.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Two documents, as word sets.</b> Document A and Document B each become a large
            set of words (or shingles of a few words).</li>
          <li><b>Compute MinHash signatures.</b> Apply, say, 100 different hash functions to each
            set, keeping the minimum hash value from each — producing a 100-number signature per
            document, regardless of how many words each document actually has.</li>
          <li><b>Compare signatures, not documents.</b> Count how many of the 100 corresponding
            hash-function slots match between the two signatures.</li>
          <li><b>That fraction estimates Jaccard similarity</b> — e.g., 78 of 100 matching
            suggests the documents are about 78% similar by this measure, without ever directly
            comparing the (possibly huge) original word sets.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of two large sets each reduced to a small signature of minimum hash values, with the fraction of matching signature slots estimating how similar the original sets are." >
          <rect className="box" x="20" y="20" width="140" height="30" rx="5" /><text x="90" y="40" className="boxText">set A (huge)</text>
          <line className="flow" x1="90" y1="50" x2="90" y2="75" />
          <rect className="boxAccent" x="30" y="80" width="120" height="26" rx="4" /><text x="90" y="97" className="boxText">signature A</text>
          <rect className="box" x="260" y="20" width="140" height="30" rx="5" /><text x="330" y="40" className="boxText">set B (huge)</text>
          <line className="flow" x1="330" y1="50" x2="330" y2="75" />
          <rect className="boxAccent" x="270" y="80" width="120" height="26" rx="4" /><text x="330" y="97" className="boxText">signature B</text>
          <text x="210" y="93" className="figHint" textAnchor="middle">compare</text>
        </svg>
        <figcaption>Small fixed-size signatures stand in for huge sets when estimating similarity.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using too few hash functions makes the similarity estimate noisy and unreliable — more
          hash functions (a longer signature) improve accuracy at the cost of more computation and
          storage per signature. Applying MinHash where an exact overlap count is required (a
          plagiarism case with legal stakes, say) also calls for verifying with a direct
          comparison, not relying on the estimate alone.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does the fraction of matching MinHash signature slots between two sets estimate their Jaccard similarity?</p>
        </div>
      </section>
      <p className="takeaway">
        MinHash compresses huge sets into small, comparable signatures — making large-scale
        similarity search (near-duplicate detection, clustering) tractable without ever comparing
        full sets directly.
      </p>
    </div>
  );
}
