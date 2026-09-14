import "../css/Article.css";

export default function CleanCodeFoundationsReadabilityAndMaintainabilityArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Code is read far more often than it is written &mdash; every time someone debugs it, reviews
          it, extends it, or just tries to understand it before touching something nearby.
          Optimizing for the writer's convenience at the reader's expense is a bad trade almost
          every time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>The read-to-write ratio</b> &mdash; a piece of code is typically written once and read many times over its life, by its author and everyone who comes after.</li>
          <li><b>Maintainability follows readability</b> &mdash; code that is hard to read is hard to safely change, because the reader cannot build an accurate mental model of what it does.</li>
          <li><b>Optimize for scanning, not just parsing</b> &mdash; a reader usually skims first to build context, then reads closely where it matters; structure that supports skimming (small functions, clear names) helps both passes.</li>
          <li><b>Consistency reduces cognitive load</b> &mdash; a reader who has learned one part of a codebase's conventions should be able to reuse that knowledge everywhere else in it.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A new engineer joins Ledgerly and needs to fix a bug: invoices sometimes show the
          wrong due date. They open <code>invoice-utils.js</code> and find this:
        </p>
        <span className="codeLabel">HARD TO SCAN</span>
        <div className="codeBlock">
          <pre>{`function upd(i,d,f){if(f){i.d=addDays(i.issuedAt,d);}else{i.d=d;}return i;}`}</pre>
        </div>
        <p>
          To understand this one line, the reader has to mentally expand every abbreviation,
          infer what the boolean flag <code>f</code> switches between, and hold all of that in
          working memory simultaneously. Rewritten for readability:
        </p>
        <span className="codeLabel">SCANNABLE</span>
        <div className="codeBlock">
          <pre>{`function setInvoiceDueDate(invoice, paymentTermsInDays, useIssueDateAsAnchor) {
  invoice.dueAt = useIssueDateAsAnchor
    ? addDays(invoice.issuedAt, paymentTermsInDays)
    : paymentTermsInDays;
  return invoice;
}`}</pre>
        </div>
        <p>
          The second version still has a real problem &mdash; the parameter name suggests a day
          count, but the non-anchor branch treats it as a date, which is itself a bug waiting to
          happen. That problem was invisible in the first version and obvious in the second.
          Readable code does not just look nicer; it surfaces bugs that unreadable code hides.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of one write event followed by many read events over a function's lifetime: written once by its author, then read repeatedly during review, debugging, and future changes.">
          <rect className="boxAccent" x="20" y="40" width="70" height="30" rx="5" /><text x="55" y="59" className="boxText" style={{fontSize:"5.5px"}}>Written once</text>
          <rect className="box" x="140" y="10" width="70" height="26" rx="5" /><text x="175" y="27" className="boxText" style={{fontSize:"5px"}}>Code review</text>
          <rect className="box" x="140" y="42" width="70" height="26" rx="5" /><text x="175" y="59" className="boxText" style={{fontSize:"5px"}}>Debugging</text>
          <rect className="box" x="140" y="74" width="70" height="26" rx="5" /><text x="175" y="91" className="boxText" style={{fontSize:"5px"}}>Future changes</text>
          <rect className="box" x="290" y="42" width="110" height="26" rx="5" /><text x="345" y="59" className="boxText" style={{fontSize:"5px"}}>Read N times over</text>
          <line className="flow" x1="90" y1="55" x2="138" y2="23" />
          <line className="flow" x1="90" y1="55" x2="138" y2="55" />
          <line className="flow" x1="90" y1="55" x2="138" y2="87" />
          <line className="flowMuted" x1="210" y1="23" x2="288" y2="50" />
          <line className="flowMuted" x1="210" y1="55" x2="288" y2="55" />
          <line className="flowMuted" x1="210" y1="87" x2="288" y2="60" />
        </svg>
        <figcaption>One write event feeds many read events &mdash; readability cost paid once, readability benefit collected repeatedly.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Equating "shorter" with "more readable" is a frequent mistake. Abbreviations, dense
          one-liners, and clever use of language features can all reduce line count while
          increasing the time it takes a reader to understand what is happening. Optimize for
          time-to-understanding, not character count.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did rewriting the due-date function for readability also expose a latent bug that the terse version had hidden?</p>
        </div>
      </section>
      <p className="takeaway">
        Because code gets read far more than it gets written, every minute spent making it
        easier to read is repaid many times over by everyone &mdash; including you &mdash; who reads it
        later.
      </p>

    </div>
  );
}
