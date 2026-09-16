export default function CreationalPatternsFactoryMethodArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Factory Method defines an interface for creating an object, but lets the decision of
          which concrete class to instantiate happen in one place, separate from the code that
          uses the result. It is the direct creational counterpart to Program to an Interface:
          instead of calling code depending on a concrete class, it depends on a factory that
          returns the interface type.
        </p>
        <p>
          Intent: decouple object creation from object use. Applicability: the concrete type to
          create depends on runtime information, or is expected to grow new variants over time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Applying Factory Method, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify direct <code>new</code> calls scattered across multiple call sites for the
            same family of types.</b> Several places in a codebase each deciding, independently,
            whether to build a <code>PdfReport</code> or a <code>CsvReport</code>.
          </li>
          <li>
            <b>Centralize the decision behind one factory method.</b>{" "}
            <code>ReportFactory.create(ReportType type, Data data)</code>, called from every site
            that previously branched independently.
          </li>
          <li>
            <b>Have the factory return the shared interface, not a concrete type.</b> Callers
            receive a <code>Report</code>, never knowing or caring whether it's a{" "}
            <code>PdfReport</code> or <code>CsvReport</code> underneath.
          </li>
          <li>
            <b>Add a new variant by extending the factory, not every call site.</b> A new{" "}
            <code>ExcelReport</code> means adding one case to <code>ReportFactory</code>, directly
            realizing Open/Closed Design for every place that calls it.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="20" width="120" height="40" rx="6" />
            <text className="boxText" x="240" y="45" fontSize="10">ReportFactory</text>
            <line className="flow" x1="220" y1="60" x2="150" y2="100" />
            <line className="flow" x1="260" y1="60" x2="330" y2="100" />
            <rect className="box" x="90" y="100" width="120" height="35" rx="5" />
            <text className="boxText" x="150" y="122" fontSize="9">PdfReport</text>
            <rect className="box" x="270" y="100" width="120" height="35" rx="5" />
            <text className="boxText" x="330" y="122" fontSize="9">CsvReport</text>
            <text className="figHint" x="240" y="15">returns Report (interface)</text>
          </svg>
          <figcaption>Every call site depends on the factory, never on which concrete Report class it decided to build.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Centralizing construction behind one method</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface Report { byte[] render(); }
class PdfReport implements Report { public byte[] render() { return new byte[0]; } }
class CsvReport implements Report { public byte[] render() { return new byte[0]; } }

class ReportFactory {
    static Report create(ReportType type, ReportData data) {
        return switch (type) {
            case PDF -> new PdfReport(data);
            case CSV -> new CsvReport(data);
        };
    }
}

// every call site, unchanged when a new ReportType is added
Report report = ReportFactory.create(requestedType, data);
byte[] bytes = report.render();`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Adding a factory for a single concrete type with no plausible second
            implementation.</b> With exactly one <code>Report</code> type, a factory is pure
            indirection over a constructor call &mdash; the same overuse trap as always.
          </li>
          <li>
            <b>Letting the factory's <code>switch</code> leak business logic beyond "which class
            to build."</b> A factory that also validates report data or applies formatting rules
            has taken on responsibilities that belong elsewhere.
          </li>
          <li>
            <b>Confusing Factory Method with Abstract Factory.</b> Factory Method creates one
            product; Abstract Factory, in the next article, creates a whole family of related
            products together &mdash; they solve related but distinct problems.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does adding a new <code>ExcelReport</code> type only require a change inside <code>ReportFactory</code>, and not at any of its call sites?</p>
          <p>
            <b>Answer:</b> Every call site depends only on the <code>Report</code> interface and
            calls <code>ReportFactory.create()</code> &mdash; none of them contain the logic that
            decides which concrete class to build. That decision lives in exactly one place, so
            extending it to a new type is a single, localized change.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Factory Method centralizes "which concrete class to build" into one place, so calling code
        can depend only on the shared interface and stay unchanged as new variants are added.
      </p>
    </div>
  );
}
