import "../css/Article.css";

export default function AlternativeApiStylesWebsocketsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A WebSocket opens one persistent, two-way connection instead of the request-response
          pattern every other style in this course assumes &mdash; the right tool specifically when
          a server needs to push many updates faster than polling could ever keep up with.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Persistent, full-duplex</b> &mdash; once open, either side can send at any time, with no need to first send a request.</li>
          <li><b>Starts as an HTTP handshake</b> &mdash; the connection begins as a normal HTTP request that "upgrades" to the WebSocket protocol.</li>
          <li><b>A different shape of problem than REST</b> &mdash; most CRUD-style operations are naturally one-off request/responses; WebSockets and REST aren't competitors, and most real products use both, for different parts of the same experience.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's live-tracking map opens a WebSocket to receive a driver's GPS position the
          moment it updates, every few seconds during an active delivery. Polling
          <code>GET /shipments/shp_9f8a/location</code> once a second to approximate the same
          experience would be both wasteful &mdash; most polls would return an unchanged position
          &mdash; and laggier, since a real position update still has to wait for the next poll
          instead of arriving the instant it happens.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting repeated polling, where the client sends many separate requests and most get an unchanged response, against a single open WebSocket connection where the server pushes updates the moment they happen.">
          <text x="105" y="18" className="figLabel">POLLING</text>
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect className="box" x={20 + i*45} y="35" width="35" height="22" rx="4" />
              <text x={37 + i*45} y="50" className="boxText" style={{fontSize:"5px"}}>poll</text>
            </g>
          ))}
          <text x="105" y="80" className="figHint" style={{fontSize:"5.5px"}}>most polls: nothing changed</text>

          <line className="divider" x1="230" y1="10" x2="230" y2="120" />

          <text x="335" y="18" className="figLabel">WEBSOCKET</text>
          <rect className="boxAccent" x="270" y="35" width="120" height="22" rx="4" />
          <text x="330" y="50" className="boxText" style={{fontSize:"6px"}}>one open connection</text>
          <text x="335" y="80" className="figHint" style={{fontSize:"5.5px"}}>server pushes the instant it changes</text>
        </svg>
        <figcaption>Polling spends most of its requests confirming nothing happened; a push over one open connection only sends data when there's actually something new.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using a WebSocket for ordinary CRUD operations that are naturally one-off
          request/responses adds connection-management complexity most operations never needed in
          the first place. Not planning for reconnection is the other common mistake: unlike an
          HTTP request, a dropped WebSocket connection has no built-in automatic retry, so the
          client needs explicit logic to reconnect and resynchronize state after a drop.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why would replacing every REST endpoint in Parcelly's API with a WebSocket-based equivalent make most operations worse, not better?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for a WebSocket specifically for high-frequency, server-initiated updates &mdash;
        everything else in this course's request/response model still fits ordinary CRUD operations
        better.
      </p>
    </div>
  );
}
