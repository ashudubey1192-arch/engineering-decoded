import "../css/Article.css";

export default function ScalabilityHorizontalAndVerticalScalingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          When a design outgrows one machine, there are exactly two directions to go: make that
          one machine bigger (vertical), or add more machines that share the load (horizontal).
          The choice shapes almost everything else in the design that follows.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Vertical scaling</b> means a bigger box &mdash; more CPU, RAM, disk on the same
          machine. It&rsquo;s simple (no code changes, no coordination between nodes) but hits a
          hard ceiling and creates a single point of failure. <b>Horizontal scaling</b> means more
          boxes behind a load balancer, sharing the work. It scales further and survives a single
          node dying, but demands the application be stateless (or externalize its state) so any
          request can land on any node.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Estimate says 40 writes/sec, 4,000 reads/sec.</b> That&rsquo;s well within a
            single well-specified server&rsquo;s capacity &mdash; vertical scaling (a bigger box)
            is the simplest correct answer for now.</li>
          <li><b>Traffic grows 100&times;.</b> No single machine, however large, comfortably
            serves 400,000 reads/sec &mdash; the design now needs horizontal scaling.</li>
          <li><b>Make the API service stateless.</b> Move session data out of the process (into a
            shared cache) so any instance can serve any request.</li>
          <li><b>Add a load balancer</b> in front of a fleet of identical instances, and the design
            now scales by adding more boxes rather than a bigger one.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram contrasting vertical scaling, one machine growing larger, against horizontal scaling, many identical machines behind a load balancer." >
          <text x="100" y="18" className="figLabel" textAnchor="middle">VERTICAL</text>
          <rect className="box" x="60" y="30" width="80" height="60" rx="8" /><text x="100" y="65" className="boxText">bigger box</text>
          <text x="330" y="18" className="figLabel" textAnchor="middle">HORIZONTAL</text>
          <rect className="boxAccent" x="290" y="25" width="80" height="24" rx="5" /><text x="330" y="41" className="boxText" style={{fontSize:"9px"}}>LB</text>
          <line className="flow" x1="330" y1="49" x2="330" y2="60" />
          {[0,1,2].map(i => (<rect key={i} className="box" x={260 + i*45} y="65" width="35" height="28" rx="5" />))}
        </svg>
        <figcaption>Vertical scaling grows one machine; horizontal scaling adds more machines behind a load balancer.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for horizontal scaling by default, even when the estimate shows a single
          well-sized machine would comfortably handle the load, adds coordination complexity
          (load balancing, statelessness, distributed state) for no real benefit. The opposite
          mistake &mdash; scaling vertically past its ceiling because it&rsquo;s familiar &mdash;
          eventually hits a wall that no bigger box can solve.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What has to be true about an application before it can be scaled horizontally, and why doesn&rsquo;t vertical scaling require it?</p>
        </div>
      </section>
      <p className="takeaway">
        Start with the simplest option the estimate actually justifies &mdash; vertical scaling
        first, horizontal scaling once a single machine genuinely can&rsquo;t keep up.
      </p>
    </div>
  );
}
