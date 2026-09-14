import "../css/Article.css";

export default function ApiEvolutionSchemaEvolutionArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A schema has to change as the domain it describes changes &mdash; the discipline is
          making each individual change safe in isolation, so the schema can keep evolving
          continuously instead of needing periodic breaking rewrites.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Add, don't repurpose</b> &mdash; if a field's meaning needs to change, add a new field with the new meaning rather than silently changing what an existing field represents.</li>
          <li><b>Widen, don't narrow</b> &mdash; loosening a constraint (allowing a longer string, a wider numeric range) is usually safe; tightening one can reject previously-valid data or requests.</li>
          <li><b>New enum values need a documented fallback</b> &mdash; safe only if clients were always required to handle a value they don't recognize.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          When Parcelly added a <code>"customs_hold"</code> status for international shipments
          stopped at a border, it was a safe change specifically because Parcelly's documented
          contract, from day one, required clients to treat any unrecognized status as a generic
          "in progress" fallback rather than assuming a fixed, closed list:
        </p>
        <span className="codeLabel">A CLIENT WRITTEN TO THE CONTRACT</span>
        <div className="codeBlock">
          <pre>{`switch (shipment.status) {
  case "created": ...
  case "in_transit": ...
  case "delivered": ...
  default: showAsInProgress(shipment) // required by Parcelly's docs
}`}</pre>
        </div>
        <p>
          A client written with a switch statement and no default case, silently doing nothing for
          any status it didn't already know about, would have broken the moment
          <code>"customs_hold"</code> started appearing &mdash; not because Parcelly's change was
          unsafe, but because that client didn't hold up its side of the contract.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram contrasting a safe additive schema change, adding a new field, against an unsafe change, repurposing an existing field's meaning.">
          <rect className="boxAccent" x="20" y="30" width="170" height="50" rx="6" />
          <text x="105" y="50" className="figLabel" style={{fontSize:"6px"}}>SAFE</text>
          <text x="105" y="68" className="figHint" style={{fontSize:"5.5px"}}>add a new optional field</text>
          <rect className="boxWarn" x="230" y="30" width="170" height="50" rx="6" />
          <text x="315" y="50" className="figLabel" style={{fontSize:"6px"}}>UNSAFE</text>
          <text x="315" y="68" className="figHint" style={{fontSize:"5.5px"}}>repurpose an existing field's meaning</text>
        </svg>
        <figcaption>Adding is almost always safe; silently changing what an existing field means never is.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Repurposing an existing field's meaning instead of adding a new one is the most damaging
          mistake &mdash; changing what <code>weight</code> represents from kilograms to pounds
          without renaming it corrupts every existing client's interpretation of every value it
          reads, silently, with no error to signal anything changed. Tightening a validation
          constraint and assuming it's "just a bug fix" is the other common one: if any real client
          was relying on the previously-looser behavior, even unintentionally, tightening it is a
          breaking change for them.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did adding the customs_hold status count as backward compatible for clients following Parcelly's contract, but not for a client with a switch statement and no default case?</p>
        </div>
      </section>
      <p className="takeaway">
        A schema can evolve continuously if every change is additive and every consumer honors the
        "handle what you don't recognize gracefully" half of the contract &mdash; schema evolution
        and backward compatibility are really the same discipline applied continuously.
      </p>
    </div>
  );
}
