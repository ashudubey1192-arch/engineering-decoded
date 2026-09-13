import "../css/Article.css";

export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          High Level Design (HLD) is the practice of turning a vague prompt like &ldquo;design
          Twitter&rdquo; into a small set of services, data stores, and connections that could
          actually be built &mdash; without yet writing a single class or function.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          System Design Fundamentals teaches the individual building blocks &mdash; what a load
          balancer is, how sharding works, what CAP theorem means. High Level Design is the next
          layer up: it&rsquo;s the skill of <b>combining</b> those building blocks into a coherent
          architecture for one specific problem. Low Level Design, in turn, is the layer below HLD
          &mdash; the class diagrams and interfaces inside a single one of the boxes an HLD produces.
          This course assumes you already know the building blocks and focuses entirely on the
          process of assembling them.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>Given the prompt &ldquo;design a parking garage reservation system,&rdquo; a complete HLD pass produces:</p>
        <ol className="stepList">
          <li><b>Clarified requirements.</b> Reserve a spot ahead of time, pay on entry, support
            three garage sizes &mdash; explicitly out of scope: dynamic pricing.</li>
          <li><b>Rough capacity numbers.</b> 50 garages, 2,000 spots each, peak 10 reservations/sec
            across the fleet &mdash; small enough that a single relational database is plausible.</li>
          <li><b>A handful of APIs and a data model.</b> <code>POST /reservations</code>,{" "}
            <code>GET /garages/{"{"}id{"}"}/availability</code>, and a{" "}
            <code>Garage / Spot / Reservation</code> schema.</li>
          <li><b>A box diagram.</b> API service, a Postgres database, and a cache for availability
            lookups &mdash; nothing more, because the numbers didn&rsquo;t justify more.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 140" role="img" aria-label="Diagram of three layers: System Design Fundamentals providing building blocks, High Level Design combining them into an architecture, and Low Level Design detailing the inside of one component." >
          <rect className="box" x="15" y="55" width="130" height="40" rx="6" /><text x="80" y="80" className="boxText">Fundamentals</text>
          <line className="flow" x1="145" y1="75" x2="195" y2="75" />
          <rect className="boxAccent" x="200" y="45" width="140" height="55" rx="6" /><text x="270" y="77" className="boxText">High Level Design</text>
          <line className="flow" x1="340" y1="75" x2="390" y2="75" />
          <rect className="box" x="395" y="55" width="55" height="40" rx="6" /><text x="422" y="80" className="boxText" style={{fontSize:"9px"}}>LLD</text>
          <text x="270" y="30" className="figHint" textAnchor="middle">this course lives here</text>
        </svg>
        <figcaption>HLD sits between the individual concepts you already know and the class-level detail of a single component.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating HLD as a trivia test &mdash; naming technologies (&ldquo;we&rsquo;ll use Kafka
          and Redis&rdquo;) without ever justifying them against requirements or scale &mdash; is
          the single most common failure mode. The other is diving straight into implementation
          detail (retry policies, exact class names) before the overall shape of the system is
          even agreed on.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>How does High Level Design differ from both System Design Fundamentals and Low Level Design?</p>
        </div>
      </section>
      <p className="takeaway">
        HLD is the assembly skill: taking building blocks you already understand and combining
        them, deliberately and justifiably, into an architecture for one specific problem.
      </p>
    </div>
  );
}
