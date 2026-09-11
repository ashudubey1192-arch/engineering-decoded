import "../css/Article.css";

export default function ArchitecturalPatternsServerlessArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Serverless lets you deploy individual functions that a cloud provider runs on demand —
          you write code, the platform handles provisioning, scaling, and turning it off entirely
          when nothing's happening. Servers still exist; you just never manage them.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A serverless function (AWS Lambda, Cloud Functions) runs only in response to a trigger —
          an HTTP request, a queue message, a scheduled timer — and the platform automatically
          scales the number of concurrent executions up or down, including to zero. You pay per
          invocation and execution time, not for idle capacity. The trade-off is less control (cold
          starts when a function hasn't run recently, execution time limits, no long-lived
          in-memory state between invocations).
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>An app needs to resize any image a user uploads — a bursty, occasional workload.</p>
        </div>
        <ol className="stepList">
          <li><b>User uploads an image.</b> It lands in object storage, which triggers an event.</li>
          <li><b>A function runs.</b> The platform spins up a resize function instance just for
            this event — no server was sitting idle waiting for it.</li>
          <li><b>It scales with bursts.</b> If 500 images upload at once, the platform runs up to
            500 concurrent instances automatically.</li>
          <li><b>It scales back to zero.</b> When uploads stop, no instances run and nothing is
            billed for idle time.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of an upload event triggering a serverless function, with the platform automatically running as many concurrent instances as needed and scaling back to zero when idle.">
          <rect className="box" x="20" y="45" width="90" height="30" rx="5" /><text x="65" y="65" className="boxText">upload event</text>
          <line className="flow" x1="110" y1="60" x2="160" y2="60" />
          <rect className="boxAccent" x="170" y="20" width="70" height="26" rx="4" /><text x="205" y="38" className="boxText">fn #1</text>
          <rect className="boxAccent" x="170" y="52" width="70" height="26" rx="4" /><text x="205" y="70" className="boxText">fn #2</text>
          <rect className="boxAccent" x="170" y="84" width="70" height="26" rx="4" /><text x="205" y="102" className="boxText">fn #3</text>
          <text x="330" y="60" className="figHint">scales to match load, then to zero</text>
        </svg>
        <figcaption>Instances spin up per event and scale back to zero — no idle server to pay for.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using serverless functions for long-running or steady, high-volume workloads can end up
          costing more than a normal server would, and hitting execution-time limits. Ignoring cold
          start latency for latency-sensitive, infrequently-called endpoints is another common
          surprise — the first request after idle time pays a startup cost.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is serverless a good fit for a bursty, occasional workload but a potentially poor fit for a steady, high-volume one?</p>
        </div>
      </section>
      <p className="takeaway">
        Serverless removes server management and bills per execution — ideal for spiky or
        infrequent workloads, less so for steady, latency-critical, long-running ones.
      </p>
    </div>
  );
}
