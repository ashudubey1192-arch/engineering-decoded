import "../css/Article.css";

export default function DeploymentAutoscalingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Autoscaling automatically adjusts how many instances of a service are running based on
          real-time load, so capacity grows during a traffic spike and shrinks back afterward without
          anyone watching a dashboard and manually typing a scale command.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A horizontal autoscaler watches a metric &mdash; CPU utilization, memory, or a custom
          metric like queue depth &mdash; against a target threshold, and adjusts replica count to
          try to keep the observed metric near that target. Horizontal scaling (more instances) is
          far more common in microservices than vertical scaling (bigger instances), since it also
          improves fault tolerance &mdash; more independent replicas means any single one failing
          matters less.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <span className="codeLabel">TARGETING 60% AVERAGE CPU</span>
        <div className="codeBlock">
          <pre>{`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef: { name: order-service }
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource: { name: cpu, target: { averageUtilization: 60 } }`}</pre>
        </div>
        <p>
          A traffic spike drives average CPU to 85%. The autoscaler adds replicas until average CPU
          settles back near 60% &mdash; reaching 7 replicas &mdash; then scales back down toward the
          floor of 3 once the spike passes.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Chart showing replica count rising from 3 to 7 as CPU utilization spikes to 85 percent, then settling back down toward 3 replicas once the traffic spike passes and CPU returns near the 60 percent target.">
          <line className="flowMuted" x1="30" y1="110" x2="390" y2="110" />
          <polyline className="flow" points="30,95 120,95 200,35 300,45 390,100" style={{fill:"none"}} />
          <circle className="ringNode" cx="30" cy="95" r="3" />
          <text x="30" y="125" className="figHint" style={{fontSize:"5.5px"}}>3 replicas</text>
          <circle className="ringKey" cx="200" cy="35" r="3.5" />
          <text x="200" y="25" className="figHint" style={{fontSize:"5.5px"}}>7 replicas (spike)</text>
          <circle className="ringNode" cx="390" cy="100" r="3" />
          <text x="365" y="125" className="figHint" style={{fontSize:"5.5px"}}>back to 3</text>
        </svg>
        <figcaption>Replica count tracks the load spike upward, then settles back down once average CPU returns near the 60% target.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Scaling on a misleading metric &mdash; CPU, when the real bottleneck is a downstream
          database connection pool limit &mdash; means adding replicas doesn't help at all: each new
          replica just contends for the same limited downstream resource, and the situation can get
          worse, not better. Setting <code>minReplicas</code> too low for a service that can't
          tolerate a cold-start latency spike, or <code>maxReplicas</code> too low to actually absorb
          real peak load, undermines autoscaling's purpose in each direction.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>OrderService's autoscaler adds replicas based on CPU, but its real bottleneck under load is a downstream database connection limit. Why might adding more replicas fail to help, or even make things worse?</p>
        </div>
      </section>
      <p className="takeaway">
        Autoscaling adjusts capacity automatically to match real load &mdash; but only helps when the
        metric it watches actually reflects the real bottleneck, and its floor and ceiling are set to
        match real operating conditions.
      </p>
    </div>
  );
}
