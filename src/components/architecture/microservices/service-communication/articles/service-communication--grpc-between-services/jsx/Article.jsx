import "../css/Article.css";

export default function ServiceCommunicationGrpcBetweenServicesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          gRPC replaces hand-written JSON-over-HTTP with a strongly-typed contract and a binary wire
          format &mdash; you get generated client and server code in every language involved, and
          none of the "does this field really always exist" guessing that comes with loosely-typed
          JSON.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A <code>.proto</code> file defines a service's methods and message shapes once; a compiler
          generates matching client and server code for whichever languages the calling and serving
          services are written in. Requests travel as compact binary (Protocol Buffers) over HTTP/2,
          which also gives you multiplexed requests and built-in streaming &mdash; a call that
          returns a stream of results over time, not just one response.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>TrackingService</code> exposes a <code>SubscribeToUpdates</code> method that
          streams location updates for a shipment as they happen, instead of the caller polling a
          REST endpoint every few seconds:
        </p>
        <span className="codeLabel">PROTO DEFINITION (SIMPLIFIED)</span>
        <div className="codeBlock">
          <pre>{`service Tracking {
  rpc SubscribeToUpdates(ShipmentId) returns (stream LocationUpdate);
}
message ShipmentId { string id = 1; }
message LocationUpdate { double lat = 1; double lng = 2; int64 at = 3; }`}</pre>
        </div>
        <p>
          Both <code>TrackingService</code> (say, written in Go) and its Node.js caller get
          generated, type-checked client code from this one file &mdash; neither side hand-writes
          request or response parsing, and a typo in a field name is a compile error, not a
          production bug.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Diagram of a gRPC streaming call: the caller sends one ShipmentId request and receives a continuous stream of LocationUpdate messages over time, rather than one single response." >
          <rect className="box" x="20" y="45" width="100" height="28" rx="6" />
          <text x="70" y="63" className="boxText" style={{fontSize:"6.5px"}}>Caller (Node.js)</text>
          <rect className="boxAccent" x="270" y="45" width="110" height="28" rx="6" />
          <text x="325" y="63" className="boxText" style={{fontSize:"6.5px"}}>TrackingService (Go)</text>
          <line className="flow" x1="120" y1="55" x2="270" y2="55" />
          <text x="195" y="43" className="figHint" style={{fontSize:"5.5px"}}>SubscribeToUpdates(id)</text>
          {[0,1,2].map(i => (<line key={i} className="flowMuted" x1="270" y1={70+i*3} x2="120" y2={80+i*8} />))}
          <text x="195" y="105" className="figHint" style={{fontSize:"6px"}}>stream of LocationUpdate, over time</text>
        </svg>
        <figcaption>One request opens a stream; LocationUpdate messages keep arriving as the shipment moves, instead of the caller polling repeatedly.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for gRPC for a service that's called directly from a browser is a common misstep
          &mdash; browsers don't speak native gRPC, so you'd need a translation proxy (gRPC-Web)
          anyway, and REST is usually the simpler choice for anything public-facing. The other
          mistake is treating the generated client code as a black box and never versioning the
          <code>.proto</code> file carefully &mdash; removing or renumbering a field breaks every
          generated client still built against the old definition.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is gRPC's SubscribeToUpdates streaming method a better fit here than a REST endpoint the caller would have to poll every few seconds?</p>
        </div>
      </section>
      <p className="takeaway">
        gRPC earns its keep for internal, high-volume, or streaming service-to-service calls where
        strong typing and generated code save real work &mdash; it's rarely the right front door for
        a browser.
      </p>
    </div>
  );
}
