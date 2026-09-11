import "../css/Article.css";

export default function DeploymentPatternsABTestingInfrastructureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A/B testing infrastructure runs two (or more) variants of a feature simultaneously for
          different users, then measures which performs better against a defined metric — the
          system that turns feature flags into a rigorous experimentation tool, not just a
          release mechanism.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Users are consistently assigned to a variant (A or B) — usually via a hash of their user
          ID, so the same user always sees the same variant throughout the experiment, which is
          essential for a clean measurement. The system tracks a defined success metric (click rate,
          conversion, revenue) per variant, and statistical analysis determines whether an observed
          difference is a real effect or just noise. This requires real infrastructure: consistent
          assignment, reliable event tracking, and enough traffic volume to reach statistical
          significance — casually eyeballing two numbers is not a valid A/B test.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Define the experiment.</b> Variant A: current checkout button; Variant B: a
            redesigned button. Success metric: click-through rate.</li>
          <li><b>Assign users consistently.</b> Each user's ID is hashed into a bucket, determining
            which variant they see — and they keep seeing that same variant for the experiment's
            duration.</li>
          <li><b>Track events per variant</b> as users interact, accumulating enough data over
            time to reach statistical significance.</li>
          <li><b>Analyze the result.</b> Variant B shows a statistically significant lift in
            click-through rate — it's rolled out to 100% of users, informed by real evidence
            rather than a guess.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of users being consistently hash-assigned to variant A or variant B, with each variant's outcome events tracked separately and compared for statistical significance." >
          <rect className="box" x="20" y="45" width="90" height="30" rx="5" /><text x="65" y="65" className="boxText">user</text>
          <line className="flow" x1="110" y1="55" x2="150" y2="30" /><line className="flow" x1="110" y1="65" x2="150" y2="95" />
          <rect className="box" x="160" y="15" width="90" height="28" rx="4" /><text x="205" y="33" className="boxText">variant A</text>
          <rect className="boxAccent" x="160" y="85" width="90" height="28" rx="4" /><text x="205" y="103" className="boxText">variant B</text>
          <text x="335" y="29" className="figHint">track outcomes →</text><text x="335" y="99" className="figHint">track outcomes →</text>
        </svg>
        <figcaption>Consistent per-user assignment and separate outcome tracking are what make the comparison valid.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Peeking at results early and stopping the test as soon as a difference "looks" real,
          without reaching statistical significance, is one of the most common A/B testing errors
          — it inflates false positives significantly. Inconsistent variant assignment (a user
          seeing different variants across sessions) is another silent bug that corrupts results
          without any obvious symptom.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is consistent, sticky assignment of a user to the same variant essential for a valid A/B test?</p>
        </div>
      </section>
      <p className="takeaway">
        A/B testing infrastructure turns feature exposure into a controlled experiment — the
        payoff is decisions backed by measured evidence, but only if assignment and measurement
        are both done rigorously.
      </p>
    </div>
  );
}
