import "../css/Article.css";

export default function ApiFoundationsConsumerOrientedApisArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A well-designed API is shaped around what its consumers need to do, not around the
          database tables or internal services that happen to produce the data &mdash; those are
          two very different shapes, and confusing them is one of the fastest ways to leak internal
          complexity onto everyone who calls you.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Internal model</b> &mdash; however your system actually stores and computes things: normalized tables, event logs, cached projections, whatever's convenient for the backend.</li>
          <li><b>Consumer's mental model</b> &mdash; the small set of concepts a caller actually thinks in: "a shipment," "its status," "its estimated delivery date."</li>
          <li><b>Translation layer</b> &mdash; the API's job is translating between the two, every time, in both directions &mdash; not exposing the internal model directly and calling it an API.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Internally, Parcelly's <code>shipment_events</code> table has 40-plus columns: carrier
          scan codes, internal routing-hub identifiers, retry counters for failed status polls, and
          three different timestamp columns for edge cases in how carriers report delivery. None of
          that belongs in the public API. What a partner actually needs is far smaller:
        </p>
        <span className="codeLabel">WHAT THE CONSUMER ACTUALLY NEEDS</span>
        <div className="codeBlock">
          <pre>{`{
  "id": "shp_9f8a",
  "status": "in_transit",
  "carrier": "fedex",
  "tracking_number": "784509821",
  "estimated_delivery": "2026-09-18"
}`}</pre>
        </div>
        <p>
          Every other internal column either gets collapsed into one of those five fields (three
          raw timestamp columns become one reliable <code>estimated_delivery</code>) or simply
          never crosses the boundary at all, because no partner has a use for a retry counter from
          Parcelly's internal polling logic.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of Parcelly's internal shipment_events table with over forty columns being translated down to a small, consumer-facing Shipment resource with five fields.">
          <rect className="box" x="20" y="20" width="140" height="100" rx="6" />
          <text x="90" y="38" className="figLabel" style={{fontSize:"6px"}}>INTERNAL TABLE</text>
          {Array.from({length:6}).map((_,i) => (
            <rect key={i} className="box" x="35" y={46 + i*11} width="110" height="8" rx="2" />
          ))}
          <text x="90" y="132" className="figHint" style={{fontSize:"5.5px"}}>40+ internal columns</text>
          <rect className="boxAccent" x="260" y="45" width="140" height="55" rx="6" />
          <text x="330" y="63" className="figLabel" style={{fontSize:"6px"}}>SHIPMENT RESOURCE</text>
          <text x="330" y="78" className="boxText" style={{fontSize:"5.5px"}}>id, status, carrier,</text>
          <text x="330" y="90" className="boxText" style={{fontSize:"5.5px"}}>tracking_number,</text>
          <text x="330" y="102" className="boxText" style={{fontSize:"5.5px"}}>estimated_delivery</text>
          <line className="flow" x1="160" y1="70" x2="258" y2="70" />
          <text x="210" y="62" className="figHint" style={{fontSize:"5.5px"}}>translate</text>
        </svg>
        <figcaption>The API exposes what a partner needs to reason about a shipment, not the forty-plus columns that happen to produce it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Serializing an internal database row directly as the API response is the most common
          version of this mistake &mdash; it's fast to build and immediately couples every schema
          migration to a public breaking change. A subtler version is naming API fields after
          internal implementation concepts (like a field called <code>polling_retry_count</code>)
          that make sense to the team that wrote the backend but mean nothing to a partner deciding
          how to render a delivery estimate.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Parcelly wants to change how estimated_delivery is computed internally, splitting one timestamp column into two. Why does a consumer-oriented API make this a non-event for partners, while a row-serializing API would make it a breaking change?</p>
        </div>
      </section>
      <p className="takeaway">
        The API is a translation, not a mirror. Every field you expose should earn its place by
        answering a real question a consumer has &mdash; not by being convenient to read off an
        internal table.
      </p>
    </div>
  );
}
