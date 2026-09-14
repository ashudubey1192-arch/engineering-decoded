import "../css/Article.css";

export default function FunctionsFunctionArgumentsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Every additional parameter multiplies the number of cases a reader has to imagine and
          a test suite has to cover. Zero, one, or two arguments are easy to reason about;
          beyond that, a function usually needs a different shape.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Fewer arguments, easier to call correctly</b> &mdash; a two-argument function has far fewer ways to be misused than a six-argument one, especially when several arguments share a type.</li>
          <li><b>Boolean (flag) arguments are a smell</b> &mdash; <code>renderInvoice(invoice, true)</code> forces the reader to go find the function definition just to know what <code>true</code> means; it usually signals the function does two different things depending on the flag.</li>
          <li><b>Group related arguments into an object</b> &mdash; three or more parameters that are always passed together are usually really one concept that deserves its own type.</li>
          <li><b>Output arguments are confusing</b> &mdash; a function that mutates one of its arguments to "return" a result (instead of returning a value) hides its real effect from the call site.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's PDF export function grew a parameter at a time until it was unusable from
          memory:
        </p>
        <span className="codeLabel">BEFORE</span>
        <div className="codeBlock">
          <pre>{`function renderInvoicePdf(invoice, includeLogo, includeTaxBreakdown, watermark, locale) {
  // ...
}
// call site — what do these booleans mean, without checking the signature?
renderInvoicePdf(invoice, true, false, "DRAFT", "en-US");`}</pre>
        </div>
        <span className="codeLabel">AFTER</span>
        <div className="codeBlock">
          <pre>{`function renderInvoicePdf(invoice, options) {
  // options: { includeLogo, includeTaxBreakdown, watermark, locale }
}
// call site — self-documenting, order-independent
renderInvoicePdf(invoice, {
  includeLogo: true,
  includeTaxBreakdown: false,
  watermark: "DRAFT",
  locale: "en-US",
});`}</pre>
        </div>
        <p>
          The second version cannot be called with arguments in the wrong order &mdash; a real bug
          that happened twice with the five-positional-argument version &mdash; and every call
          site is readable without opening the function definition.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram comparing five positional arguments, where order matters and meaning is hidden at the call site, versus one options object, where every value is labeled and order independent.">
          <text x="100" y="15" className="figLabel" style={{fontSize:"5.5px"}}>5 positional args</text>
          <rect className="boxWarn" x="15" y="25" width="35" height="22" rx="3" /><text x="32" y="39" className="boxText" style={{fontSize:"4px"}}>invoice</text>
          <rect className="boxWarn" x="55" y="25" width="35" height="22" rx="3" /><text x="72" y="39" className="boxText" style={{fontSize:"4px"}}>true</text>
          <rect className="boxWarn" x="95" y="25" width="35" height="22" rx="3" /><text x="112" y="39" className="boxText" style={{fontSize:"4px"}}>false</text>
          <rect className="boxWarn" x="135" y="25" width="45" height="22" rx="3" /><text x="157" y="39" className="boxText" style={{fontSize:"3.5px"}}>"DRAFT"</text>
          <rect className="boxWarn" x="185" y="25" width="45" height="22" rx="3" /><text x="207" y="39" className="boxText" style={{fontSize:"3.5px"}}>"en-US"</text>
          <text x="330" y="15" className="figLabel" style={{fontSize:"5.5px"}}>1 labeled object</text>
          <rect className="boxAccent" x="260" y="25" width="150" height="55" rx="5" />
          <text x="335" y="40" className="boxText" style={{fontSize:"4.5px"}}>includeLogo: true</text>
          <text x="335" y="50" className="boxText" style={{fontSize:"4.5px"}}>includeTaxBreakdown: false</text>
          <text x="335" y="60" className="boxText" style={{fontSize:"4.5px"}}>watermark: "DRAFT"</text>
          <text x="335" y="70" className="boxText" style={{fontSize:"4.5px"}}>locale: "en-US"</text>
        </svg>
        <figcaption>Positional booleans and strings hide their meaning at the call site; a labeled options object cannot be misread.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Wrapping every function's arguments into an options object "for consistency," even
          for simple two-argument functions like <code>add(a, b)</code>, adds indirection where
          none was needed. Reserve the options-object pattern for functions where argument
          count or ambiguity actually causes confusion.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does renderInvoicePdf(invoice, true, false, "DRAFT", "en-US") require the reader to check the function definition, while the options-object version does not?</p>
        </div>
      </section>
      <p className="takeaway">
        Argument count is a real readability cost &mdash; when a function accumulates several
        related parameters, especially unlabeled booleans, group them into a named object
        instead of letting the call site turn into a guessing game.
      </p>

    </div>
  );
}
