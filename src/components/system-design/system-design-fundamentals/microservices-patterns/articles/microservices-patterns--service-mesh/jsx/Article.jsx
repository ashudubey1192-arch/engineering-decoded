import "../css/Article.css";

export default function MicroservicesPatternsServiceMeshArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A service mesh is a dedicated infrastructure layer — typically built from sidecars — that
          handles service-to-service communication concerns (routing, retries, encryption,
          observability) uniformly across every service, without any of that logic living in
          application code.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A mesh has two parts: a <b>data plane</b> — a sidecar proxy next to every service
          instance, handling the actual traffic — and a <b>control plane</b> that configures all
          those sidecars centrally (routing rules, security policy, certificates). Because every
          service's outbound and inbound traffic flows through its sidecar, the mesh can uniformly
          apply mTLS encryption, retries, timeouts, and collect consistent metrics and traces
          across every service, regardless of what language each one is written in.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Every service gets a sidecar.</b> Deploying with the mesh automatically attaches
            a proxy sidecar to each service instance.</li>
          <li><b>Control plane pushes policy.</b> An operator sets "all traffic between services
            must use mTLS" once, centrally.</li>
          <li><b>Sidecars enforce it.</b> Every sidecar picks up that policy and encrypts traffic
            automatically — no service's code changed.</li>
          <li><b>Observe uniformly.</b> The mesh reports consistent request metrics and traces for
            every service-to-service call, even across services written in different languages.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram of a control plane configuring sidecar proxies attached to three services, with all inter-service traffic flowing through the sidecars rather than directly between services.">
          <rect className="boxAccent" x="170" y="10" width="100" height="28" rx="5" /><text x="220" y="29" className="boxText">control plane</text>
          <line className="flowMuted" x1="190" y1="38" x2="90" y2="65" /><line className="flowMuted" x1="220" y1="38" x2="220" y2="65" /><line className="flowMuted" x1="250" y1="38" x2="350" y2="65" />
          {[[90, "svc A"], [220, "svc B"], [350, "svc C"]].map(([x, label], i) => (
            <g key={i}>
              <rect className="box" x={x - 45} y="65" width="90" height="26" rx="4" /><text x={x} y="82" className="boxText">sidecar</text>
              <rect className="box" x={x - 35} y="100" width="70" height="24" rx="4" /><text x={x} y="116" className="boxText">{label}</text>
            </g>
          ))}
          <line className="flow" x1="135" y1="78" x2="175" y2="78" /><line className="flow" x1="265" y1="78" x2="305" y2="78" />
        </svg>
        <figcaption>A central control plane configures every sidecar, which then enforces routing and security uniformly.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adopting a service mesh before you have enough services for its operational complexity to
          pay off is a common over-engineering trap — meshes add real operational overhead
          (upgrading, debugging the extra network hop) that's only worth it at meaningful
          microservice scale. Assuming a mesh replaces the need for good service design is another
          gap — it manages the network, not your architecture's actual coupling problems.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a service mesh enforce consistent mTLS encryption and observability across services written in different languages?</p>
        </div>
      </section>
      <p className="takeaway">
        A service mesh centralizes service-to-service networking concerns into a uniform,
        language-agnostic layer — valuable at real microservice scale, overkill below it.
      </p>
    </div>
  );
}
