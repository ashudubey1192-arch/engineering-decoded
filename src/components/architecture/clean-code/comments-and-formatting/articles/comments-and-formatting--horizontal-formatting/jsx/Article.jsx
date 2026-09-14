import "../css/Article.css";

export default function CommentsAndFormattingHorizontalFormattingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Horizontal formatting is about how much a single line asks the reader to take in at
          once: line length, indentation depth, and how tightly related characters are packed
          together.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Keep lines within a comfortable width</b> &mdash; roughly 80&ndash;120 characters is a common team convention; beyond that, most readers have to scroll horizontally or lose context wrapping.</li>
          <li><b>Indentation encodes structure</b> &mdash; consistent indentation is how a reader visually parses nesting before reading a single keyword; inconsistent indentation actively misleads that visual parse.</li>
          <li><b>Whitespace around operators aids scanning</b> &mdash; <code>a+b*c</code> takes longer to parse visually than <code>a + b * c</code>, especially in longer expressions.</li>
          <li><b>Deep nesting is a horizontal problem too</b> &mdash; four or five levels of indentation push code far enough right that it becomes hard to read regardless of line length; it is usually a sign a function should be split (see Small Functions).</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          The same validation logic, cramped versus formatted for scanning:
        </p>
        <span className="codeLabel">CRAMPED</span>
        <div className="codeBlock">
          <pre>{`function v(i){if(i.total<0||i.lineItems.length===0||!i.customer||i.dueAt<i.issuedAt){return false}return true}`}</pre>
        </div>
        <span className="codeLabel">FORMATTED FOR SCANNING</span>
        <div className="codeBlock">
          <pre>{`function isValidInvoice(invoice) {
  const hasNegativeTotal = invoice.total < 0;
  const hasNoLineItems = invoice.lineItems.length === 0;
  const hasNoCustomer = !invoice.customer;
  const hasInvalidDates = invoice.dueAt < invoice.issuedAt;

  return !(hasNegativeTotal || hasNoLineItems || hasNoCustomer || hasInvalidDates);
}`}</pre>
        </div>
        <p>
          Both versions check identical conditions. The first requires the reader to
          mentally split apart a single dense line into four separate ideas before they can
          evaluate any of them; the second has already done that splitting for them.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 90" role="img" aria-label="Diagram comparing one cramped line requiring the reader to mentally split it into four conditions before understanding it, versus four already separated, spaced, and named lines that can each be read independently.">
          <rect className="boxWarn" x="20" y="15" width="380" height="20" rx="4" /><text x="210" y="28" className="boxText" style={{fontSize:"4.5px"}}>if(i.total&lt;0||i.lineItems.length===0||!i.customer||...)</text>
          <rect className="box" x="20" y="50" width="90" height="20" rx="4" /><text x="65" y="63" className="boxText" style={{fontSize:"4px"}}>hasNegativeTotal</text>
          <rect className="box" x="120" y="50" width="90" height="20" rx="4" /><text x="165" y="63" className="boxText" style={{fontSize:"4px"}}>hasNoLineItems</text>
          <rect className="box" x="220" y="50" width="80" height="20" rx="4" /><text x="260" y="63" className="boxText" style={{fontSize:"4px"}}>hasNoCustomer</text>
          <rect className="box" x="310" y="50" width="90" height="20" rx="4" /><text x="355" y="63" className="boxText" style={{fontSize:"4px"}}>hasInvalidDates</text>
        </svg>
        <figcaption>One dense line forces the reader to do the splitting themselves; four named lines have already done it for them.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Relying on manual formatting discipline instead of an automated formatter is a
          recurring source of drift &mdash; different engineers, or the same engineer on different
          days, format slightly differently, and code review becomes cluttered with whitespace
          debates. An automated formatter (run in a pre-commit hook or CI, covered further in
          Team Formatting Rules) removes the question entirely.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does splitting a dense boolean expression into named intermediate variables reduce the reader's work, even though the total number of characters goes up?</p>
        </div>
      </section>
      <p className="takeaway">
        Horizontal density is a real readability cost &mdash; spacing, sensible line length, and
        shallow nesting let a reader parse a line's structure before they have to think about
        its meaning.
      </p>

    </div>
  );
}
