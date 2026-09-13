import "../css/Article.css";

export default function ArchitecturePatternsSidecarPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A sidecar attaches a separate helper process to a service, deployed alongside it and
          sharing its lifecycle, to handle a cross-cutting concern &mdash; logging, TLS, retries
          &mdash; without writing that same logic into every service's own codebase, in every
          language they happen to use.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The sidecar runs as its own process, often its own container inside the same Pod,
          intercepting or supplementing the main service's traffic. It's deployed, scaled, and
          restarted together with the service it's attached to, but developed and updated
          independently &mdash; a networking or security team can ship a sidecar update without
          touching a single application team's code.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Every service gets an Envoy sidecar handling mTLS and retries transparently.
          <code>OrderService</code>'s own code makes a plain HTTP call to
          <code>PaymentService</code>; its sidecar intercepts that call, encrypts it with mTLS,
          retries on transient failure, and only then does the request actually leave the Pod &mdash;
          none of that logic lives in <code>OrderService</code>'s own code at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 380 130" role="img" aria-label="Diagram of a Pod containing OrderService's own container alongside a sidecar container, where the sidecar intercepts OrderService's outbound plain HTTP call and adds mTLS encryption and retries before the request leaves the Pod.">
          <rect className="box" x="20" y="15" width="340" height="95" rx="10" />
          <text x="190" y="30" className="figLabel">POD</text>
          <rect className="box" x="45" y="45" width="130" height="40" rx="6" />
          <text x="110" y="69" className="boxText" style={{fontSize:"6.5px"}}>OrderService</text>
          <rect className="boxAccent" x="205" y="45" width="130" height="40" rx="6" />
          <text x="270" y="63" className="boxText" style={{fontSize:"6.5px"}}>Sidecar (Envoy)</text>
          <text x="270" y="76" className="figHint" style={{fontSize:"5px"}}>mTLS + retries</text>
          <line className="flow" x1="175" y1="65" x2="203" y2="65" />
          <text x="270" y="105" className="figHint" style={{fontSize:"5.5px"}}>only the sidecar's traffic leaves the Pod</text>
        </svg>
        <figcaption>OrderService's plain HTTP call never leaves the Pod directly &mdash; its sidecar adds mTLS and retries first, transparently.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing the same cross-cutting logic independently inside each service's own code,
          each in its own language, instead of via a shared sidecar creates duplicated, inconsistent
          implementations that all need separate updates whenever the policy changes. Treating the
          sidecar as free is the other common mistake &mdash; it still consumes its own CPU and
          memory per instance, and multiplied across hundreds of Pods, that overhead is real and
          needs its own budget.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>OrderService's own code makes a plain, unencrypted HTTP call to PaymentService. How does that call end up protected by mTLS without OrderService's code ever handling TLS itself?</p>
        </div>
      </section>
      <p className="takeaway">
        A sidecar moves a cross-cutting concern out of every service's own code and into a shared,
        independently-updatable process deployed right alongside it.
      </p>
    </div>
  );
}
