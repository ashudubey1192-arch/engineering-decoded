import "../css/Article.css";

export default function DatabasesFullTextSearchEnginesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A full-text search engine (Elasticsearch, OpenSearch, Solr) is built to answer "which
          documents contain words like this," ranked by relevance — something a plain{" "}
          <code>WHERE text LIKE '%word%'</code> in a regular database does very slowly.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The core structure is an <b>inverted index</b>: instead of "document → words," it stores
          "word → which documents contain it," pre-built at write time. A search for "distributed
          systems" looks up both words directly and intersects the document lists — no scanning
          every document's text. On top of that, search engines add ranking (how relevant is this
          match), typo tolerance, and language-aware tokenization (stemming "running" to "run").
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Index documents as they're created.</b> Each blog post is tokenized into words
            and added to the inverted index.</li>
          <li><b>User searches "distributed systems."</b> The engine looks up both terms in the
            inverted index.</li>
          <li><b>Intersect and rank.</b> Documents containing both terms are ranked higher than
            documents with just one, factoring in term frequency and field weight (title beats
            body).</li>
          <li><b>Return in milliseconds</b>, even across millions of documents, because the lookup
            is by word, not a scan of every document's text.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 140" role="img" aria-label="Diagram of an inverted index mapping words to the document ids that contain them, then intersecting two word lookups to find documents matching both search terms.">
          <rect className="box" x="20" y="20" width="90" height="24" rx="4" /><text x="65" y="37" className="boxText">"distributed"</text>
          <text x="130" y="37" className="figHint">→ docs 4, 9, 12</text>
          <rect className="box" x="20" y="55" width="90" height="24" rx="4" /><text x="65" y="72" className="boxText">"systems"</text>
          <text x="130" y="72" className="figHint">→ docs 2, 4, 9, 20</text>
          <line className="flow" x1="65" y1="79" x2="65" y2="100" />
          <line className="flow" x1="65" y1="44" x2="65" y2="100" />
          <rect className="boxAccent" x="20" y="100" width="150" height="26" rx="4" />
          <text x="95" y="118" className="boxText">intersect → docs 4, 9</text>
        </svg>
        <figcaption>Two word lookups and a set intersection — no document text scanned at query time.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating a search engine as your primary datastore for data you also need strong
          transactional consistency for is a common misstep — most teams keep the source of truth
          in a regular database and index a copy into search, accepting a small sync delay.
          Under-tuning relevance scoring also leaves "technically matching but useless" results
          at the top.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is an inverted index so much faster for text search than scanning every row's text column with a LIKE query?</p>
        </div>
      </section>
      <p className="takeaway">
        Full-text search engines pre-pay the cost of indexing every word at write time so that
        searches, even across millions of documents, stay fast and rankable.
      </p>
    </div>
  );
}
