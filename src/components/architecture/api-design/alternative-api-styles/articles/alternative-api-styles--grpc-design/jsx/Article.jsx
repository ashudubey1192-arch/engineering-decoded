import "../css/Article.css";

export default function AlternativeApiStylesGrpcDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          gRPC trades REST's human-readable, cacheable flexibility for speed and strict typing
          &mdash; a contract defined once in a <code>.proto</code> file, compiled directly into
          client and server code, talking a compact binary format over HTTP/2.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>.proto file</b> &mdash; defines services (RPC methods) and message types in one language-agnostic schema.</li>
          <li><b>Generated stubs</b> &mdash; both client and server compile strongly-typed code directly from the same file, so a mismatch is a compile error, not a runtime surprise.</li>
          <li><b>Field numbers, not names, are the wire identity</b> &mdash; protobuf messages are identified on the wire by number; reusing a number for a different field is silently catastrophic in a way that has no REST equivalent.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's <code>RatingService.proto</code> defines a <code>GetRate</code> call once;
          both <code>ShipmentService</code> (the caller) and <code>RatingService</code> (the
          implementer) generate their code from the identical file:
        </p>
        <span className="codeLabel">RATINGSERVICE.PROTO (EXCERPT)</span>
        <div className="codeBlock">
          <pre>{`service RatingService {
  rpc GetRate (RateRequest) returns (RateResponse);
}
message RateRequest {
  string carrier = 1;
  double weight_kg = 2;
}`}</pre>
        </div>
        <p>
          If someone on the <code>RatingService</code> team changes <code>weight_kg</code>'s type
          without regenerating <code>ShipmentService</code>'s stub, the mismatch is caught at
          compile time on the caller's side &mdash; not discovered later from a confusing
          production bug report.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of one .proto file generating both a client stub and a server stub, keeping the caller and implementer's code compiled from the same source of truth.">
          <rect className="boxAccent" x="165" y="10" width="90" height="30" rx="6" />
          <text x="210" y="29" className="boxText" style={{fontSize:"6.5px"}}>RatingService.proto</text>
          <rect className="box" x="40" y="80" width="110" height="30" rx="5" />
          <text x="95" y="99" className="boxText" style={{fontSize:"6px"}}>ShipmentService stub</text>
          <rect className="box" x="270" y="80" width="110" height="30" rx="5" />
          <text x="325" y="99" className="boxText" style={{fontSize:"6px"}}>RatingService stub</text>
          <line className="flow" x1="195" y1="40" x2="105" y2="78" />
          <line className="flow" x1="225" y1="40" x2="315" y2="78" />
        </svg>
        <figcaption>Both sides compile from one file &mdash; a mismatch between them is a build failure, not a production incident.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Choosing gRPC for a public, partner-facing API is a common mistake when broad client and
          browser support and easy debuggability matter more than raw throughput &mdash; curling a
          binary protobuf payload to debug an issue is real friction most external partners won't
          want. The more dangerous mistake is treating a <code>.proto</code> change as casually as
          adding a REST field: reusing a field number for a different purpose, instead of retiring
          it and assigning a new one, corrupts data silently on the wire with no error to signal
          anything went wrong.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is reusing a protobuf field number for a different field far more dangerous than renaming a JSON field in a REST API?</p>
        </div>
      </section>
      <p className="takeaway">
        gRPC's strict, generated contract is exactly what makes it strong for internal
        service-to-service calls you control on both ends &mdash; and exactly why its evolution
        rules deserve more care than REST's, since a mistake here fails silently instead of loudly.
      </p>
    </div>
  );
}
