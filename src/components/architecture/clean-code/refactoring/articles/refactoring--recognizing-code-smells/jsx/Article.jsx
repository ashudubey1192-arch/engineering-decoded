import "../css/Article.css";

export default function RefactoringRecognizingCodeSmellsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A code smell is a surface signal that something may be wrong beneath &mdash; not a bug
          itself, but a pattern correlated with deeper design problems. Recognizing the common
          ones is what turns "this code feels off" into "this is Feature Envy, and here's the
          fix."
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>A smell is a symptom, not a diagnosis</b> &mdash; it points toward a likely problem, not a certain one; judgment still decides whether it's worth fixing.</li>
          <li><b>Common smells have names</b> &mdash; Long Method, Duplicated Code, Long Parameter List, Feature Envy (a method more interested in another class's data than its own), Shotgun Surgery (one change requires edits across many classes).</li>
          <li><b>Smells accumulate gradually</b> &mdash; no single change introduces one; each small compromise adds a little.</li>
          <li><b>Recognizing a smell is a trigger to consider a refactoring</b> &mdash; not an automatic verdict that the code must change immediately.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>InvoiceService</code> reaching repeatedly into a customer's internals
          &mdash; a classic case of Feature Envy:
        </p>
        <span className="codeLabel">FEATURE ENVY</span>
        <div className="codeBlock">
          <pre>{`class InvoiceService {
  processInvoice(invoice) {
    const zone = invoice.customer.address.region.taxZone; // reaches through 3 objects
    const rate = invoice.customer.address.region.taxZone.currentRate; // reaches through 4
    return invoice.subtotal * rate;
  }
}
// InvoiceService is more interested in Customer's internals than its own`}</pre>
        </div>
        <span className="codeLabel">SYMPTOM ADDRESSED (SEE LAW OF DEMETER, EXTRACT METHOD)</span>
        <div className="codeBlock">
          <pre>{`class InvoiceService {
  processInvoice(invoice) {
    const rate = invoice.customer.currentTaxRate(); // Customer exposes what callers need
    return invoice.subtotal * rate;
  }
}`}</pre>
        </div>
        <p>
          The smell &mdash; reaching through several objects to get one value &mdash; pointed straight
          at the fix: ask <code>Customer</code> for what you need, instead of walking its
          internals.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of common code smell names shown as labeled tiles: Long Method, Feature Envy, Shotgun Surgery, Duplicated Code, and Long Parameter List.">
          <rect className="boxWarn" x="10" y="15" width="95" height="26" rx="5" /><text x="57" y="32" className="boxText" style={{fontSize:"4.2px"}}>Long Method</text>
          <rect className="boxWarn" x="115" y="15" width="95" height="26" rx="5" /><text x="162" y="32" className="boxText" style={{fontSize:"4.2px"}}>Feature Envy</text>
          <rect className="boxWarn" x="220" y="15" width="100" height="26" rx="5" /><text x="270" y="32" className="boxText" style={{fontSize:"4.2px"}}>Shotgun Surgery</text>
          <rect className="boxWarn" x="330" y="15" width="80" height="26" rx="5" /><text x="370" y="32" className="boxText" style={{fontSize:"3.8px"}}>Duplicated Code</text>
          <rect className="boxWarn" x="115" y="55" width="130" height="26" rx="5" /><text x="180" y="72" className="boxText" style={{fontSize:"3.8px"}}>Long Parameter List</text>
          <text x="210" y="95" className="figHint" style={{fontSize:"4.2px"}}>each a symptom worth investigating, not a verdict</text>
        </svg>
        <figcaption>A short catalog of common smells &mdash; recognizable patterns that usually point toward a specific refactoring.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating every instance of a named smell as an automatic must-fix, even when the
          "smelly" code is simple, stable, rarely touched, and causing no real pain, burns time
          chasing smells for their own sake rather than for any proportional benefit.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is reaching through invoice.customer.address.region.taxZone repeatedly, instead of asking Customer for its tax rate directly, an example of Feature Envy?</p>
        </div>
      </section>
      <p className="takeaway">
        Learn the common smells as a vocabulary for spotting likely trouble, then use judgment
        about whether a given instance is worth fixing &mdash; a smell is a prompt to look closer,
        not a verdict.
      </p>

    </div>
  );
}
