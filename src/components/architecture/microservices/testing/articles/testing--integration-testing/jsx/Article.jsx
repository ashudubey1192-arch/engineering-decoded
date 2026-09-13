import "../css/Article.css";

export default function TestingIntegrationTestingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An integration test checks that a service's code actually works against a real (or
          realistic) version of one specific dependency &mdash; catching the exact class of bug that
          a mock, by design, can never catch.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Unlike a unit test, an integration test deliberately crosses one real boundary &mdash; most
          commonly a real database instance, often spun up as a disposable container just for the
          test run &mdash; verifying the actual SQL, the actual schema, the actual serialization,
          rather than just confirming a mock was invoked with the expected arguments.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code>'s repository layer is tested against a real, disposable Postgres
          instance created for the test run, verifying that <code>saveOrder()</code> actually
          persists and a subsequent <code>findById()</code> returns the correct row &mdash; a bug in
          the raw SQL itself, invisible to a mocked repository, surfaces here immediately.
        </p>
        <span className="codeLabel">TESTING AGAINST A REAL DATABASE</span>
        <div className="codeBlock">
          <pre>{`beforeAll(async () => { db = await startTestPostgres() })

test("saveOrder persists and is retrievable", async () => {
  await orderRepo.saveOrder(testOrder)
  const found = await orderRepo.findById(testOrder.id)
  expect(found.total).toBe(testOrder.total)
})`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 110" role="img" aria-label="Diagram of an integration test: OrderService's real repository code runs against a real, disposable test Postgres instance, while the rest of the system remains mocked and out of scope.">
          <rect className="boxAccent" x="30" y="35" width="140" height="30" rx="6" />
          <text x="100" y="55" className="boxText" style={{fontSize:"6px"}}>OrderService repo (real)</text>
          <rect className="box" x="230" y="35" width="140" height="30" rx="6" />
          <text x="300" y="55" className="boxText" style={{fontSize:"6px"}}>Test Postgres (real)</text>
          <line className="flow" x1="170" y1="50" x2="228" y2="50" />
          <text x="200" y="40" className="figHint" style={{fontSize:"5px"}}>real SQL</text>
          <text x="200" y="90" className="figHint" style={{fontSize:"5.5px"}}>everything else stays mocked, out of scope</text>
        </svg>
        <figcaption>One real boundary is crossed &mdash; the repository's real code against a real database &mdash; while the rest of the system stays out of scope.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Testing against a stand-in that behaves differently from production &mdash; an in-memory
          fake database with different SQL semantics than real Postgres &mdash; can pass tests that
          would fail for real, undermining the entire point of the exercise. Letting integration
          tests multiply to cover every code path, instead of leaving that job to unit tests, makes
          the suite slow without adding much real confidence; the sweet spot is a smaller number of
          integration tests aimed specifically at real boundaries.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why would a bug in OrderService's raw SQL query go undetected by a unit test that mocks the repository, but get caught by an integration test against a real Postgres instance?</p>
        </div>
      </section>
      <p className="takeaway">
        An integration test earns its slower speed by crossing one real boundary on purpose &mdash;
        the exact boundary a unit test's mocks are specifically designed to skip.
      </p>
    </div>
  );
}
