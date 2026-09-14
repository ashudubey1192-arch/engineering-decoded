import "../css/Article.css";

export default function CommentsAndFormattingWhenCommentsHelpArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          The best comment is the one you did not need to write, because the code already said
          it. But some information genuinely cannot live in code &mdash; and for that information,
          a comment is exactly the right tool.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Explain "why," not "what"</b> &mdash; code already shows what it does; a comment earns its place by explaining a reason that is not visible in the code itself.</li>
          <li><b>Legal and licensing notices</b> &mdash; copyright headers, license text, required attributions: information the code cannot express on its own.</li>
          <li><b>Warnings of consequence</b> &mdash; "do not call this before <code>init()</code> runs" or "this is O(n&sup2;), only safe for small lists" &mdash; a warning that saves the next person from a real, non-obvious mistake.</li>
          <li><b>Links to context outside the code</b> &mdash; a ticket number, an RFC, a regulatory requirement that explains an otherwise-strange business rule.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A single line in Ledgerly's tax calculator looks arbitrary without context:
        </p>
        <span className="codeLabel">GENUINELY USEFUL COMMENT</span>
        <div className="codeBlock">
          <pre>{`// EU VAT must be calculated on the discounted subtotal, not the pre-discount
// amount — confirmed with finance/legal per Directive 2006/112/EC Art. 73.
// Getting this order wrong overcharges customers on every discounted EU invoice.
function calculateVat(discountedSubtotal, taxRegion) {
  return taxableRegions.includes(taxRegion) ? discountedSubtotal * VAT_RATE : 0;
}`}</pre>
        </div>
        <p>
          Nothing about reading <code>calculateVat()</code>'s code would tell you <i>why</i> it
          must receive the discounted amount rather than the raw subtotal, or that getting the
          order wrong has real financial and legal consequences. That is exactly the kind of
          fact a comment should carry &mdash; it cannot be expressed as a variable name or a smaller
          function, because it is about a decision made outside the code, not about the code's
          own structure.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram splitting comments into two categories: what the code does, which should be expressed in code itself through names and structure, and why a decision was made, which belongs in a comment because it cannot live in code.">
          <rect className="box" x="20" y="20" width="170" height="60" rx="6" /><text x="105" y="42" className="boxText" style={{fontSize:"5.5px"}}>"What" the code does</text><text x="105" y="55" className="boxText" style={{fontSize:"4.5px"}}>&rarr; belongs in names,</text><text x="105" y="65" className="boxText" style={{fontSize:"4.5px"}}>structure, and types</text>
          <rect className="boxAccent" x="230" y="20" width="170" height="60" rx="6" /><text x="315" y="42" className="boxText" style={{fontSize:"5.5px"}}>"Why" a decision was made</text><text x="315" y="55" className="boxText" style={{fontSize:"4.5px"}}>&rarr; belongs in a comment,</text><text x="315" y="65" className="boxText" style={{fontSize:"4.5px"}}>because code can't say it</text>
        </svg>
        <figcaption>"What" the code does should be expressed in the code; "why" a decision was made is what comments are for.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Writing a comment as a substitute for a clearer name or a better-structured function
          is the most common misuse &mdash; explaining confusing code instead of un-confusing it.
          Before writing a comment, ask whether renaming a variable or extracting a function
          would make the comment unnecessary. If it would, do that instead.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why couldn't the VAT ordering requirement in the example be expressed through a better function name instead of a comment?</p>
        </div>
      </section>
      <p className="takeaway">
        A good comment explains something the code cannot &mdash; a legal requirement, a
        non-obvious warning, a decision made elsewhere. If a comment is only explaining what
        the next three lines do, that information belongs in the code itself.
      </p>

    </div>
  );
}
