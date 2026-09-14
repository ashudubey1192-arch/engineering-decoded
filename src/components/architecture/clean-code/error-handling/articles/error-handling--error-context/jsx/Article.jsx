import "../css/Article.css";

export default function ErrorHandlingErrorContextArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          "Something went wrong" is technically an error message. It is also useless at 2am
          when you are trying to figure out which of ten thousand invoices caused a crash. A
          good error message answers the next three questions the reader will have.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Include identifying data</b> &mdash; which invoice, which customer, which request &mdash; concrete IDs that let someone jump straight to the relevant record instead of searching for it.</li>
          <li><b>State what was expected vs. what happened</b> &mdash; "expected a positive amount, got -50" is far more actionable than "invalid amount."</li>
          <li><b>Preserve the original cause</b> &mdash; when translating a low-level error into a higher-level one (see Custom Exceptions), keep the original error attached (many languages support an explicit "caused by" chain) instead of discarding it.</li>
          <li><b>Write for whoever debugs this at 2am</b> &mdash; often not the original author, with no memory of this code &mdash; and often without easy access to ask questions.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          The same failure in Ledgerly, logged two different ways:
        </p>
        <span className="codeLabel">NO CONTEXT</span>
        <div className="codeBlock">
          <pre>{`throw new Error("Payment failed");
// on-call engineer sees this in the logs at 2am with no other information:
// Error: Payment failed
//     at chargeCard (payment.js:42)
// ...and has no way to know which invoice, which customer, or why`}</pre>
        </div>
        <span className="codeLabel">RICH CONTEXT</span>
        <div className="codeBlock">
          <pre>{`throw new PaymentDeclinedError({
  invoiceId: invoice.id,
  customerId: invoice.customer.id,
  amountCents: invoice.total,
  gatewayCode: result.code,
  gatewayMessage: result.message,
  cause: originalGatewayError,
});
// on-call engineer sees:
// PaymentDeclinedError: invoice inv_8821, customer cust_4402,
// amount 12000 cents, gateway code "insufficient_funds"
// caused by: NetworkTimeoutError at gateway-client.js:88`}</pre>
        </div>
        <p>
          The second version turns a 2am investigation that might have started with "grep the
          logs for anything invoice-related in the last hour" into "open invoice inv_8821
          directly" &mdash; the difference between minutes and an hour of debugging.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a bare error message forcing an on-call engineer to search broadly through logs and records to find the relevant invoice, versus a context-rich error message pointing directly at the specific invoice, customer, and cause.">
          <rect className="boxWarn" x="20" y="15" width="150" height="26" rx="4" /><text x="95" y="32" className="boxText" style={{fontSize:"4.5px"}}>"Payment failed"</text>
          <rect className="boxWarn" x="220" y="15" width="180" height="26" rx="4" /><text x="310" y="32" className="boxText" style={{fontSize:"4.5px"}}>Broad search across all invoices</text>
          <line className="flow" x1="170" y1="28" x2="218" y2="28" />
          <rect className="boxAccent" x="20" y="60" width="150" height="26" rx="4" /><text x="95" y="72" className="boxText" style={{fontSize:"4.5px"}}>invoiceId, customerId,</text><text x="95" y="82" className="boxText" style={{fontSize:"4.5px"}}>gateway code, cause</text>
          <rect className="boxAccent" x="220" y="60" width="180" height="26" rx="4" /><text x="310" y="77" className="boxText" style={{fontSize:"4.5px"}}>Direct jump to inv_8821</text>
          <line className="flow" x1="170" y1="73" x2="218" y2="73" />
        </svg>
        <figcaption>Identifying context in the error message turns a broad investigation into a direct lookup.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Including sensitive data &mdash; full card numbers, passwords, tokens &mdash; in error messages
          or logs to make debugging easier trades one problem for a worse one. Include
          identifying, non-sensitive context (IDs, codes, timestamps); redact or omit anything
          that would be a security or privacy issue if it ended up in a log file.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does preserving the original "caused by" error, rather than discarding it when translating to a higher-level exception, matter for debugging?</p>
        </div>
      </section>
      <p className="takeaway">
        Write error messages for the person debugging them at 2am with no other context &mdash;
        concrete IDs, an expected-versus-actual comparison, and the original cause turn a
        vague failure into a direct lead.
      </p>

    </div>
  );
}
