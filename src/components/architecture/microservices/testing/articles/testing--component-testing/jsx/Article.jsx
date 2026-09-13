import "../css/Article.css";

export default function TestingComponentTestingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A component test treats one entire service as a black box &mdash; running its real code,
          start to finish, exercised only through its actual API &mdash; while everything outside
          that one service is replaced with a lightweight stand-in.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Unlike a unit test (one function, everything mocked) or an end-to-end test (every real
          service, nothing mocked), a component test runs one service's whole, real, internal wiring
          and business logic, while stubbing out only its network-level calls to other services. This
          validates that a service works correctly internally, top to bottom, without needing every
          other service in the system running to find out.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> is started for real, with its real database and real internal
          logic, but its outbound calls to <code>PaymentService</code> are intercepted by a local
          stub server returning a canned response. A test then calls
          <span className="badge">POST /orders</span> on OrderService's actual API and asserts on the
          real response &mdash; exercising all of OrderService's own code, and none of anyone else's.
        </p>
        <span className="codeLabel">TESTING THE REAL SERVICE THROUGH ITS OWN API</span>
        <div className="codeBlock">
          <pre>{`beforeAll(async () => {
  stubServer.stub("POST /payments/charge", { status: 200, body: { approved: true } })
  orderService = await startRealOrderService({ paymentUrl: stubServer.url })
})

test("POST /orders succeeds when payment is approved", async () => {
  const res = await request(orderService).post("/orders").send(testOrder)
  expect(res.status).toBe(201)
})`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Diagram of a component test: the real, complete OrderService runs with its real database, called through its actual API, while its outbound call to PaymentService is intercepted by a local stub server instead of a real service.">
          <rect className="boxAccent" x="30" y="20" width="160" height="70" rx="8" />
          <text x="110" y="38" className="figLabel">OrderService (real)</text>
          <text x="110" y="60" className="boxText" style={{fontSize:"6px"}}>real logic + real DB</text>
          <text x="110" y="75" className="figHint" style={{fontSize:"5.5px"}}>tested via POST /orders</text>
          <rect className="box" x="250" y="35" width="120" height="30" rx="6" />
          <text x="310" y="55" className="boxText" style={{fontSize:"6px"}}>Stub: PaymentService</text>
          <line className="flowMuted" x1="190" y1="55" x2="248" y2="50" />
        </svg>
        <figcaption>OrderService's own code runs entirely for real; only its call out to another service is replaced with a stub.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Confusing component testing with unit testing &mdash; mocking pieces inside the service
          under test, rather than only its external network dependencies &mdash; stops validating
          that the service's own internal wiring actually works end to end. Never updating stub
          responses to match how the real dependency behaves today lets component tests pass
          confidently against a stub that no longer reflects reality.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A component test for OrderService mocks its internal order-validation logic in addition to stubbing PaymentService. What does this test stop validating that a proper component test should cover?</p>
        </div>
      </section>
      <p className="takeaway">
        A component test draws the isolation boundary at the service's edge, not inside it &mdash;
        everything inside runs for real; only the calls leaving the service are stubbed.
      </p>
    </div>
  );
}
