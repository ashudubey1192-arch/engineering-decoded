import "../css/Article.css";

export default function MicroservicesPatternsStranglerFigPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The strangler fig pattern migrates a legacy system to a new one gradually, by routing an
          increasing share of traffic to new functionality piece by piece — instead of a risky
          all-at-once rewrite and cutover.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Named after a fig vine that grows around a host tree and gradually replaces it, this
          pattern puts a routing layer (often the same place an API gateway would sit) in front of
          the legacy system. New functionality is built as a separate service, and the router sends
          traffic for that specific functionality to the new service while everything else still
          goes to the legacy system. Piece by piece, more functionality moves to the new side, until
          eventually the legacy system handles nothing and can be safely retired.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start with 100% legacy.</b> All traffic hits the old monolith.</li>
          <li><b>Build one piece new.</b> The team rebuilds just the "search" functionality as a
            new service.</li>
          <li><b>Route incrementally.</b> The router sends search requests to the new service;
            everything else still goes to the legacy monolith.</li>
          <li><b>Repeat for each piece.</b> Checkout, then user accounts, then catalog — each
            migrated and routed over, one at a time.</li>
          <li><b>Retire the legacy system</b> once nothing routes to it anymore — with each step
            having been small and independently reversible.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a router sending some traffic to a new search service and the remaining traffic to the legacy monolith, illustrating a gradual migration in progress.">
          <rect className="box" x="20" y="50" width="70" height="30" rx="5" /><text x="55" y="70" className="boxText">traffic</text>
          <line className="flow" x1="90" y1="65" x2="140" y2="65" />
          <rect className="boxAccent" x="150" y="50" width="90" height="30" rx="5" /><text x="195" y="70" className="boxText">router</text>
          <line className="flow" x1="240" y1="58" x2="300" y2="25" /><line className="flow" x1="240" y1="72" x2="300" y2="100" />
          <rect className="box" x="305" y="10" width="110" height="30" rx="5" /><text x="360" y="30" className="boxText">new: search</text>
          <rect className="box" x="305" y="85" width="110" height="30" rx="5" /><text x="360" y="105" className="boxText">legacy monolith</text>
          <text x="360" y="60" className="figHint" textAnchor="middle">split, and shifts over time</text>
        </svg>
        <figcaption>The router splits traffic between new and legacy — the split shifts fully to new over time.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Trying to migrate everything at once defeats the whole purpose — the pattern's value is
          in small, independently verifiable, reversible steps. Forgetting to actually decommission
          the legacy system once it's fully strangled also leaves dead code and infrastructure
          costs lingering indefinitely.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is migrating one piece of functionality at a time less risky than a full rewrite-and-cutover migration?</p>
        </div>
      </section>
      <p className="takeaway">
        The strangler fig pattern turns a risky big-bang rewrite into a series of small,
        reversible steps — the legacy system shrinks gradually until it can be safely retired.
      </p>
    </div>
  );
}
