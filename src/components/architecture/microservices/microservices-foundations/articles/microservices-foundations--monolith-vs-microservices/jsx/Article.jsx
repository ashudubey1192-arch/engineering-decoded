import "../css/Article.css";

export default function MicroservicesFoundationsMonolithVsMicroservicesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The difference isn't size &mdash; it's where the seams are. A monolith is one deployable
          unit with internal (in-process) seams between its modules; microservices move those seams
          out onto the network, between independently deployable processes, each with its own data.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Monolith</h3>
            <p>One deployable, one process (or one clustered copy of it), one shared database. Modules call each other as ordinary in-process function calls.</p>
          </div>
          <div>
            <h3>Microservices</h3>
            <p>Many deployables, many processes, many databases. Services call each other over the network &mdash; HTTP, gRPC, or messages &mdash; not as in-process calls.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A ticket-booking app's "confirm booking" flow touches seats, payment, and email receipts.
          In a monolith, that's one function calling three modules in-process, inside one
          transaction, deployed as one artifact. As microservices, it's <code>BookingService</code>
          calling <code>PaymentService</code> over HTTP and publishing a <code>BookingConfirmed</code>
          event that <code>NotificationService</code> picks up independently &mdash; three separate
          deployables, three separate databases, no shared transaction across them.
        </p>
        <table className="miniTable">
          <caption>THE SAME FLOW, TWO WAYS</caption>
          <thead><tr><th>Dimension</th><th>Monolith</th><th>Microservices</th></tr></thead>
          <tbody>
            <tr><td>Deploy unit</td><td>One artifact, all modules</td><td>One artifact per service</td></tr>
            <tr><td>Data</td><td>One shared database</td><td>One database per service</td></tr>
            <tr><td>Failure blast radius</td><td>A bug can take down the whole app</td><td>Usually limited to one service</td></tr>
            <tr><td>Cross-cutting change</td><td>One PR, one deploy</td><td>Coordinated changes across several deploys</td></tr>
          </tbody>
        </table>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 190" role="img" aria-label="Side-by-side comparison: a monolith as one box containing Booking, Payment, and Email modules sharing one database, versus microservices as three independent services each with its own database, connected by network calls.">
          <text x="105" y="20" className="figLabel">MONOLITH</text>
          <rect className="boxAccent" x="20" y="35" width="170" height="80" rx="8" />
          <text x="105" y="58" className="boxText" style={{fontSize:"7.5px"}}>Booking | Payment | Email</text>
          <text x="105" y="72" className="figHint" style={{fontSize:"6px"}}>in-process calls</text>
          <rect className="box" x="60" y="95" width="90" height="18" rx="4" />
          <text x="105" y="107" className="figHint" style={{fontSize:"6px"}}>one shared database</text>

          <line className="divider" x1="230" y1="10" x2="230" y2="180" />

          <text x="345" y="20" className="figLabel">MICROSERVICES</text>
          {["Booking","Payment","Email"].map((t,i) => (
            <g key={t}>
              <rect className="box" x={250 + i*70} y="40" width="60" height="26" rx="5" />
              <text x={280 + i*70} y="57" className="boxText" style={{fontSize:"6.5px"}}>{t}</text>
              <rect className="box" x={258 + i*70} y="80" width="44" height="16" rx="4" />
              <text x={280 + i*70} y="91" className="figHint" style={{fontSize:"5px"}}>own DB</text>
            </g>
          ))}
          <line className="flow" x1="310" y1="53" x2="320" y2="53" />
          <line className="flow" x1="380" y1="53" x2="390" y2="53" />
          <text x="350" y="115" className="figHint" style={{fontSize:"6px"}}>calls over the network, not in-process</text>
        </svg>
        <figcaption>Same three concerns, two different seams: in-process modules over one database, versus independent services over the network, each with its own database.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming microservices are unconditionally "more modern" or "better architected" is the
          biggest mistake &mdash; a well-modularized monolith with clean internal boundaries is often
          easier to operate, test, and deploy than microservices split too early, before anyone
          knows where the real boundaries should be. The network calls that replace in-process calls
          aren't free either: they add latency, partial-failure modes, and serialization overhead
          that a function call never had.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>The "confirm booking" flow used to be one in-process transaction across three modules. After splitting into three services, what specifically has to change about how that flow guarantees all three steps happen together?</p>
        </div>
      </section>
      <p className="takeaway">
        You're not eliminating the coupling between booking, payment, and email by splitting them
        up &mdash; you're moving it from an in-process function call to a network call, which is a
        different (and not automatically better) set of trade-offs.
      </p>
    </div>
  );
}
