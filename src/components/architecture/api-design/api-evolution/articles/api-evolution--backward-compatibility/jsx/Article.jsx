import "../css/Article.css";

export default function ApiEvolutionBackwardCompatibilityArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Backward compatibility means a change to the API doesn't break any consumer who was
          already using it correctly &mdash; and "correctly" is the fine print that ends up
          deciding most real disagreements about whether a given change actually broke something.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Producers should be conservative</b> &mdash; never require existing clients to start sending something new; new request fields should always be optional.</li>
          <li><b>Consumers should be liberal</b> &mdash; correctly written clients must ignore unrecognized response fields rather than erroring on them.</li>
          <li><b>The contract includes both sides</b> &mdash; a producer can only safely add new fields if its documented contract actually requires consumers to tolerate them; that requirement has to be stated, not assumed.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <table className="miniTable">
          <caption>SAFE VS. BREAKING, ON PARCELLY'S SHIPMENT SCHEMA</caption>
          <thead><tr><th>Change</th><th>Effect on existing clients</th></tr></thead>
          <tbody>
            <tr><td>Add a new optional <code>weight_unit</code> field</td><td>Safe &mdash; old clients that don't look for it are unaffected</td></tr>
            <tr><td>Add a new value to the <code>status</code> enum</td><td>Safe only if clients are documented to handle unknown values gracefully</td></tr>
            <tr><td>Rename <code>carrier</code> to <code>carrier_code</code></td><td>Breaking &mdash; every client reading the old name now gets nothing</td></tr>
            <tr><td>Make <code>delivery_instructions</code> required on create</td><td>Breaking &mdash; every client that previously omitted it now fails</td></tr>
          </tbody>
        </table>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of the backward compatibility contract: the producer stays conservative about what it requires, the consumer stays liberal about what it tolerates, and both halves meet in a compatible contract.">
          <rect className="box" x="20" y="30" width="140" height="50" rx="6" />
          <text x="90" y="51" className="figLabel" style={{fontSize:"6px"}}>PRODUCER</text>
          <text x="90" y="67" className="figHint" style={{fontSize:"5.5px"}}>never requires new fields</text>
          <rect className="box" x="260" y="30" width="140" height="50" rx="6" />
          <text x="330" y="51" className="figLabel" style={{fontSize:"6px"}}>CONSUMER</text>
          <text x="330" y="67" className="figHint" style={{fontSize:"5.5px"}}>ignores unrecognized fields</text>
          <line className="flow" x1="160" y1="55" x2="258" y2="55" />
          <text x="210" y="45" className="figHint" style={{fontSize:"5.5px"}}>compatible</text>
        </svg>
        <figcaption>Backward compatibility holds only when both halves of the contract are honored &mdash; either side skipping theirs breaks it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming "additive" automatically means "safe" is the most common mistake &mdash; adding
          a new enum value is only actually safe if every client was required, from the start, to
          treat unrecognized values gracefully instead of crashing or mis-branching on them. The
          opposite mistake is treating every change as risky and freezing the schema entirely,
          which just delays necessary evolution until it has to happen all at once, as a much
          larger and riskier breaking change.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is adding a new value to a status enum only safe if the API's contract already required clients to handle unrecognized values gracefully?</p>
        </div>
      </section>
      <p className="takeaway">
        Backward compatibility is a two-sided contract &mdash; the producer stays conservative
        about what it requires, and the consumer stays liberal about what it tolerates. Either side
        skipping their half breaks the guarantee.
      </p>
    </div>
  );
}
