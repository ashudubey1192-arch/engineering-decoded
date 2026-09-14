import "../css/Article.css";

export default function ErrorHandlingExceptionsOverErrorCodesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Returning an error code forces every single caller to remember to check it. An
          exception, by contrast, propagates automatically until something explicitly handles
          it &mdash; which means a forgotten check fails loudly instead of silently.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Error codes are opt-in</b> &mdash; nothing forces a caller to check a returned status code; ignoring it compiles and runs fine, right up until the ignored failure causes damage somewhere downstream.</li>
          <li><b>Exceptions are opt-out</b> &mdash; an uncaught exception stops execution (or reaches a top-level handler) instead of silently continuing with bad state.</li>
          <li><b>Separates happy path from error path</b> &mdash; error codes force every call site to interleave "did it work?" checks with normal logic; exceptions let the normal logic read linearly, with errors handled separately (see Error Handling in Functions).</li>
          <li><b>Not free</b> &mdash; exceptions have their own cost: they can be used to control ordinary flow (an anti-pattern), and in some languages carry a real performance cost when thrown frequently. Use them for genuinely exceptional, not routine, outcomes.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's original payment code used a status code that three call sites forgot to
          check:
        </p>
        <span className="codeLabel">ERROR CODE: EASY TO FORGET</span>
        <div className="codeBlock">
          <pre>{`function chargeCard(invoice) {
  const result = gateway.charge(invoice.total);
  return result.code; // 0 = success, 1 = declined, 2 = network error
}
// call site — forgot to check the code:
chargeCard(invoice);
markInvoicePaid(invoice); // runs even if the charge failed!`}</pre>
        </div>
        <span className="codeLabel">EXCEPTION: IMPOSSIBLE TO SILENTLY IGNORE</span>
        <div className="codeBlock">
          <pre>{`function chargeCard(invoice) {
  const result = gateway.charge(invoice.total);
  if (result.status !== "approved") {
    throw new PaymentDeclinedError(invoice.id, result.status);
  }
}
// call site — a forgotten catch means the program stops here, visibly,
// instead of quietly marking a failed invoice as paid:
chargeCard(invoice);
markInvoicePaid(invoice); // never reached if chargeCard threw
`}</pre>
        </div>
        <p>
          The exception version cannot silently continue past a failed charge &mdash; either the
          caller explicitly handles <code>PaymentDeclinedError</code>, or the program stops
          loudly instead of marking an unpaid invoice as paid.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram comparing an error code that a caller can silently ignore and continue past, versus an exception that interrupts normal execution and forces some level of the call stack to handle it.">
          <rect className="box" x="20" y="15" width="110" height="24" rx="4" /><text x="75" y="31" className="boxText" style={{fontSize:"5px"}}>chargeCard()</text>
          <rect className="boxWarn" x="170" y="15" width="110" height="24" rx="4" /><text x="225" y="31" className="boxText" style={{fontSize:"4.5px"}}>ignored error code</text>
          <rect className="boxWarn" x="320" y="15" width="90" height="24" rx="4" /><text x="365" y="31" className="boxText" style={{fontSize:"4.5px"}}>bad state continues</text>
          <line className="flow" x1="130" y1="27" x2="168" y2="27" />
          <line className="flow" x1="280" y1="27" x2="318" y2="27" />
          <rect className="box" x="20" y="65" width="110" height="24" rx="4" /><text x="75" y="81" className="boxText" style={{fontSize:"5px"}}>chargeCard()</text>
          <rect className="boxAccent" x="170" y="65" width="110" height="24" rx="4" /><text x="225" y="81" className="boxText" style={{fontSize:"4.5px"}}>thrown exception</text>
          <rect className="boxAccent" x="320" y="65" width="90" height="24" rx="4" /><text x="365" y="81" className="boxText" style={{fontSize:"4.5px"}}>execution stops</text>
          <line className="flow" x1="130" y1="77" x2="168" y2="77" />
          <line className="flow" x1="280" y1="77" x2="318" y2="77" />
        </svg>
        <figcaption>An error code can be silently stepped over; an exception forces the failure to be dealt with, one way or another.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using exceptions for routine, expected outcomes &mdash; throwing on "item not found" in a
          lookup that is expected to miss often &mdash; turns normal control flow into exception
          handling, which is usually slower and harder to follow than a simple return value.
          Reserve exceptions for genuinely exceptional failures, not everyday branching.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the error-code version of chargeCard allow an invoice to be marked paid even after a declined charge, while the exception version could not?</p>
        </div>
      </section>
      <p className="takeaway">
        An error code relies on every caller remembering to check it; an exception cannot be
        silently ignored &mdash; reserve exceptions for genuine failures, and let them make those
        failures impossible to accidentally step over.
      </p>

    </div>
  );
}
