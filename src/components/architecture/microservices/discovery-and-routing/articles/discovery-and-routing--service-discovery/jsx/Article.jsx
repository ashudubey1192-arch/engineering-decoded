import "../css/Article.css";

export default function DiscoveryAndRoutingServiceDiscoveryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Service discovery answers a question that only exists because services scale
          independently and move around: given a service's name, which of its currently-running
          instances, at which currently-valid network addresses, should actually handle this call
          right now?
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A <b>service registry</b> keeps a live list of healthy instances for each service name.
          Instances <b>register</b> themselves (or are registered by their platform) on startup and
          send periodic heartbeats; the registry drops any instance that stops heartbeating, on the
          assumption it's crashed or is unreachable. Callers look up a service by name and get back
          one or more currently-healthy addresses &mdash; never a fixed, hardcoded IP that might
          belong to an instance that no longer exists.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>InventoryService</code> autoscales from 3 to 9 instances during a flash sale, and
          Kubernetes reschedules two of them onto different nodes after a node failure. Every one of
          those changes updates addresses that a hardcoded configuration file would get wrong within
          minutes. Instead, callers ask the registry for "InventoryService" and always get back
          whichever addresses are healthy right now.
        </p>
        <span className="codeLabel">REGISTRY LOOKUP, NOT A HARDCODED ADDRESS</span>
        <div className="codeBlock">
          <pre>{`// wrong: const inventoryUrl = "http://10.0.4.12:8080"
const instances = await registry.lookup("InventoryService")
// instances: [{ host: "10.0.4.18", port: 8080 }, { host: "10.0.4.21", port: 8080 }, ...]`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of service discovery: three InventoryService instances register themselves and send heartbeats to a registry, and a caller looks up InventoryService by name to get back the current list of healthy addresses.">
          {[0,1,2].map(i => (
            <g key={i}>
              <rect className="box" x={20 + i*90} y="15" width="75" height="26" rx="5" />
              <text x={57 + i*90} y="32" className="boxText" style={{fontSize:"6px"}}>Instance {i+1}</text>
              <line className="flowMuted" x1={57 + i*90} y1="41" x2="210" y2="70" />
            </g>
          ))}
          <rect className="boxAccent" x="165" y="70" width="90" height="30" rx="6" />
          <text x="210" y="89" className="boxText" style={{fontSize:"6.5px"}}>Registry</text>
          <rect className="box" x="320" y="70" width="80" height="30" rx="6" />
          <text x="360" y="89" className="boxText" style={{fontSize:"6.5px"}}>Caller</text>
          <line className="flow" x1="255" y1="85" x2="318" y2="85" />
          <text x="288" y="72" className="figHint" style={{fontSize:"5px"}}>lookup</text>
          <text x="210" y="55" className="figHint" style={{fontSize:"6px"}}>register + heartbeat</text>
        </svg>
        <figcaption>Instances register and heartbeat continuously; a caller always gets back the currently-healthy list, never a fixed address.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Hardcoding an instance's IP address anywhere in configuration defeats the entire point
          &mdash; it works until the very next deploy, autoscale event, or node failure moves that
          instance. The other common mistake is a heartbeat interval so long, or a "mark unhealthy"
          threshold so lenient, that a crashed instance keeps receiving traffic for minutes after it
          actually died.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>InventoryService autoscales from 3 to 9 instances during a flash sale. What would break if callers used a hardcoded list of the original 3 addresses instead of a registry lookup?</p>
        </div>
      </section>
      <p className="takeaway">
        Service discovery exists because "where is this service running" is a question that changes
        constantly at runtime &mdash; the registry is what keeps the answer current.
      </p>
    </div>
  );
}
