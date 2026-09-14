import "../css/Article.css";

export default function QueryingResourcesFilteringArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Filtering narrows a collection down to the items matching specific criteria &mdash; the
          exact operator syntax matters less than picking one consistent convention and applying it
          to every filterable field in the API.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Equality filters</b> &mdash; <code>?status=in_transit</code> narrows to items where that field matches exactly.</li>
          <li><b>Operators beyond equality</b> &mdash; ranges and comparisons need a convention, such as <code>?created_after=2026-09-01</code> or a bracket syntax like <code>?weight_kg[gte]=5</code>.</li>
          <li><b>Multiple values on one field</b> &mdash; a comma-separated list (<code>?status=in_transit,delivered</code>) typically means OR within that field.</li>
          <li><b>Multiple filters together</b> &mdash; different fields in the same query string typically combine with AND.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>Parcelly narrows shipments with a small, consistent filter vocabulary:</p>
        <span className="codeLabel">COMBINING FILTERS</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments?status=in_transit&carrier=fedex&created_after=2026-09-01
# status = in_transit AND carrier = fedex AND created_at > 2026-09-01`}</pre>
        </div>
        <p>
          Filtering is deliberately narrower than search: <code>?carrier=fedex</code> matches an
          exact, structured value with a defined set of valid carriers, and either matches or
          doesn't &mdash; no ranking, no partial credit. That's what makes filter results fully
          deterministic and safe to cache, unlike the fuzzy, ranked results covered in the
          Searching lesson.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of three filters narrowing a collection of shipments step by step: status equals in transit, then carrier equals fedex, then created after September 1st, each filter removing more items from the result.">
          <rect className="box" x="10" y="40" width="80" height="50" rx="6" />
          <text x="50" y="68" className="boxText" style={{fontSize:"6px"}}>all shipments</text>
          {["status=\nin_transit","carrier=\nfedex","created_after=\n2026-09-01"].map((t,i) => (
            <g key={i}>
              <line className="flow" x1={90 + i*105} y1="65" x2={110 + i*105} y2="65" />
              <rect className={i===2 ? "boxAccent" : "box"} x={115 + i*105} y="40" width="90" height="50" rx="6" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={160 + i*105} y={60 + li*13} className="figHint" style={{fontSize:"5.5px"}}>{line}</text>
              ))}
            </g>
          ))}
        </svg>
        <figcaption>Each filter narrows the set further &mdash; combined with AND, in the order they're applied conceptually, not necessarily the order written.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Silently ignoring an unrecognized filter parameter is the most damaging mistake &mdash; a
          caller who typos <code>?statuss=in_transit</code> gets back the entire unfiltered
          collection with no error, and may not notice for a long time that filtering never
          actually applied. Using a different operator convention per endpoint (brackets here,
          suffixed parameter names there) is the other common one, turning what should be one
          learnable pattern into a lookup table.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A caller sends ?statuss=in_transit (misspelled) and the API just returns every shipment. Why is silently ignoring unknown parameters more dangerous than rejecting the request with a 400?</p>
        </div>
      </section>
      <p className="takeaway">
        Reject filters you don't recognize rather than silently ignoring them, and keep the
        operator syntax identical across every field &mdash; filtering should be one skill a
        consumer learns once, not one per endpoint.
      </p>
    </div>
  );
}
