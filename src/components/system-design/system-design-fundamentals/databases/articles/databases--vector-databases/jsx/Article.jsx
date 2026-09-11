import "../css/Article.css";

export default function DatabasesVectorDatabasesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A vector database (Pinecone, Milvus, Weaviate) stores high-dimensional numeric vectors —
          typically embeddings produced by a machine learning model — and answers "which stored
          vectors are closest to this one" instead of exact-match queries.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          An embedding model turns something meaningful (a sentence, an image) into a vector of
          numbers such that similar things end up as nearby points in that vector space. Finding
          the exact nearest neighbors among millions of vectors by brute force is too slow, so
          vector databases use approximate nearest neighbor (ANN) indexes — trading a small amount
          of accuracy for orders-of-magnitude faster lookups.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A support tool needs to find past tickets similar in meaning to a new one, not just matching keywords.</p>
        </div>
        <ol className="stepList">
          <li><b>Embed every ticket.</b> Run each ticket's text through an embedding model,
            producing a vector.</li>
          <li><b>Store the vectors.</b> Each vector is indexed in the vector database alongside
            the ticket ID.</li>
          <li><b>Embed the new query.</b> The new ticket's text is embedded the same way.</li>
          <li><b>Search by nearness.</b> The database returns the closest stored vectors — tickets
            that mean something similar, even with completely different wording.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 380 220" role="img" aria-label="Diagram of vectors plotted in a 2D space, with a new query vector and its three nearest neighbors highlighted as similar items.">
          <circle className="box" cx="80" cy="60" r="6" /><circle className="box" cx="120" cy="100" r="6" />
          <circle className="box" cx="280" cy="50" r="6" /><circle className="box" cx="300" cy="170" r="6" />
          <circle className="boxAccent" cx="150" cy="150" r="7" /><circle className="boxAccent" cx="170" cy="120" r="7" /><circle className="boxAccent" cx="130" cy="170" r="7" />
          <circle cx="150" cy="145" r="9" fill="none" style={{ stroke: "var(--course-accent)", strokeWidth: 2, strokeDasharray: "3 3" }} />
          <circle cx="150" cy="145" r="55" fill="none" style={{ stroke: "var(--course-accent)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
          <text x="150" y="200" className="figHint" textAnchor="middle">3 nearest neighbors highlighted around the query</text>
        </svg>
        <figcaption>Similar meaning lands close together in vector space, regardless of exact wording.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using raw keyword search where semantic similarity is what's actually needed (or vice
          versa) leaves relevant results unfound. It's also easy to forget that ANN search is{" "}
          <em>approximate</em> — for use cases needing guaranteed exact nearest neighbors, that
          trade-off needs to be a deliberate choice, not an oversight.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can't a vector database simply compute exact distances to every stored vector for each query at web scale?</p>
        </div>
      </section>
      <p className="takeaway">
        Vector databases answer "what's similar to this," using approximate nearest-neighbor
        search to stay fast at the scale modern embedding-based applications need.
      </p>
    </div>
  );
}
