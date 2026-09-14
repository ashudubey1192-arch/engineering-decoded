import "../css/Article.css";

export default function ApiPlatformApiObservabilityArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Observability for an API product answers a different question than observability for one
          service's internals &mdash; not just "is this healthy," but "which endpoints are partners
          struggling with, who's about to hit a limit, and which fields does anyone actually still
          use."
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Per-consumer breakdown, not just aggregate</b> &mdash; an API-wide 99.9% success rate can hide one specific partner experiencing 40% failures the whole time.</li>
          <li><b>Field-level usage tracking</b> &mdash; which response fields consumers actually read, which is exactly what makes a deprecation decision safe rather than a guess.</li>
          <li><b>Self-diagnosable visibility</b> &mdash; giving partners their own usage and error data lets them answer "is this me or is this you" without opening a support ticket every time.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's aggregate error rate looked entirely healthy &mdash; comfortably under 1%
          &mdash; while one specific partner integration was silently retrying a
          <code>422</code> validation error in a tight loop, failing on effectively every attempt.
          The aggregate number hid it completely; a per-consumer breakdown of error rate surfaced
          it immediately, as one clear outlier against dozens of otherwise-healthy partners.
        </p>
        <table className="miniTable">
          <caption>AGGREGATE VS. PER-CONSUMER</caption>
          <thead><tr><th>View</th><th>What it shows</th></tr></thead>
          <tbody>
            <tr><td>API-wide error rate</td><td>0.8% &mdash; looks completely healthy</td></tr>
            <tr><td>Per-consumer breakdown</td><td>One partner at 41% error rate, everyone else under 0.1%</td></tr>
          </tbody>
        </table>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Bar chart of per-consumer error rates: most partners show a short bar near zero errors, while one partner stands out with a tall bar showing a very high error rate, invisible in the API-wide average.">
          {[3,4,2,5,3,41,4].map((v,i) => (
            <rect key={i} className={v>30 ? "boxWarn" : "box"} x={20 + i*55} y={95 - v} width="35" height={v} rx="3" />
          ))}
          <line className="divider" x1="10" y1="95" x2="410" y2="95" />
          <text x="210" y="112" className="figHint" style={{fontSize:"6px"}}>seven partners' error rates &mdash; one clear outlier</text>
        </svg>
        <figcaption>The aggregate average buries exactly the one bar that actually needs attention.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Tracking only aggregate, API-wide metrics is the most common gap &mdash; a healthy-looking
          average can hide exactly one partner in real, ongoing trouble, and nobody notices until
          that partner escalates. Deprecating a field without ever having measured its real usage,
          relying only on how long it's been documented as deprecated, is the other common mistake
          &mdash; and it's exactly the measurement this lesson's field-level tracking is meant to
          provide for the process covered back in the Deprecation Strategy lesson.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did Parcelly's overall error rate look fine while one partner was failing on almost every request?</p>
        </div>
      </section>
      <p className="takeaway">
        An API-wide average is exactly the kind of number that hides its most important
        exceptions &mdash; observability for an API product means being able to see one struggling
        consumer clearly, not just the system's health on average.
      </p>
    </div>
  );
}
