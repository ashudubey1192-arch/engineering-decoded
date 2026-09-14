import "../css/Article.css";

export default function RequestsAndResponsesValidationErrorsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Validation errors are the error case every client hits most often during integration,
          which makes them the worst place to be stingy &mdash; report every problem with the
          request at once, per field, instead of making the caller fix one mistake per round trip.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>422 vs. 400</b> &mdash; a common (though not universal) convention: 400 for a request that's malformed or unparseable, 422 for a well-formed request that fails business or field validation.</li>
          <li><b>Report all failures at once</b> &mdash; validate the entire payload, then return every failing field together, not just the first one found.</li>
          <li><b>Per-field structure</b> &mdash; each error names the exact field path and what's wrong with it, so a client can highlight the right input.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>A malformed shipment-creation request against Parcelly fails on three fields at once, and hears about all three immediately:</p>
        <span className="codeLabel">422 UNPROCESSABLE ENTITY</span>
        <div className="codeBlock">
          <pre>{`{
  "error": {
    "code": "validation_failed",
    "message": "3 fields failed validation.",
    "details": [
      { "field": "carrier", "issue": "must be one of: fedex, ups, usps" },
      { "field": "packages[0].weight_kg", "issue": "must be greater than 0" },
      { "field": "destination_address_id", "issue": "required field is missing" }
    ]
  }
}`}</pre>
        </div>
        <p>
          A client rendering a form can highlight all three fields in one pass. Without this, a
          caller fixes <code>carrier</code>, resubmits, is told about <code>weight_kg</code>, fixes
          that, resubmits again, and only then learns about the missing address &mdash; three round
          trips to discover what one response could have said the first time.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting fail-fast validation, which reports one error per round trip across three requests, against batch validation, which reports all three problems in a single response.">
          <text x="105" y="18" className="figLabel">FAIL-FAST (avoided)</text>
          {[0,1,2].map(i => (
            <g key={i}>
              <rect className="boxWarn" x={20 + i*70} y="35" width="55" height="24" rx="4" />
              <text x={47 + i*70} y="51" className="boxText" style={{fontSize:"5.5px"}}>request {i+1}</text>
            </g>
          ))}
          <text x="105" y="80" className="figHint" style={{fontSize:"5.5px"}}>3 round trips to learn all 3 problems</text>

          <line className="divider" x1="230" y1="10" x2="230" y2="120" />

          <text x="335" y="18" className="figLabel">BATCH (Parcelly)</text>
          <rect className="boxAccent" x="290" y="35" width="90" height="30" rx="5" />
          <text x="335" y="54" className="boxText" style={{fontSize:"6px"}}>1 request</text>
          <text x="335" y="80" className="figHint" style={{fontSize:"5.5px"}}>1 response, all 3 problems listed</text>
        </svg>
        <figcaption>Reporting every validation failure at once turns three slow round trips into one.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Returning only the first validation error found is the most common mistake, usually just
          an artifact of validation code that returns as soon as it hits a problem instead of
          collecting all of them first. Using a generic <code>400 Bad Request</code> for every kind
          of validation failure, indistinguishable from a genuinely malformed request, is the other
          common one &mdash; it throws away the useful distinction between "your JSON doesn't even
          parse" and "your JSON parses fine but one field is out of range."
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does collecting all validation failures before responding matter more for a form-heavy client than for a script that only ever sends already-valid data?</p>
        </div>
      </section>
      <p className="takeaway">
        Validate the whole payload, then report every problem together. It costs a little more
        validation logic up front and saves every integrator several rounds of trial and error.
      </p>
    </div>
  );
}
