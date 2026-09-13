import "../css/Article.css";

export default function DeploymentServiceConfigurationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The same container image needs to run unchanged in dev, staging, and production &mdash;
          which only works if every setting that differs between them lives outside the image
          entirely, injected at runtime rather than baked in at build time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Non-sensitive settings live in a <b>ConfigMap</b>; sensitive values (passwords, API keys)
          live in a separate <b>Secret</b>, handled with tighter access controls. Both are typically
          injected into a running container as environment variables or mounted files. The same
          image, deployed three times with three different config sources, becomes three different
          environments without ever being rebuilt.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <span className="codeLabel">A CONFIGMAP FOR PRODUCTION</span>
        <div className="codeBlock">
          <pre>{`apiVersion: v1
kind: ConfigMap
metadata: { name: order-service-config }
data:
  LOG_LEVEL: "info"
  PAYMENT_SERVICE_URL: "http://payment-service.prod.svc.cluster.local"`}</pre>
        </div>
        <p>
          The exact same <code>order-service:1.4.0</code> image, given a staging ConfigMap instead,
          points at a staging <code>PaymentService</code> URL with a more verbose log level &mdash;
          no rebuild required at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of one container image fed three different ConfigMaps for dev, staging, and production, producing three differently configured running instances from the exact same unchanged image.">
          <rect className="boxAccent" x="160" y="15" width="100" height="28" rx="5" />
          <text x="210" y="33" className="boxText" style={{fontSize:"6.5px"}}>order-service:1.4.0</text>
          {["Dev config","Staging config","Prod config"].map((t,i) => (
            <g key={t}>
              <line className="flowMuted" x1="210" y1="43" x2={70 + i*140} y2="65" />
              <rect className="box" x={20 + i*140} y="70" width="100" height="24" rx="5" />
              <text x={70 + i*140} y="86" className="boxText" style={{fontSize:"5.5px"}}>{t}</text>
              <rect className="box" x={20 + i*140} y="105" width="100" height="24" rx="5" />
              <text x={70 + i*140} y="121" className="boxText" style={{fontSize:"5.5px"}}>running instance</text>
              <line className="flowMuted" x1={70 + i*140} y1="94" x2={70 + i*140} y2="103" />
            </g>
          ))}
        </svg>
        <figcaption>One unchanged image, three different ConfigMaps &mdash; three different runtime environments, with zero rebuilds.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Baking a specific environment's URL directly into application code or the image means a
          new build is required just to move between environments, defeating externalization
          entirely. Storing a sensitive value, like a database password, in a plain ConfigMap
          instead of a Secret means it's stored and displayed in plain text everywhere the ConfigMap
          is readable, without any of a Secret's tighter access restrictions.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>The same order-service image is deployed to staging and production with two different ConfigMaps. Why does this avoid needing two different images?</p>
        </div>
      </section>
      <p className="takeaway">
        Externalizing configuration is what lets one image genuinely mean one build &mdash; every
        environment difference lives in a ConfigMap or Secret, never in the image itself.
      </p>
    </div>
  );
}
