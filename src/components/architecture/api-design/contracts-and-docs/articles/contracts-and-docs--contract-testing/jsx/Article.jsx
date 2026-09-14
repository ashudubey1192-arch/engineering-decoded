import "../css/Article.css";

export default function ContractsAndDocsContractTestingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A published contract is only trustworthy if something actually verifies the live API
          still matches it. Here, that means validating real request and response traffic against
          the published OpenAPI spec itself &mdash; catching the exact moment an implementation and
          its documentation quietly disagree.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Schema validation, not just data validation</b> &mdash; an ordinary integration test checks whether a response contains the right data; a contract test checks whether it matches the documented shape at all, independent of whether the data itself is correct.</li>
          <li><b>Run it in CI, on every change</b> &mdash; capture real responses from the test suite and validate them against the OpenAPI spec automatically, so drift is caught before merge, not discovered by a partner later.</li>
          <li><b>Validate inbound too</b> &mdash; request-validation middleware in production, rejecting anything that doesn't match the spec, doubles as both real-time enforcement and drift detection.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's CI pipeline runs its integration test suite, captures the real HTTP responses,
          and validates every one of them against <code>openapi.yaml</code> before allowing a merge:
        </p>
        <span className="codeLabel">CI STEP</span>
        <div className="codeBlock">
          <pre>{`run integration tests -> capture real responses
validate each response against openapi.yaml
FAIL BUILD if any response doesn't match its documented schema`}</pre>
        </div>
        <p>
          A pull request that adds a new required field to the <code>Shipment</code> response,
          without updating the spec to declare it, fails this check immediately &mdash; before it
          can reach a single partner as an undocumented, silent change they'd have discovered only
          by their own integration breaking.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 110" role="img" aria-label="Diagram of a CI pipeline: an implementation change triggers tests, tests produce real responses, responses are validated against the OpenAPI spec, and the build either passes or fails on any mismatch.">
          {["Code\nchange","Tests\nrun","Validate vs\nopenapi.yaml","Pass / Fail"].map((t,i) => (
            <g key={i}>
              <rect className={i===3 ? "boxAccent" : "box"} x={10 + i*108} y="30" width="96" height="46" rx="6" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={58 + i*108} y={50 + li*13} className="boxText" style={{fontSize:"6px"}}>{line}</text>
              ))}
              {i < 3 && <line className="flow" x1={106 + i*108} y1="53" x2={118 + i*108} y2="53" />}
            </g>
          ))}
        </svg>
        <figcaption>Every merge is gated on the live behavior still matching the published contract, not just on ordinary tests passing.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating "the tests pass" as proof the contract is honored is a common and subtle
          mistake &mdash; ordinary tests can pass while a response includes an undocumented extra
          field, or returns null for a field the spec promises is always present, simply because no
          test happened to check for either. Validating the spec manually or occasionally, instead
          of automatically on every change, is the other common mistake: drift creeps back in
          almost immediately after the next unrelated change nobody thought to re-check.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a test suite pass completely while the API still violates its own published OpenAPI contract?</p>
        </div>
      </section>
      <p className="takeaway">
        "The tests pass" and "the contract is honored" are different claims &mdash; only an
        automated check against the actual spec, on every change, verifies the second one.
      </p>
    </div>
  );
}
