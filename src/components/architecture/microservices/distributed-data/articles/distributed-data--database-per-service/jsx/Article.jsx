import "../css/Article.css";

export default function DistributedDataDatabasePerServiceArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Database-per-service means exactly what it says: each service has its own private
          database that no other service touches directly &mdash; the single rule that makes
          independent deployability actually hold up once real data is involved.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          If two services can query the same tables, they're coupled at the schema level no matter
          how separately they're deployed: one service can't change a column without checking every
          other service that might depend on it. Database-per-service enforces the same "ask,
          don't query" rule from service boundaries, but at the data layer: the only way to read or
          write a service's data is through its API.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> owns a Postgres database with an <code>orders</code> table;
          <code>InventoryService</code> owns a separate Postgres database with a
          <code>stock_levels</code> table &mdash; potentially even a different engine entirely (say,
          a document store), since nothing outside <code>InventoryService</code> ever queries it
          directly. When <code>OrderService</code> needs stock information, it calls
          <code>InventoryService</code>'s API; it has no connection string, credentials, or schema
          knowledge for the inventory database at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of OrderService and InventoryService, each with its own separate database that only it can access directly, communicating with each other only through APIs.">
          <rect className="boxAccent" x="20" y="20" width="140" height="34" rx="6" />
          <text x="90" y="41" className="boxText" style={{fontSize:"7px"}}>OrderService</text>
          <rect className="box" x="45" y="70" width="90" height="26" rx="5" />
          <text x="90" y="87" className="figHint" style={{fontSize:"6px"}}>orders DB</text>
          <line className="flowMuted" x1="90" y1="54" x2="90" y2="68" />

          <rect className="boxAccent" x="240" y="20" width="140" height="34" rx="6" />
          <text x="310" y="41" className="boxText" style={{fontSize:"7px"}}>InventoryService</text>
          <rect className="box" x="265" y="70" width="90" height="26" rx="5" />
          <text x="310" y="87" className="figHint" style={{fontSize:"6px"}}>stock DB</text>
          <line className="flowMuted" x1="310" y1="54" x2="310" y2="68" />

          <line className="flow" x1="160" y1="37" x2="240" y2="37" />
          <text x="200" y="25" className="figHint" style={{fontSize:"5.5px"}}>API only</text>
        </svg>
        <figcaption>Neither service can see or query the other's database &mdash; every cross-service data need goes through an API call instead.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Giving another service's engineers read-only credentials to your database "just for
          reporting" feels harmless but recreates the coupling this pattern exists to remove &mdash;
          the moment anyone builds a report against your schema, you can no longer change that schema
          without warning them first. The other common mistake is not planning for the read patterns
          this creates: without care, replacing one join query with several API calls to different
          services can turn one fast query into a slow chain of network round trips.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A reporting team is given read-only credentials directly into InventoryService's database "just to build some dashboards." What does InventoryService lose the ability to do freely as a result?</p>
        </div>
      </section>
      <p className="takeaway">
        Database-per-service only works if the rule has no exceptions &mdash; a single "just this
        once" read-only connection is enough to quietly reintroduce the coupling it's meant to
        remove.
      </p>
    </div>
  );
}
