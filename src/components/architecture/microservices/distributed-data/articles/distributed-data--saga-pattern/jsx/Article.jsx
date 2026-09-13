import "../css/Article.css";

export default function DistributedDataSagaPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A saga replaces one all-or-nothing distributed transaction with a sequence of local
          transactions, each with its own compensating action to undo it &mdash; trading true
          atomicity for something more practical: eventual consistency, achieved by actively undoing
          whatever already succeeded if a later step fails.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each step in a saga is a normal local transaction in one service. If step 3 of 4 fails, the
          saga doesn't try to roll back a distributed transaction &mdash; it runs compensating
          actions for steps 2 and 1, in reverse order, each undoing what its forward step did. A
          compensating action isn't a database rollback; it's its own explicit operation
          (<code>releaseSeat</code>, not "undo the reservation transaction").
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Booking the same trip as a saga: reserve the flight seat, reserve the hotel room, charge
          the card. If the charge fails, the saga runs <code>releaseHotelRoom</code> then
          <code>releaseFlightSeat</code> &mdash; each a normal, local, already-committed operation on
          its own service, run in reverse order of the original steps.
        </p>
        <span className="codeLabel">FORWARD STEPS AND THEIR COMPENSATIONS</span>
        <div className="codeBlock">
          <pre>{`1. FlightService.reserveSeat()     compensate: releaseSeat()
2. HotelService.reserveRoom()      compensate: releaseRoom()
3. PaymentService.chargeCard()     (fails here)
-> run compensations in reverse: releaseRoom(), releaseSeat()`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram of a saga: forward steps reserve a flight seat then a hotel room then attempt to charge a card, which fails, triggering compensating actions that release the hotel room and then the flight seat, in reverse order.">
          <defs>
            <marker id="sgArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: "var(--course-accent)" }} />
            </marker>
            <marker id="sgArrowWarn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: "#e0574f" }} />
            </marker>
          </defs>
          <rect className="boxAccent" x="15" y="20" width="110" height="30" rx="6" />
          <text x="70" y="39" className="boxText" style={{fontSize:"6.5px"}}>1. Reserve seat</text>
          <rect className="boxAccent" x="155" y="20" width="110" height="30" rx="6" />
          <text x="210" y="39" className="boxText" style={{fontSize:"6.5px"}}>2. Reserve room</text>
          <rect className="boxWarn" x="295" y="20" width="110" height="30" rx="6" />
          <text x="350" y="39" className="boxText" style={{fontSize:"6.5px"}}>3. Charge card &mdash; FAILS</text>
          <line className="flow" x1="125" y1="35" x2="153" y2="35" markerEnd="url(#sgArrow)" />
          <line className="flow" x1="265" y1="35" x2="293" y2="35" markerEnd="url(#sgArrow)" />

          <rect className="box" x="155" y="95" width="110" height="30" rx="6" />
          <text x="210" y="114" className="boxText" style={{fontSize:"6.5px"}}>Release room</text>
          <rect className="box" x="15" y="95" width="110" height="30" rx="6" />
          <text x="70" y="114" className="boxText" style={{fontSize:"6.5px"}}>Release seat</text>
          <line className="flowMuted" x1="350" y1="50" x2="265" y2="95" markerEnd="url(#sgArrowWarn)" />
          <line className="flowMuted" x1="155" y1="110" x2="125" y2="110" markerEnd="url(#sgArrowWarn)" />
          <text x="210" y="140" className="figHint" style={{fontSize:"6px"}}>compensations run in reverse order</text>
        </svg>
        <figcaption>When the third step fails, the saga doesn't roll back a transaction &mdash; it runs explicit compensating actions for the steps that already succeeded, in reverse.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Writing a compensating action that assumes the original step definitely succeeded exactly
          once is risky &mdash; compensations need to handle being run against a step that partially
          completed or was retried, which means they usually need to be idempotent too. Forgetting
          that a saga is not atomic in the traditional sense is the other mistake: between step 1
          succeeding and step 3 failing, another process could briefly observe the flight seat as
          reserved even though the whole booking eventually fails &mdash; a saga gives you eventual
          consistency, not the instant all-or-nothing view a single transaction would.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why must compensating actions run in the reverse order of the original forward steps, rather than in any order or the same forward order?</p>
        </div>
      </section>
      <p className="takeaway">
        A saga trades true atomicity for something workable across independent services &mdash;
        explicit, reversed compensating actions instead of a single distributed rollback.
      </p>
    </div>
  );
}
