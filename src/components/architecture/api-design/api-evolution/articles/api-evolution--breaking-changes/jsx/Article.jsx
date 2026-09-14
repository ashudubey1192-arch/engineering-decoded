import "../css/Article.css";

export default function ApiEvolutionBreakingChangesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A breaking change is anything that makes correctly-written existing client code stop
          working &mdash; the actual line is narrower than most people assume, and knowing exactly
          where it sits is what lets you ship confidently instead of guessing.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>BREAKING OR NOT</caption>
          <thead><tr><th>Change</th><th>Breaking?</th></tr></thead>
          <tbody>
            <tr><td>Adding a new optional field</td><td>No</td></tr>
            <tr><td>Reordering fields in a JSON object</td><td>No &mdash; key order isn't meaningful in JSON</td></tr>
            <tr><td>Removing a field</td><td>Yes</td></tr>
            <tr><td>Renaming a field</td><td>Yes &mdash; equivalent to remove + add</td></tr>
            <tr><td>Making an optional field required</td><td>Yes</td></tr>
            <tr><td>Changing a field's type or format</td><td>Yes</td></tr>
            <tr><td>Tightening validation on an existing field</td><td>Yes, if any real client relied on the looser behavior</td></tr>
            <tr><td>Adding a new enum value</td><td>Only if clients weren't required to handle unknown values</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly nearly shipped a change that looked like an obvious bug fix: tightening
          <code>weight_kg</code> validation from "any number" to "a positive number no greater than
          1000." In review, a partner-integration audit found that one long-standing partner had
          been sending <code>0</code> for "weight unknown at booking time" for over two years, an
          undocumented but functioning convention. Tightening the validation as planned would have
          started rejecting every one of that partner's requests. Parcelly instead explicitly
          documented and supported <code>0</code> as a valid "unknown" sentinel before tightening
          the rest of the range.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a gate: an additive change like adding a field passes through freely, while a breaking change like removing a field is stopped and requires a version bump instead.">
          <rect className="box" x="10" y="15" width="100" height="26" rx="5" />
          <text x="60" y="32" className="boxText" style={{fontSize:"6px"}}>add a field</text>
          <rect className="boxWarn" x="10" y="65" width="100" height="26" rx="5" />
          <text x="60" y="82" className="boxText" style={{fontSize:"6px"}}>remove a field</text>
          <rect className="boxAccent" x="160" y="35" width="100" height="40" rx="8" />
          <text x="210" y="59" className="boxText" style={{fontSize:"6.5px"}}>Gate</text>
          <line className="flow" x1="110" y1="28" x2="158" y2="48" />
          <line className="flowMuted" x1="110" y1="78" x2="158" y2="62" />
          <rect className="box" x="310" y="35" width="90" height="26" rx="5" />
          <text x="355" y="52" className="boxText" style={{fontSize:"6px"}}>ships freely</text>
          <line className="flow" x1="260" y1="50" x2="308" y2="48" />
        </svg>
        <figcaption>An additive change passes through untouched; a breaking one gets stopped at the gate and needs a version bump instead.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming a change is safe because it looks like a bug fix, without checking real traffic
          for anyone relying on the old behavior, is the most common way teams accidentally ship a
          breaking change. The opposite mistake is being so cautious that ordinary maintenance
          &mdash; like reordering JSON fields for readability, which changes nothing a correctly
          written client depends on &mdash; gets treated as risky, adding unnecessary process to
          changes that were never breaking in the first place.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did tightening weight_kg validation turn out to be a breaking change in practice, even though the new rule looked like a reasonable bug fix in isolation?</p>
        </div>
      </section>
      <p className="takeaway">
        "Looks like a bug fix" and "is backward compatible" are different questions &mdash; the
        only way to really answer the second one is to check what real traffic is actually doing
        today, not just what the documentation says it should be doing.
      </p>
    </div>
  );
}
