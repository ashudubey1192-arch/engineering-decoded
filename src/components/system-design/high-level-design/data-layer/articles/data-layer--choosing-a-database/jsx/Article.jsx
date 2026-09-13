import "../css/Article.css";

export default function DataLayerChoosingADatabaseArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The database choice should fall out of the data model and access patterns already
          defined earlier in the design &mdash; not be picked first out of familiarity or trend.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Three questions narrow the choice fast: how <b>structured and relational</b> is the
          data (many joins across entities favor a relational database), how <b>flexible</b> does
          the schema need to be (rapidly-changing or sparse fields favor a document store), and
          what <b>access pattern</b> dominates (simple key lookups at huge scale favor a key-value
          store; full-text search favors a search index). Most real designs end up with more than
          one datastore, each chosen for a specific access pattern rather than one database doing
          everything.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>An orders system</b> needs orders, line items, and customers, with joins between
            them and strict correctness on totals &mdash; a relational database fits well.</li>
          <li><b>The same product also needs product search by keyword</b> &mdash; a relational
            database is a poor fit for full-text ranking, so a dedicated search index is added
            alongside it.</li>
          <li><b>It also needs a live &ldquo;items in cart&rdquo; count per user,</b> a simple,
            extremely high-volume key lookup &mdash; a key-value store fits better than routing
            that through the relational database.</li>
          <li><b>The result is three datastores,</b> each chosen for one access pattern, not one
            database stretched to cover all three.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of one application with three different access patterns, each routed to a different datastore chosen specifically for that pattern: relational for orders, key-value for cart counts, and search index for product search." >
          <rect className="boxAccent" x="180" y="45" width="80" height="30" rx="5" /><text x="220" y="64" className="boxText" style={{fontSize:"9px"}}>App</text>
          <line className="flow" x1="180" y1="55" x2="60" y2="25" /><line className="flow" x1="260" y1="55" x2="380" y2="25" /><line className="flow" x1="220" y1="75" x2="220" y2="95" />
          <rect className="box" x="15" y="10" width="90" height="26" rx="5" /><text x="60" y="27" className="boxText" style={{fontSize:"8px"}}>Relational</text>
          <rect className="box" x="335" y="10" width="90" height="26" rx="5" /><text x="380" y="27" className="boxText" style={{fontSize:"8px"}}>Search index</text>
          <rect className="box" x="175" y="98" width="90" height="22" rx="5" /><text x="220" y="113" className="boxText" style={{fontSize:"8px"}}>Key-value</text>
        </svg>
        <figcaption>Three access patterns, three datastores, each chosen specifically for the pattern it serves.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Picking a database because it&rsquo;s trendy or familiar, before the access patterns are
          even known, often means retrofitting the wrong tool later. Forcing every access pattern
          through one datastore &ldquo;to keep things simple&rdquo; frequently produces worse
          performance than a small number of purpose-fit stores would.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What three questions about the data should be answered before picking a database, and why does the answer often lead to more than one datastore?</p>
        </div>
      </section>
      <p className="takeaway">
        Let the data model and access patterns choose the database, not the other way around
        &mdash; and expect a non-trivial design to use more than one kind of store.
      </p>
    </div>
  );
}
