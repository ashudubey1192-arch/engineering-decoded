import "../css/Article.css";

export default function QueryingResourcesSortingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Sorting changes the order of a collection without changing its membership &mdash; a small
          surface area, but an undefined default order is a surprisingly common source of subtle
          bugs in whatever consumes the collection next, especially pagination.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Sort parameter</b> &mdash; a field name in the query string, like <code>?sort=created_at</code>, ascending by default.</li>
          <li><b>Direction</b> &mdash; a leading minus is a common convention for descending: <code>?sort=-created_at</code>.</li>
          <li><b>Multi-field sort</b> &mdash; a comma-separated list applies as tiebreakers in order: <code>?sort=status,-created_at</code>.</li>
          <li><b>Always define a default</b> &mdash; when no sort parameter is given, the order must still be stable and documented, never "whatever the database happens to return."</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's shipment list defaults to <code>-created_at</code> (newest first) when no sort
          is specified, and documents that explicitly. A partner building an activity feed asks for
          exactly that behavior for free; a partner building a queue-processing tool asks for
          <code>created_at</code> (oldest first) to work through the backlog in order:
        </p>
        <span className="codeLabel">MULTI-FIELD SORT</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments?sort=status,-created_at
# groups by status, and within each status shows newest first`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram contrasting an undefined sort order, which can silently change between identical requests, against an explicit documented default order, which stays stable every time.">
          <text x="105" y="18" className="figLabel">UNDEFINED (avoided)</text>
          {[0,1,2].map((i) => (
            <g key={i}>
              <rect className="boxWarn" x={30 + i*60} y="35" width="45" height="26" rx="4" />
              <text x={52 + i*60} y="52" className="boxText" style={{fontSize:"7px"}}>?</text>
            </g>
          ))}
          <text x="105" y="85" className="figHint" style={{fontSize:"5.5px"}}>order can silently change between calls</text>

          <line className="divider" x1="230" y1="10" x2="230" y2="110" />

          <text x="335" y="18" className="figLabel">EXPLICIT DEFAULT</text>
          {[0,1,2].map((i) => (
            <g key={i}>
              <rect className="boxAccent" x={280 + i*45} y="35" width="35" height="26" rx="4" />
              <text x={297 + i*45} y="52" className="boxText" style={{fontSize:"7px"}}>{i+1}</text>
            </g>
          ))}
          <text x="335" y="85" className="figHint" style={{fontSize:"5.5px"}}>newest first, same order every time</text>
        </svg>
        <figcaption>Without an explicit, documented default, "no sort specified" isn't really an order at all &mdash; it's whatever the database felt like returning today.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Leaving the default order undefined and letting it fall out of whatever the database
          engine happens to do is the most damaging mistake &mdash; that order can silently change
          after a database upgrade, an index change, or even between two calls with identical
          parameters, and it interacts badly with pagination: items can be skipped or repeated
          across pages if the underlying order isn't stable. The second common mistake is allowing
          sort on a field with no supporting index, which works fine in testing on a small
          collection and becomes a slow, expensive query the moment a partner's data grows.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can an undefined default sort order cause a client paging through results to see the same shipment twice, or miss one entirely?</p>
        </div>
      </section>
      <p className="takeaway">
        An explicit, stable default order isn't a nice-to-have &mdash; it's what makes pagination
        correct. Never leave the "no sort specified" case undefined.
      </p>
    </div>
  );
}
