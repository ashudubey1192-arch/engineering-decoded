import "../css/Article.css";

export default function OperationsLoggingAndMonitoringArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Logging records what happened; monitoring watches metrics continuously and tells someone
          when something needs attention &mdash; complementary, and both need a place in the
          design from the start.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Structured logging</b> (consistent, machine-parseable fields, not free-form text)
          makes logs searchable and aggregatable across every instance of a service, not just
          readable one file at a time. <b>Monitoring and alerting</b> watches metrics continuously
          and pages a human when a threshold is crossed &mdash; ideally a threshold tied to actual
          user impact (error rate, latency) rather than an internal detail (CPU usage) that may or
          may not matter to anyone.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Every service emits structured logs</b> with consistent fields: timestamp,
            request ID, service name, status.</li>
          <li><b>Logs from every instance</b> are aggregated centrally, searchable by request ID
            across the whole fleet, not one server at a time.</li>
          <li><b>A monitoring system tracks error rate</b> continuously against a threshold agreed
            with the team.</li>
          <li><b>Error rate crosses 5% for five minutes.</b> An alert pages the on-call engineer,
            who searches the aggregated logs by the affected request IDs to start investigating
            immediately.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of structured logs from many service instances being aggregated centrally, alongside a monitoring system that watches error rate and pages an engineer when a threshold is crossed." >
          {[0,1,2].map(i => (<rect key={i} className="box" x={20+i*70} y="15" width="55" height="24" rx="4" />))}
          {[0,1,2].map(i => (<line key={i} className="flow" x1={47+i*70} y1="39" x2="200" y2="65" />))}
          <rect className="boxAccent" x="150" y="68" width="120" height="28" rx="5" /><text x="210" y="86" className="boxText" style={{fontSize:"8px"}}>Aggregated logs</text>
          <rect className="box" x="300" y="15" width="100" height="26" rx="5" /><text x="350" y="32" className="boxText" style={{fontSize:"8px"}}>Monitoring</text>
          <line className="flow" x1="350" y1="41" x2="350" y2="70" /><text x="380" y="55" className="figHint" style={{fontSize:"7px"}}>alert</text>
        </svg>
        <figcaption>Structured logs aggregate for searchability; monitoring watches metrics and pages someone when a threshold is crossed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Free-form, unstructured log messages are nearly impossible to search or aggregate at
          scale across many instances. Alerting on internal, cause-based metrics (CPU, memory)
          instead of symptom-based ones (error rate, latency) generates noisy alerts that may not
          reflect any real user impact.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does structured logging matter more once a service runs as many instances rather than just one?</p>
        </div>
      </section>
      <p className="takeaway">
        Structured, aggregated logging and symptom-based monitoring together turn &ldquo;something
        feels wrong&rdquo; into a specific alert and a searchable trail to the cause.
      </p>
    </div>
  );
}
