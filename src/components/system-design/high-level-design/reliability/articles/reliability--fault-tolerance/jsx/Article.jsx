import "../css/Article.css";

export default function ReliabilityFaultToleranceArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          In a system built from enough machines, something is statistically always failing
          somewhere &mdash; fault tolerance is the design habit of assuming that from the start,
          rather than treating every failure as a surprise.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Fault tolerance means the overall system keeps working &mdash; possibly in a degraded
          form &mdash; when one of its parts fails, rather than the whole system going down with
          it. It&rsquo;s an umbrella that the rest of this section&rsquo;s tools (redundancy,
          circuit breakers, retries, disaster recovery) each implement a piece of: no single
          component&rsquo;s failure should be able to take down the whole design, and every
          component that can fail should have a defined, deliberate behavior for when it does.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Design review question:</b> &ldquo;what happens if the recommendation service is
            completely down?&rdquo;</li>
          <li><b>Without fault tolerance:</b> the product page itself fails to load, because it
            was written to require recommendations to succeed.</li>
          <li><b>With fault tolerance:</b> the product page loads normally, simply omitting the
            recommendations section, because that dependency was explicitly made non-critical.</li>
          <li><b>The same question gets asked</b> of every dependency in the design, one at a
            time, until every failure mode has a defined, acceptable behavior.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a product page that continues to render its main content when a non-critical recommendations dependency fails, instead of failing the entire page." >
          <rect className="box" x="20" y="20" width="380" height="75" rx="8" />
          <rect className="boxAccent" x="35" y="32" width="220" height="50" rx="6" /><text x="145" y="60" className="boxText" style={{fontSize:"9px"}}>Product page: still renders</text>
          <rect className="boxWarn" x="270" y="32" width="115" height="50" rx="6" /><text x="327" y="55" className="boxText" style={{fontSize:"8px"}}>Recs:</text><text x="327" y="70" className="boxText" style={{fontSize:"8px"}}>down, omitted</text>
        </svg>
        <figcaption>A non-critical dependency failing degrades the page instead of breaking it entirely.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Making every dependency &ldquo;required&rdquo; by default, without asking whether it
          truly needs to block the primary function, turns every minor outage into a major one.
          Assuming fault tolerance is one library or setting you add at the end is the other
          mistake &mdash; it&rsquo;s a design stance applied consistently to every component,
          from the start.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What question should be asked of every dependency in a design to check whether the overall system is fault tolerant?</p>
        </div>
      </section>
      <p className="takeaway">
        Fault tolerance is the discipline of deciding, for every dependency, what happens when it
        fails &mdash; before it actually does, in production, without a plan.
      </p>
    </div>
  );
}
