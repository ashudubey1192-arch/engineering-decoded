import "../css/Article.css";

export default function ErrorHandlingWritingTryCatchBlocksArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A try/catch block is a contract: "this much code might fail, and here is exactly what
          happens if it does." A poorly scoped or poorly written one turns that contract into
          a vague promise that hides more than it reveals.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Keep the try block narrow</b> &mdash; wrapping ten unrelated lines in one try block makes it unclear which line could actually throw, and which specific failure the catch block is meant to handle.</li>
          <li><b>Catch specific exception types</b> &mdash; catching a broad base <code>Error</code> type risks silently swallowing an unrelated bug that happened to also throw, instead of only the failure you intended to handle.</li>
          <li><b>Never leave a catch block empty</b> &mdash; an empty catch discards the fact that something failed; at minimum, log it, and usually re-throw or handle it explicitly.</li>
          <li><b>Decide: recover, translate, or propagate</b> &mdash; every catch block should do one of three things on purpose: recover and continue, translate into a more meaningful error and re-throw, or let it propagate by not catching it at all.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A PDF export in Ledgerly, first with a catch block that hides real bugs, then fixed:
        </p>
        <span className="codeLabel">TOO BROAD, TOO SILENT</span>
        <div className="codeBlock">
          <pre>{`try {
  const invoice = repository.find(invoiceId);
  const pdf = renderPdf(invoice); // could throw for many unrelated reasons
  emailClient.send(customer.email, pdf); // could also throw
  invoice.pdfSentAt = new Date();
} catch (e) {
  // silently ignored — including a genuine bug in renderPdf()
}`}</pre>
        </div>
        <span className="codeLabel">NARROW, SPECIFIC, HONEST</span>
        <div className="codeBlock">
          <pre>{`const invoice = repository.find(invoiceId); // outside try — not expected to fail here

let pdf;
try {
  pdf = renderPdf(invoice);
} catch (renderError) {
  throw new InvoicePdfRenderError(invoice.id, { cause: renderError });
}

try {
  emailClient.send(invoice.customer.email, pdf);
  invoice.pdfSentAt = new Date();
} catch (deliveryError) {
  logger.warn("PDF generated but email delivery failed", { invoiceId: invoice.id });
  throw new PdfDeliveryError(invoice.id, { cause: deliveryError });
}`}</pre>
        </div>
        <p>
          The rewritten version tells the reader exactly which step can fail, gives each
          failure a specific, meaningful type, and makes it impossible for a bug in
          <code>renderPdf()</code> to disappear silently the way it did before.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of one wide try block wrapping three unrelated operations with a single silent catch, versus two narrow try blocks, each wrapping one operation with its own specific, named error type.">
          <rect className="boxWarn" x="20" y="15" width="380" height="30" rx="5" /><text x="210" y="34" className="boxText" style={{fontSize:"5px"}}>try { find + render + email } catch (silent)</text>
          <rect className="box" x="20" y="60" width="180" height="30" rx="5" /><text x="110" y="79" className="boxText" style={{fontSize:"4.5px"}}>try { render } catch (PdfRenderError)</text>
          <rect className="box" x="220" y="60" width="180" height="30" rx="5" /><text x="310" y="79" className="boxText" style={{fontSize:"4.5px"}}>try { email } catch (DeliveryError)</text>
        </svg>
        <figcaption>One wide, silent catch hides which step failed; two narrow, named catches make each failure specific and visible.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Logging an error and then continuing as if nothing happened &mdash; without re-throwing,
          returning a failure signal, or otherwise changing the flow &mdash; is a common half-measure.
          It looks like the error was handled because something got logged, but the program
          proceeds with the same broken state a truly silent catch would have left behind.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does narrowing a try block to wrap only one operation make a catch block's meaning clearer to a reader?</p>
        </div>
      </section>
      <p className="takeaway">
        Scope try blocks narrowly, catch specific exception types, and always do something
        deliberate in a catch block &mdash; recover, translate, or propagate &mdash; never let a
        failure vanish silently.
      </p>

    </div>
  );
}
