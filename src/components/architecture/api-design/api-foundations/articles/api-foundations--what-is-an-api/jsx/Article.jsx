import "../css/Article.css";

export default function ApiFoundationsWhatIsAnApiArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          An API &mdash; an Application Programming Interface &mdash; is a defined contract that
          lets one piece of software ask another to do something or return data, without either
          side needing to know how the other one is actually built.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>Three ideas do almost all the work in that definition:</p>
        <ul className="stepList">
          <li><b>Contract</b> &mdash; a fixed set of requests the API accepts, what each one needs as input, and exactly what it returns, including how it reports failure.</li>
          <li><b>Abstraction boundary</b> &mdash; the caller only ever sees the contract. The database, the programming language, the number of servers behind it &mdash; all free to change, as long as the contract's behavior doesn't.</li>
          <li><b>Producer and consumer</b> &mdash; the producer builds and maintains the contract; the consumer builds against it and trusts it not to shift under them without warning.</li>
        </ul>
        <p>
          It helps to think of an API the way you'd think of a hotel's front desk rather than its
          back office. A guest doesn't get to wander into the kitchen or the laundry room and ask
          how things get done &mdash; they interact through a specific, published set of requests
          the desk supports: book a room, request a late checkout, order a wake-up call. Ask for
          something outside that set and you get a clear, defined "we don't do that," not a
          confused shrug. The hotel can gut-renovate its entire back office over a weekend, and as
          long as the desk keeps honoring the same requests the same way, not a single guest
          notices. That's the whole point of the boundary: it lets the inside change freely because
          the outside was never allowed to depend on it.
        </p>
        <p>
          It's also worth being precise about scope: "API" is a much older and broader term than
          "web API." A programming language's standard library, an operating system's syscalls, and
          a package's public functions are all APIs in exactly this sense &mdash; a defined surface
          for one piece of software to call another. This course is specifically about network
          APIs, usually over HTTP, because that's the style used when the caller and the service
          are built and deployed by different teams, sometimes different companies entirely, and
          the contract has to hold up not just across code changes but across network failures,
          versions, and years of nobody remembering why a field is named the way it is.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's contract for fetching a shipment is small and specific: a <code>GET</code>
          request to a fixed URL shape, returning a fixed JSON shape.
        </p>
        <span className="codeLabel">REQUEST</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments/shp_9f8a HTTP/1.1
Host: api.parcelly.com
Authorization: Bearer sk_live_...`}</pre>
        </div>
        <span className="codeLabel">RESPONSE</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "shp_9f8a",
  "status": "in_transit",
  "carrier": "fedex",
  "estimated_delivery": "2026-09-18"
}`}</pre>
        </div>
        <p>
          A partner's mobile app calling this has no idea whether Parcelly's backend is a single Go
          service or thirty Kubernetes pods, whether shipment status lives in Postgres or gets
          assembled from three different systems, or whether "in_transit" was computed a
          millisecond ago or read from a cache. None of that is part of the contract, so none of it
          can break the caller when it changes.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram of a caller sending a request through the API contract boundary to reach the implementation behind it, which is free to change as long as the contract stays the same.">
          <rect className="box" x="20" y="55" width="90" height="40" rx="6" />
          <text x="65" y="79" className="boxText" style={{fontSize:"7.5px"}}>Caller</text>
          <rect className="boxAccent" x="175" y="45" width="90" height="60" rx="6" />
          <text x="220" y="68" className="boxText" style={{fontSize:"7px"}}>API contract</text>
          <text x="220" y="82" className="figHint" style={{fontSize:"5.5px"}}>fixed shape</text>
          <rect className="box" x="330" y="55" width="90" height="40" rx="6" style={{strokeDasharray:"4 3"}} />
          <text x="375" y="74" className="boxText" style={{fontSize:"7px"}}>Implementation</text>
          <text x="375" y="88" className="figHint" style={{fontSize:"5.5px"}}>free to change</text>
          <line className="flow" x1="110" y1="75" x2="173" y2="75" />
          <line className="flow" x1="267" y1="75" x2="328" y2="75" />
          <text x="140" y="65" className="figHint" style={{fontSize:"6px"}}>request</text>
          <text x="298" y="65" className="figHint" style={{fontSize:"6px"}}>delegates</text>
          <text x="220" y="130" className="figHint" style={{fontSize:"6.5px"}}>the caller only ever sees the middle box &mdash; the right box can be rewritten freely</text>
        </svg>
        <figcaption>The contract is the only part the caller can see or depend on; everything to its right is free to change.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The first mistake is using "API" and "REST API" interchangeably, as if the term were
          invented for HTTP. It wasn't &mdash; REST is just today's dominant style for one specific
          kind of API, the kind exposed over a network between independently owned systems. The
          second, more expensive mistake is letting the contract leak implementation details it
          shouldn't &mdash; returning a database's raw auto-increment ID, a field that only makes
          sense given this month's internal architecture, or an error message copy-pasted from a
          stack trace. Once a partner's code starts depending on that leaked detail, it's part of
          the contract whether you intended it to be or not, and removing it is now a breaking
          change.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Parcelly switches its shipment data from Postgres to a different database entirely, and not one partner integration breaks. What property of its API made that possible?</p>
        </div>
      </section>
      <p className="takeaway">
        An API is the boundary, not the implementation behind it. Design decisions in this course
        are almost all about keeping that boundary clean &mdash; specific enough to be useful,
        narrow enough that what's behind it stays free to change.
      </p>
    </div>
  );
}
