import "../css/Article.css";

export default function ObservabilityAlertingMonitoringArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Monitoring watches metrics continuously; alerting notifies a human (or triggers an
          automated response) when something crosses a threshold that indicates a real problem.
          Getting the threshold and target right is what separates a useful alert from noise.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The best alerts are based on <b>symptoms</b> users actually experience (elevated error
          rate, high latency, requests failing) rather than <b>causes</b> (CPU usage, disk space) —
          a symptom-based alert fires exactly when something is genuinely wrong for users, while a
          cause-based alert can fire on a perfectly harmless high-CPU period that never actually
          affects anyone. Alerts also need a clear, actionable target — someone who receives an
          alert should know both that it matters and roughly what to do about it, which is why
          alerts are usually paired with runbooks (next article).
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Cause-based alert (weaker):</b> "CPU usage exceeded 80%" — might be totally fine
            (a scheduled batch job), or might not be — the alert alone can't tell you.</li>
          <li><b>Symptom-based alert (stronger):</b> "Error rate exceeded 5% for 5 minutes" —
            this directly reflects real user impact, regardless of the underlying cause.</li>
          <li><b>Add context to the alert.</b> Include a link to the relevant dashboard and
            runbook directly in the notification, so the on-call engineer doesn't start from zero.</li>
          <li><b>Tune the threshold and duration</b> (5 minutes, not 5 seconds) to avoid firing on
            brief, self-resolving blips that don't need a human response.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram contrasting a cause-based alert on CPU usage that may not reflect real user impact against a symptom-based alert on error rate that directly reflects what users experience." >
          <text x="100" y="18" className="figLabel" textAnchor="middle">CAUSE-BASED</text>
          <rect className="box" x="20" y="30" width="160" height="30" rx="5" /><text x="100" y="50" className="boxText">CPU &gt; 80%</text>
          <text x="100" y="80" className="figHint" textAnchor="middle">may or may not matter to users</text>
          <text x="320" y="18" className="figLabel" textAnchor="middle">SYMPTOM-BASED</text>
          <rect className="boxAccent" x="240" y="30" width="160" height="30" rx="5" /><text x="320" y="50" className="boxText">error rate &gt; 5%</text>
          <text x="320" y="80" className="figHint" textAnchor="middle">directly reflects real user impact</text>
        </svg>
        <figcaption>Symptom-based alerts fire on what users actually feel; cause-based alerts can fire on harmless conditions.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Over-alerting on noisy, low-signal conditions causes alert fatigue — engineers start
          ignoring or muting alerts, including the genuinely important ones, which defeats the
          entire purpose. An alert with no clear owner or no obvious next step is nearly as bad as
          no alert at all — it wakes someone up without telling them what to actually do.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is an alert on "error rate exceeded 5%" generally more useful than one on "CPU usage exceeded 80%"?</p>
        </div>
      </section>
      <p className="takeaway">
        Good alerting fires on symptoms users actually feel, with enough context to act on
        immediately — noisy, cause-based, or context-free alerts erode trust and get ignored.
      </p>
    </div>
  );
}
