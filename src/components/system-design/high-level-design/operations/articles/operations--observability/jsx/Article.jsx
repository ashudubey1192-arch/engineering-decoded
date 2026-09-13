import "../css/Article.css";

export default function OperationsObservabilityArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Observability is whether the system can actually answer &ldquo;why is this happening&rdquo;
          when something goes wrong in production &mdash; a design property, not something bolted
          on after an incident.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Observability rests on three pillars: <b>metrics</b> (numeric signals like request rate
          and error rate, cheap to collect continuously), <b>logs</b> (detailed records of specific
          events, useful for deep-diving one request), and <b>traces</b> (following one request
          across every service it touches, showing where time was spent). In an HLD diagram, this
          shows up as: every service exports metrics, structured logs, and trace spans to a
          shared observability system &mdash; not as an afterthought added once something breaks.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A metric dashboard shows checkout error rate spiking</b> at 2 AM &mdash; the
            &ldquo;something is wrong&rdquo; signal.</li>
          <li><b>Traces for failing requests</b> show nearly all their time is spent in a call to
            the payments service.</li>
          <li><b>Logs from the payments service,</b> filtered to that time window, show a specific
            downstream timeout error.</li>
          <li><b>Root cause is found in minutes,</b> because metrics, traces, and logs each
            answered a different part of &ldquo;what, where, and why.&rdquo;</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of three observability pillars, metrics, traces, and logs, each answering a different question: something is wrong, where the time went, and exactly why it failed." >
          {["Metrics","Traces","Logs"].map((t,i) => (<rect key={t} className="boxAccent" x={20+i*140} y="20" width="120" height="34" rx="6" />))}
          {["Metrics","Traces","Logs"].map((t,i) => (<text key={t} x={80+i*140} y="41" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>{t}</text>))}
          {["something's wrong","where time went","exactly why"].map((t,i) => (<text key={t} x={80+i*140} y="70" className="figHint" textAnchor="middle" style={{fontSize:"7px"}}>{t}</text>))}
        </svg>
        <figcaption>Each pillar answers a different part of a production incident; none alone tells the whole story.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Relying on logs alone, without metrics or tracing, means every incident starts with
          grepping through text instead of jumping straight to the relevant service. Treating
          observability as something to add after the system is already in production, rather than
          building it in from the start, means the first real incident happens with no visibility at all.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does diagnosing a production incident typically require metrics, traces, and logs together, rather than any one of them alone?</p>
        </div>
      </section>
      <p className="takeaway">
        Observability should appear on the component diagram itself, not just in an incident
        postmortem &mdash; every service should be built from the start to export what it takes to
        answer &ldquo;why is this happening.&rdquo;
      </p>
    </div>
  );
}
