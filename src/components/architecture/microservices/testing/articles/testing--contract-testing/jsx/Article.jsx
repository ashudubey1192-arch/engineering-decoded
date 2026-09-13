import "../css/Article.css";

export default function TestingContractTestingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A contract test lets a service and its consumers verify they agree on the shape of an API
          &mdash; without ever spinning up the other side at all &mdash; catching a breaking change
          months before it would otherwise surface as an incident between two teams who rarely talk.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A consumer publishes a <b>contract</b>: the exact requests it will make and the responses
          it expects back. The provider service then replays that contract against its own actual
          implementation &mdash; independent of the consumer's test suite, and without the consumer
          needing to be running at all &mdash; to confirm it still satisfies every consumer's
          expectations before it deploys anything.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>CheckoutService</code>'s contract with <code>InventoryService</code> states it will
          call <span className="badge">GET /stock/{"{sku}"}</span> and expects a response shaped like
          <code>{"{ sku, available, quantity }"}</code>. Before deploying any change,
          <code>InventoryService</code>'s CI pipeline replays this exact contract and fails the build
          if <code>quantity</code> is ever renamed or removed &mdash; catching the break long before
          <code>CheckoutService</code> would ever see it in production.
        </p>
        <span className="codeLabel">A CONSUMER-DEFINED CONTRACT</span>
        <div className="codeBlock">
          <pre>{`pact.given("sku_42 is in stock")
    .uponReceiving("a request for stock level")
    .withRequest({ method: "GET", path: "/stock/sku_42" })
    .willRespondWith({ status: 200, body: { sku: "sku_42", available: true, quantity: 18 } })`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of contract testing: CheckoutService publishes a contract to a broker, and InventoryService independently verifies its own implementation against that same contract during its own CI pipeline, with no live consumer involved.">
          <rect className="box" x="20" y="40" width="110" height="28" rx="6" />
          <text x="75" y="58" className="boxText" style={{fontSize:"6.5px"}}>CheckoutService</text>
          <rect className="boxAccent" x="155" y="40" width="100" height="28" rx="6" />
          <text x="205" y="58" className="boxText" style={{fontSize:"6.5px"}}>Contract broker</text>
          <rect className="box" x="280" y="40" width="120" height="28" rx="6" />
          <text x="340" y="58" className="boxText" style={{fontSize:"6.5px"}}>InventoryService CI</text>
          <line className="flow" x1="130" y1="54" x2="153" y2="54" />
          <text x="141" y="40" className="figHint" style={{fontSize:"5px"}}>publish</text>
          <line className="flow" x1="255" y1="54" x2="278" y2="54" />
          <text x="266" y="40" className="figHint" style={{fontSize:"5px"}}>verify</text>
          <text x="340" y="85" className="figHint" style={{fontSize:"6px"}}>no live CheckoutService needed</text>
        </svg>
        <figcaption>InventoryService verifies against the published contract during its own CI run &mdash; CheckoutService never needs to be running for the check to happen.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping contract tests because "we already have end-to-end tests" misses the point
          entirely &mdash; e2e tests only catch a break after both sides are deployed together, while
          contract tests catch it during CI, before either side ships anything. Writing a contract
          too loosely, accepting any shape of response, provides false confidence &mdash; it keeps
          passing even after a field the consumer actually depends on has been silently removed.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>InventoryService removes the "quantity" field from its response, and CheckoutService's published contract explicitly expects it. At what point does this get caught &mdash; and would it be caught at all if the two teams relied only on end-to-end tests?</p>
        </div>
      </section>
      <p className="takeaway">
        A contract test catches a broken agreement between two services during CI, before either one
        deploys &mdash; without needing to run the other service at all to find out.
      </p>
    </div>
  );
}
