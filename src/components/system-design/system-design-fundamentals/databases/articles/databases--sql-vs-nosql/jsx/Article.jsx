import "../css/Article.css";

export default function DatabasesSqlVsNosqlArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          SQL databases enforce a fixed schema and strong consistency through ACID transactions;
          NoSQL databases relax one or both of those in exchange for flexible schemas and easier
          horizontal scaling.
        </p>
        <p>
          "NoSQL" isn't one thing — it's a family (document, key-value, wide-column, graph) that
          shares a common trade: give up some of SQL's guarantees or structure to gain scale or
          flexibility.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>SQL</h3>
            <p>Fixed schema enforced up front. Joins across tables. Strong ACID transactions.
              Vertical scaling is the default path; horizontal scaling (sharding) takes real
              engineering effort.</p>
          </div>
          <div>
            <h3>NoSQL</h3>
            <p>Schema-flexible or schema-less. Data is often denormalized to avoid joins.
              Many NoSQL databases are built from the ground up to shard horizontally across
              many cheap machines.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A payments team needs guaranteed consistency across accounts; a content team needs to store rapidly-evolving, loosely-structured article metadata.</p>
        </div>
        <ol className="stepList">
          <li><b>Payments → SQL.</b> Debiting one account and crediting another must happen
            atomically — exactly what ACID transactions guarantee.</li>
          <li><b>Content metadata → NoSQL (document).</b> Each article's fields change over time
            and vary by content type; a rigid schema would mean constant migrations.</li>
          <li><b>Both ship in the same product</b> — the choice is per data set, not company-wide.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 140" role="img" aria-label="Diagram contrasting a fixed-schema SQL table of rows against a flexible NoSQL collection of documents with differing fields.">
          <text x="110" y="18" className="figLabel" textAnchor="middle">SQL — FIXED SCHEMA</text>
          <rect className="box" x="30" y="30" width="160" height="70" rx="6" />
          <line className="divider" x1="30" y1="53" x2="190" y2="53" />
          <line className="divider" x1="30" y1="76" x2="190" y2="76" />
          <line className="divider" x1="110" y1="30" x2="110" y2="100" />
          <text x="70" y="45" className="boxText">id</text><text x="150" y="45" className="boxText">name</text>
          <text x="70" y="68" className="boxText">1</text><text x="150" y="68" className="boxText">Ann</text>
          <text x="70" y="91" className="boxText">2</text><text x="150" y="91" className="boxText">Bo</text>
          <line className="divider" x1="230" y1="10" x2="230" y2="120" />
          <text x="350" y="18" className="figLabel" textAnchor="middle">NOSQL — FLEXIBLE</text>
          <rect className="boxAccent" x="270" y="30" width="160" height="28" rx="5" /><text x="350" y="48" className="boxText">{"{ id, name }"}</text>
          <rect className="boxAccent" x="270" y="65" width="160" height="28" rx="5" /><text x="350" y="83" className="boxText">{"{ id, name, tags[] }"}</text>
        </svg>
        <figcaption>Every SQL row shares the same columns; NoSQL documents can differ from each other.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating this as a binary "which is better" question misses the point — it's per
          workload. A common real mistake is using a NoSQL store for data that actually needs
          multi-row transactions (like double-entry bookkeeping) and then rebuilding transaction
          guarantees badly in application code.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might a single product reasonably use both a SQL and a NoSQL database for different parts of its data?</p>
        </div>
      </section>
      <p className="takeaway">
        SQL buys you structure and strong transactions; NoSQL buys you schema flexibility and
        easier horizontal scale — pick per data set based on which guarantee you actually need.
      </p>
    </div>
  );
}
