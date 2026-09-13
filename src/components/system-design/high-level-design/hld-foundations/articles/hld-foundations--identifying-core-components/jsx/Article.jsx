import "../css/Article.css";

export default function HldFoundationsIdentifyingCoreComponentsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          With APIs and a data model in hand, the last foundational step is drawing the actual
          boxes &mdash; deciding what&rsquo;s a separate service, what&rsquo;s a datastore, and
          what supporting pieces the capacity estimate has already justified.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A component earns its own box when it has a distinct responsibility, can scale or fail
          independently, or was specifically justified by the capacity estimate (a cache because
          reads dominate, a queue because writes need to be smoothed out). Components that don&rsquo;t
          meet one of those bars should stay merged into an existing box &mdash; splitting things
          apart &ldquo;for cleanliness&rdquo; adds operational cost without a concrete reason.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start from the API service and data model</b> already defined &mdash; that&rsquo;s
            always the first box.</li>
          <li><b>Check the estimate.</b> Earlier estimation showed reads far outnumber writes
            &mdash; that justifies adding a cache in front of the database.</li>
          <li><b>Check for anything else the estimate implies.</b> Write volume was low, so a
            message queue isn&rsquo;t justified yet &mdash; it stays out of the diagram.</li>
          <li><b>Draw the final box diagram.</b> Client &rarr; API service &rarr; cache &rarr;
            database, with each box present for a stated reason.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 110" role="img" aria-label="Diagram of a client calling an API service, which checks a cache before falling back to a database, each box justified by a specific requirement or estimate." >
          <rect className="box" x="10" y="35" width="80" height="34" rx="6" /><text x="50" y="57" className="boxText">Client</text>
          <line className="flow" x1="90" y1="52" x2="140" y2="52" />
          <rect className="boxAccent" x="145" y="30" width="100" height="44" rx="6" /><text x="195" y="56" className="boxText">API service</text>
          <line className="flow" x1="245" y1="45" x2="290" y2="45" /><text x="267" y="38" className="figHint" style={{fontSize:"8px"}}>check</text>
          <rect className="box" x="295" y="20" width="70" height="30" rx="5" /><text x="330" y="39" className="boxText" style={{fontSize:"9px"}}>Cache</text>
          <line className="flow" x1="245" y1="65" x2="290" y2="65" /><text x="267" y="80" className="figHint" style={{fontSize:"8px"}}>fallback</text>
          <rect className="box" x="295" y="60" width="70" height="30" rx="5" /><text x="330" y="79" className="boxText" style={{fontSize:"9px"}}>DB</text>
        </svg>
        <figcaption>Every box in the diagram is present because a requirement or an estimate specifically justified it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adding components by default &mdash; a message queue, a search index, a separate
          microservice per entity &mdash; because they &ldquo;seem like good practice&rdquo;
          produces an over-engineered design that can&rsquo;t be justified when questioned. Under-
          splitting is the opposite failure: cramming a component that clearly needs to scale or
          fail independently into an existing box just to keep the diagram simple.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What are the three justifications that earn a piece of the system its own box in the component diagram?</p>
        </div>
      </section>
      <p className="takeaway">
        Every box on the diagram should trace back to a stated requirement or a specific number
        from the estimate &mdash; that traceability is what makes a design defensible rather than
        just familiar-looking.
      </p>
    </div>
  );
}
