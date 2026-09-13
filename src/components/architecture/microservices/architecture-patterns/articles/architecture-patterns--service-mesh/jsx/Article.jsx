import "../css/Article.css";

export default function ArchitecturePatternsServiceMeshArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A service mesh moves cross-cutting networking concerns &mdash; retries, mTLS, traffic
          routing, observability &mdash; out of every individual service's code and into a dedicated
          infrastructure layer, standardizing the sidecar idea into something centrally configured
          across an entire system at once.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The mesh's <b>data plane</b> is the set of sidecars actually intercepting every service's
          traffic. The <b>control plane</b> is where operators define policy once &mdash;
          "<code>PaymentService</code> calls should retry twice with backoff" &mdash; and the mesh
          pushes that configuration out to every relevant sidecar automatically, without touching a
          single service's code.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          An operator wants every call to <code>PaymentService</code>, from any caller anywhere in the
          system, to retry twice with backoff. Instead of updating that logic in every calling
          service's own codebase, they set one policy in the mesh's control plane, and every sidecar
          handling traffic toward <code>PaymentService</code> picks it up automatically, mesh-wide.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of a service mesh: a central control plane at the top pushes one retry policy down to three separate sidecars, each attached to a different service, in the data plane below.">
          <rect className="boxAccent" x="150" y="15" width="120" height="28" rx="6" />
          <text x="210" y="33" className="boxText" style={{fontSize:"6.5px"}}>Control plane</text>
          {[0,1,2].map(i => (
            <g key={i}>
              <line className="flowMuted" x1="210" y1="43" x2={80 + i*130} y2="75" />
              <rect className="box" x={30 + i*130} y="80" width="100" height="26" rx="5" />
              <text x={80 + i*130} y="97" className="boxText" style={{fontSize:"5.5px"}}>Sidecar {i+1}</text>
            </g>
          ))}
          <text x="210" y="125" className="figHint" style={{fontSize:"6px"}}>one policy, pushed to every sidecar automatically</text>
        </svg>
        <figcaption>One retry policy, set once in the control plane, reaches every sidecar in the data plane &mdash; no service code changes anywhere.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adopting a service mesh before the number of services and the cross-cutting complexity
          actually justify it adds real operational overhead &mdash; another system to run,
          understand, and debug &mdash; without a proportional benefit; small systems with a handful
          of services rarely need one yet. Treating the mesh as a substitute for application-level
          error handling, rather than a complement to it, leaves services unable to make sensible
          business decisions, like showing a fallback, purely because network-level retries were
          assumed to handle everything.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A team with 4 services is deciding whether to adopt a service mesh mainly to get consistent retry policies. What operational cost are they taking on, and might a simpler shared library achieve the same result at this scale?</p>
        </div>
      </section>
      <p className="takeaway">
        A service mesh standardizes and centrally controls what the sidecar pattern does per
        service &mdash; valuable once the number of services makes consistent, code-free policy
        changes worth the added operational layer.
      </p>
    </div>
  );
}
