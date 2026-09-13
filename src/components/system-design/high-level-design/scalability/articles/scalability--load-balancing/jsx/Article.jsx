import "../css/Article.css";

export default function ScalabilityLoadBalancingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The moment a design has more than one instance of a service, something has to decide
          which instance handles each incoming request &mdash; that&rsquo;s the load balancer, and
          it becomes the front door of the whole architecture.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A load balancer sits between clients and a fleet of identical service instances,
          distributing requests across them (round robin, least-connections, or by a consistent
          hash of the request). It also removes unhealthy instances from rotation via health
          checks, so a single failed node doesn&rsquo;t take down the whole service. In an HLD
          diagram, it&rsquo;s the box that appears the instant horizontal scaling shows up.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Traffic outgrows one instance.</b> Three identical API service instances are
            deployed to share the load.</li>
          <li><b>A load balancer is placed in front of them,</b> becoming the single entry point
            clients actually connect to.</li>
          <li><b>It health-checks each instance</b> every few seconds, routing only to instances
            that respond successfully.</li>
          <li><b>One instance crashes.</b> The load balancer stops sending it traffic within one
            health-check interval &mdash; clients notice nothing beyond a brief blip.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a load balancer distributing requests across three service instances, with a health check line to each and one instance marked unhealthy and removed from rotation." >
          <rect className="box" x="20" y="45" width="70" height="34" rx="6" /><text x="55" y="67" className="boxText">Client</text>
          <line className="flow" x1="90" y1="62" x2="140" y2="62" />
          <rect className="boxAccent" x="150" y="47" width="70" height="30" rx="6" /><text x="185" y="66" className="boxText" style={{fontSize:"9px"}}>LB</text>
          <line className="flow" x1="220" y1="55" x2="270" y2="25" />
          <line className="flow" x1="220" y1="62" x2="270" y2="62" />
          <line className="flowMuted" x1="220" y1="70" x2="270" y2="100" />
          <rect className="box" x="275" y="10" width="60" height="26" rx="5" /><text x="305" y="27" className="boxText" style={{fontSize:"8px"}}>node A</text>
          <rect className="box" x="275" y="49" width="60" height="26" rx="5" /><text x="305" y="66" className="boxText" style={{fontSize:"8px"}}>node B</text>
          <rect className="boxWarn" x="275" y="88" width="60" height="26" rx="5" /><text x="305" y="105" className="boxText" style={{fontSize:"8px"}}>unhealthy</text>
        </svg>
        <figcaption>The load balancer stops routing to an unhealthy node as soon as its health checks start failing.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forgetting that the load balancer itself can become a single point of failure is a
          common oversight &mdash; production designs run at least two load balancer instances
          behind a shared virtual IP or DNS. Sticky sessions (always routing one client to the
          same instance) also quietly reintroduce the statelessness problem horizontal scaling was
          supposed to solve.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a load balancer typically need to run as more than one instance itself, rather than as a single box?</p>
        </div>
      </section>
      <p className="takeaway">
        A load balancer is what makes a fleet of instances behave like one reliable service to the
        outside world &mdash; but it needs the same redundancy thinking applied to everything behind it.
      </p>
    </div>
  );
}
