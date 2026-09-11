import "../css/Article.css";

export default function ObservabilityDashboardsRunbooksArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A dashboard gives an at-a-glance visual view of a system's key metrics; a runbook is a
          written, step-by-step guide for responding to a specific problem. Together, they turn
          "someone got paged" into a fast, guided response instead of a cold, from-scratch
          investigation.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A good dashboard is organized around a specific audience's question, not just "every
          metric we have" — an on-call engineer's incident dashboard should surface the handful of
          signals that matter most during an outage, front and center. A runbook, linked directly
          from the corresponding alert, documents the concrete steps to diagnose and mitigate a
          specific known failure mode — written in advance, calmly, rather than improvised at 3 AM
          under pressure. Neither replaces the other: a dashboard shows current state; a runbook
          tells you what to actually do about a bad state.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Alert fires:</b> "checkout error rate &gt; 5%," linking directly to both a
            dashboard and a runbook.</li>
          <li><b>Dashboard shows the picture.</b> Error rate spiked at 2:14 AM, correlated with a
            latency spike specifically in calls to the payments service.</li>
          <li><b>Runbook provides the steps.</b> "If payments service latency is elevated: 1)
            check payments service's own dashboard, 2) check its upstream dependency (the card
            processor) status page, 3) if the processor is degraded, enable the fallback processor
            flag."</li>
          <li><b>On-call engineer follows the runbook</b> and resolves the incident in minutes,
            instead of starting an investigation from zero.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of an alert linking to both a dashboard showing current system state and a runbook providing concrete response steps, together enabling a fast guided incident response." >
          <rect className="boxWarn" x="150" y="10" width="120" height="28" rx="5" /><text x="210" y="28" className="boxText">alert fires</text>
          <line className="flow" x1="190" y1="38" x2="120" y2="65" /><line className="flow" x1="230" y1="38" x2="300" y2="65" />
          <rect className="box" x="40" y="70" width="140" height="30" rx="5" /><text x="110" y="90" className="boxText">dashboard: state</text>
          <rect className="boxAccent" x="240" y="70" width="140" height="30" rx="5" /><text x="310" y="90" className="boxText">runbook: steps</text>
        </svg>
        <figcaption>An alert points to both what's happening now and exactly what to do about it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Building one giant, cluttered dashboard with every metric ever collected makes finding
          the signal that actually matters during an incident slower, not faster — purposeful,
          audience-specific dashboards work better than one universal view. Letting runbooks go
          stale as the system changes is just as dangerous — an outdated runbook can actively
          mislead an engineer during a real incident.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does pairing an alert with both a dashboard and a runbook speed up incident response more than either alone?</p>
        </div>
      </section>
      <p className="takeaway">
        Dashboards show what's happening; runbooks say what to do about it — written and
        organized in advance, so incident response is fast and guided instead of improvised.
      </p>
    </div>
  );
}
