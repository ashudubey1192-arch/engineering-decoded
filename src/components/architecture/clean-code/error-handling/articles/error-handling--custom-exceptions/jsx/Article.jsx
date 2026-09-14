import "../css/Article.css";

export default function ErrorHandlingCustomExceptionsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A generic <code>Error("something went wrong")</code> tells a catch block nothing
          useful. A custom exception type turns a failure into structured information &mdash; what
          failed, why, and what data is relevant &mdash; that calling code can act on deliberately.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Name the failure, not just "an error"</b> &mdash; <code>PaymentDeclinedError</code> versus a generic <code>Error</code> tells both the reader and the calling code exactly what happened.</li>
          <li><b>Carry relevant context as data</b> &mdash; a custom exception can hold structured fields (which invoice, which gateway response code) instead of forcing that information into an unparseable message string.</li>
          <li><b>Group related exceptions with a hierarchy</b> &mdash; a shared base class like <code>PaymentError</code> lets a caller catch broadly ("any payment problem") or narrowly (<code>PaymentDeclinedError</code> specifically) depending on what it needs to do.</li>
          <li><b>Don't create a type for every possible failure</b> &mdash; a distinct exception type earns its place when callers actually need to handle it differently; otherwise it adds ceremony without adding value.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's payment flow, before and after custom exception types:
        </p>
        <span className="codeLabel">GENERIC, UNACTIONABLE</span>
        <div className="codeBlock">
          <pre>{`throw new Error("Payment failed");
// ...
try {
  chargeCard(invoice);
} catch (e) {
  // e.message is a string — can we retry? show the customer a message?
  // notify support? there's no way to tell without string-matching e.message
}`}</pre>
        </div>
        <span className="codeLabel">CUSTOM, ACTIONABLE</span>
        <div className="codeBlock">
          <pre>{`class PaymentError extends Error {}
class PaymentDeclinedError extends PaymentError {
  constructor(invoiceId, declineReason) {
    super(\`Payment declined for invoice \${invoiceId}: \${declineReason}\`);
    this.invoiceId = invoiceId;
    this.declineReason = declineReason;
    this.retryable = declineReason !== "insufficient_funds";
  }
}
try {
  chargeCard(invoice);
} catch (error) {
  if (error instanceof PaymentDeclinedError && error.retryable) {
    scheduleRetry(error.invoiceId);
  } else if (error instanceof PaymentDeclinedError) {
    notifyCustomer(error.invoiceId, error.declineReason);
  } else {
    throw error; // an unrelated error — don't pretend to handle it
  }
}`}</pre>
        </div>
        <p>
          The custom exception carries exactly the structured data the catch block needs to
          make a real decision &mdash; retry, notify, or propagate &mdash; instead of forcing that logic
          to parse an English sentence.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a generic error carrying only a message string, giving the catch block nothing to act on, versus a custom PaymentDeclinedError carrying structured fields, letting the catch block branch on retryable status directly.">
          <rect className="boxWarn" x="20" y="15" width="170" height="30" rx="5" /><text x="105" y="34" className="boxText" style={{fontSize:"4.5px"}}>Error("Payment failed")</text>
          <rect className="boxWarn" x="230" y="15" width="170" height="30" rx="5" /><text x="315" y="30" className="boxText" style={{fontSize:"4.5px"}}>catch: parse a string?</text><text x="315" y="40" className="boxText" style={{fontSize:"4.5px"}}>no real signal</text>
          <rect className="boxAccent" x="20" y="65" width="170" height="35" rx="5" /><text x="105" y="80" className="boxText" style={{fontSize:"4.5px"}}>PaymentDeclinedError</text><text x="105" y="92" className="boxText" style={{fontSize:"4.5px"}}>{"{ invoiceId, retryable }"}</text>
          <rect className="boxAccent" x="230" y="65" width="170" height="35" rx="5" /><text x="315" y="80" className="boxText" style={{fontSize:"4.5px"}}>catch: if (error.retryable)</text><text x="315" y="92" className="boxText" style={{fontSize:"4.5px"}}>scheduleRetry(...)</text>
        </svg>
        <figcaption>A structured exception gives the catch block real fields to branch on, instead of an opaque message to guess at.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Creating an overly deep or overly granular exception hierarchy &mdash; a distinct type for
          every single failure variant, several levels deep &mdash; adds maintenance overhead
          without adding value if nothing ever catches most of those types differently. Add a
          new exception type when a caller genuinely needs to handle that case differently, not
          preemptively.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why couldn't the catch block in the generic-error version reliably decide whether to retry the payment?</p>
        </div>
      </section>
      <p className="takeaway">
        A custom exception turns a failure into structured, actionable information &mdash; name it,
        give it relevant fields, and calling code can make real decisions instead of guessing
        from a message string.
      </p>

    </div>
  );
}
