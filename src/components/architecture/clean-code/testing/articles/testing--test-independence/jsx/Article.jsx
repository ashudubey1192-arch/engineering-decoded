import "../css/Article.css";

export default function TestingTestIndependenceArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A test suite where tests must run in a particular order, or where one test's leftover
          state affects the next, looks fine until the moment it doesn't &mdash; a reordering, a new
          test inserted in the middle, or a parallel test runner turns a hidden dependency into
          an unpredictable failure.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Each test builds its own state</b> &mdash; no test should rely on a previous test having already run and left something behind.</li>
          <li><b>Shared mutable fixtures are the usual culprit</b> &mdash; a single seeded database row, or a module-level variable, reused and mutated across tests.</li>
          <li><b>Independence implies runnable in any order, and alone</b> &mdash; running one single test in isolation should give the same result as running the whole suite.</li>
          <li><b>Parallel runners expose order-dependence fast</b> &mdash; tests that passed only because of execution order become flaky the moment they run concurrently or shuffled.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's suite, before and after removing a shared, mutated fixture:
        </p>
        <span className="codeLabel">SHARED, MUTATED FIXTURE</span>
        <div className="codeBlock">
          <pre>{`let sharedCustomer; // created once, reused (and mutated) by many tests

beforeAll(() => { sharedCustomer = createTestCustomer("Acme Co"); });

test("applies a discount", () => {
  sharedCustomer.discountRate = 0.1; // mutates the shared fixture
  expect(applyDiscount(sharedCustomer, 1000)).toBe(900);
});

test("customer starts with no discount", () => {
  expect(sharedCustomer.discountRate).toBe(0); // passes only if run before the test above
});`}</pre>
        </div>
        <span className="codeLabel">FRESH, ISOLATED STATE PER TEST</span>
        <div className="codeBlock">
          <pre>{`test("applies a discount", () => {
  const customer = aCustomer({ discountRate: 0.1 }); // fresh, isolated fixture
  expect(applyDiscount(customer, 1000)).toBe(900);
});

test("customer starts with no discount", () => {
  const customer = aCustomer(); // fresh, isolated fixture, default discountRate: 0
  expect(customer.discountRate).toBe(0);
});
// either test passes alone, in either order, or run a thousand times in parallel`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a chain of tests where each depends on state left behind by the previous one, so one broken test cascades into the ones after it, versus independent tests that each build their own isolated state and do not depend on order.">
          <rect className="box" x="20" y="15" width="80" height="22" rx="4" /><text x="60" y="30" className="boxText" style={{fontSize:"4.2px"}}>test A</text>
          <rect className="box" x="150" y="15" width="80" height="22" rx="4" /><text x="190" y="30" className="boxText" style={{fontSize:"4.2px"}}>test B</text>
          <rect className="boxWarn" x="280" y="15" width="80" height="22" rx="4" /><text x="320" y="30" className="boxText" style={{fontSize:"4.2px"}}>test C</text>
          <line className="flowMuted" x1="100" y1="26" x2="148" y2="26" />
          <line className="flowMuted" x1="230" y1="26" x2="278" y2="26" />
          <text x="190" y="50" className="figHint" style={{fontSize:"4.2px"}}>leftover state, chained</text>
          <text x="190" y="60" className="figHint" style={{fontSize:"4.2px"}}>reordering or parallel runs break it</text>
          <rect className="boxAccent" x="20" y="75" width="80" height="22" rx="4" /><text x="60" y="90" className="boxText" style={{fontSize:"4.2px"}}>test A</text>
          <rect className="boxAccent" x="150" y="75" width="80" height="22" rx="4" /><text x="190" y="90" className="boxText" style={{fontSize:"4.2px"}}>test B</text>
          <rect className="boxAccent" x="280" y="75" width="80" height="22" rx="4" /><text x="320" y="90" className="boxText" style={{fontSize:"4.2px"}}>test C</text>
        </svg>
        <figcaption>Tests chained by leftover shared state break under reordering or parallel runs; independent tests, each with their own state, don't.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Fixing an order-dependent failure by pinning the test suite to a specific, hardcoded
          run sequence treats the symptom, not the cause &mdash; the same fragility returns the next
          time a new test is inserted anywhere in that sequence. Remove the shared mutable state
          instead.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did "customer starts with no discount" only pass when run after "applies a discount" had not yet run, and what change made it pass regardless of order?</p>
        </div>
      </section>
      <p className="takeaway">
        Give every test its own fresh state instead of sharing a mutable fixture &mdash; a suite
        that only passes in one specific order is not really passing, it's passing by
        coincidence.
      </p>

    </div>
  );
}
