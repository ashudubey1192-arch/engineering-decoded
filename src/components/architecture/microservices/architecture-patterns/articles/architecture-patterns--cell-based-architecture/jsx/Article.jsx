import "../css/Article.css";

export default function ArchitecturePatternsCellBasedArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Cell-based architecture partitions an entire system into several independent,
          self-contained replicas &mdash; cells &mdash; each capable of serving a subset of users
          entirely on its own, so a failure inside one cell can't cascade into any other.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each cell contains a full copy of every service needed to serve a request end to end, plus
          its own data store, entirely isolated from every other cell. Requests are routed to a
          specific cell &mdash; often based on a customer or tenant ID, kept consistently on the same
          cell &mdash; and never cross cell boundaries. A failure, bug, or overload inside one cell is
          contained to just the users assigned there; everyone else, on other cells, is entirely
          unaffected.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A SaaS platform runs 4 cells, each serving roughly a quarter of all customers with its own
          complete stack. A memory leak inside Cell 3 degrades performance only for the customers
          assigned there &mdash; the other three-quarters of customers, on Cells 1, 2, and 4, notice
          nothing at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of four isolated cells, each a full independent stack serving one quarter of customers, with a router assigning each customer consistently to one cell; Cell 3 is shown degraded while the other three cells remain unaffected.">
          <rect className="box" x="160" y="10" width="100" height="24" rx="5" />
          <text x="210" y="26" className="boxText" style={{fontSize:"6px"}}>Router</text>
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect className={i===2 ? "boxWarn" : "box"} x={15 + i*100} y="65" width="85" height="45" rx="6" />
              <text x={57 + i*100} y="85" className="boxText" style={{fontSize:"6px"}}>Cell {i+1}</text>
              <text x={57 + i*100} y="100" className="figHint" style={{fontSize:"5px"}}>{i===2 ? "degraded" : "unaffected"}</text>
              <line className="flowMuted" x1="210" y1="34" x2={57 + i*100} y2="63" />
            </g>
          ))}
        </svg>
        <figcaption>Cell 3 alone is degraded &mdash; its isolation from the other three cells is exactly what keeps the other 75% of customers unaffected.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Sharing any component across cells &mdash; a single shared database, a single shared queue
          &mdash; reintroduces exactly the blast-radius problem cells are meant to prevent, since one
          shared dependency failing takes down every cell at once. Routing a given customer
          inconsistently across different cells, rather than consistently to the same one, breaks the
          isolation model and any per-cell data locality, and can even split a customer's data across
          cells.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A cell-based system's 4 cells each have their own database, but all 4 share one central message queue. What happens to every cell if that shared queue goes down, and why does this defeat the point of using cells at all?</p>
        </div>
      </section>
      <p className="takeaway">
        Cells limit a failure's blast radius by duplicating the entire stack, not just parts of it
        &mdash; the isolation only holds as long as nothing is shared across cell boundaries.
      </p>
    </div>
  );
}
