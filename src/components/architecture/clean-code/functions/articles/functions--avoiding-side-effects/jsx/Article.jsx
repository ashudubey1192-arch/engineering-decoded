import "../css/Article.css";

export default function FunctionsAvoidingSideEffectsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A side effect is anything a function does beyond returning a value: mutating an
          argument, writing to a shared variable, calling the network. Side effects are
          sometimes necessary, but an undocumented one is one of the most common sources of
          bugs that are hard to reproduce.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Hidden vs. declared side effects</b> &mdash; a function named <code>validateInvoice()</code> that also silently fixes a bad field has a hidden side effect; renaming it to <code>validateAndNormalizeInvoice()</code> makes the same effect declared.</li>
          <li><b>Temporal coupling</b> &mdash; a side effect can create an invisible requirement that functions be called in a specific order, which nothing in the code enforces or documents.</li>
          <li><b>Shared mutable state is the riskiest kind</b> &mdash; a side effect confined to a function's own argument is easier to reason about than one that reaches into a global or module-level variable.</li>
          <li><b>Isolate side effects at the edges</b> &mdash; keeping the core logic (calculations, decisions) side-effect-free and pushing side effects (saving, emailing, logging) to the boundaries makes the core trivially testable.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A password-style bug pattern shows up often with invoices: a "check" function that
          quietly changes state.
        </p>
        <span className="codeLabel">HIDDEN SIDE EFFECT</span>
        <div className="codeBlock">
          <pre>{`function isValidForSubmission(invoice) {
  if (!invoice.customer) return false;
  if (invoice.lineItems.length === 0) return false;
  invoice.validatedAt = new Date(); // surprise: this is a "checker" that writes
  return true;
}
// two engineers, months apart, both assume this is read-only:
if (isValidForSubmission(draftInvoice)) { /* ...preview logic runs this too, unintentionally stamping drafts */ }`}</pre>
        </div>
        <span className="codeLabel">SIDE EFFECT MADE EXPLICIT</span>
        <div className="codeBlock">
          <pre>{`function isValidForSubmission(invoice) {
  if (!invoice.customer) return false;
  if (invoice.lineItems.length === 0) return false;
  return true; // pure — safe to call from anywhere, any number of times
}
function markValidated(invoice) {
  invoice.validatedAt = new Date(); // the mutation now has its own explicit call
}
// call site makes both steps visible:
if (isValidForSubmission(invoice)) markValidated(invoice);`}</pre>
        </div>
        <p>
          The preview code that only wanted to check validity, not stamp anything, can now call
          <code>isValidForSubmission()</code> safely as many times as it wants.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a validity check function with a hidden write buried inside it, called safely by one caller expecting only a boolean, but silently corrupting state for a second caller that did not expect the write.">
          <rect className="boxWarn" x="150" y="10" width="120" height="26" rx="5" /><text x="210" y="27" className="boxText" style={{fontSize:"5px"}}>isValid (+ hidden write)</text>
          <rect className="box" x="20" y="65" width="140" height="28" rx="4" /><text x="90" y="80" className="boxText" style={{fontSize:"4.5px"}}>Submission flow</text><text x="90" y="89" className="boxText" style={{fontSize:"4.5px"}}>(expects the write)</text>
          <rect className="boxWarn" x="260" y="65" width="140" height="28" rx="4" /><text x="330" y="80" className="boxText" style={{fontSize:"4.5px"}}>Preview flow</text><text x="330" y="89" className="boxText" style={{fontSize:"4.5px"}}>(doesn't expect it — corrupted)</text>
          <line className="flow" x1="180" y1="36" x2="90" y2="63" />
          <line className="flow" x1="240" y1="36" x2="330" y2="63" />
        </svg>
        <figcaption>One hidden side effect, two callers with different assumptions &mdash; only one of them gets the behavior it expected.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Removing all side effects everywhere is neither possible nor desirable &mdash; software
          has to save data, send emails, and write logs somewhere. The goal is making side
          effects visible (through naming and function boundaries) and concentrated at the
          edges of the system, not eliminating them entirely.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the preview flow get corrupted state even though it never called anything explicitly named "write" or "save"?</p>
        </div>
      </section>
      <p className="takeaway">
        A side effect is not inherently wrong &mdash; an undeclared one is. Name functions honestly
        about what they change, and keep the side-effect-free core of your logic separate from
        the parts that touch the outside world.
      </p>

    </div>
  );
}
