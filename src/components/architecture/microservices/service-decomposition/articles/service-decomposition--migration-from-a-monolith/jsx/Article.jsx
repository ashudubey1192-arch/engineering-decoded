import "../css/Article.css";

export default function ServiceDecompositionMigrationFromAMonolithArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Migrating a monolith to services works best as a series of small, reversible extractions
          &mdash; pick one well-understood capability, carve it out behind a facade, and prove the
          pattern before repeating it, rather than attempting one big-bang rewrite.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Pick the first extraction carefully</b> &mdash; a capability with a clear boundary and low risk, not the most tangled part of the system.</li>
          <li><b>Route through a facade</b> &mdash; the monolith calls the new service through one seam, so the rest of the codebase doesn't need to know the capability moved.</li>
          <li><b>Migrate data ownership last, not first</b> &mdash; extract the behavior behind an API before you fully cut over the data, so you can roll back cleanly if something's wrong.</li>
          <li><b>Verify with production traffic before removing the old path</b> &mdash; run both in parallel and compare results before deleting the monolith's version.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A retailer extracts <code>NotificationService</code> first &mdash; it's well-understood,
          low-risk, and nothing else depends on its internals. The monolith keeps calling
          <code>sendNotification(...)</code> internally, but that function now forwards to the new
          service's API instead of running the old in-process code. Only after two weeks of matching
          production behavior does the team delete the monolith's original notification code.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of a three-stage migration: the monolith's internal sendNotification call is first routed through an internal facade to the old code, then the facade is repointed to call the new NotificationService instead, with the old code finally removed.">
          <text x="80" y="18" className="figLabel">STAGE 1</text>
          <rect className="box" x="20" y="30" width="120" height="30" rx="6" />
          <text x="80" y="49" className="boxText" style={{fontSize:"6.5px"}}>Monolith (facade &rarr; old code)</text>
          <text x="220" y="18" className="figLabel">STAGE 2</text>
          <rect className="box" x="160" y="30" width="120" height="30" rx="6" />
          <text x="220" y="49" className="boxText" style={{fontSize:"6px"}}>Monolith (facade &rarr; new service)</text>
          <rect className="boxAccent" x="160" y="75" width="120" height="30" rx="6" />
          <text x="220" y="94" className="boxText" style={{fontSize:"6.5px"}}>NotificationService</text>
          <line className="flow" x1="220" y1="60" x2="220" y2="73" />
          <text x="370" y="18" className="figLabel">STAGE 3</text>
          <rect className="boxAccent" x="330" y="75" width="80" height="30" rx="6" />
          <text x="370" y="94" className="boxText" style={{fontSize:"6px"}}>Notification</text>
          <text x="370" y="60" className="figHint" style={{fontSize:"5.5px"}}>old code deleted</text>
        </svg>
        <figcaption>The facade lets the caller's code stay unchanged while what's behind it moves in stages &mdash; from old in-process code, to the new service, to the new service alone.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Cutting over the database before the behavior is a common ordering mistake &mdash; it
          removes the ability to roll back cleanly if the new service has a bug, since the monolith's
          old code path no longer has its data to fall back on. Attempting to extract several
          capabilities simultaneously, rather than one at a time, is the other classic mistake:
          it multiplies the number of things that could be going wrong when something breaks, right
          when the team has the least experience with the new pattern.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does routing the monolith's existing sendNotification() call through a facade make it possible to switch the underlying implementation without changing any other code in the monolith?</p>
        </div>
      </section>
      <p className="takeaway">
        Migrate in small, provably-reversible steps &mdash; a facade that hides which implementation
        is behind it is what makes each step safe to roll back if it goes wrong.
      </p>
    </div>
  );
}
