import "../css/Article.css";

export default function MicroservicesPatternsBackendForFrontendBffArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A Backend for Frontend (BFF) is a dedicated backend layer built for one specific client —
          mobile, web, a partner API — instead of one generic API trying to serve every client
          equally well.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Different clients often need different shapes of data: a mobile app wants a small,
          pre-aggregated payload to save bandwidth and battery; a web dashboard might want a richer,
          more detailed response. A single shared API tends to either bloat (serving everything to
          everyone) or force awkward compromises. A BFF sits between each client type and the
          backend microservices, calling and combining whatever's needed, shaped exactly for that
          client.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A product page needs a lightweight payload on mobile but a data-rich payload on the web dashboard.</p>
        </div>
        <ol className="stepList">
          <li><b>Mobile BFF.</b> Calls the catalog and pricing services, returns just the name,
            price, and thumbnail — minimal payload for a slow connection.</li>
          <li><b>Web BFF.</b> Calls catalog, pricing, reviews, and recommendations services,
            combining them into one larger response tailored for the richer web UI.</li>
          <li><b>Each BFF evolves independently.</b> Adding a new mobile screen doesn't require
            touching the web BFF, and vice versa.</li>
          <li><b>Backend services stay generic.</b> Catalog and pricing services don't need to know
            anything about mobile vs. web — that shaping logic lives in the BFFs.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a mobile client and a web client each calling their own dedicated BFF, both of which call the same shared backend services underneath.">
          <rect className="box" x="20" y="15" width="80" height="26" rx="4" /><text x="60" y="33" className="boxText">mobile app</text>
          <rect className="box" x="20" y="90" width="80" height="26" rx="4" /><text x="60" y="108" className="boxText">web app</text>
          <line className="flow" x1="100" y1="28" x2="150" y2="28" /><line className="flow" x1="100" y1="103" x2="150" y2="103" />
          <rect className="boxAccent" x="155" y="15" width="80" height="26" rx="4" /><text x="195" y="33" className="boxText">mobile BFF</text>
          <rect className="boxAccent" x="155" y="90" width="80" height="26" rx="4" /><text x="195" y="108" className="boxText">web BFF</text>
          <line className="flow" x1="235" y1="30" x2="320" y2="65" /><line className="flow" x1="235" y1="100" x2="320" y2="70" />
          <rect className="box" x="325" y="55" width="90" height="26" rx="4" /><text x="370" y="73" className="boxText">shared services</text>
        </svg>
        <figcaption>Each client type gets a BFF shaped for its needs; backend services stay shared and generic.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Creating a BFF per client without a plan for shared logic between them leads to
          duplicated code across BFFs — common shaping logic often deserves its own shared library
          or service. Too many BFFs (one per screen, rather than one per client type) can also
          fragment the system past the point of being manageable.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might a mobile client and a web dashboard each want their own BFF instead of sharing one general-purpose API?</p>
        </div>
      </section>
      <p className="takeaway">
        A BFF trades one generic API's compromises for a backend tailored to each client's real
        needs — worth it once different clients' needs have genuinely diverged.
      </p>
    </div>
  );
}
