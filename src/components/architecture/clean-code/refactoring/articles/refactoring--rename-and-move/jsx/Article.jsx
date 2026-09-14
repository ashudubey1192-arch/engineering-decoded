import "../css/Article.css";

export default function RefactoringRenameAndMoveArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Rename and Move are two of the simplest refactorings, and two of the most underrated:
          giving something its accurate name, and putting it where it actually belongs. Simple to
          perform, easy to skip, and easy to underestimate the value of.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>A rename is never "just cosmetic"</b> &mdash; a name is the primary interface between code and the person reading it; a misleading one costs time every single time it's read.</li>
          <li><b>Rename as understanding improves</b> &mdash; the right name is often not obvious until you've worked with the code for a while; renaming later is expected, not a failure.</li>
          <li><b>Move to where the data actually lives</b> &mdash; move a method or field to the class that actually uses it, tying back to Feature Envy, High Cohesion, and Low Coupling.</li>
          <li><b>Both are mechanically low-risk with good tooling</b> &mdash; a rename that updates every reference automatically, checked by tests and a type-checker, is close to risk-free.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly renaming a cryptic <code>calc()</code> and moving a misplaced helper to where
          it belongs:
        </p>
        <span className="codeLabel">CRYPTIC NAME, WRONG HOME</span>
        <div className="codeBlock">
          <pre>{`// utils.js — a growing grab-bag of unrelated helpers
function calc(a, b) { return a + b * 1.0825; }
function formatMoney(cents) { return "$" + (cents / 100).toFixed(2); }
function daysBetween(a, b) { /* ... */ }`}</pre>
        </div>
        <span className="codeLabel">ACCURATE NAME, RIGHT HOME</span>
        <div className="codeBlock">
          <pre>{`// invoice.js
function calculateInvoiceTotal(subtotal, taxRate) { return subtotal + subtotal * taxRate; }

// money.js
class Money {
  static format(cents) { return "$" + (cents / 100).toFixed(2); }
}`}</pre>
        </div>
        <p>
          Neither change touched the underlying logic. <code>formatMoney</code> now lives next to
          the concept it formats, and <code>calc()</code> now says exactly what it computes.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a function named calc living in a generic utils file, versus the same logic renamed to calculateInvoiceTotal and moved into the invoice file where it is actually used.">
          <rect className="boxWarn" x="30" y="20" width="140" height="28" rx="4" /><text x="100" y="34" className="boxText" style={{fontSize:"4.5px"}}>calc()</text><text x="100" y="44" className="boxText" style={{fontSize:"3.6px"}}>in utils.js</text>
          <line className="flow" x1="180" y1="34" x2="248" y2="34" />
          <rect className="boxAccent" x="250" y="20" width="160" height="28" rx="4" /><text x="330" y="34" className="boxText" style={{fontSize:"4px"}}>calculateInvoiceTotal()</text><text x="330" y="44" className="boxText" style={{fontSize:"3.6px"}}>in invoice.js</text>
          <text x="210" y="80" className="figHint" style={{fontSize:"4.2px"}}>rename and move together: accurate name, right home</text>
        </svg>
        <figcaption>A cryptic name in the wrong file becomes an accurate name in the right one &mdash; same logic, both fixed together.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Renaming or moving something without first confirming every call site is covered
          &mdash; a partial rename that updates the declaration but misses a dynamically referenced
          call site, such as a string-based lookup, silently breaks a code path the type-checker
          or editor couldn't see.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a rename that an editor can apply automatically to every reference generally safer than a rename done by hand with a find-and-replace?</p>
        </div>
      </section>
      <p className="takeaway">
        Don't treat a rename or a move as too small to bother with &mdash; a name and a location are
        both information, and getting them right costs little compared to what a wrong one costs
        every time the code is read.
      </p>

    </div>
  );
}
