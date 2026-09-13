import "../css/Article.css";

export default function ServiceDecompositionAvoidingDistributedMonolithsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A distributed monolith is the worst of both worlds: services that are physically separate
          processes but so tightly coupled &mdash; through a shared database, chatty synchronous
          calls, or coordinated deploys &mdash; that they can only ever be released and scaled
          together, just like a monolith, but now with network latency and partial-failure modes on
          top.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>Three habits reliably produce a distributed monolith:</p>
        <ul className="stepList">
          <li><b>Shared database</b> &mdash; any two services reading or writing the same tables are coupled at the schema level, whether or not they're separate deployables.</li>
          <li><b>Synchronous call chains</b> &mdash; Service A calling B calling C calling D, all within one request, means A is only as available as the least available link in that chain.</li>
          <li><b>Lockstep deploys</b> &mdash; if deploying Service A always requires deploying Service B in the same release window, they're not actually independent.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A checkout flow calls <code>CheckoutService &rarr; PricingService &rarr; TaxService &rarr;
          PromotionsService</code> synchronously, all within one HTTP request, and all four share one
          Postgres instance. When <code>TaxService</code> is slow, checkout is slow. When anyone
          changes a shared table's schema, all four services need testing together. Four
          deployables; one true unit of failure and one true unit of release &mdash; a distributed
          monolith in every way that matters operationally.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of four services chained together synchronously in one request path, Checkout to Pricing to Tax to Promotions, all sharing one database, forming a single unit of failure despite being four separate deployables.">
          {["Checkout","Pricing","Tax","Promotions"].map((t,i) => (
            <g key={t}>
              <rect className="boxWarn" x={15 + i*100} y="25" width="85" height="30" rx="6" />
              <text x={57 + i*100} y="44" className="boxText" style={{fontSize:"6.5px"}}>{t}</text>
              {i < 3 && <line className="flow" x1={100 + i*100} y1="40" x2={115 + i*100} y2="40" />}
            </g>
          ))}
          <rect className="box" x="140" y="80" width="140" height="26" rx="5" />
          <text x="210" y="97" className="figHint" style={{fontSize:"6.5px"}}>one shared database</text>
          {[0,1,2,3].map(i => (<line key={i} className="flowMuted" x1={57 + i*100} y1="55" x2={175 + i*30} y2="80" />))}
        </svg>
        <figcaption>Four processes, but one synchronous chain and one shared database &mdash; a slow or broken Tax service takes down the whole checkout path.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Measuring "microservices adoption" by counting deployables instead of by checking for these
          three habits is how teams end up here without noticing &mdash; the service count goes up
          while true independence goes down. Believing a synchronous call chain is fine because "the
          services are still separate codebases" ignores that availability is what actually matters
          in production, and a four-deep synchronous chain has the combined availability of its
          weakest link, not its strongest.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Four services are deployed independently but share one database and call each other synchronously in a chain within every request. In what sense are they still effectively one monolith?</p>
        </div>
      </section>
      <p className="takeaway">
        Counting separate deployables tells you nothing about real independence &mdash; check for a
        shared database, long synchronous chains, and lockstep releases before calling something
        microservices.
      </p>
    </div>
  );
}
