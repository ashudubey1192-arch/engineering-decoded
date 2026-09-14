import "../css/Article.css";

export default function ErrorHandlingFailFastArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A system that fails fast raises an error the moment something is wrong &mdash; not several
          steps later, once bad data has already spread. The alternative, failing slowly, turns
          a five-minute bug into a multi-hour investigation.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Validate at the boundary</b> &mdash; check untrusted input (from a user, an API request, a file) as early as possible, before it enters the rest of the system.</li>
          <li><b>Assertions for "impossible" states</b> &mdash; a check that fails loudly if an internal invariant is somehow violated catches bugs immediately, at the point they happen, instead of downstream where the connection is no longer obvious.</li>
          <li><b>Distance between cause and symptom</b> &mdash; the further a bad value travels before causing a visible failure, the harder it is to trace back to its actual origin.</li>
          <li><b>Loud failure beats silent corruption</b> &mdash; a crash with a clear error message, right at the source, is a far better outcome than a program that keeps running on corrupted data.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A negative quantity entered a Ledgerly invoice through a bulk-import feature. Two
          different outcomes depending on where the check happened:
        </p>
        <span className="codeLabel">FAILS SLOWLY</span>
        <div className="codeBlock">
          <pre>{`function importLineItem(row) {
  return { description: row.desc, quantity: row.qty, unitPrice: row.price };
  // no validation — a negative quantity flows straight into the system
}
// six steps later, in an unrelated reporting module:
// "Monthly revenue report is $4,200 lower than expected" — nobody connects
// this to a CSV import from three days ago`}</pre>
        </div>
        <span className="codeLabel">FAILS FAST</span>
        <div className="codeBlock">
          <pre>{`function importLineItem(row) {
  if (row.qty <= 0) {
    throw new InvalidImportRowError(\`Line \${row.lineNumber}: quantity must be positive, got \${row.qty}\`);
  }
  if (row.price < 0) {
    throw new InvalidImportRowError(\`Line \${row.lineNumber}: price cannot be negative, got \${row.price}\`);
  }
  return { description: row.desc, quantity: row.qty, unitPrice: row.price };
}
// the import fails immediately, with the exact row and reason —
// fixed in the same CSV file within minutes`}</pre>
        </div>
        <p>
          The failing-slowly version does not avoid the bug &mdash; it just delays discovering it
          until the damage (an inaccurate revenue report, in this case) is much harder to trace
          back to its source.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of bad data entering a system and traveling through several steps before causing a visible symptom far from its source, versus bad data being rejected immediately at the point of entry, with cause and symptom in the same place.">
          <rect className="boxWarn" x="15" y="20" width="70" height="24" rx="4" /><text x="50" y="36" className="boxText" style={{fontSize:"4.5px"}}>Bad input</text>
          <rect className="box" x="105" y="20" width="60" height="24" rx="4" /><text x="135" y="36" className="boxText" style={{fontSize:"4.5px"}}>Step 2</text>
          <rect className="box" x="185" y="20" width="60" height="24" rx="4" /><text x="215" y="36" className="boxText" style={{fontSize:"4.5px"}}>Step 3</text>
          <rect className="boxWarn" x="265" y="20" width="140" height="24" rx="4" /><text x="335" y="36" className="boxText" style={{fontSize:"4.5px"}}>Symptom, far from cause</text>
          <line className="flowMuted" x1="85" y1="32" x2="103" y2="32" /><line className="flowMuted" x1="165" y1="32" x2="183" y2="32" /><line className="flowMuted" x1="245" y1="32" x2="263" y2="32" />
          <rect className="boxWarn" x="15" y="75" width="70" height="24" rx="4" /><text x="50" y="91" className="boxText" style={{fontSize:"4.5px"}}>Bad input</text>
          <rect className="boxAccent" x="105" y="75" width="150" height="24" rx="4" /><text x="180" y="91" className="boxText" style={{fontSize:"4.5px"}}>Rejected here, immediately</text>
          <line className="flow" x1="85" y1="87" x2="103" y2="87" />
        </svg>
        <figcaption>The same bad data, caught at the boundary versus discovered several steps and much distance later.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adding defensive checks everywhere, including deep inside internal functions that
          already trust their caller's contract, adds noise without adding safety. Fail fast at
          trust boundaries &mdash; where untrusted or unvalidated data enters &mdash; not redundantly at
          every internal function along the way.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the failing-slowly version make the revenue report bug much harder to trace back to its actual cause?</p>
        </div>
      </section>
      <p className="takeaway">
        Validate untrusted input at the boundary where it enters your system &mdash; the sooner bad
        data is rejected, the closer the error message stays to its actual cause.
      </p>

    </div>
  );
}
