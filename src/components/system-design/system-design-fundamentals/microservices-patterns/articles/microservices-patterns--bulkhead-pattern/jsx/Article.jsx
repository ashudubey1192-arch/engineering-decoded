import "../css/Article.css";

export default function MicroservicesPatternsBulkheadPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The bulkhead pattern isolates resources — thread pools, connection pools — per
          dependency, so one slow or failing dependency can't exhaust resources shared by
          everything else and take down unrelated functionality with it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Named after a ship's watertight compartments — a hull breach floods one compartment, not
          the whole ship — the pattern gives each dependency its own dedicated, capped pool of
          resources (threads, connections) instead of one shared pool for everything. If one
          dependency starts responding slowly, only the requests waiting on <i>that</i> dependency
          get stuck; requests to every other dependency keep flowing through their own,
          unaffected pool.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A service calls both a fast internal database and a slow third-party shipping API — from one shared thread pool.</p>
        </div>
        <ol className="stepList">
          <li><b>Without bulkheads.</b> The shipping API slows down; all threads in the shared
            pool end up blocked waiting on it — even requests that only needed the fast database
            now can't get a thread.</li>
          <li><b>Add a bulkhead.</b> Give the shipping API calls their own pool of, say, 10
            threads, separate from the database calls' pool.</li>
          <li><b>Shipping API slows down again.</b> Only its 10 dedicated threads fill up and
            back up — database calls keep flowing through their own separate pool, completely
            unaffected.</li>
          <li><b>Blast radius is contained</b> — one slow dependency degrades only the
            functionality that depends on it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram contrasting one shared thread pool where a slow dependency exhausts all threads versus separate bulkheaded pools where a slow dependency only exhausts its own pool.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">SHARED POOL</text>
          <rect className="boxWarn" x="30" y="30" width="140" height="50" rx="6" /><text x="100" y="60" className="boxText">all threads blocked</text>
          <line className="divider" x1="200" y1="10" x2="200" y2="130" />
          <text x="330" y="18" className="figLabel" textAnchor="middle">BULKHEADED</text>
          <rect className="boxWarn" x="230" y="30" width="80" height="45" rx="5" /><text x="270" y="55" className="boxText">shipping pool</text>
          <rect className="box" x="320" y="30" width="80" height="45" rx="5" /><text x="360" y="55" className="boxText">DB pool (fine)</text>
        </svg>
        <figcaption>Separate pools contain a slow dependency's impact to only the requests that need it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Under-sizing every bulkhead "to be safe" can leave individual pools too small for normal
          load, creating artificial bottlenecks. It's also easy to forget bulkheads at the
          connection-pool or process level, not just threads — a shared database connection pool
          can bottleneck the same way a shared thread pool does.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does isolating resource pools per dependency stop one slow dependency from affecting unrelated requests?</p>
        </div>
      </section>
      <p className="takeaway">
        Bulkheads trade some resource efficiency for contained failure — a slow dependency's
        damage stays within its own compartment instead of spreading to everything else.
      </p>
    </div>
  );
}
