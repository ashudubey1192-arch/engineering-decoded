export default function PatternFoundationsAvoidingPatternOveruseArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Pattern overuse &mdash; sometimes called "pattern fever" &mdash; is applying a named
          structure because it's available and impressive-looking, not because the forces from
          the previous article actually call for it. It is a real, common failure mode, usually
          committed by developers who just learned a pattern and are eager to use it. This closing
          article of the foundations section is the deliberate counterweight to everything before
          it.
        </p>
        <p>
          The cost is concrete: every pattern adds indirection that a reader has to trace through.
          Unearned indirection is pure cost with no offsetting benefit.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Recognizing overuse, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Count the classes a pattern adds against what it actually buys.</b> A Factory
            Method wrapping a single, unlikely-to-change constructor call adds a class and an
            interface for a flexibility need that doesn't exist.
          </li>
          <li>
            <b>Ask whether applicability was genuinely checked, or the pattern was chosen first.</b>{" "}
            "I wanted to use Visitor" is a warning sign; "double-dispatch based on both the
            operation and the node type is genuinely required here" is a real applicability check.
          </li>
          <li>
            <b>Watch for patterns applied to problems that don't yet exist.</b> Building an
            Abstract Factory for object families that only has one family today, on the
            speculation that a second family might exist someday, pays the cost now for a benefit
            that may never arrive.
          </li>
          <li>
            <b>Prefer the simplest structure that solves the actual, current problem.</b> This is
            not anti-pattern advice &mdash; it's the same discipline the Forces and Trade-Offs
            article asked for, applied specifically against the temptation to over-apply.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="45" width="180" height="50" rx="8" />
            <text className="boxText" x="110" y="68" fontSize="11">Pattern chosen first</text>
            <text className="figHint" x="110" y="85">"I want to use Visitor"</text>
            <rect className="boxAccent" x="280" y="45" width="180" height="50" rx="8" />
            <text className="boxText" x="370" y="68" fontSize="11">Problem identified first</text>
            <text className="figHint" x="370" y="85">forces genuinely present</text>
          </svg>
          <figcaption>The same pattern, reached two different ways &mdash; only one of them is a real applicability check.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A single constructor call, over-patterned</h2>
        <span className="codeLabel">JAVA &mdash; OVERUSED</span>
        <div className="codeBlock">
          <pre>{`interface LoggerFactory { Logger create(); }
class ConsoleLoggerFactory implements LoggerFactory {
    public Logger create() { return new ConsoleLogger(); }
}
// call site
Logger logger = new ConsoleLoggerFactory().create();
// there is exactly one Logger implementation, and no plan for a second`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; RIGHT-SIZED</span>
        <div className="codeBlock">
          <pre>{`Logger logger = new ConsoleLogger();
// if a second logger implementation genuinely becomes needed later,
// introducing Factory Method at that point costs one small refactor --
// far cheaper than the ongoing cost of an unneeded factory today`}</pre>
        </div>
        <p>
          The right-sized version isn't "unfinished" or "less sophisticated" &mdash; it's an
          honest match between the code's structure and the problem that actually exists today.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. The overuse mistakes themselves, named</h2>
        <ul>
          <li>
            <b>Golden hammer.</b> Reaching for one favorite pattern (often Strategy or Observer)
            for every problem, regardless of fit.
          </li>
          <li>
            <b>Speculative generality.</b> Building flexibility (Abstract Factory, plugin-style
            extension points) for variation that hasn't been requested and may never arrive.
          </li>
          <li>
            <b>Pattern-name-driven design.</b> Deciding on a pattern name before articulating the
            actual problem, then reshaping the problem description to justify the pattern already
            chosen.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is the "right-sized" version above not considered incomplete or naive, given it doesn't use a documented creational pattern at all?</p>
          <p>
            <b>Answer:</b> With exactly one <code>Logger</code> implementation and no near-term
            need for a second, Factory Method's flexibility has no problem to solve yet. Direct
            construction matches the actual current need; introducing the pattern later, if a
            second implementation genuinely appears, costs one small refactor &mdash; far less
            than carrying unneeded indirection the whole time in between.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A pattern applied where the forces don't actually call for it is pure cost &mdash; check
        applicability honestly, prefer the simplest structure that solves today's real problem,
        and let patterns earn their place rather than assuming their place.
      </p>
    </div>
  );
}
