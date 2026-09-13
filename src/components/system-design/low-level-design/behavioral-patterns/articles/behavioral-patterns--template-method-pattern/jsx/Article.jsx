import "../css/Article.css";

export default function BehavioralPatternsTemplateMethodPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Template Method defines the skeleton of an algorithm in a base class, deferring specific
          steps to subclasses &mdash; the overall sequence stays fixed and protected, while
          individual steps remain overridable.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A base class method calls a fixed sequence of steps, some of which are implemented
          directly and some of which are left abstract for subclasses to fill in. Subclasses can
          change what individual steps do, but they can't change the order the base class calls
          them in &mdash; the algorithm's shape is owned in exactly one place.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>DataProcessor.process()</code> template method calls
          <code>readData()</code>, then <code>transformData()</code>, then
          <code>saveData()</code>, always in that order. <code>CsvProcessor</code> and
          <code>JsonProcessor</code> subclasses only override <code>readData()</code> and
          <code>transformData()</code> for their own format &mdash; neither one ever touches the
          overall sequence, or needs to.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 110" role="img" aria-label="Diagram of a fixed process sequence, read then transform then save, defined once in a base class, with only the read and transform steps overridden differently by CSV and JSON subclasses." >
          <rect className="box" x="20" y="15" width="360" height="26" rx="5" /><text x="200" y="32" className="boxText" style={{fontSize:"7.5px"}}>process(): readData() &rarr; transformData() &rarr; saveData()</text>
          <line className="flowMuted" x1="120" y1="41" x2="120" y2="65" /><line className="flowMuted" x1="280" y1="41" x2="280" y2="65" />
          <rect className="boxAccent" x="60" y="70" width="120" height="26" rx="5" /><text x="120" y="87" className="boxText" style={{fontSize:"6.5px"}}>CsvProcessor overrides</text>
          <rect className="boxAccent" x="220" y="70" width="120" height="26" rx="5" /><text x="280" y="87" className="boxText" style={{fontSize:"6.5px"}}>JsonProcessor overrides</text>
        </svg>
        <figcaption>The base class owns the sequence; subclasses only ever change what specific steps do, never the order.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Making too many steps overridable lets subclasses silently break the sequence the pattern
          was supposed to protect. Duplicating the skeleton logic inside each subclass, rather than
          trusting the base class to own it once, throws away the reuse Template Method exists to
          provide.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What can CsvProcessor and JsonProcessor each change about DataProcessor's process() method, and what can neither of them change?</p>
        </div>
      </section>
      <p className="takeaway">
        Template Method fixes the algorithm's shape in one place and lets subclasses vary only its
        individual steps &mdash; never the sequence itself.
      </p>
    </div>
  );
}
