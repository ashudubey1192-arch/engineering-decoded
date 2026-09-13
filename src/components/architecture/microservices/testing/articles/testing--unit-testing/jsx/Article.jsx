import "../css/Article.css";

export default function TestingUnitTestingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A unit test exercises a single function or class in complete isolation, with every
          dependency replaced by a stand-in &mdash; so it runs in milliseconds and pinpoints exactly
          which piece of logic broke, not just that something, somewhere, did.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Every collaborator the code under test would normally call is replaced with a mock or stub
          that returns a canned response, so the test only exercises the logic actually being tested
          &mdash; not the correctness of everything it happens to call. With no network, database, or
          other service involved, unit tests are fast enough to run in the hundreds or thousands, on
          every single code change.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Testing <code>OrderService</code>'s <code>calculateTotal()</code> in isolation, a stub
          <code>TaxService</code> always returns a fixed rate, so the test verifies only the total
          calculation itself &mdash; not whether the real tax service is reachable or correct.
        </p>
        <span className="codeLabel">A UNIT TEST WITH A STUBBED DEPENDENCY</span>
        <div className="codeBlock">
          <pre>{`test("calculateTotal applies tax correctly", () => {
  const taxService = { getRate: () => 0.08 }   // stub: always returns 8%
  const total = calculateTotal({ subtotal: 100 }, taxService)
  expect(total).toBe(108)
})`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Diagram of a unit test: calculateTotal, the function under test, is called directly by the test, with its TaxService dependency replaced by a stub that returns a fixed canned value instead of a real network call.">
          <rect className="boxAccent" x="140" y="15" width="130" height="30" rx="6" />
          <text x="205" y="35" className="boxText" style={{fontSize:"6.5px"}}>calculateTotal()</text>
          <rect className="box" x="150" y="70" width="110" height="28" rx="5" />
          <text x="205" y="88" className="boxText" style={{fontSize:"6px"}}>Stub: TaxService</text>
          <line className="flowMuted" x1="205" y1="45" x2="205" y2="68" />
          <text x="290" y="60" className="figHint" style={{fontSize:"5.5px"}}>no real network call</text>
        </svg>
        <figcaption>The function under test runs for real; its only dependency is a stub returning a fixed value &mdash; no network, no database, no other service involved.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Mocking so much that the test no longer exercises any real logic &mdash; only verifying
          that mocks were called in a certain order &mdash; can pass even when the actual logic is
          completely broken. Reaching out to a real database or making a real network call "just this
          once" quietly turns a unit test into a slow, flaky integration test wearing a unit test's
          name and speed expectations.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A test for calculateTotal() mocks TaxService to always return a fixed rate. What does this test verify, and what does it deliberately not verify?</p>
        </div>
      </section>
      <p className="takeaway">
        A unit test's speed and precision both come from the same source &mdash; isolating exactly
        one piece of logic by replacing everything else it touches with a stand-in.
      </p>
    </div>
  );
}
