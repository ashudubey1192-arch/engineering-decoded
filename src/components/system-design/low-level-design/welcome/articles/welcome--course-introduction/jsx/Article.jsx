import "../css/Article.css";

export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          High level design decides which boxes exist in a system and how they talk to each
          other. Low level design is the next step down: once you know a &ldquo;PaymentService&rdquo;
          box needs to exist, LLD is what decides what&rsquo;s actually inside it &mdash; which
          classes, which responsibilities, which relationships.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Where HLD reasons about services, databases, and network boundaries at the scale of an
          entire system, LLD reasons about objects: their fields, their methods, and how instances
          of different classes collaborate to fulfill one component&rsquo;s responsibility. The
          usual output isn&rsquo;t a system diagram with boxes and arrows between servers &mdash;
          it&rsquo;s a class diagram, or working code, describing a single well-modeled piece.
        </p>
        <p>
          Interview framing makes the difference concrete: an HLD prompt like &ldquo;design
          Uber&rdquo; asks how location updates, matching, and payments scale across millions of
          users. An LLD prompt like &ldquo;design a parking lot&rdquo; never mentions servers or
          databases at all &mdash; it asks you to model Vehicle, ParkingSpot, and Ticket as classes
          with clear responsibilities and correct relationships.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>An HLD answer to &ldquo;design a parking lot&rdquo;</b> might discuss a payments
            service, a notifications service, and a database that scales across multiple physical
            locations.</li>
          <li><b>An LLD answer to the same prompt</b> instead defines a ParkingSpot class with a
            size and occupied flag, a Vehicle class with a size, and a ParkingLot class that
            matches one to the other &mdash; no servers in sight.</li>
          <li><b>Both are valid designs for the same system;</b> they're just answering different
            questions about it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram contrasting a high level design view, made of services and databases connected by network calls, with a low level design view of the same prompt, made of classes connected by relationships." >
          <rect className="box" x="20" y="20" width="180" height="90" rx="8" />
          <text x="110" y="16" className="figLabel" textAnchor="middle" style={{fontSize:"8px"}}>HLD view</text>
          <rect className="boxAccent" x="35" y="35" width="70" height="24" rx="5" /><text x="70" y="51" className="boxText" style={{fontSize:"7px"}}>Service</text>
          <rect className="boxAccent" x="115" y="35" width="65" height="24" rx="5" /><text x="147" y="51" className="boxText" style={{fontSize:"7px"}}>Service</text>
          <rect className="box" x="70" y="80" width="90" height="22" rx="5" /><text x="115" y="95" className="boxText" style={{fontSize:"7px"}}>Database</text>
          <line className="divider" x1="220" y1="15" x2="220" y2="115" />
          <rect className="box" x="240" y="20" width="180" height="90" rx="8" />
          <text x="330" y="16" className="figLabel" textAnchor="middle" style={{fontSize:"8px"}}>LLD view</text>
          <rect className="boxAccent" x="255" y="35" width="65" height="22" rx="5" /><text x="287" y="50" className="boxText" style={{fontSize:"7px"}}>Vehicle</text>
          <rect className="boxAccent" x="335" y="35" width="70" height="22" rx="5" /><text x="370" y="50" className="boxText" style={{fontSize:"7px"}}>ParkingSpot</text>
          <rect className="box" x="290" y="80" width="70" height="22" rx="5" /><text x="325" y="95" className="boxText" style={{fontSize:"7px"}}>Ticket</text>
        </svg>
        <figcaption>Two valid answers to the same prompt: one about services and data flow, the other about classes and relationships.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating LLD as &ldquo;just write any code that works&rdquo; skips the actual point,
          which is demonstrating deliberate class design &mdash; clear responsibilities, sensible
          relationships, principles applied on purpose. Jumping straight to code before sketching
          responsibilities and relationships is the other common failure; the classes that come
          out tend to be harder to explain and harder to extend.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the key difference in what a high level design and a low level design each ask you to produce for the same system?</p>
        </div>
      </section>
      <p className="takeaway">
        HLD decides which boxes exist and how they talk; LLD decides what's inside one box &mdash;
        the classes, their responsibilities, and how their instances relate.
      </p>
    </div>
  );
}
