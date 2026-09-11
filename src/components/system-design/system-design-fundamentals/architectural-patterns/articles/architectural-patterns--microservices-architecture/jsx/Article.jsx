import "../css/Article.css";

export default function ArchitecturalPatternsMicroservicesArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Microservices split a system into small, independently deployable services, each owning
          its own data and communicating over the network — trading the monolith's simplicity for
          independent scaling, deployment, and team ownership.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each service is built, deployed, and scaled independently, typically owns its own
          database (no other service reaches in directly), and exposes a well-defined API. That
          independence is the whole point — a team can deploy their service without coordinating
          with every other team — but it comes at the cost of network calls where function calls
          used to be, the need to handle partial failures, and operational overhead (service
          discovery, monitoring, deployment pipelines) multiplied by the number of services.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Split by business capability.</b> The e-commerce monolith becomes separate{" "}
            <code>catalog</code>, <code>cart</code>, <code>orders</code>, and{" "}
            <code>users</code> services.</li>
          <li><b>Each owns its data.</b> The orders service has its own database; the catalog
            service can't query it directly — it calls the orders API.</li>
          <li><b>Deploy independently.</b> The catalog team ships three times a day; the orders
            team ships weekly — neither blocks the other.</li>
          <li><b>Handle the network.</b> A call from cart to catalog can now time out or fail
            outright — code has to handle that, where an in-process function call never could.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of four independent microservices, each with its own database, communicating with each other over the network via APIs.">
          {["catalog", "cart", "orders", "users"].map((m, i) => (
            <g key={m}>
              <rect className="boxAccent" x={20 + i * 105} y="20" width="85" height="34" rx="5" /><text x={62 + i * 105} y="42" className="boxText">{m}</text>
              <rect className="box" x={35 + i * 105} y="70" width="55" height="24" rx="4" /><text x={62 + i * 105} y="86" className="boxText">DB</text>
              <line className="flowMuted" x1={62 + i * 105} y1="54" x2={62 + i * 105} y2="70" />
            </g>
          ))}
          <line className="flow" x1="105" y1="37" x2="125" y2="37" /><line className="flow" x1="210" y1="37" x2="230" y2="37" /><line className="flow" x1="315" y1="37" x2="335" y2="37" />
          <text x="220" y="120" className="figHint" textAnchor="middle">each service: own deploy, own database, talks over the network</text>
        </svg>
        <figcaption>Independent services, independent data, network calls where a monolith had function calls.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Splitting services along technical layers (a "database service," a "business logic
          service") instead of business capabilities creates chatty, tightly-coupled services that
          behave like a distributed monolith — all the network overhead, none of the independence.
          Skipping investment in observability and service-to-service resilience (timeouts,
          retries, circuit breakers) is the other classic gap.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does splitting services by business capability tend to work better than splitting by technical layer?</p>
        </div>
      </section>
      <p className="takeaway">
        Microservices buy independent scaling and deployment at the cost of network calls,
        partial failure, and real operational overhead — worth it once a monolith's coordination
        pain outweighs that cost, not by default.
      </p>
    </div>
  );
}
