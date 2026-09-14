import "../css/Article.css";

export default function ApiEvolutionConsumerMigrationArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Versioning and deprecation headers create the option to migrate; they don't make
          migration actually happen. Someone still has to drive consumers through it, and that's
          usually more work than the technical change itself.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ol className="stepList">
          <li><b>Communicate early, in more than one place</b> &mdash; changelog, docs, and a dashboard notice, not just one email that can get buried.</li>
          <li><b>Provide a concrete migration guide</b> &mdash; before/after examples of real requests, not just an abstract description of what changed.</li>
          <li><b>Instrument real usage</b> &mdash; track which API keys are still calling the old path, so migration status is measured, not guessed.</li>
          <li><b>Offer a real transition window</b> &mdash; enough time that both old and new can coexist for consumers with their own release cycles.</li>
          <li><b>Reach out directly to stragglers</b> &mdash; a personal message to the last few accounts still on the old path outperforms another broadcast email.</li>
          <li><b>Verify zero usage before removing anything</b> &mdash; the deadline passing isn't the same as migration being complete.</li>
        </ol>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          For its v1-to-v2 migration, Parcelly's usage dashboard showed which specific API keys
          were still calling deprecated v1 endpoints, updated daily. Two weeks before the sunset
          date, three partner accounts were still active on v1. Rather than one more broadcast
          email, the partner success team reached out to each by name, with their own specific
          integration's before/after diff attached &mdash; a level of specificity a mass email
          can't offer, and the reason all three migrated within the week instead of waiting until
          the deadline forced an outage.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Funnel diagram: all consumers start on the old version, most migrate after seeing docs and changelog announcements, a smaller group needs direct outreach, and migration is only complete once usage reaches zero.">
          {["All consumers\non old version","Migrated via\ndocs/changelog","Needed direct\noutreach","Usage = 0,\nsafe to remove"].map((t,i) => (
            <g key={i}>
              <rect className={i===3 ? "boxAccent" : "box"} x={10 + i*105} y="30" width="92" height="50" rx="6" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={56 + i*105} y={50 + li*13} className="boxText" style={{fontSize:"5.8px"}}>{line}</text>
              ))}
              {i < 3 && <line className="flow" x1={102 + i*105} y1="55" x2={112 + i*105} y2="55" />}
            </g>
          ))}
        </svg>
        <figcaption>Most consumers self-serve off documentation; the remainder need direct, personal outreach before removal is actually safe.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating one changelog entry as sufficient outreach is the most common mistake &mdash;
          the consumers most likely to miss it are exactly the smaller, less-engaged integrations
          least equipped to handle a surprise breaking change later. Measuring migration progress
          by time elapsed instead of by actual usage data is the other common one: it feels like
          progress without confirming anyone has actually done anything.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did direct outreach to the three remaining partners succeed faster than Parcelly's original broadcast announcement had?</p>
        </div>
      </section>
      <p className="takeaway">
        A migration plan is a communication plan with a deadline attached, not just a technical
        one &mdash; measure it by real usage dropping to zero, and expect the last few consumers to
        need a personal nudge, not just another notice.
      </p>
    </div>
  );
}
