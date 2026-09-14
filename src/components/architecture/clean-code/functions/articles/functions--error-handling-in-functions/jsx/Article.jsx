import "../css/Article.css";

export default function FunctionsErrorHandlingInFunctionsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Error handling and business logic compete for the reader's attention. A function that
          interleaves its happy path with every possible failure case is harder to follow than
          one that separates the two &mdash; even when both handle exactly the same failures.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Errors are a separate concern</b> &mdash; robert C. Martin's framing: a function that does its main job and also handles errors is doing two things, even though it looks like one function.</li>
          <li><b>Extract the try/catch body</b> &mdash; pulling the contents of a try block into its own well-named function keeps error-handling scaffolding from crowding out the actual logic.</li>
          <li><b>Fail fast, close to the source</b> &mdash; validate inputs and raise errors as early as possible, rather than letting bad data travel deep into the call stack before something notices.</li>
          <li><b>Don't return null to signal failure</b> &mdash; a null return forces every caller to remember to check for it; an exception (covered in depth in Error Handling) or a result type makes the failure impossible to silently ignore.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Charging a customer's card, with error handling tangled into the main flow versus
          separated out:
        </p>
        <span className="codeLabel">TANGLED</span>
        <div className="codeBlock">
          <pre>{`function chargeInvoice(invoice) {
  try {
    const result = paymentGateway.charge(invoice.customer.cardToken, invoice.total);
    if (result.status === "declined") {
      invoice.status = "payment_failed";
      notifyCustomer(invoice, "Your card was declined.");
      return false;
    }
    invoice.status = "paid";
    invoice.paidAt = new Date();
    return true;
  } catch (networkError) {
    invoice.status = "payment_error";
    notifyOpsTeam(networkError);
    return false;
  }
}`}</pre>
        </div>
        <span className="codeLabel">SEPARATED</span>
        <div className="codeBlock">
          <pre>{`function chargeInvoice(invoice) {
  try {
    return processCharge(invoice);
  } catch (networkError) {
    return handleChargeError(invoice, networkError);
  }
}
function processCharge(invoice) {
  const result = paymentGateway.charge(invoice.customer.cardToken, invoice.total);
  return result.status === "declined" ? handleDeclined(invoice) : markPaid(invoice);
}
function markPaid(invoice) {
  invoice.status = "paid";
  invoice.paidAt = new Date();
  return true;
}
function handleDeclined(invoice) {
  invoice.status = "payment_failed";
  notifyCustomer(invoice, "Your card was declined.");
  return false;
}
function handleChargeError(invoice, error) {
  invoice.status = "payment_error";
  notifyOpsTeam(error);
  return false;
}`}</pre>
        </div>
        <p>
          <code>chargeInvoice()</code> now reads as pure structure &mdash; try the charge, handle a
          network error &mdash; while every specific outcome has its own named, individually
          testable function.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a top level function containing only the try catch structure, delegating the happy path and each failure case to separate named functions, instead of interleaving all branches in one body.">
          <rect className="boxAccent" x="150" y="10" width="120" height="24" rx="4" /><text x="210" y="26" className="boxText" style={{fontSize:"5px"}}>chargeInvoice (try/catch)</text>
          <rect className="box" x="20" y="65" width="100" height="26" rx="4" /><text x="70" y="82" className="boxText" style={{fontSize:"4.5px"}}>markPaid</text>
          <rect className="box" x="135" y="65" width="100" height="26" rx="4" /><text x="185" y="82" className="boxText" style={{fontSize:"4.5px"}}>handleDeclined</text>
          <rect className="box" x="250" y="65" width="150" height="26" rx="4" /><text x="325" y="82" className="boxText" style={{fontSize:"4.5px"}}>handleChargeError</text>
          <line className="flow" x1="180" y1="34" x2="70" y2="63" />
          <line className="flow" x1="200" y1="34" x2="185" y2="63" />
          <line className="flow" x1="240" y1="34" x2="325" y2="63" />
        </svg>
        <figcaption>The top-level function shows only structure; every specific outcome (success, decline, network error) has its own name.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Swallowing exceptions silently &mdash; an empty <code>catch</code> block, or one that only
          logs without re-throwing or returning a clear failure signal &mdash; is a common shortcut
          that turns a visible failure into a silent one. If a function cannot recover from an
          error, it should propagate it, not hide it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does separating each outcome of chargeInvoice into its own function make the error-handling structure easier to verify by reading, compared to the tangled version?</p>
        </div>
      </section>
      <p className="takeaway">
        Treat error handling as its own responsibility &mdash; extract it into clearly named
        functions so the reader can see a function's structure and its specific failure
        handling as two separate, individually understandable things.
      </p>

    </div>
  );
}
