import "../css/Article.css";

export default function MicroservicesPatternsServiceDiscoveryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Service discovery is how one service finds the current network location of another, in
          a world where instances are constantly starting, stopping, and moving between machines —
          so nobody can just hardcode an IP address.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A <b>service registry</b> (Consul, etcd, Eureka, or a cloud provider's built-in registry)
          keeps a live list of which instances of each service are currently healthy and where they
          are. Instances register themselves on startup and send heartbeats; the registry drops
          entries that stop responding. A caller looks up "orders-service" in the registry instead
          of a fixed address, and gets back one or more current, healthy instance locations.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Instance starts.</b> A new orders-service instance boots and registers itself
            with the registry, including its IP and port.</li>
          <li><b>Heartbeats keep it listed.</b> It periodically pings the registry to prove it's
            still healthy.</li>
          <li><b>Caller looks it up.</b> The cart service asks the registry "where is
            orders-service" instead of using a hardcoded address.</li>
          <li><b>Instance crashes.</b> Heartbeats stop, the registry removes it after a timeout,
            and new lookups no longer return the dead instance.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of service instances registering themselves with a registry, and a caller looking up a healthy instance location from that registry before calling it directly.">
          <rect className="boxAccent" x="180" y="15" width="100" height="30" rx="5" /><text x="230" y="35" className="boxText">registry</text>
          <line className="flowMuted" x1="200" y1="45" x2="100" y2="80" /><line className="flowMuted" x1="260" y1="45" x2="360" y2="80" />
          <rect className="box" x="60" y="85" width="90" height="28" rx="4" /><text x="105" y="103" className="boxText">instance A</text>
          <rect className="box" x="310" y="85" width="90" height="28" rx="4" /><text x="355" y="103" className="boxText">instance B</text>
          <text x="140" y="65" className="figHint">register/heartbeat</text>
          <line className="flow" x1="230" y1="45" x2="230" y2="100" />
          <rect className="box" x="185" y="87" width="90" height="26" rx="4" /><text x="230" y="104" className="boxText">caller</text>
          <text x="230" y="128" className="figHint" textAnchor="middle">"where is orders-service?" → lookup, then call directly</text>
        </svg>
        <figcaption>Instances register and heartbeat; callers look up current, healthy locations instead of hardcoding them.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Hardcoding service addresses "temporarily" tends to become permanent technical debt that
          breaks the moment instances move or scale. Not handling a registry lookup failure
          gracefully (falling back to cached results, retrying) also makes the registry itself a
          new single point of failure if it's ever unavailable.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does hardcoding a service's IP address break down once that service runs as multiple auto-scaled, frequently-restarted instances?</p>
        </div>
      </section>
      <p className="takeaway">
        Service discovery replaces fixed addresses with a live, health-checked directory — the
        foundation that lets services scale, restart, and move without breaking their callers.
      </p>
    </div>
  );
}
