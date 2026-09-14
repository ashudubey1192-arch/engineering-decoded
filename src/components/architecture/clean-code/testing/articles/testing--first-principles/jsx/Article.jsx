import "../css/Article.css";

export default function TestingFirstPrinciplesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          FIRST names five properties a healthy unit test suite has: Fast, Independent,
          Repeatable, Self-validating, Timely. A suite missing any one of them tends to get run
          less, trusted less, or both.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Fast</b> &mdash; a suite that takes 40 minutes gets run at the end of the day, not before every commit; a slow safety net catches problems much later than a fast one.</li>
          <li><b>Independent and Repeatable</b> &mdash; no shared mutable state (see Test Independence), and the same result regardless of machine, time, or run order.</li>
          <li><b>Self-validating</b> &mdash; a test reports a clear pass or fail; nobody should need to read printed output and judge for themselves whether it "looks right."</li>
          <li><b>Timely</b> &mdash; tests written close to the code they cover, not bolted on much later once bugs have had time to calcify into "expected" behavior.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's original suite hit a real staging database; the rebuilt suite uses in-memory
          fakes at the boundaries:
        </p>
        <span className="codeLabel">SLOW: REAL DATABASE, 40 MINUTES</span>
        <div className="codeBlock">
          <pre>{`beforeEach(async () => {
  await stagingDb.connect(); // real network round trip to a shared staging database
  await stagingDb.seed(testFixtures);
});
test("calculates an invoice total", async () => {
  const invoice = await stagingDb.invoices.find("inv-1"); // real query, real latency
  expect(calculateTotal(invoice)).toBe(1080000);
});
// full suite: about 40 minutes, run once a week before a release`}</pre>
        </div>
        <span className="codeLabel">FAST: IN-MEMORY, 12 SECONDS</span>
        <div className="codeBlock">
          <pre>{`test("calculates an invoice total", () => {
  const invoice = anInvoice({ lineItems: [aLineItem({ total: 1080000 })] }); // in-memory, no I/O
  expect(calculateTotal(invoice)).toBe(1080000);
});
// full suite: about 12 seconds, run automatically before every commit`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of the five FIRST properties as five labeled tiles: Fast, Independent, Repeatable, Self-validating, and Timely.">
          <rect className="boxAccent" x="10" y="30" width="76" height="40" rx="4" /><text x="48" y="50" className="boxText" style={{fontSize:"7px"}}>F</text><text x="48" y="62" className="boxText" style={{fontSize:"3.6px"}}>Fast</text>
          <rect className="boxAccent" x="94" y="30" width="76" height="40" rx="4" /><text x="132" y="50" className="boxText" style={{fontSize:"7px"}}>I</text><text x="132" y="62" className="boxText" style={{fontSize:"3.6px"}}>Independent</text>
          <rect className="boxAccent" x="178" y="30" width="76" height="40" rx="4" /><text x="216" y="50" className="boxText" style={{fontSize:"7px"}}>R</text><text x="216" y="62" className="boxText" style={{fontSize:"3.6px"}}>Repeatable</text>
          <rect className="boxAccent" x="262" y="30" width="76" height="40" rx="4" /><text x="300" y="50" className="boxText" style={{fontSize:"7px"}}>S</text><text x="300" y="62" className="boxText" style={{fontSize:"3.6px"}}>Self-validating</text>
          <rect className="boxAccent" x="346" y="30" width="76" height="40" rx="4" /><text x="384" y="50" className="boxText" style={{fontSize:"7px"}}>T</text><text x="384" y="62" className="boxText" style={{fontSize:"3.6px"}}>Timely</text>
        </svg>
        <figcaption>Five independent properties &mdash; missing any one of them tends to erode how much a team actually trusts and runs its test suite.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating FIRST as only a speed target is a common trap &mdash; a suite made fast by
          parallelizing tests that secretly share mutable state trades one FIRST property, Fast,
          for another, Independent, and ends up flaky under the very parallelism meant to speed
          it up.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did the original Ledgerly suite's 40-minute runtime mean it only ran once a week, and what did that delay cost in terms of how quickly a bug could be caught?</p>
        </div>
      </section>
      <p className="takeaway">
        A test suite earns trust by being fast, independent, repeatable, self-validating, and
        timely together &mdash; weakening any one of the five tends to erode how often the whole
        suite actually gets run.
      </p>

    </div>
  );
}
