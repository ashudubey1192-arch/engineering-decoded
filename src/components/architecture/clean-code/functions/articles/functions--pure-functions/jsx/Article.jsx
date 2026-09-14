import "../css/Article.css";

export default function FunctionsPureFunctionsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A pure function's output depends only on its inputs, and calling it changes nothing
          about the world. Pure functions are the easiest kind of code to test, reason about,
          reuse, and run in parallel &mdash; which makes them worth reaching for by default.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Same input, same output, always</b> &mdash; a pure <code>calculateTax(amount, rate)</code> returns the identical result every time given the same two arguments, with no dependency on the clock, a database, or global state.</li>
          <li><b>No observable side effects</b> &mdash; a pure function does not mutate its arguments, write to disk, make network calls, or modify anything outside its own scope.</li>
          <li><b>Trivial to test</b> &mdash; a pure function needs no mocks, no setup, and no teardown; assert on its return value for a given input and you are done.</li>
          <li><b>Push impurity to the edges</b> &mdash; keep the core of your business logic pure, and confine unavoidable impurity (the current time, the database, the network) to a thin layer at the boundary that calls into the pure core.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's overdue check originally depended directly on the system clock, making it
          untestable without manipulating real time:
        </p>
        <span className="codeLabel">IMPURE</span>
        <div className="codeBlock">
          <pre>{`function isOverdue(invoice) {
  return Date.now() > invoice.dueAt; // hidden dependency on "now"
}
// testing this requires mocking the global clock`}</pre>
        </div>
        <span className="codeLabel">PURE</span>
        <div className="codeBlock">
          <pre>{`function isOverdue(invoice, currentTime) {
  return currentTime > invoice.dueAt; // "now" is an explicit input
}
// call site supplies the impure part once, at the edge:
isOverdue(invoice, Date.now());
// tests supply any time they like, with zero mocking:
isOverdue(invoice, new Date("2026-01-01"));`}</pre>
        </div>
        <p>
          The logic did not get more complex &mdash; the one impure dependency (the current time)
          simply moved from being hidden inside the function to being an explicit, visible
          argument. Every test can now pass in whatever "now" it needs directly.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a pure core of business logic surrounded by a thin impure boundary layer that supplies the current time, database reads, and network calls as explicit inputs, keeping the core testable without mocks.">
          <circle className="boxAccent" cx="210" cy="58" r="45" /><text x="210" y="55" className="boxText" style={{fontSize:"5.5px"}}>Pure core</text><text x="210" y="65" className="boxText" style={{fontSize:"5.5px"}}>isOverdue(invoice, time)</text>
          <rect className="box" x="10" y="10" width="80" height="22" rx="4" /><text x="50" y="25" className="boxText" style={{fontSize:"4.5px"}}>Date.now()</text>
          <rect className="box" x="330" y="10" width="80" height="22" rx="4" /><text x="370" y="25" className="boxText" style={{fontSize:"4.5px"}}>Database</text>
          <rect className="box" x="170" y="90" width="80" height="18" rx="4" /><text x="210" y="102" className="boxText" style={{fontSize:"4.5px"}}>Tests: fixed time</text>
          <line className="flow" x1="90" y1="22" x2="175" y2="35" />
          <line className="flow" x1="330" y1="22" x2="245" y2="35" />
          <line className="flow" x1="210" y1="90" x2="210" y2="103" />
        </svg>
        <figcaption>The impure dependency (the clock) becomes an explicit input at the boundary; the core stays pure and trivially testable.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Trying to make every function in a system pure is not realistic &mdash; something has to
          eventually read the clock, hit the database, and send the email. The mistake is
          impurity spreading unnecessarily deep into logic that could have stayed pure; the fix
          is threading the impure values in as arguments, as shown above, not eliminating
          impurity altogether.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does passing currentTime as an explicit argument make isOverdue easier to test than reading Date.now() directly inside the function?</p>
        </div>
      </section>
      <p className="takeaway">
        Push impurity &mdash; the clock, the network, the database &mdash; to the edges of your system,
        and keep as much of your actual logic as possible pure: same input, same output,
        nothing hidden.
      </p>

    </div>
  );
}
