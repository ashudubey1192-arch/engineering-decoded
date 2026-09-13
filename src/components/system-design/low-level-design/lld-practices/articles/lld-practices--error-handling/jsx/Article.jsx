import "../css/Article.css";

export default function LldPracticesErrorHandlingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          How a class handles failure is a design decision, not an afterthought &mdash; deciding
          which layer validates input, and whether a failure is an exception or a value the caller
          checks, is part of the class's contract just as much as its normal-case methods are.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Exceptions suit failures that are truly exceptional &mdash; rare, unexpected, and usually
          unrecoverable at the point they're thrown. Failures that are routine and expected as part
          of normal operation are often clearer as an explicit return value (a Result type, or a
          boolean plus a reason) that the caller must actively check, rather than an exception it
          might forget to catch.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>withdrawFunds(amount)</code> method: insufficient balance happens routinely and
          is entirely expected, so returning a <code>Result</code> (success or a specific failure
          reason) forces the caller to explicitly handle the case where the withdrawal didn't go
          through. A genuinely exceptional failure &mdash; the underlying database connection
          dropping mid-transaction &mdash; is a better fit for a thrown exception, since it's not
          something normal calling code is expected to routinely check for.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of two failure paths: a thrown exception unwinding the call stack for a truly exceptional failure, versus a Result return value the caller must explicitly check for a routine, expected failure." >
          <rect className="box" x="20" y="15" width="170" height="26" rx="5" /><text x="105" y="32" className="boxText" style={{fontSize:"7px"}}>withdrawFunds(): DB connection drops</text>
          <line className="flowMuted" x1="105" y1="41" x2="105" y2="65" /><text x="120" y="55" className="figHint" style={{fontSize:"6.5px"}}>throws</text>
          <rect className="boxWarn" x="45" y="70" width="120" height="24" rx="5" /><text x="105" y="86" className="boxText" style={{fontSize:"6.5px"}}>unwinds the stack</text>
          <line className="divider" x1="220" y1="10" x2="220" y2="100" />
          <rect className="box" x="240" y="15" width="160" height="26" rx="5" /><text x="320" y="32" className="boxText" style={{fontSize:"7px"}}>withdrawFunds(): insufficient balance</text>
          <line className="flow" x1="320" y1="41" x2="320" y2="65" /><text x="345" y="55" className="figHint" style={{fontSize:"6.5px"}}>returns Result</text>
          <rect className="boxAccent" x="255" y="70" width="130" height="24" rx="5" /><text x="320" y="86" className="boxText" style={{fontSize:"6.5px"}}>caller checks explicitly</text>
        </svg>
        <figcaption>A truly exceptional failure unwinds the stack; a routine, expected failure is a value the caller must actively check.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using exceptions for routine, expected control flow is expensive and easy for a caller to
          accidentally not catch. Catching a broad exception type and just logging it &mdash;
          without re-throwing or otherwise surfacing it &mdash; hides real failures from callers who
          actually needed to react to them.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might insufficient balance be a better fit for a returned Result than a thrown exception?</p>
        </div>
      </section>
      <p className="takeaway">
        Reserve exceptions for truly exceptional, rare failures; make routine, expected outcomes an
        explicit value the caller has to check.
      </p>
    </div>
  );
}
