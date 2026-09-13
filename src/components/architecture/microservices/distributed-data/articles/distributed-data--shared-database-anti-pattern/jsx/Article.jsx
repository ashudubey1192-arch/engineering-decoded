import "../css/Article.css";

export default function DistributedDataSharedDatabaseAntiPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The shared-database anti-pattern is what you get when several services all read and write
          the same database directly &mdash; it looks like it saves effort early on, and it quietly
          recreates a monolith's coupling underneath what looks like a microservices architecture.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          When <code>Service A</code> and <code>Service B</code> both query the same
          <code>orders</code> table, neither can change that table's shape without coordinating with
          the other &mdash; a column rename becomes a two-team migration, not a one-team deploy. The
          database has effectively become the real API between the two services, except it's an API
          with no versioning, no access control per field, and no way to tell who depends on what.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> and <code>ReportingService</code> both connect to the same
          <code>orders</code> table &mdash; <code>ReportingService</code> reads it directly for
          speed. Six months later, <code>OrderService</code> wants to split <code>customer_name</code>
          into <code>first_name</code>/<code>last_name</code>. That single-column migration now needs
          sign-off from the reporting team too, and a bug slips through because nobody remembered
          <code>ReportingService</code> depended on the old column at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of OrderService and ReportingService both connecting directly to the same shared orders database table, meaning a schema change to that table requires coordinating both services even though they are deployed separately.">
          <rect className="box" x="20" y="20" width="110" height="30" rx="6" />
          <text x="75" y="39" className="boxText" style={{fontSize:"6.5px"}}>OrderService</text>
          <rect className="box" x="270" y="20" width="110" height="30" rx="6" />
          <text x="325" y="39" className="boxText" style={{fontSize:"6.5px"}}>ReportingService</text>
          <rect className="boxWarn" x="130" y="80" width="140" height="30" rx="6" />
          <text x="200" y="99" className="boxText" style={{fontSize:"6.5px"}}>shared orders table</text>
          <line className="flowMuted" x1="75" y1="50" x2="180" y2="80" />
          <line className="flowMuted" x1="325" y1="50" x2="230" y2="80" />
          <text x="200" y="120" className="figHint" style={{fontSize:"6px"}}>a schema change now needs both teams' sign-off</text>
        </svg>
        <figcaption>Two "separate" services, one real coupling point &mdash; the shared table, which neither can safely change alone.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Justifying a shared database as "temporary, just until we have time to build a proper API"
          is the most common trap &mdash; the temporary connection almost always outlives the
          intention to remove it, because removing it later requires the same coordinated migration
          effort the team was trying to avoid in the first place. Assuming a read-only connection is
          safe because "we're not writing to it" ignores that reads still couple you to the schema
          &mdash; a column rename breaks a read-only reporting query exactly as easily as a write.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>ReportingService only ever reads from OrderService's orders table, never writes to it. Is it still coupled to OrderService's schema? Why or why not?</p>
        </div>
      </section>
      <p className="takeaway">
        A shared database is a coupling, whether it's read-only or read-write &mdash; the fix is an
        API in front of the data, not "just be careful" discipline that has to hold forever.
      </p>
    </div>
  );
}
