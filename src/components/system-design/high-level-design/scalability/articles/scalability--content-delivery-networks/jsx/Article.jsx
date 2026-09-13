import "../css/Article.css";

export default function ScalabilityContentDeliveryNetworksArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A CDN pushes static or slow-changing content physically closer to users around the world
          &mdash; it&rsquo;s the box you add the moment a design serves images, video, or any asset
          to a geographically spread-out audience.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A CDN is a network of edge servers, geographically distributed, that cache copies of
          content close to where users actually are &mdash; so a user in Tokyo fetches a video
          thumbnail from a nearby edge node instead of crossing the ocean to the origin server. It
          reduces both latency (physical distance) and origin load (most requests never reach the
          origin at all). Unlike an application-level cache, a CDN specifically targets static
          assets served over HTTP, not arbitrary query results.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A video platform serves thumbnails</b> to users worldwide from a single
            origin data center.</li>
          <li><b>Users far from that data center</b> experience noticeably higher latency loading
            thumbnails than users nearby.</li>
          <li><b>Put a CDN in front of thumbnail URLs.</b> The first request in a region pulls from
            origin and caches at the nearby edge node.</li>
          <li><b>Every subsequent request in that region</b> is served from the edge node directly
            &mdash; faster for users, and far less load reaching the origin.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of users in different regions being served by nearby CDN edge nodes, which fetch from a single origin server only on a cache miss." >
          <rect className="boxAccent" x="180" y="50" width="80" height="30" rx="5" /><text x="220" y="69" className="boxText" style={{fontSize:"9px"}}>Origin</text>
          {[[40,20],[380,20],[40,100],[380,100]].map(([x,y],i) => (
            <g key={i}>
              <rect className="box" x={x-30} y={y-15} width="60" height="26" rx="5" /><text x={x} y={y+3} className="boxText" style={{fontSize:"7px"}}>edge {i+1}</text>
              <line className="flowMuted" x1={x} y1={y > 50 ? y-15 : y+11} x2="220" y2="65" />
            </g>
          ))}
        </svg>
        <figcaption>Edge nodes serve most requests locally, falling back to the origin only when their cache misses.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Putting frequently-changing, user-specific content behind a CDN without proper cache
          keys or short TTLs risks serving one user&rsquo;s data to another. Forgetting a CDN
          entirely for a globally-distributed, asset-heavy design (images, video, downloads) leaves
          an easy, high-impact optimization on the table.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>How does a CDN differ from an application-level cache like Redis, in what it caches and where it lives?</p>
        </div>
      </section>
      <p className="takeaway">
        A CDN is the answer specifically to &ldquo;users are far from my origin server&rdquo; for
        static or slow-changing content &mdash; it belongs on the diagram whenever both of those
        are true.
      </p>
    </div>
  );
}
