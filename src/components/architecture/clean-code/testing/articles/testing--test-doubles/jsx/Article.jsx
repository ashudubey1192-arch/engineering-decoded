import "../css/Article.css";

export default function TestingTestDoublesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Test double is the umbrella term for anything standing in for a real dependency during
          a test &mdash; a database, a payment gateway, an email provider. Stubs, fakes, and mocks
          are different tools under that umbrella, each suited to a different question.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Stub</b> &mdash; returns a canned answer, nothing more; useful when a test only needs the dependency to respond a certain way, not to verify how it was called.</li>
          <li><b>Fake</b> &mdash; a lightweight, real, working implementation, such as an in-memory repository that behaves like a database without one running.</li>
          <li><b>Mock</b> &mdash; verifies that specific interactions happened, useful for checking that a particular call was made under particular circumstances.</li>
          <li><b>Prefer stubs and fakes for most tests</b> &mdash; mocks that assert on call sequences couple a test to implementation details, and tend to break when the implementation changes even though the behavior did not.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's payment tests, using a stub for a straightforward case and a mock for a
          retry-specific one:
        </p>
        <span className="codeLabel">STUB: CANNED RESPONSE</span>
        <div className="codeBlock">
          <pre>{`class StubGateway {
  charge() { return { status: "approved" }; }
}
test("marks an invoice paid when the charge is approved", () => {
  const service = new InvoiceService(new StubGateway());
  service.chargeAndMark(invoice);
  expect(invoice.status).toBe("paid");
});`}</pre>
        </div>
        <span className="codeLabel">MOCK: VERIFIES AN INTERACTION</span>
        <div className="codeBlock">
          <pre>{`class MockGateway {
  calls = [];
  charge(amount) {
    this.calls.push(amount);
    if (this.calls.length < 3) throw new NetworkTimeoutError();
    return { status: "approved" };
  }
}
test("retries a charge up to 3 times after a network timeout", () => {
  const gateway = new MockGateway();
  new InvoiceService(gateway).chargeAndMark(invoice);
  expect(gateway.calls.length).toBe(3); // verifies the retry actually happened
});`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a class under test connected to a real payment gateway over the network during production, versus the same class connected to a test double standing in for the gateway during a test, avoiding any real network call or charge.">
          <rect className="box" x="30" y="15" width="120" height="24" rx="4" /><text x="90" y="31" className="boxText" style={{fontSize:"4.2px"}}>InvoiceService</text>
          <rect className="boxWarn" x="270" y="15" width="120" height="24" rx="4" /><text x="330" y="31" className="boxText" style={{fontSize:"4.2px"}}>Real gateway (network)</text>
          <line className="flowMuted" x1="150" y1="27" x2="268" y2="27" /><text x="210" y="20" className="figHint" style={{fontSize:"4px"}}>production</text>
          <rect className="box" x="30" y="65" width="120" height="24" rx="4" /><text x="90" y="81" className="boxText" style={{fontSize:"4.2px"}}>InvoiceService</text>
          <rect className="boxAccent" x="270" y="65" width="120" height="24" rx="4" /><text x="330" y="81" className="boxText" style={{fontSize:"4.2px"}}>Test double (in-process)</text>
          <line className="flow" x1="150" y1="77" x2="268" y2="77" /><text x="210" y="98" className="figHint" style={{fontSize:"4px"}}>test: fast, deterministic, no real charge</text>
        </svg>
        <figcaption>In production InvoiceService reaches a real gateway over the network; in a test, a double at the same boundary keeps the test fast and deterministic.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Mocking a type you don't own &mdash; asserting on the exact internal call sequence of a
          third-party library, for instance &mdash; couples the test to that library's implementation
          details rather than to a stable interface you control. The library's next version can
          break the test without the actual behavior being wrong at all.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why was a mock, rather than a simple stub, the right tool for verifying that a charge was retried exactly three times after a timeout?</p>
        </div>
      </section>
      <p className="takeaway">
        Match the test double to the question the test is asking &mdash; a stub or fake for "does
        this work correctly," a mock only when the test specifically needs to verify that an
        interaction happened.
      </p>

    </div>
  );
}
