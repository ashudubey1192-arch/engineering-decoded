import "../css/Article.css";

export default function DeploymentPatternsRollbacksImmutableInfrastructureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A rollback undoes a bad deployment by reverting to the previous known-good version.
          Immutable infrastructure — never modifying running servers, only replacing them — is
          what makes rollbacks fast, predictable, and genuinely reliable.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          In <b>mutable</b> infrastructure, servers are updated in place (SSH in, patch, restart)
          — over time, configuration drift makes servers subtly different from each other, and
          "rolling back" means trying to undo changes on a server that's no longer in a clean,
          known state. <b>Immutable</b> infrastructure never patches a running server: a new
          version means building a brand new image (a container image, a VM image) and replacing
          old instances with fresh ones built from it. A rollback is then just as simple as a
          forward deployment — spin up instances from the <i>previous</i> known-good image,
          because that exact, unmodified image was never thrown away.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Build an immutable image</b> for every release — v41, v42, v43 — each a complete,
            versioned snapshot, never modified after being built.</li>
          <li><b>Deploy v43.</b> Old v42 instances are terminated and replaced by fresh instances
            booted from the v43 image.</li>
          <li><b>v43 has a critical bug.</b> Roll back by simply redeploying instances from the
            v42 image — the exact same image that was running and working minutes earlier.</li>
          <li><b>No "undo" logic needed</b> — a rollback is just a forward deployment of an older,
            known-good, unmodified image.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a sequence of versioned, immutable images where rolling back simply means deploying instances from a previous image instead of running undo logic on a live server." >
          {["v41", "v42", "v43"].map((v, i) => (<rect key={v} className={i === 2 ? "boxWarn" : "box"} x={40 + i * 120} y="30" width="90" height="34" rx="5" />))}
          {["v41", "v42", "v43"].map((v, i) => (<text key={v} x={85 + i * 120} y="51" className="boxText" textAnchor="middle">{v}</text>))}
          <line className="flowMuted" x1="325" y1="47" x2="175" y2="47" />
          <text x="250" y="35" className="figHint" textAnchor="middle">rollback = redeploy v42</text>
          <text x="230" y="95" className="figHint" textAnchor="middle">every past image is preserved, unmodified, ready to redeploy</text>
        </svg>
        <figcaption>Immutable, versioned images make rollback identical in mechanism to a forward deploy.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Patching servers in place "just this once" for a quick fix reintroduces configuration
          drift and undermines the whole point of immutability — even urgent fixes should go
          through building a new image. Not retaining old images long enough is another gap — if
          the previous version's image has already been deleted, there's nothing to roll back to.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does immutable infrastructure make a rollback just as simple and predictable as a forward deployment?</p>
        </div>
      </section>
      <p className="takeaway">
        Immutable infrastructure turns rollback from risky, manual undo work into the same
        reliable mechanism as any other deployment — just pointed at a previous, unmodified,
        known-good image.
      </p>
    </div>
  );
}
