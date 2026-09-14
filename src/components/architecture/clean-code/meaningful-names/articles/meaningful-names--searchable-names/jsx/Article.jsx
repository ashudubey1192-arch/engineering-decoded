import "../css/Article.css";

export default function MeaningfulNamesSearchableNamesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Single-letter names and bare numeric literals share the same flaw: they cannot be
          searched for. When something goes wrong with "the number 7" scattered across a
          codebase, there is no way to find every place that matters.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Grep-ability matters</b> &mdash; a name like <code>MAX_LINE_ITEMS_PER_INVOICE</code> can be searched for across an entire codebase; the literal <code>50</code> cannot be distinguished from every other unrelated <code>50</code>.</li>
          <li><b>Magic numbers become named constants</b> &mdash; any number with meaning beyond its immediate context (a threshold, a limit, a conversion factor) deserves a name.</li>
          <li><b>Short names for short scopes</b> &mdash; <code>i</code> in a five-line loop is fine, because its entire lifetime is visible in one glance; the same name spanning a 60-line function is not.</li>
          <li><b>Length should scale with distance from declaration to use</b> &mdash; a variable used one line after it is declared needs less context in its name than one used forty lines later.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's validation logic silently rejected any invoice with more than a hardcoded
          number of line items in three different files, using the bare literal in each:
        </p>
        <span className="codeLabel">NOT SEARCHABLE</span>
        <div className="codeBlock">
          <pre>{`// invoice-form.js
if (items.length > 50) return false;
// invoice-import.js
if (rows.length > 50) throw new Error("too many rows");
// invoice-api.js
if (payload.lineItems.length > 50) return res.status(400).send();`}</pre>
        </div>
        <p>
          When the limit needed to change to 100, an engineer searching for <code>50</code>
          found dozens of unrelated matches (prices, percentages, other limits) and missed one
          of the three call sites, leaving an inconsistent limit in production for two weeks.
        </p>
        <span className="codeLabel">SEARCHABLE</span>
        <div className="codeBlock">
          <pre>{`export const MAX_LINE_ITEMS_PER_INVOICE = 50;
// every call site:
if (items.length > MAX_LINE_ITEMS_PER_INVOICE) return false;`}</pre>
        </div>
        <p>
          Now a project-wide search for <code>MAX_LINE_ITEMS_PER_INVOICE</code> finds every
          call site unambiguously, and the value only needs to change in one place.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram comparing a search for the bare number 50, which returns many unrelated matches, versus a search for the named constant MAX LINE ITEMS PER INVOICE, which returns exactly the relevant call sites.">
          <rect className="boxWarn" x="15" y="15" width="130" height="28" rx="5" /><text x="80" y="33" className="boxText" style={{fontSize:"5px"}}>Search: "50"</text>
          <rect className="boxWarn" x="200" y="10" width="200" height="70" rx="5" />
          <text x="300" y="28" className="boxText" style={{fontSize:"4.5px"}}>price: 50, discount: 50%,</text>
          <text x="300" y="40" className="boxText" style={{fontSize:"4.5px"}}>limit: 50, timeout: 50,</text>
          <text x="300" y="52" className="boxText" style={{fontSize:"4.5px"}}>...and the 3 that matter</text>
          <line className="flowMuted" x1="145" y1="29" x2="198" y2="40" />
          <rect className="boxAccent" x="15" y="70" width="130" height="28" rx="5" /><text x="80" y="88" className="boxText" style={{fontSize:"4.3px"}}>Search: MAX_LINE_ITEMS</text>
          <rect className="boxAccent" x="200" y="88" width="200" height="20" rx="5" /><text x="300" y="101" className="boxText" style={{fontSize:"5px"}}>Exactly 3 matches</text>
          <line className="flow" x1="145" y1="84" x2="198" y2="98" />
        </svg>
        <figcaption>A named constant is unambiguous to search for; a bare literal is lost among every unrelated use of the same number.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Not every literal needs a name &mdash; <code>for (let i = 0; i &lt; 3; i++)</code> looping over
          three fixed retry attempts inline is fine if "3" has no meaning beyond that one loop.
          Over-naming trivial, single-use literals adds indirection without adding safety. Name
          numbers that matter beyond their immediate context, not every number.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did searching for the literal 50 fail to reliably find every place Ledgerly's line-item limit was enforced?</p>
        </div>
      </section>
      <p className="takeaway">
        If a number or string matters beyond the line it appears on, give it a name &mdash; an
        unsearchable magic value is a maintenance trap waiting for the day it needs to change.
      </p>

    </div>
  );
}
