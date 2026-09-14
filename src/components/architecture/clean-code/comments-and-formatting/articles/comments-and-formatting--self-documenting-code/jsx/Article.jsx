import "../css/Article.css";

export default function CommentsAndFormattingSelfDocumentingCodeArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Self-documenting code is code whose structure and names make a describing comment
          unnecessary. It is not a claim that comments are always bad &mdash; it is a design goal:
          write the code so clearly that a "what this does" comment would just repeat it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Extracted functions as documentation</b> &mdash; naming a block of logic by pulling it into a well-named function documents it more durably than a comment above the block would.</li>
          <li><b>Named constants replace explanatory comments</b> &mdash; <code>MAX_RETRY_ATTEMPTS</code> instead of <code>3 // max retries</code> puts the explanation where it cannot drift from the value.</li>
          <li><b>Types as documentation</b> &mdash; a well-named parameter type or return type tells the reader what shape of data to expect without a separate prose description.</li>
          <li><b>Tests as documentation</b> &mdash; a well-named test (covered in depth in Clean Tests) often explains intended behavior more reliably than a comment, because a failing test is impossible to ignore the way a stale comment is.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A block of Ledgerly logic, first explained with a comment, then rewritten to make the
          comment unnecessary:
        </p>
        <span className="codeLabel">COMMENT EXPLAINING UNCLEAR CODE</span>
        <div className="codeBlock">
          <pre>{`// Check if invoice can be voided: must be unpaid, less than 24h old,
// and not already voided
function canModify(inv) {
  return inv.status !== "paid" &&
    (Date.now() - inv.createdAt) < 86400000 &&
    inv.status !== "voided";
}`}</pre>
        </div>
        <span className="codeLabel">SELF-DOCUMENTING, NO COMMENT NEEDED</span>
        <div className="codeBlock">
          <pre>{`const VOID_WINDOW_MS = 24 * 60 * 60 * 1000;

function canBeVoided(invoice) {
  const isUnpaid = invoice.status !== InvoiceStatus.PAID;
  const isNotAlreadyVoided = invoice.status !== InvoiceStatus.VOIDED;
  const isWithinVoidWindow = (Date.now() - invoice.createdAt) < VOID_WINDOW_MS;
  return isUnpaid && isNotAlreadyVoided && isWithinVoidWindow;
}`}</pre>
        </div>
        <p>
          The second version says everything the comment said &mdash; and unlike the comment, it
          cannot drift out of sync with the logic, because it <i>is</i> the logic.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of the same explanation existing in two places, a comment and the code, versus the explanation existing in exactly one place, the code itself, expressed through clear names.">
          <rect className="boxWarn" x="20" y="15" width="170" height="26" rx="4" /><text x="105" y="32" className="boxText" style={{fontSize:"4.5px"}}>Comment: "must be unpaid..."</text>
          <rect className="box" x="20" y="50" width="170" height="26" rx="4" /><text x="105" y="67" className="boxText" style={{fontSize:"4.5px"}}>Code: cryptic booleans</text>
          <text x="10" y="35" className="figHint" style={{fontSize:"6px"}}>2&#215;</text>
          <rect className="boxAccent" x="240" y="32" width="170" height="26" rx="4" /><text x="325" y="49" className="boxText" style={{fontSize:"4.5px"}}>Code: isUnpaid, isWithinVoidWindow...</text>
          <text x="220" y="48" className="figHint" style={{fontSize:"6px"}}>1&#215;</text>
        </svg>
        <figcaption>Explaining logic in both a comment and the code duplicates the explanation; clear names put it in exactly one place.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating "self-documenting" as license to remove every comment, including the ones
          explaining "why" rather than "what," throws away genuinely useful information. Self-documenting
          code replaces "what this does" comments; it does not replace "why this exists"
          comments, which still belong in the code (see When Comments Help).
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a well-named boolean variable more durable documentation than a comment describing the same condition?</p>
        </div>
      </section>
      <p className="takeaway">
        Aim to make "what does this do" comments unnecessary by naming things clearly enough
        that the code answers the question itself &mdash; that explanation cannot go stale, because
        it is not separate from the logic it describes.
      </p>

    </div>
  );
}
