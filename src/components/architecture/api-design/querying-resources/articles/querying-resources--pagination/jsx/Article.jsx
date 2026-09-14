import "../css/Article.css";

export default function QueryingResourcesPaginationArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Pagination is how a caller walks through a collection too large to return in one
          response &mdash; the choice between offset and cursor pagination isn't a style
          preference, it changes both performance at scale and correctness while the collection is
          being written to.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>OFFSET VS. CURSOR</caption>
          <thead><tr><th>Dimension</th><th>Offset (?page=3)</th><th>Cursor (?cursor=xyz)</th></tr></thead>
          <tbody>
            <tr><td>Jump to an arbitrary page</td><td>Yes</td><td>No, forward/backward only</td></tr>
            <tr><td>Stable under concurrent inserts</td><td>No &mdash; items can shift between pages</td><td>Yes &mdash; anchored to a specific item</td></tr>
            <tr><td>Performance on a large offset</td><td>Degrades &mdash; the database still scans past skipped rows</td><td>Stays fast regardless of position</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly switched a high-volume partner integration from offset to cursor pagination
          after a real incident: the partner paged through <code>?page=1</code>,
          <code>?page=2</code>, <code>?page=3</code> once a minute while new shipments were being
          created constantly. Each new shipment sorted to the front of the (newest-first) list,
          shifting every later page by one &mdash; the partner's script saw some shipments twice
          across two pages and silently missed others entirely, with no error to indicate anything
          had gone wrong. Cursor pagination fixed this by anchoring each page to the last item
          actually seen, not to a numeric position that shifts as new rows are inserted:
        </p>
        <span className="codeLabel">CURSOR PAGINATION</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments?limit=25
{ "data": [ ...25 shipments... ], "meta": { "next_cursor": "eyJpZCI6InNocF85ZjhhIn0=" } }

GET /v1/shipments?limit=25&cursor=eyJpZCI6InNocF85ZjhhIn0=
# continues exactly after the last item from the previous page, even if new items were inserted`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Side-by-side comparison: offset pagination where a page's numeric window shifts when a new item is inserted at the front, causing a duplicate and a skip, versus cursor pagination where the next page is anchored to the last seen item and stays stable.">
          <text x="105" y="18" className="figLabel">OFFSET (shifts)</text>
          {["A","B","C","D"].map((t,i) => (
            <rect key={t} className={i===0 ? "boxWarn" : "box"} x={20 + i*48} y="35" width="40" height="24" rx="4" />
          ))}
          {["A","B","C","D"].map((t,i) => (
            <text key={t} x={40 + i*48} y="51" className="boxText" style={{fontSize:"6px"}}>{t}</text>
          ))}
          <text x="105" y="80" className="figHint" style={{fontSize:"5.5px"}}>new item inserted at front shifts page 2's window</text>

          <line className="divider" x1="230" y1="10" x2="230" y2="140" />

          <text x="335" y="18" className="figLabel">CURSOR (stable)</text>
          {["A","B","C","D"].map((t,i) => (
            <rect key={t} className="box" x={260 + i*48} y="35" width="40" height="24" rx="4" />
          ))}
          {["A","B","C","D"].map((t,i) => (
            <text key={t} x={280 + i*48} y="51" className="boxText" style={{fontSize:"6px"}}>{t}</text>
          ))}
          <text x="335" y="80" className="figHint" style={{fontSize:"5.5px"}}>next page anchored to "after D" &mdash; new inserts don't move it</text>
        </svg>
        <figcaption>Offset counts positions that shift as data changes; a cursor points at a specific item and stays correct regardless of what's inserted elsewhere.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using offset pagination for a large or frequently-written collection is the most common
          mistake, usually chosen because it's simpler to implement and lets a UI jump to an
          arbitrary page number. That convenience is exactly what breaks under concurrent writes.
          The second mistake is returning an exact total count on every paginated response for a
          very large collection &mdash; computing a precise count can be nearly as expensive as the
          query itself, and an approximate count, clearly labeled as such, is usually good enough
          for what callers actually do with it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did a shipment inserted between two of a partner's paginated requests cause them to see one item twice and miss another, under offset pagination?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for cursor pagination by default for any collection that's large or actively written
        to; offset pagination is fine for small, mostly-static collections where jumping to an
        arbitrary page is genuinely useful.
      </p>
    </div>
  );
}
