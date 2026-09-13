import "../css/Article.css";

export default function HldFoundationsRequirementsClarificationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Every HLD prompt is deliberately under-specified &mdash; &ldquo;design Twitter&rdquo;
          could mean a dozen different systems, and the first real skill is narrowing it down
          before designing anything.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements split into two kinds. <b>Functional requirements</b> are the features the
          system must support (post a tweet, follow a user, view a timeline). <b>Non-functional
          requirements</b> are the qualities the system must have while doing so &mdash; scale,
          latency, availability, consistency needs. Both matter, but non-functional requirements
          usually drive the more consequential architecture decisions, since they determine
          whether a single database is fine or whether the design needs replication, caching, or
          sharding at all.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start broad.</b> &ldquo;Design Twitter&rdquo; &mdash; too large to design directly.</li>
          <li><b>Ask functional questions.</b> Does it need posting, following, and a timeline? Are
            retweets and likes in scope? Agree: posting, following, and a timeline; skip likes and
            retweets for now.</li>
          <li><b>Ask non-functional questions.</b> How many users? Is the timeline allowed to be a
            few seconds stale? Agree: 50M users, timeline can be eventually consistent.</li>
          <li><b>State the narrowed scope back.</b> &ldquo;So we&rsquo;re designing posting,
            following, and an eventually-consistent timeline for 50M users&rdquo; &mdash; now
            there&rsquo;s something concrete to design.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Funnel diagram narrowing a broad prompt through functional and non-functional clarifying questions down to a concrete, agreed scope." >
          <path className="box" d="M20 20 L400 20 L280 60 L280 100 L140 100 L140 60 Z" />
          <text x="210" y="15" className="figHint" textAnchor="middle">broad prompt</text>
          <text x="210" y="45" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>+ functional questions</text>
          <text x="210" y="80" className="boxText" textAnchor="middle" style={{fontSize:"9px"}}>+ non-functional questions</text>
          <rect className="boxAccent" x="140" y="105" width="140" height="20" rx="4" /><text x="210" y="119" className="boxText" style={{fontSize:"8px"}}>agreed scope</text>
        </svg>
        <figcaption>Clarifying questions narrow an open-ended prompt down to a scope small enough to actually design.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Silently assuming scope (deciding internally that likes are out of scope without saying
          so) leaves the person listening unsure what&rsquo;s actually being designed. The opposite
          mistake &mdash; asking dozens of clarifying questions without ever converging on a stated
          scope &mdash; burns time without producing anything to design against.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why do non-functional requirements typically drive more architecture decisions than functional requirements do?</p>
        </div>
      </section>
      <p className="takeaway">
        Clarifying requirements isn&rsquo;t a formality before the real work starts &mdash; it
        <i>is</i> the first piece of real design work, since it determines what &ldquo;done&rdquo;
        even means.
      </p>
    </div>
  );
}
