import "../css/Article.css";

export default function MicroservicesPatternsSidecarPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The sidecar pattern runs a helper process alongside your main application — in its own
          container, but sharing its lifecycle — to handle cross-cutting concerns like networking,
          logging, or security, without that code living inside your application itself.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of every service reimplementing things like TLS handling, retries, or metrics
          collection in its own language and codebase, a sidecar process runs next to it (typically
          in the same pod in Kubernetes) and handles that concern generically. The main application
          talks to its sidecar over localhost, oblivious to the fact that the sidecar is doing
          extra work like encrypting traffic or reporting metrics. This is how most service meshes
          are implemented under the hood.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Deploy app + sidecar together.</b> A Java service and an Envoy proxy sidecar are
            deployed in the same Kubernetes pod, sharing the pod's network namespace.</li>
          <li><b>App calls "localhost."</b> The Java service sends its outbound calls to the
            sidecar on localhost, not directly to other services.</li>
          <li><b>Sidecar handles the hard part.</b> It manages retries, TLS, load balancing across
            instances of the destination service, and reports metrics — all outside the
            application's code.</li>
          <li><b>Upgrade the sidecar independently.</b> Rolling out a new retry policy means
            updating the sidecar, with zero changes to the Java application itself.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of an application container and a sidecar proxy container running together in the same pod, with the application routing outbound traffic through the sidecar.">
          <rect className="box" x="30" y="30" width="340" height="70" rx="8" />
          <text x="200" y="20" className="figLabel" textAnchor="middle">SAME POD</text>
          <rect className="boxAccent" x="50" y="45" width="140" height="40" rx="5" /><text x="120" y="69" className="boxText">application</text>
          <line className="flow" x1="190" y1="65" x2="230" y2="65" />
          <rect className="box" x="240" y="45" width="110" height="40" rx="5" /><text x="295" y="69" className="boxText">sidecar proxy</text>
          <text x="205" y="115" className="figHint" textAnchor="middle">app talks to "localhost" — sidecar handles the network</text>
        </svg>
        <figcaption>The sidecar shares the app's lifecycle and handles cross-cutting concerns outside its code.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adding a sidecar to every service without measuring the added resource overhead (each
          sidecar consumes its own CPU/memory) can add up significantly at scale. Not understanding
          that the sidecar shares the fate of its pod — if the pod is killed, both go down together
          — matters when reasoning about failure modes.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does putting retry logic and TLS handling in a sidecar avoid reimplementing it separately in every service's own language?</p>
        </div>
      </section>
      <p className="takeaway">
        A sidecar pulls cross-cutting infrastructure concerns out of application code and into a
        shared, language-agnostic helper process — the foundation most service meshes are built on.
      </p>
    </div>
  );
}
