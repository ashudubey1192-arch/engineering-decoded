import "../css/Article.css";

export default function ApiPlatformApiLifecycleArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          An API endpoint has a lifecycle, the same way the resources it exposes do &mdash;
          proposed, beta, stable, deprecated, retired &mdash; and naming those stages explicitly is
          what tells everyone, including outside consumers, exactly how much to trust a given
          endpoint right now.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>THE STAGES</caption>
          <thead><tr><th>Stage</th><th>What it means for consumers</th></tr></thead>
          <tbody>
            <tr><td>Proposed / in review</td><td>Not yet available; still being designed and reviewed.</td></tr>
            <tr><td>Beta</td><td>Available, but explicitly not covered by the full backward-compatibility guarantee yet.</td></tr>
            <tr><td>Stable / GA</td><td>The full backward-compatibility contract applies from here on.</td></tr>
            <tr><td>Deprecated</td><td>Still works, has a documented sunset date and a migration path.</td></tr>
            <tr><td>Retired</td><td>No longer available, removed only after verified zero usage.</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly labels every new endpoint <code>beta</code> for the first four to eight weeks
          after launch, deliberately &mdash; preserving the right to make an adjustment based on
          real partner feedback before fully committing to the backward-compatibility guarantee
          that <code>stable</code> implies. That's a temporary, clearly communicated carve-out, not
          an excuse to skip design discipline: a beta endpoint still went through design review; it
          just hasn't yet earned the full stability promise that comes with more real usage.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 110" role="img" aria-label="Timeline of an API endpoint's lifecycle: proposed, then beta with a lighter compatibility guarantee, then stable with the full guarantee, then deprecated with a sunset date, then retired.">
          {["Proposed","Beta","Stable","Deprecated","Retired"].map((t,i) => (
            <g key={t}>
              <rect className={i===2 ? "boxAccent" : "box"} x={10 + i*86} y="30" width="76" height="40" rx="6" />
              <text x={48 + i*86} y="54" className="boxText" style={{fontSize:"6.5px"}}>{t}</text>
              {i < 4 && <line className="flow" x1={86 + i*86} y1="50" x2={96 + i*86} y2="50" />}
            </g>
          ))}
        </svg>
        <figcaption>Every stage after "proposed" makes a different promise to consumers about how much can still change.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Calling something <code>stable</code> before it's genuinely ready to commit to
          backward compatibility removes the option to fix a design mistake cheaply &mdash; exactly
          the flexibility beta labeling exists to preserve. Leaving an endpoint labeled
          <code>beta</code> indefinitely, with no real path or timeline toward stabilization, is the
          opposite mistake: partners can't tell whether it's safe to build on, which defeats the
          entire purpose of having the label in the first place.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does labeling a new endpoint beta for a few weeks give Parcelly more room to fix a design mistake than launching it as stable immediately?</p>
        </div>
      </section>
      <p className="takeaway">
        A lifecycle stage is a promise about how much can still change &mdash; be honest about
        which stage something is actually in, and consumers can make good decisions about how much
        to rely on it.
      </p>
    </div>
  );
}
