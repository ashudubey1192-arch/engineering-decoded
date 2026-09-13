import "../css/Article.css";

export default function SolidPrinciplesSingleResponsibilityPrincipleArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A class should have exactly one reason to change &mdash; one responsibility, answering
          to one actor or concern. It's the first SOLID principle because most of the others
          become easier once this one is respected.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          &ldquo;One responsibility&rdquo; doesn&rsquo;t mean &ldquo;one method&rdquo; &mdash; a
          class can have many methods and still answer to a single concern. The test is whether
          the class would need to change for more than one unrelated reason: if pricing logic,
          print formatting, and storage format each independently might change, and all three live
          in the same class, that class has three reasons to change, not one.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          An <code>Invoice</code> class that calculates totals, formats itself for printing, and
          saves itself to a database has three separate reasons to change: a new tax rule, a new
          print layout, a new storage backend &mdash; each touches the same class. Splitting it
          into <code>Invoice</code> (data and calculation), <code>InvoicePrinter</code>, and
          <code>InvoiceRepository</code> means each class now changes for exactly one of those
          reasons, and changing the print layout can never accidentally break the tax calculation.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of one overloaded Invoice class handling calculation, printing, and storage, splitting into three focused classes each responsible for one concern." >
          <rect className="boxWarn" x="20" y="35" width="140" height="50" rx="8" /><text x="90" y="55" className="boxText" style={{fontSize:"7.5px"}}>Invoice</text><text x="90" y="70" className="figHint" style={{fontSize:"6.5px"}}>calc + print + save</text>
          <line className="flow" x1="160" y1="60" x2="200" y2="60" />
          <rect className="boxAccent" x="205" y="15" width="90" height="24" rx="5" /><text x="250" y="31" className="boxText" style={{fontSize:"6.5px"}}>Invoice</text>
          <rect className="boxAccent" x="205" y="48" width="90" height="24" rx="5" /><text x="250" y="64" className="boxText" style={{fontSize:"6.5px"}}>InvoicePrinter</text>
          <rect className="boxAccent" x="205" y="81" width="90" height="24" rx="5" /><text x="250" y="97" className="boxText" style={{fontSize:"6.5px"}}>InvoiceRepository</text>
        </svg>
        <figcaption>One class with three reasons to change splits into three classes, each with exactly one.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Confusing &ldquo;one responsibility&rdquo; with &ldquo;one method&rdquo; leads to
          needless splitting of classes that already had a single, cohesive concern spread across
          several related methods. Splitting so finely that a trivial concept requires five
          collaborating classes is the opposite overcorrection, and adds more ceremony than the
          problem calls for.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an Invoice class that calculates, prints, and saves itself have three reasons to change instead of one?</p>
        </div>
      </section>
      <p className="takeaway">
        Ask whether a class would need to change for more than one unrelated reason &mdash; that's
        the real test for single responsibility, not how many methods it has.
      </p>
    </div>
  );
}
