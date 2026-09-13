import "../css/Article.css";

export default function DistributedSystemsServiceDiscoveryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Once services scale to many, constantly-changing instances, hardcoding &ldquo;call this
          IP address&rdquo; stops working &mdash; service discovery is how one service finds a
          current, healthy instance of another without that address ever being hardcoded.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each service instance registers itself with a <b>service registry</b> on startup, and
          removes itself (or is removed via health check) on shutdown. When one service needs to
          call another, it asks the registry for a current list of healthy instances rather than
          using a fixed address &mdash; often paired with client-side load balancing to pick one.
          This is what lets a fleet scale up, scale down, or reschedule instances continuously
          without any other service needing to be reconfigured.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>The orders service needs to call the inventory service,</b> which runs as a
            fleet of instances that scales up and down with load.</li>
          <li><b>Each inventory instance registers itself</b> with the service registry on startup,
            including its address and a health-check endpoint.</li>
          <li><b>The orders service asks the registry</b> &ldquo;give me healthy inventory
            instances&rdquo; instead of using a fixed address.</li>
          <li><b>The inventory fleet scales from 3 to 8 instances</b> during a sale &mdash; the
            orders service picks this up automatically through the registry, with no
            reconfiguration or redeploy needed.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of service instances registering themselves with a central registry, and a caller querying the registry for a current list of healthy instances instead of using a fixed address." >
          {[0,1,2].map(i => (<rect key={i} className="box" x={280} y={10 + i*35} width="80" height="26" rx="5" />))}
          {[0,1,2].map(i => (<text key={i} x="320" y={27 + i*35} className="boxText" textAnchor="middle" style={{fontSize:"8px"}}>instance {i+1}</text>))}
          {[0,1,2].map(i => (<line key={i} className="flowMuted" x1="280" y1={23+i*35} x2="230" y2="60" />))}
          <rect className="boxAccent" x="150" y="45" width="80" height="30" rx="6" /><text x="190" y="64" className="boxText" style={{fontSize:"8px"}}>Registry</text>
          <line className="flow" x1="150" y1="60" x2="90" y2="60" />
          <rect className="box" x="15" y="45" width="75" height="30" rx="6" /><text x="52" y="64" className="boxText" style={{fontSize:"8px"}}>Orders svc</text>
        </svg>
        <figcaption>The caller asks the registry for a current, healthy instance instead of relying on a fixed address.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Hardcoding instance addresses, even &ldquo;temporarily,&rdquo; becomes a maintenance
          burden the moment the fleet size changes even once. Forgetting that the registry itself
          needs to be highly available &mdash; it becomes a single point of failure for
          practically every service-to-service call if it goes down.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What breaks if a service calls another via a hardcoded address instead of through service discovery, once the fleet size starts changing?</p>
        </div>
      </section>
      <p className="takeaway">
        Service discovery is what makes a fleet of instances elastic from every other service&rsquo;s
        point of view &mdash; instances can come and go freely as long as they register and
        de-register correctly.
      </p>
    </div>
  );
}
