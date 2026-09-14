import "../css/Article.css";

export default function CleanCodeFoundationsWhyCodeQualityMattersArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Messy code does not fail immediately &mdash; it fails slowly, by making every future change
          more expensive than the last one. Code quality matters because it directly controls
          how fast a team can keep shipping, not just how the code looks.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>The cost-of-change curve</b> &mdash; in a clean codebase, the cost of adding a feature stays roughly flat over time; in a messy one, it climbs, because each change has to work around more accumulated confusion.</li>
          <li><b>"Later equals never"</b> &mdash; a principle sometimes attributed to LeBlanc's Law: code you plan to clean up later almost never gets cleaned up, because "later" never arrives with spare capacity.</li>
          <li><b>Velocity decay</b> &mdash; teams on messy codebases do not get slower because they got worse at coding; they get slower because the codebase actively resists change.</li>
          <li><b>Quality is not gold-plating</b> &mdash; clean code is not extra polish added after the "real" work; it is the fastest sustainable way to keep shipping.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's team tracked how long a small, well-understood change &mdash; "add a new tax
          region" &mdash; took to ship, at three points in the product's life:
        </p>
        <table className="miniTable">
          <caption>Time to ship the same class of change, over time</caption>
          <thead><tr><th>Month</th><th>Codebase state</th><th>Time to add a tax region</th></tr></thead>
          <tbody>
            <tr><td>Month 2</td><td>Small, mostly clean</td><td>~1 hour</td></tr>
            <tr><td>Month 8</td><td>Growing, some shortcuts taken</td><td>~1 day (had to trace tax logic through four files)</td></tr>
            <tr><td>Month 14</td><td>Deadline-driven, little cleanup</td><td>~4 days (tax logic duplicated in six places, two of which disagreed)</td></tr>
          </tbody>
        </table>
        <p>
          Nothing about adding a tax region got harder in principle. What changed was the
          codebase's resistance to being understood and safely touched &mdash; the direct, measurable
          cost of skipped code quality.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Line chart comparing cost of change over time for a clean codebase, which stays roughly flat, versus a messy codebase, where cost of change rises steeply.">
          <line className="divider" x1="40" y1="15" x2="40" y2="105" />
          <line className="divider" x1="40" y1="105" x2="400" y2="105" />
          <text x="20" y="60" className="figLabel" style={{fontSize:"5px"}} transform="rotate(-90 20 60)">Cost</text>
          <text x="220" y="118" className="figLabel" style={{fontSize:"5px"}}>Time</text>
          <polyline className="flow" points="45,90 150,85 250,80 390,72" />
          <text x="395" y="68" className="boxText" style={{fontSize:"5px"}}>clean</text>
          <polyline className="flowMuted" points="45,95 150,80 250,50 390,15" />
          <text x="395" y="12" className="boxText" style={{fontSize:"5px"}}>messy</text>
        </svg>
        <figcaption>The same feature costs roughly the same to add in a clean codebase over time &mdash; and increasingly more in a neglected one.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          A common mistake is framing code quality as being in tension with speed &mdash; "we don't
          have time to write clean code, we need to ship." In the short term this can be true
          for a single change. Averaged across a project's life, the opposite is usually true:
          skipped quality is borrowed speed, repaid with interest on every later change.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did adding a tax region get four times slower for Ledgerly even though the underlying task never changed in complexity?</p>
        </div>
      </section>
      <p className="takeaway">
        Code quality is not about aesthetics &mdash; it is a direct lever on how expensive future
        changes will be, and that cost compounds far faster than most teams expect.
      </p>

    </div>
  );
}
