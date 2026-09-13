import "../css/Article.css";

export default function DeploymentKubernetesFundamentalsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Kubernetes looks enormous from the outside, but nearly everything you'll read about it
          builds on just a few core building blocks &mdash; learning those first makes the rest of
          the ecosystem click into place.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A <b>Pod</b> is the smallest deployable unit &mdash; one or more tightly-coupled containers
          sharing network and storage. A <b>Deployment</b> declares "I want N replicas of this Pod
          running" and continuously reconciles reality against that desired state, restarting failed
          Pods and replacing them on updates. A <b>Service</b> gives callers one stable network
          address in front of a changing set of Pod replicas, since individual Pods are ephemeral and
          get new IPs whenever they're recreated.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <span className="codeLabel">A DEPLOYMENT REQUESTING 3 REPLICAS</span>
        <div className="codeBlock">
          <pre>{`apiVersion: apps/v1
kind: Deployment
metadata: { name: order-service }
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: order-service
        image: order-service:1.4.0`}</pre>
        </div>
        <p>
          A <code>Service</code> placed in front of this Deployment routes traffic to whichever 3
          Pods are currently healthy at any given moment &mdash; callers never need to know, or
          track, any individual Pod's IP address.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of a Deployment managing three Pods, with a Service in front providing one stable address that load-balances across whichever Pods are currently healthy.">
          <rect className="box" x="20" y="15" width="120" height="26" rx="5" />
          <text x="80" y="32" className="boxText" style={{fontSize:"6.5px"}}>Deployment (n=3)</text>
          {[0,1,2].map(i => (
            <g key={i}>
              <rect className="box" x={20 + i*90} y="60" width="75" height="28" rx="5" />
              <text x={57 + i*90} y="78" className="boxText" style={{fontSize:"6px"}}>Pod {i+1}</text>
              <line className="flowMuted" x1="80" y1="41" x2={57 + i*90} y2="58" />
            </g>
          ))}
          <rect className="boxAccent" x="290" y="60" width="110" height="28" rx="5" />
          <text x="345" y="78" className="boxText" style={{fontSize:"6.5px"}}>Service</text>
          {[0,1,2].map(i => (
            <line key={i} className="flow" x1={95 + i*90} y1="74" x2="290" y2="74" />
          ))}
          <text x="345" y="105" className="figHint" style={{fontSize:"6px"}}>one stable address</text>
        </svg>
        <figcaption>The Deployment keeps 3 Pods running; the Service gives callers one address that survives any individual Pod being replaced.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Calling a Pod's IP address directly instead of going through its Service breaks the moment
          Kubernetes reschedules that Pod and assigns it a new IP &mdash; Pods are meant to be
          treated as disposable. Setting <code>replicas: 1</code> on a Deployment that's supposed to
          be highly available defeats the purpose of using a Deployment at all: with a single
          replica, one Pod failure is a full outage for however long it takes to reschedule.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A Deployment manages 3 replicas of OrderService, and each Pod gets a new random IP whenever it's recreated. Why should callers reach OrderService through its Service instead of a specific Pod's IP address?</p>
        </div>
      </section>
      <p className="takeaway">
        A Deployment keeps the desired number of Pods running; a Service gives callers one stable
        address in front of Pods that come and go &mdash; nearly everything else in Kubernetes builds
        on exactly this pair.
      </p>
    </div>
  );
}
