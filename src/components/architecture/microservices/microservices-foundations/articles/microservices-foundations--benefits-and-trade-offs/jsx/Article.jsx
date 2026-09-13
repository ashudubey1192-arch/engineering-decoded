import "../css/Article.css";

export default function MicroservicesFoundationsBenefitsAndTradeOffsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Every benefit microservices offer is bought with a specific, matching cost &mdash; the
          style doesn't remove complexity, it relocates it from inside one codebase to the space
          between services, where it shows up as network calls, operational tooling, and coordination.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>WHAT YOU GET, AND WHAT IT COSTS</caption>
          <thead><tr><th>Benefit</th><th>The cost that pays for it</th></tr></thead>
          <tbody>
            <tr><td>Independent deployability</td><td>Versioned APIs and backward-compatibility discipline between services</td></tr>
            <tr><td>Scale only what's hot</td><td>Per-service infrastructure, monitoring, and on-call ownership</td></tr>
            <tr><td>Tech stack per service</td><td>More languages/runtimes for the org to actually support in production</td></tr>
            <tr><td>Fault isolation</td><td>Distributed failure handling &mdash; timeouts, retries, fallbacks &mdash; everywhere</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A single "apply a discount code at checkout" feature used to be one pull request in a
          monolith. Split across <code>CheckoutService</code>, <code>PromotionsService</code>, and
          <code>PricingService</code>, it becomes three pull requests, an agreed API contract change
          between them, and a coordinated rollout order &mdash; because <code>PricingService</code>
          has to accept the new discount field before <code>CheckoutService</code> can start sending
          it, or every request in between fails validation.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of one feature change requiring three coordinated deploys in order: PricingService first to accept a new field, then PromotionsService, then CheckoutService to start sending it.">
          {["1. PricingService\naccepts new field","2. PromotionsService\ncomputes it","3. CheckoutService\nsends it"].map((t,i) => (
            <g key={i}>
              <rect className={i===0 ? "boxAccent" : "box"} x={15 + i*140} y="40" width="120" height="46" rx="7" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={75 + i*140} y={60 + li*13} className="boxText" style={{fontSize:"6.5px"}}>{line}</text>
              ))}
              {i < 2 && <line className="flow" x1={135 + i*140} y1="63" x2={155 + i*140} y2="63" />}
            </g>
          ))}
          <text x="210" y="110" className="figHint" style={{fontSize:"6.5px"}}>one feature, three deploys, in a required order</text>
        </svg>
        <figcaption>One logical change now needs three separate, ordered deploys &mdash; the coordination the monolith used to give away for free.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adopting microservices for the benefits column without budgeting for the cost column is
          the single most common failure pattern: teams gain independent deployability on paper but
          have no API versioning discipline, so every cross-service change is still a coordinated,
          risky rollout in practice &mdash; all of the distributed-systems cost, none of the
          independence benefit. Investing in per-service tech diversity before investing in shared
          observability tooling is the second: five languages in production with no unified logging
          or tracing makes a bad incident far worse than the flexibility was worth.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A team lists "independent deployability" as a benefit of their new microservices, but every feature still needs a coordinated, ordered rollout across three services. What cost did they skip paying for?</p>
        </div>
      </section>
      <p className="takeaway">
        Before splitting a service, name the specific cost you're taking on for each benefit you
        want &mdash; if you can't name the cost, you likely can't collect the benefit either.
      </p>
    </div>
  );
}
