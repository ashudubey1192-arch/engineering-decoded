import "../css/Article.css";

export default function LldCaseStudiesDesignAParkingLotArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A classic LLD warm-up, deceptively simple sounding &mdash; it tests whether you model a
          small set of related entities cleanly, rather than writing one giant ParkingLot class
          that does everything itself.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: park a vehicle in a suitable spot, issue a ticket on entry, calculate a fee
          on exit, and support multiple vehicle and spot sizes. Candidate classes: <code>Vehicle</code>
          (with a size), <code>ParkingSpot</code> (sized, occupied or free), <code>Ticket</code>
          (entry time, spot, vehicle), and <code>ParkingLot</code> (coordinates the other three).
          Which spot a vehicle gets, and how the fee is calculated, are both policies that vary
          between lots &mdash; a natural fit for Strategy, so a lot can plug in a &ldquo;nearest
          spot&rdquo; or &ldquo;best-fit size&rdquo; assignment policy without ParkingLot's own
          code ever changing.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A vehicle arrives.</b> ParkingLot asks its current spot-assignment strategy to
            find a free spot matching the vehicle's size.</li>
          <li><b>The spot is marked occupied,</b> and a Ticket is created recording the entry time,
            the assigned spot, and the vehicle.</li>
          <li><b>The vehicle exits.</b> ParkingLot asks its fee strategy to calculate a charge from
            the Ticket's duration and the vehicle's type.</li>
          <li><b>The spot is marked free again,</b> available for the next vehicle whose size fits it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of ParkingLot coordinating Vehicle, ParkingSpot, and Ticket, with a pluggable spot-assignment strategy deciding which spot a vehicle gets." >
          <rect className="boxAccent" x="160" y="15" width="120" height="28" rx="6" /><text x="220" y="34" className="boxText" style={{fontSize:"7.5px"}}>ParkingLot</text>
          <line className="flow" x1="220" y1="43" x2="220" y2="65" /><text x="255" y="58" className="figHint" style={{fontSize:"6.5px"}}>assignment strategy</text>
          <rect className="box" x="150" y="70" width="140" height="26" rx="5" /><text x="220" y="87" className="boxText" style={{fontSize:"7px"}}>SpotAssignmentStrategy</text>
          <line className="flowMuted" x1="160" y1="29" x2="60" y2="60" /><rect className="box" x="20" y="65" width="80" height="24" rx="5" /><text x="60" y="81" className="boxText" style={{fontSize:"6.5px"}}>Vehicle</text>
          <line className="flowMuted" x1="280" y1="29" x2="370" y2="60" /><rect className="box" x="330" y="65" width="80" height="24" rx="5" /><text x="370" y="81" className="boxText" style={{fontSize:"6.5px"}}>Ticket</text>
          <rect className="box" x="175" y="105" width="90" height="22" rx="5" /><text x="220" y="120" className="boxText" style={{fontSize:"6.5px"}}>ParkingSpot</text>
        </svg>
        <figcaption>ParkingLot coordinates Vehicle, ParkingSpot, and Ticket, delegating the assignment decision to a swappable strategy.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Hardcoding fee and assignment logic as if/else directly inside ParkingLot, instead of
          behind a swappable strategy, ties every policy change to editing the core class. Modeling
          spot size and vehicle size as plain strings compared with equality checks, instead of a
          shared enum or type, invites typo-driven bugs that a type system would have caught.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why do spot assignment and fee calculation both fit naturally as Strategy objects rather than logic inside ParkingLot itself?</p>
        </div>
      </section>
      <p className="takeaway">
        The parking lot's real design test is keeping Vehicle, ParkingSpot, and Ticket each
        focused, with the policies that vary between lots pulled out behind swappable strategies.
      </p>
    </div>
  );
}
