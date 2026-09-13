import "../css/Article.css";

export default function LldPracticesRefactoringForExtensibilityArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Good LLD is rarely achieved on the first pass &mdash; it's usually recognized in
          hindsight, when a change request becomes unexpectedly painful, and then deliberately
          restructured toward one of the patterns this course already covers.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Specific pain points point to specific fixes: an if/else chain that grows with every new
          case usually wants Strategy or Factory Method behind it; a class doing three unrelated
          things every time one of them changes usually wants splitting along Single Responsibility
          lines; a rigid subclass that breaks under a new requirement usually wants composition
          instead of inheritance. Recognizing which symptom you're looking at is most of the work.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>NotificationSender</code> with an if/else on channel type that's grown a new
          branch every time a channel was added gets refactored the same way Strategy handled
          payment types earlier: each channel becomes its own class implementing a shared interface,
          and <code>NotificationSender</code> just calls <code>channel.send()</code> polymorphically
          &mdash; the exact same shape of fix, recognized from a different starting point.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a NotificationSender's growing if-else on channel type being refactored into a dispatch call against a shared channel interface, the same shape as the earlier Strategy fix." >
          <rect className="boxWarn" x="20" y="30" width="170" height="30" rx="6" /><text x="105" y="49" className="boxText" style={{fontSize:"7px"}}>if/else on channel type</text>
          <line className="flow" x1="190" y1="45" x2="230" y2="45" />
          <rect className="boxAccent" x="235" y="30" width="160" height="30" rx="6" /><text x="315" y="49" className="boxText" style={{fontSize:"7px"}}>channel.send() &mdash; polymorphic</text>
        </svg>
        <figcaption>The same fix already seen for payment types, recognized here from a different starting symptom.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Refactoring pre-emptively for flexibility no requirement has actually asked for yet is
          the same speculative-generality mistake the Open/Closed article warned about, just
          arriving from the refactoring direction instead. Refactoring without a test safety net
          first turns what should be a design improvement into a real regression risk.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What specific code symptom points toward refactoring an if/else chain into a Strategy-based design?</p>
        </div>
      </section>
      <p className="takeaway">
        Treat a growing if/else, a class with too many reasons to change, or a fragile subclass as
        a signal pointing at a specific, already-known fix &mdash; not a reason to redesign from scratch.
      </p>
    </div>
  );
}
