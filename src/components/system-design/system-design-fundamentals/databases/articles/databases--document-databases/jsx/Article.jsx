import "../css/Article.css";

export default function DatabasesDocumentDatabasesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A document database (MongoDB, Couchbase) stores each record as a self-contained
          JSON-like document, with no enforced schema shared across documents in the same
          collection.
        </p>
        <p>
          Instead of splitting an entity across normalized tables, a document database usually
          keeps everything about one entity — a user, a product, an order — nested in a single
          document, so a common read is a single lookup rather than a join.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Documents in the same collection can have different fields, which suits data that
          varies by type or evolves over time — no migration required to add a field to new
          documents. The trade-off is that relationships between documents (a user's orders) are
          usually modeled by embedding or by application-level lookups, not database-enforced
          foreign keys.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A product catalog where a "shirt" has size/color and a "laptop" has RAM/CPU — wildly different attribute sets.</p>
        </div>
        <ol className="stepList">
          <li><b>Model each product as one document.</b>{" "}
            <code>{"{ id, name, price, attributes: {...} }"}</code> — attributes vary freely.</li>
          <li><b>No migration for new categories.</b> Adding "headphones" with its own attribute
            shape needs zero schema change.</li>
          <li><b>Read in one lookup.</b> Rendering a product page fetches one document — no joins
            across an attributes table.</li>
          <li><b>Accept the trade.</b> "Find all products where any attribute equals X" needs a
            secondary index, since attributes aren't a fixed column.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 140" role="img" aria-label="Diagram of two product documents in the same collection with different attribute fields, versus a relational model that would need separate attribute tables per product type.">
          <rect className="boxAccent" x="30" y="20" width="180" height="45" rx="6" />
          <text x="120" y="38" className="boxText">{"{ name: 'Shirt',"}</text>
          <text x="120" y="55" className="boxText">{"  size, color }"}</text>
          <rect className="boxAccent" x="30" y="75" width="180" height="45" rx="6" />
          <text x="120" y="93" className="boxText">{"{ name: 'Laptop',"}</text>
          <text x="120" y="110" className="boxText">{"  ram, cpu }"}</text>
          <text x="120" y="128" className="figHint" textAnchor="middle">same collection, different shapes</text>
          <line className="divider" x1="250" y1="10" x2="250" y2="135" />
          <text x="360" y="18" className="figHint" textAnchor="middle">relational would need a</text>
          <text x="360" y="32" className="figHint" textAnchor="middle">separate attributes table</text>
          <text x="360" y="46" className="figHint" textAnchor="middle">joined per product type</text>
        </svg>
        <figcaption>Variable shape, one collection — no schema migration needed to add a new product type.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Embedding data that grows unbounded (all of a popular product's reviews inside the
          product document) eventually blows past document size limits and slows every read of
          that document. And skipping schema discipline entirely — no shared shape at all — makes
          the application code responsible for handling every possible document variation.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>When would embedding related data in one document be the wrong call compared to referencing a separate document?</p>
        </div>
      </section>
      <p className="takeaway">
        Document databases fit data that's naturally read and written as one nested object and
        whose shape varies or evolves — the flexibility trades away enforced cross-document structure.
      </p>
    </div>
  );
}
