import "../css/Article.css";

export default function DiscoveryAndRoutingLoadBalancingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Load balancing decides, on every single call, which of several healthy instances actually
          receives it &mdash; the algorithm behind that decision has a real, direct effect on
          whether traffic ends up evenly spread or piled onto whichever instance happens to be
          slowest.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>COMMON LOAD-BALANCING ALGORITHMS</caption>
          <thead><tr><th>Algorithm</th><th>How it picks</th><th>Weak spot</th></tr></thead>
          <tbody>
            <tr><td><span className="badge">ROUND ROBIN</span></td><td>Cycles through instances in order</td><td>Ignores that some requests are much heavier than others</td></tr>
            <tr><td><span className="badge">LEAST CONNECTIONS</span></td><td>Sends to whichever instance has the fewest in-flight requests</td><td>Needs live connection counts, slightly more overhead to track</td></tr>
            <tr><td><span className="badge">WEIGHTED</span></td><td>Favors instances with more capacity (e.g. bigger machines)</td><td>Weights need to be kept accurate as capacity changes</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>InventoryService</code> has 5 instances; one, still warming up its cache after a
          restart, is answering requests noticeably slower than the other four. Plain round robin
          keeps sending it a full, equal share of new requests regardless, letting its queue build
          up. Least-connections, by contrast, naturally sends it fewer new requests while it's
          already busy handling a backlog &mdash; it adapts to the instance's actual current load
          instead of assuming every instance is equally free.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting round robin, which sends an equal share of new requests to a slow, backed-up instance, against least-connections, which routes fewer new requests to that same instance because it already has more in-flight work.">
          <text x="105" y="20" className="figLabel">ROUND ROBIN</text>
          {[0,1,2].map(i => (
            <g key={i}>
              <rect className={i===1 ? "boxWarn" : "box"} x={20 + i*70} y="35" width="55" height="26" rx="5" />
              <text x={47 + i*70} y="52" className="boxText" style={{fontSize:"6px"}}>Inst {i+1}</text>
              <text x={47 + i*70} y="75" className="figHint" style={{fontSize:"5.5px"}}>1 new req</text>
            </g>
          ))}
          <line className="divider" x1="245" y1="10" x2="245" y2="115" />
          <text x="335" y="20" className="figLabel">LEAST CONNECTIONS</text>
          {[0,1,2].map(i => (
            <g key={i}>
              <rect className={i===1 ? "boxWarn" : "box"} x={270 + i*50} y="35" width="42" height="26" rx="5" />
              <text x={291 + i*50} y="52" className="boxText" style={{fontSize:"5.5px"}}>Inst {i+1}</text>
              <text x={291 + i*50} y="75" className="figHint" style={{fontSize:"5px"}}>{i===1 ? "0 new" : "1-2 new"}</text>
            </g>
          ))}
        </svg>
        <figcaption>The already-backed-up instance (highlighted) still gets its equal share under round robin, but is routed around under least-connections.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Defaulting to round robin without checking whether request cost actually varies is a
          common oversight &mdash; it's the simplest algorithm, but it assumes every request and
          every instance is roughly equal, which frequently isn't true for services with mixed
          request types or instances of different sizes. Forgetting that load balancing and service
          discovery are separate concerns &mdash; the registry says who's healthy, the algorithm says
          who gets the next request among the healthy ones &mdash; leads to confusing the two when
          debugging an uneven traffic pattern.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>One InventoryService instance is still warming up and responding slowly. Why does least-connections naturally send it fewer new requests than round robin would, without being explicitly told it's slow?</p>
        </div>
      </section>
      <p className="takeaway">
        The load-balancing algorithm is a real design decision, not a default to leave unexamined
        &mdash; it decides whether an already-struggling instance gets piled on further or given room
        to recover.
      </p>
    </div>
  );
}
