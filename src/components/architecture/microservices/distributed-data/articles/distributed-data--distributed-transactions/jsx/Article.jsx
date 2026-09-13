import "../css/Article.css";

export default function DistributedDataDistributedTransactionsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A distributed transaction tries to make several independent services' database changes
          succeed or fail together, atomically &mdash; the same guarantee a single-database
          transaction gives for free, but far more expensive once each piece is a separate service
          with its own database.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The classic mechanism is <b>two-phase commit</b>: a coordinator asks every participant to
          "prepare" (lock resources and confirm they could commit), and only once every participant
          has agreed does it tell them all to actually commit. This works, but it holds locks across
          every participant for the whole round trip, and if the coordinator itself crashes between
          phases, participants can be left holding locks indefinitely.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Booking a trip needs a flight seat, a hotel room, and a rental car reserved together, or
          not at all. A two-phase commit would have the coordinator ask
          <code>FlightService</code>, <code>HotelService</code>, and <code>CarService</code> to each
          prepare (holding a lock on the seat, room, and car), wait for all three to confirm, then
          tell all three to commit. If <code>CarService</code> is slow to respond, the flight seat
          and hotel room stay locked the whole time, unavailable to anyone else.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of two-phase commit: a coordinator asks Flight, Hotel, and Car services to prepare and hold locks, waits for all three to confirm, and only then tells all three to commit, with locks held the entire time.">
          <rect className="boxAccent" x="160" y="15" width="100" height="26" rx="6" />
          <text x="210" y="32" className="boxText" style={{fontSize:"7px"}}>Coordinator</text>
          {["Flight","Hotel","Car"].map((t,i) => (
            <g key={t}>
              <rect className="boxWarn" x={30 + i*140} y="75" width="90" height="30" rx="6" />
              <text x={75 + i*140} y="94" className="boxText" style={{fontSize:"6.5px"}}>{t}Service</text>
              <line className="flow" x1="210" y1="41" x2={75 + i*140} y2="73" />
            </g>
          ))}
          <text x="210" y="60" className="figHint" style={{fontSize:"6px"}}>1. prepare &amp; lock &rarr; 2. all confirm &rarr; 3. commit</text>
          <text x="210" y="125" className="figHint" style={{fontSize:"6px"}}>all three locks held for the entire round trip</text>
        </svg>
        <figcaption>Every participant holds its lock from prepare through commit &mdash; the slowest participant sets the pace for all three.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for two-phase commit as the default way to coordinate across services is a common
          overcorrection &mdash; it couples the availability of all participants together for the
          duration of every transaction, which is exactly the kind of coupling microservices are
          usually trying to avoid. It also doesn't compose well with services owned by different
          teams or running on different infrastructure, since it needs every participant to support
          the same coordination protocol. The Saga pattern in the next lesson is what most real
          systems reach for instead.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>While CarService is slow to respond during the prepare phase, what happens to the flight seat and hotel room that FlightService and HotelService already locked?</p>
        </div>
      </section>
      <p className="takeaway">
        Two-phase commit gives you real atomicity across services, but at the cost of coupling every
        participant's availability together for the whole transaction &mdash; know that cost before
        reaching for it.
      </p>
    </div>
  );
}
