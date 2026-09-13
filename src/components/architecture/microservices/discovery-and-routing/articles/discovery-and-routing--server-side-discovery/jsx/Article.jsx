import "../css/Article.css";

export default function DiscoveryAndRoutingServerSideDiscoveryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Server-side discovery moves the registry lookup out of every caller and into one piece of
          shared infrastructure &mdash; a load balancer or router that stays in sync with the
          registry itself, so callers can stay completely unaware that discovery is happening at
          all.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The router (commonly a cloud load balancer, or a service mesh's data plane) subscribes to
          registry changes and keeps its own routing table current &mdash; new instances become
          reachable within seconds of registering, and failed instances are removed just as fast,
          all invisibly to callers. Callers keep a single, stable address for a service forever;
          everything about scaling, failure, and rebalancing happens behind that one address.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>CheckoutService</code>'s code always calls
          <code>http://inventory-service.internal/</code>, unchanged since the day it was written.
          Behind that address, a load balancer watches the registry and currently routes to 6
          instances; during a deploy it temporarily excludes 2 instances mid-rollout, and during a
          flash sale it picks up 3 newly autoscaled ones &mdash; none of which requires a single line
          change in <code>CheckoutService</code>.
        </p>
        <span className="codeLabel">CALLER-SIDE CODE, NEVER CHANGES</span>
        <div className="codeBlock">
          <pre>{`const res = await fetch("http://inventory-service.internal/items/sku_1842")
// same code whether there are 3 instances behind it or 30`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of server-side discovery: CheckoutService always calls one stable load-balancer address, while the load balancer subscribes to registry changes and continuously updates which of a changing set of InventoryService instances actually receive traffic.">
          <rect className="box" x="20" y="45" width="110" height="28" rx="6" />
          <text x="75" y="63" className="boxText" style={{fontSize:"6.5px"}}>CheckoutService</text>
          <rect className="boxAccent" x="170" y="45" width="110" height="28" rx="6" />
          <text x="225" y="63" className="boxText" style={{fontSize:"6.5px"}}>Load balancer</text>
          <line className="flow" x1="130" y1="59" x2="168" y2="59" />
          <text x="150" y="45" className="figHint" style={{fontSize:"5px"}}>stable address</text>
          {[0,1,2].map(i => (
            <g key={i}>
              <rect className="box" x={330} y={20+i*35} width="80" height="24" rx="5" />
              <text x={370} y={36+i*35} className="boxText" style={{fontSize:"6px"}}>Instance {i+1}</text>
            </g>
          ))}
          <line className="flow" x1="280" y1="55" x2="328" y2="32" />
          <line className="flow" x1="280" y1="59" x2="328" y2="67" />
          <line className="flowMuted" x1="280" y1="63" x2="328" y2="102" />
          <text x="225" y="100" className="figHint" style={{fontSize:"6px"}}>subscribes to registry changes</text>
        </svg>
        <figcaption>CheckoutService's address never changes; the load balancer alone tracks which instances (here, one recently removed) are actually live.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating the load balancer as a simple, static piece of infrastructure and forgetting it
          needs its own high-availability plan is a common oversight &mdash; every caller now depends
          on it, so an outage there is an outage for every service behind it, not just one. The other
          mistake is a load balancer with a stale or slow-to-refresh view of the registry, which can
          keep routing to instances that have already failed for longer than callers would tolerate.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>InventoryService scales from 6 to 9 instances during a flash sale. What, if anything, needs to change in CheckoutService's code for it to start using the 3 new instances?</p>
        </div>
      </section>
      <p className="takeaway">
        Server-side discovery buys every caller a permanently stable address, at the cost of making
        the router in front of it critical, shared infrastructure that now needs its own reliability
        plan.
      </p>
    </div>
  );
}
