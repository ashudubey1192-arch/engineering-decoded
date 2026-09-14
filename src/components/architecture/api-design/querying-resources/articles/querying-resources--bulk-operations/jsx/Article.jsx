import "../css/Article.css";

export default function QueryingResourcesBulkOperationsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A bulk endpoint's hard design problem isn't the happy path where everything succeeds
          &mdash; it's deciding, upfront and clearly, what happens when item 47 of 200 fails and
          the other 199 shouldn't be held hostage to it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>All-or-nothing</h3>
            <p>The whole batch succeeds or the whole batch is rolled back. Simple to reason about, but rarely practical once the batch involves calls to external systems that can't be transactionally rolled back.</p>
          </div>
          <div>
            <h3>Best-effort, per-item</h3>
            <p>Each item succeeds or fails independently, and the response reports every individual outcome. More complex to consume, but matches how most bulk operations actually behave in practice.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's bulk shipment creation is best-effort by necessity &mdash; each shipment
          involves a call to a carrier's own API to reserve a tracking number, and carrier calls
          can independently fail without any way to "roll back" the ones that already succeeded.
          The response reports every item's outcome, in the same order they were submitted:
        </p>
        <span className="codeLabel">POST /v1/shipments/bulk</span>
        <div className="codeBlock">
          <pre>{`{
  "results": [
    { "index": 0, "status": 201, "id": "shp_9f8a" },
    { "index": 1, "status": 201, "id": "shp_7c21" },
    { "index": 2, "status": 422, "error": { "code": "invalid_carrier" } }
  ],
  "meta": { "submitted": 3, "succeeded": 2, "failed": 1 }
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of one bulk request splitting into three independent per-item outcomes: two successes and one failure, reported together in a single response.">
          <rect className="boxAccent" x="20" y="45" width="90" height="30" rx="5" />
          <text x="65" y="64" className="boxText" style={{fontSize:"6.5px"}}>1 bulk request</text>
          {[0,1,2].map(i => (
            <g key={i}>
              <line className="flow" x1="110" y1="60" x2={150 + i*90} y2={30 + i*30} />
              <rect className={i===2 ? "boxWarn" : "box"} x={150 + i*90} y={18 + i*30} width="80" height="24" rx="4" />
              <text x={190 + i*90} y={34 + i*30} className="boxText" style={{fontSize:"5.5px"}}>item {i}: {i===2 ? "422" : "201"}</text>
            </g>
          ))}
        </svg>
        <figcaption>One request, three independent outcomes &mdash; the two successes aren't held hostage to the one failure.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Not documenting which semantics a bulk endpoint uses is the most damaging mistake &mdash;
          a caller who assumes atomicity and gets partial success (or vice versa) can end up with
          data in a state their own logic never accounted for. Losing the correspondence between
          input order and result order is the second: if a client submitted five items and gets
          back an unordered or filtered results array, it has no reliable way to know which result
          belongs to which input.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is all-or-nothing semantics usually impractical for a bulk endpoint that calls an external carrier API for each item?</p>
        </div>
      </section>
      <p className="takeaway">
        Decide and document all-or-nothing vs. best-effort before writing the endpoint, preserve
        input order in the results, and report every item's individual outcome &mdash; a bulk
        endpoint is really just many independent operations wearing one request.
      </p>
    </div>
  );
}
