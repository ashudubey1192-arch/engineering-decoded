import "../css/Article.css";

export default function TestingArrangeActAssertArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Arrange-Act-Assert gives every test the same predictable shape: build the starting
          state, perform the one action under test, then check what happened. A reader who knows
          the pattern can scan any test in the suite the same way.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Arrange</b> &mdash; build only the state this test needs, ideally through a builder (see Readable Tests).</li>
          <li><b>Act</b> &mdash; exactly one call to the code under test; a test that calls its subject several times with different inputs is usually testing more than one thing.</li>
          <li><b>Assert</b> &mdash; check the outcome, ideally with a small number of assertions about the same result.</li>
          <li><b>Make the shape visible</b> &mdash; a blank line or a comment between the three sections makes the structure obvious at a glance, even before reading the content.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's discount test, interleaved and then separated into clean bands:
        </p>
        <span className="codeLabel">INTERLEAVED</span>
        <div className="codeBlock">
          <pre>{`test("discount test", () => {
  const invoice = anInvoice({ total: 1000000 });
  expect(invoice.total).toBe(1000000);
  const discounted = applyTieredDiscount(invoice);
  invoice.notes.push("discount applied");
  expect(discounted.total).toBe(900000);
  expect(invoice.notes.length).toBe(1);
});
// arrange, act, and assert are interleaved three times over`}</pre>
        </div>
        <span className="codeLabel">ARRANGE, ACT, ASSERT</span>
        <div className="codeBlock">
          <pre>{`test("applies a 10% discount to invoices over $5,000", () => {
  // Arrange
  const invoice = anInvoice({ total: 1000000 });

  // Act
  const discounted = applyTieredDiscount(invoice);

  // Assert
  expect(discounted.total).toBe(900000);
});`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of arrange, act, and assert steps interleaved three times over in a tangled test, versus arranged as three clean, separated bands in order.">
          <rect className="boxWarn" x="20" y="10" width="90" height="20" rx="3" /><text x="65" y="24" className="boxText" style={{fontSize:"4.2px"}}>Arrange</text>
          <rect className="boxWarn" x="120" y="10" width="70" height="20" rx="3" /><text x="155" y="24" className="boxText" style={{fontSize:"4.2px"}}>Assert</text>
          <rect className="boxWarn" x="200" y="10" width="60" height="20" rx="3" /><text x="230" y="24" className="boxText" style={{fontSize:"4.2px"}}>Act</text>
          <rect className="boxWarn" x="270" y="10" width="60" height="20" rx="3" /><text x="300" y="24" className="boxText" style={{fontSize:"4.2px"}}>Arrange</text>
          <rect className="boxWarn" x="340" y="10" width="60" height="20" rx="3" /><text x="370" y="24" className="boxText" style={{fontSize:"4.2px"}}>Assert</text>
          <text x="210" y="44" className="figHint" style={{fontSize:"4.2px"}}>interleaved, hard to scan</text>
          <rect className="boxAccent" x="20" y="65" width="120" height="24" rx="3" /><text x="80" y="81" className="boxText" style={{fontSize:"4.8px"}}>Arrange</text>
          <rect className="boxAccent" x="150" y="65" width="120" height="24" rx="3" /><text x="210" y="81" className="boxText" style={{fontSize:"4.8px"}}>Act</text>
          <rect className="boxAccent" x="280" y="65" width="120" height="24" rx="3" /><text x="340" y="81" className="boxText" style={{fontSize:"4.8px"}}>Assert</text>
          <line className="flow" x1="140" y1="77" x2="148" y2="77" />
          <line className="flow" x1="270" y1="77" x2="278" y2="77" />
          <text x="210" y="105" className="figHint" style={{fontSize:"4.2px"}}>three clean bands, in order</text>
        </svg>
        <figcaption>Interleaved arrange, act, and assert forces a reader to trace execution order; three separated bands can be scanned at a glance.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          A test with more than one Act step &mdash; calling the function under test twice with
          different inputs to save writing a second test &mdash; usually means two behaviors are
          being verified in one test. Split it into two tests, each with a single Act.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does interleaving arrange, act, and assert three times over make the discount test harder to scan than three separated bands?</p>
        </div>
      </section>
      <p className="takeaway">
        Shape every test the same way &mdash; arrange the state, perform one action, assert the
        outcome &mdash; so any test in the suite can be scanned with the same expectation of where
        to look.
      </p>

    </div>
  );
}
