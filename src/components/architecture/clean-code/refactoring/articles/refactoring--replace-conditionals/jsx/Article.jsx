import "../css/Article.css";

export default function RefactoringReplaceConditionalsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Sprawling if/else or switch chains, especially ones repeated in several places, are a
          common refactoring target &mdash; replaced with a lookup table, polymorphism, or a
          guard-clause restructuring, depending on the shape of the problem.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Repeated type-based conditionals suit polymorphism</b> &mdash; checking a customer's tier in five different methods is a candidate for one class per tier, each implementing the varying behavior.</li>
          <li><b>Selecting among fixed, known values suits a lookup table</b> &mdash; a chain of <code>else if</code> comparing against a small set of constants can often become a map lookup.</li>
          <li><b>Guard clauses flatten nested conditionals</b> &mdash; early returns are usually more readable than deeply nested if/else, echoing Single Level of Abstraction.</li>
          <li><b>Not every conditional is a smell</b> &mdash; a single, simple, local <code>if</code> is often the clearest possible code; this refactoring targets conditionals that are complex, duplicated, or type-based and scattered.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's discount-rate conditional, duplicated in three places, replaced with a
          lookup table:
        </p>
        <span className="codeLabel">IF/ELSE CHAIN, REPEATED IN 3 PLACES</span>
        <div className="codeBlock">
          <pre>{`function discountRateFor(tier) {
  if (tier === "bronze") return 0.0;
  else if (tier === "silver") return 0.05;
  else if (tier === "gold") return 0.10;
  else if (tier === "platinum") return 0.15;
  else return 0.0;
}`}</pre>
        </div>
        <span className="codeLabel">LOOKUP TABLE, DEFINED ONCE</span>
        <div className="codeBlock">
          <pre>{`const DISCOUNT_RATES = { bronze: 0.0, silver: 0.05, gold: 0.10, platinum: 0.15 };
function discountRateFor(tier) {
  return DISCOUNT_RATES[tier] ?? 0.0;
}`}</pre>
        </div>
        <p>
          Adding a new tier now means adding one entry to the table, in one place, instead of
          finding and editing every copy of the chain.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a chain of four if-else branches checking a tier value one by one, versus a single lookup table returning the matching value directly by key.">
          <rect className="boxWarn" x="30" y="10" width="90" height="20" rx="3" /><text x="75" y="24" className="boxText" style={{fontSize:"3.8px"}}>if bronze</text>
          <rect className="boxWarn" x="30" y="35" width="90" height="20" rx="3" /><text x="75" y="49" className="boxText" style={{fontSize:"3.8px"}}>else if silver</text>
          <rect className="boxWarn" x="30" y="60" width="90" height="20" rx="3" /><text x="75" y="74" className="boxText" style={{fontSize:"3.8px"}}>else if gold</text>
          <rect className="boxWarn" x="30" y="85" width="90" height="20" rx="3" /><text x="75" y="99" className="boxText" style={{fontSize:"3.8px"}}>else if platinum</text>
          <rect className="boxAccent" x="230" y="40" width="160" height="40" rx="4" /><text x="310" y="58" className="boxText" style={{fontSize:"4px"}}>DISCOUNT_RATES[tier]</text><text x="310" y="70" className="boxText" style={{fontSize:"3.6px"}}>one lookup, no branching</text>
        </svg>
        <figcaption>A chain of branches checking the same variable against fixed values collapses into a single table lookup.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Replacing a simple, single, local if-statement with an over-engineered polymorphic
          class hierarchy for a condition that appears exactly once and is unlikely to grow adds
          indirection with no payoff. Reserve this refactoring for conditionals that are complex,
          duplicated, or genuinely likely to grow more branches.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does duplicating the same if/else chain across three files make adding a new discount tier riskier than it would be with a single shared lookup table?</p>
        </div>
      </section>
      <p className="takeaway">
        Match the fix to the shape of the conditional &mdash; a lookup table for fixed known values,
        polymorphism for type-based branches repeated across methods, and often, for a single
        simple case, no refactoring at all.
      </p>

    </div>
  );
}
