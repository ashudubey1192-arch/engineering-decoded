import "../css/Article.css";

export default function ClassesAndModulesDependencyManagementArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          How a class gets hold of the objects it depends on matters as much as what it does
          with them. A dependency built quietly inside a method is invisible and fixed; a
          dependency handed in from outside is visible and replaceable.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Constructor injection makes dependencies visible</b> &mdash; everything a class needs appears in its constructor signature, readable without opening the method bodies.</li>
          <li><b>Hidden dependencies don't show up anywhere</b> &mdash; a method can quietly reach out to a global singleton or a static call, and nothing about its signature warns you.</li>
          <li><b>Depend on abstractions for things that vary</b> &mdash; ties directly to Low Coupling: inject an interface, not a concrete class, when substitution is plausible.</li>
          <li><b>Not everything needs injecting</b> &mdash; simple, stable values don't need a dependency-injection framework; injection earns its cost for things that vary or need to be faked.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>TaxCalculator</code>, before and after making its dependency explicit:
        </p>
        <span className="codeLabel">HIDDEN DEPENDENCY ON A GLOBAL</span>
        <div className="codeBlock">
          <pre>{`class TaxCalculator {
  calculate(subtotal, region) {
    const rate = AppConfig.instance.getTaxRate(region); // hidden global dependency
    return subtotal * rate;
  }
}
// a test for calculate() must first configure the real global AppConfig singleton &mdash;
// tests now depend on global setup order, and can interfere with each other`}</pre>
        </div>
        <span className="codeLabel">EXPLICIT DEPENDENCY, PASSED IN</span>
        <div className="codeBlock">
          <pre>{`class TaxCalculator {
  constructor(rateProvider) { this.rateProvider = rateProvider; } // dependency is visible
  calculate(subtotal, region) {
    return subtotal * this.rateProvider.getRate(region);
  }
}
// a test passes in a small FakeRateProvider directly &mdash;
// no global state, no setup order, no interference between tests`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a class silently reaching out to a global singleton for a dependency it needs, an invisible connection not shown in its signature, versus a class receiving the same dependency explicitly through its constructor.">
          <rect className="box" x="30" y="15" width="130" height="26" rx="4" /><text x="95" y="32" className="boxText" style={{fontSize:"4.5px"}}>TaxCalculator</text>
          <rect className="boxWarn" x="260" y="15" width="130" height="26" rx="4" /><text x="325" y="32" className="boxText" style={{fontSize:"4.2px"}}>AppConfig.instance</text>
          <line className="flowMuted" x1="160" y1="28" x2="258" y2="28" /><text x="210" y="20" className="figHint" style={{fontSize:"4px"}}>hidden reach</text>
          <rect className="box" x="30" y="65" width="130" height="26" rx="4" /><text x="95" y="82" className="boxText" style={{fontSize:"4.5px"}}>TaxCalculator</text>
          <rect className="boxAccent" x="260" y="65" width="130" height="26" rx="4" /><text x="325" y="82" className="boxText" style={{fontSize:"4.2px"}}>rateProvider (ctor arg)</text>
          <line className="flow" x1="258" y1="78" x2="160" y2="78" /><text x="210" y="70" className="figHint" style={{fontSize:"4px"}}>visible, explicit</text>
        </svg>
        <figcaption>A dependency reached through global state is invisible in the class's signature; a dependency passed to the constructor is visible and replaceable.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Wrapping every constructor argument, including plain configuration values that never
          vary and never need a fake, through an elaborate dependency-injection framework adds
          ceremony without adding testability. Inject what needs to vary or be faked; pass simple
          values simply.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did testing calculate() require configuring a real global singleton in the first version, and what changed once TaxCalculator received its rate provider through the constructor?</p>
        </div>
      </section>
      <p className="takeaway">
        Make a class's dependencies visible in its constructor rather than reaching for them
        internally &mdash; a hidden dependency on global state is a hidden coupling that tests, and
        future readers, will trip over.
      </p>

    </div>
  );
}
