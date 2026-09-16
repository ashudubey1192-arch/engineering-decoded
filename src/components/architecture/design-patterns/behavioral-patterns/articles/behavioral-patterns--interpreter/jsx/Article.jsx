export default function BehavioralPatternsInterpreterArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Interpreter defines a representation for a simple grammar, along with an interpreter
          that evaluates sentences in that grammar, by modeling each grammar rule as a class. It's
          a niche pattern, worth recognizing rather than reaching for casually &mdash; useful
          specifically when a small, stable, domain-specific language needs to be evaluated
          repeatedly, like a permission-rule expression or a simple filter syntax.
        </p>
        <p>
          Intent: represent grammar rules as a class hierarchy, and interpret sentences in that
          grammar by walking the resulting tree. Applicability: the grammar is genuinely simple
          and stable, and the alternative (writing a full parser and evaluator by hand) is
          disproportionate to the actual need.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Modeling a grammar as classes, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define the grammar precisely, in the smallest form that solves the real need.</b> A
            permission rule language: <code>role EQUALS "admin"</code>, combined with{" "}
            <code>AND</code> / <code>OR</code>.
          </li>
          <li>
            <b>Model each grammar rule as its own class implementing a shared{" "}
            <code>Expression</code> interface.</b> <code>EqualsExpression</code>,{" "}
            <code>AndExpression</code>, <code>OrExpression</code> &mdash; each knowing how to
            evaluate itself given a context.
          </li>
          <li>
            <b>Compose expressions into a tree matching the sentence's structure.</b>{" "}
            <code>role EQUALS "admin" AND region EQUALS "us"</code> becomes an{" "}
            <code>AndExpression</code> wrapping two <code>EqualsExpression</code> leaves.
          </li>
          <li>
            <b>Evaluate by walking the tree, each node delegating to its children.</b>{" "}
            <code>AndExpression.evaluate(context)</code> evaluates both children and returns their
            logical AND &mdash; no separate parser or evaluator engine needed beyond the tree
            itself.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 460 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="15" width="100" height="35" rx="6" />
            <text className="boxText" x="230" y="37" fontSize="10">AndExpression</text>
            <line className="flow" x1="210" y1="50" x2="110" y2="90" />
            <line className="flow" x1="250" y1="50" x2="350" y2="90" />
            <rect className="box" x="40" y="90" width="140" height="35" rx="6" />
            <text className="boxText" x="110" y="112" fontSize="8">role EQUALS "admin"</text>
            <rect className="box" x="280" y="90" width="140" height="35" rx="6" />
            <text className="boxText" x="350" y="112" fontSize="8">region EQUALS "us"</text>
          </svg>
          <figcaption>Each grammar rule becomes a node; evaluating the tree evaluates the sentence.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A tiny expression tree, evaluated recursively</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface Expression { boolean evaluate(Map<String, String> context); }

class EqualsExpression implements Expression {
    private final String field, value;
    EqualsExpression(String field, String value) { this.field = field; this.value = value; }
    public boolean evaluate(Map<String, String> context) {
        return value.equals(context.get(field));
    }
}
class AndExpression implements Expression {
    private final Expression left, right;
    AndExpression(Expression left, Expression right) { this.left = left; this.right = right; }
    public boolean evaluate(Map<String, String> context) {
        return left.evaluate(context) && right.evaluate(context);
    }
}

// role EQUALS "admin" AND region EQUALS "us"
Expression rule = new AndExpression(
    new EqualsExpression("role", "admin"),
    new EqualsExpression("region", "us")
);
rule.evaluate(Map.of("role", "admin", "region", "us")); // true`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for Interpreter for a grammar complex enough to need a real parser.</b> A
            grammar with precedence rules, nested function calls, or extensibility needs should
            use a proper parsing tool, not a hand-rolled expression tree.
          </li>
          <li>
            <b>Building the pattern for a grammar that never actually grows past one or two
            expression types.</b> If the "grammar" is really just one comparison, a single method
            is simpler than a class hierarchy.
          </li>
          <li>
            <b>Forgetting that every new grammar construct means a new class.</b> Interpreter
            trades a compact grammar description for a class per rule &mdash; a grammar with
            dozens of constructs produces dozens of small classes, a real maintenance cost.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is Interpreter a reasonable fit for the small permission-rule language above, but a poor fit for evaluating a general-purpose scripting language?</p>
          <p>
            <b>Answer:</b> The permission-rule grammar is small and stable &mdash; a handful of
            expression types that rarely change. A general-purpose scripting language has far more
            grammar rules, precedence and scoping concerns, and ongoing extension needs that a
            hand-rolled class-per-rule tree can't handle well; that calls for a proper parser and
            evaluator, not Interpreter.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Interpreter only for a genuinely small, stable grammar that needs repeated
        evaluation &mdash; model each rule as a class, compose them into a tree matching the
        sentence, and evaluate by walking it.
      </p>
    </div>
  );
}
