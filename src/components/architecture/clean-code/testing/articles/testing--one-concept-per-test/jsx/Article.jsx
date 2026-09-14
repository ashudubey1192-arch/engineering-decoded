import "../css/Article.css";

export default function TestingOneConceptPerTestArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A test that checks three unrelated things at once produces an ambiguous failure &mdash; the
          report says red, but not which of the three concepts broke, and an assertion failure
          partway through can hide problems in the checks that follow it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>One reason to fail</b> &mdash; when a test goes red, its name and body should point at a single, specific cause.</li>
          <li><b>Several assertions about the same concept are fine</b> &mdash; checking three fields of one resulting object is still one concept; checking tax, then late fees, then currency formatting is three.</li>
          <li><b>Splitting by concept usually means more, shorter tests</b> &mdash; almost always worth the trade for the clarity gained in the failure report.</li>
          <li><b>Most assertion libraries stop at the first failure</b> &mdash; anything after an unrelated failing assertion isn't actually checked that run.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's do-everything test, split into three focused ones:
        </p>
        <span className="codeLabel">THREE CONCEPTS, ONE TEST</span>
        <div className="codeBlock">
          <pre>{`test("invoice calculations", () => {
  const invoice = anInvoice({ total: 1000000, dueDate: "2024-01-01" });
  expect(calculateTax(invoice, "US-CA")).toBe(92500);
  expect(calculateLateFee(invoice, asOf("2024-02-15"))).toBe(50000);
  expect(formatCurrency(invoice.total, "EUR")).toBe("EUR 10,000.00");
});
// a currency-formatting bug hides whether tax and late-fee math still work,
// because the test never reaches those assertions once one fails`}</pre>
        </div>
        <span className="codeLabel">THREE CONCEPTS, THREE TESTS</span>
        <div className="codeBlock">
          <pre>{`test("calculates 9.25% sales tax for California customers", () => {
  const invoice = anInvoice({ total: 1000000 });
  expect(calculateTax(invoice, "US-CA")).toBe(92500);
});

test("charges a late fee 45 days past the due date", () => {
  const invoice = anInvoice({ total: 1000000, dueDate: "2024-01-01" });
  expect(calculateLateFee(invoice, asOf("2024-02-15"))).toBe(50000);
});

test("formats totals in the customer's currency", () => {
  expect(formatCurrency(1000000, "EUR")).toBe("EUR 10,000.00");
});`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of one test with a single failure result connected to three unrelated pieces of logic, making it unclear which one broke, versus three separate tests, each connected to exactly one piece of logic, so a failure names its cause directly.">
          <rect className="boxWarn" x="150" y="10" width="120" height="24" rx="4" /><text x="210" y="26" className="boxText" style={{fontSize:"4.2px"}}>1 test, red</text>
          <rect className="box" x="20" y="55" width="90" height="22" rx="4" /><text x="65" y="70" className="boxText" style={{fontSize:"4.2px"}}>tax logic</text>
          <rect className="box" x="165" y="55" width="90" height="22" rx="4" /><text x="210" y="70" className="boxText" style={{fontSize:"4.2px"}}>late fee logic</text>
          <rect className="box" x="310" y="55" width="90" height="22" rx="4" /><text x="355" y="70" className="boxText" style={{fontSize:"4.2px"}}>currency logic</text>
          <line className="flowMuted" x1="200" y1="34" x2="65" y2="53" />
          <line className="flowMuted" x1="210" y1="34" x2="210" y2="53" />
          <line className="flowMuted" x1="225" y1="34" x2="355" y2="53" />
          <text x="210" y="93" className="figHint" style={{fontSize:"4.2px"}}>which one actually broke?</text>
          <rect className="boxAccent" x="20" y="105" width="90" height="20" rx="3" /><text x="65" y="119" className="boxText" style={{fontSize:"4px"}}>test: tax</text>
          <rect className="boxAccent" x="165" y="105" width="90" height="20" rx="3" /><text x="210" y="119" className="boxText" style={{fontSize:"4px"}}>test: late fee</text>
          <rect className="boxAccent" x="310" y="105" width="90" height="20" rx="3" /><text x="355" y="119" className="boxText" style={{fontSize:"4px"}}>test: currency</text>
        </svg>
        <figcaption>One test tangled across three unrelated pieces of logic can't say which one failed; three focused tests each point straight at their own cause.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Splitting so far that a single logical concept &mdash; every field of one calculated
          result, say &mdash; is scattered across five separate one-assertion tests loses the forest
          for the trees. "One concept per test" means one reason to fail, not a rigid
          one-assertion rule.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the currency-formatting bug in the combined test leave it unclear whether the tax and late-fee calculations still worked?</p>
        </div>
      </section>
      <p className="takeaway">
        Give every test exactly one reason to fail &mdash; several assertions about the same concept
        are fine together, but unrelated concepts belong in separate tests so a red result points
        straight at its cause.
      </p>

    </div>
  );
}
