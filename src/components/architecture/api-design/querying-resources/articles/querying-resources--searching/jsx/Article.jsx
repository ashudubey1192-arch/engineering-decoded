import "../css/Article.css";

export default function QueryingResourcesSearchingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Search and filtering solve different problems and shouldn't be designed as the same
          feature &mdash; filtering is exact and deterministic, search is approximate and ranked,
          and conflating the two produces an API that's confusing at both jobs.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Filtering</h3>
            <p>Structured, exact-match criteria on known fields. Deterministic: the same query against the same data always returns the same set, in no particular relevance order.</p>
          </div>
          <div>
            <h3>Search</h3>
            <p>Free-text matching, often against multiple fields at once, ranked by relevance. Frequently backed by a separate search index that can lag slightly behind the primary store.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly exposes both, clearly separated. <code>?carrier=fedex</code> is a filter: exact,
          deterministic, backed directly by the primary database. <code>?q=fragile electronics</code>
          is a search: it matches against package descriptions using a separate search index,
          ranks results by relevance, and can occasionally miss a shipment created a few seconds
          ago that the index hasn't caught up to yet &mdash; a trade-off Parcelly documents
          explicitly rather than pretending search is as immediately consistent as a filter.
        </p>
        <span className="codeLabel">DIFFERENT GUARANTEES, SAME ENDPOINT</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments?carrier=fedex        # exact, deterministic, always current
GET /v1/shipments?q=fragile+electronics # ranked, may lag by a few seconds`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting filtering, which queries the primary database directly for an exact deterministic match, against search, which queries a separate search index that ranks results and may lag slightly behind the primary store.">
          <text x="105" y="18" className="figLabel">FILTER</text>
          <rect className="box" x="30" y="35" width="70" height="26" rx="5" />
          <text x="65" y="52" className="boxText" style={{fontSize:"6px"}}>Request</text>
          <rect className="boxAccent" x="150" y="35" width="90" height="26" rx="5" />
          <text x="195" y="52" className="boxText" style={{fontSize:"5.5px"}}>Primary database</text>
          <line className="flow" x1="100" y1="48" x2="148" y2="48" />
          <text x="140" y="80" className="figHint" style={{fontSize:"6px"}}>exact, always current</text>

          <line className="divider" x1="270" y1="10" x2="270" y2="120" />

          <text x="355" y="18" className="figLabel">SEARCH</text>
          <rect className="box" x="290" y="35" width="70" height="26" rx="5" />
          <text x="325" y="52" className="boxText" style={{fontSize:"6px"}}>Request</text>
          <rect className="boxAccent" x="395" y="35" width="30" height="26" rx="5" />
          <text x="410" y="52" className="boxText" style={{fontSize:"5px"}}>Index</text>
          <line className="flow" x1="360" y1="48" x2="393" y2="48" />
          <text x="360" y="80" className="figHint" style={{fontSize:"6px"}}>ranked, may lag briefly</text>
        </svg>
        <figcaption>Filters hit the primary store directly; search goes through an index with its own, slightly looser consistency guarantee.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing "search" as a fuzzy filter directly against the primary database (a
          case-insensitive <code>LIKE</code> query) works at small scale but degrades badly as data
          grows, and it doesn't rank results by relevance the way callers expect from something
          named "search." The opposite mistake is not documenting a real search index's slight lag
          &mdash; a partner who creates a shipment and immediately searches for it may not find it
          for a few seconds, which is confusing without a clear explanation that search and reads
          have different consistency guarantees.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might a shipment be immediately visible through GET /shipments/shp_9f8a but not yet show up in a ?q= search for a few seconds afterward?</p>
        </div>
      </section>
      <p className="takeaway">
        Filtering and search look similar in a query string and behave completely differently
        underneath &mdash; keep the distinction explicit in your API's design and its
        documentation, not just in your backend architecture.
      </p>
    </div>
  );
}
