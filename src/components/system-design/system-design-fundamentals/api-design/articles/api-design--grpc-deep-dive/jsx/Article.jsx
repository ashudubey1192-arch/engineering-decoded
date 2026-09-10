import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiDesignGrpcDeepDiveArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          gRPC is a way for services to call each other like local functions. You define the methods
          and message types in a <code>.proto</code> file, and gRPC generates client and server code
          in many languages.
        </p>
        <p>
          It runs on <b>HTTP/2</b> and sends <b>Protocol Buffers</b> (compact binary), which makes it
          fast and small &mdash; ideal for internal microservice traffic.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your checkout service needs the price and stock of 40 items from the catalog service, 200
            times a second. Over REST + JSON that is a lot of text parsing and repeated field names.
            With gRPC the call looks like <code>catalog.GetItems(ids)</code> in code, the payload is
            a few hundred bytes of binary, and one HTTP/2 connection is reused for every call &mdash;
            noticeably lower latency and CPU.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The contract: a .proto file</h2>
        <pre>
          <code>{`syntax = "proto3";

message ItemRequest { repeated string ids = 1; }
message Item { string id = 1; int32 price_cents = 2; int32 stock = 3; }
message ItemList { repeated Item items = 1; }

service Catalog {
  rpc GetItems(ItemRequest) returns (ItemList);
}`}</code>
        </pre>
        <p>
          Run the compiler and you get a typed <code>CatalogClient</code> and a server stub. The
          field <b>numbers</b> (not names) are what travels on the wire, so they must never change.
        </p>

        <h2>2. Four call types</h2>
        <table className="miniTable">
          <caption>GRPC STREAMING MODES</caption>
          <thead>
            <tr>
              <th>Type</th>
              <th>Shape</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Unary</td>
              <td>1 request &rarr; 1 response</td>
              <td>GetUser(id)</td>
            </tr>
            <tr>
              <td>Server streaming</td>
              <td>1 request &rarr; many responses</td>
              <td>Subscribe to price updates</td>
            </tr>
            <tr>
              <td>Client streaming</td>
              <td>many requests &rarr; 1 response</td>
              <td>Upload a file in chunks</td>
            </tr>
            <tr>
              <td>Bidirectional</td>
              <td>many &harr; many</td>
              <td>A live chat or telemetry link</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="grpcTitle">
            <title id="grpcTitle">
              A .proto file generates both the client stub and the server skeleton, which talk
              Protobuf over one reused HTTP/2 connection.
            </title>
            <rect className="boxAccent" x="240" y="15" width="160" height="26" />
            <text className="boxText" x="320" y="32">
              catalog.proto
            </text>
            <line className="flow" x1="300" y1="41" x2="150" y2="65" />
            <line className="flow" x1="340" y1="41" x2="490" y2="65" />
            <rect className="box" x="60" y="65" width="180" height="30" />
            <text className="boxText" x="150" y="84">
              generated client
            </text>
            <rect className="box" x="400" y="65" width="180" height="30" />
            <text className="boxText" x="490" y="84">
              generated server
            </text>
            <line className="flow" x1="240" y1="105" x2="400" y2="105" />
            <text className="figHint" x="320" y="122">
              HTTP/2 + Protobuf (binary)
            </text>
          </svg>
          <figcaption>
            Both sides are generated from the same file, so a type mismatch is a compile error, not a
            production surprise.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: adding a gRPC call</h2>
        <ol className="stepList">
          <li>
            <b>Edit the .proto:</b> add <code>rpc GetItems(ItemRequest) returns (ItemList);</code>{" "}
            and the messages, each field with a fresh number.
          </li>
          <li>
            <b>Regenerate</b> client and server code for every language that uses it.
          </li>
          <li>
            <b>Implement the server method</b> &mdash; just fill in the generated stub with the real
            catalog lookup.
          </li>
          <li>
            <b>Call it from the client</b> like a function:{" "}
            <code>client.GetItems({`{ids}`})</code>. gRPC handles connection reuse, serialization,
            and retries.
          </li>
          <li>
            <b>Evolve safely:</b> to add a field later, give it a new number; old clients ignore
            unknown fields, new clients get a default for missing ones.
          </li>
        </ol>
        <div className="takeaway">
          gRPC shines <i>inside</i> your system: same company, low latency, many languages, strict
          contracts. At the browser edge you usually still expose REST or GraphQL.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Reusing or renumbering fields</h3>
            <p>
              Wire compatibility is by number. Changing or reusing a number corrupts messages between
              old and new code. Mark removed numbers <code>reserved</code>.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Exposing gRPC directly to browsers</h3>
            <p>
              Browsers cannot do raw gRPC. You need grpc-web plus a proxy &mdash; often not worth it
              versus a thin REST layer.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No deadlines on calls</h3>
            <p>
              Without a per-call deadline, a slow downstream service ties up resources everywhere.
              Always set a timeout.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Why is gRPC a good fit for a payments service calling a fraud-scoring service internally,
            but a poor fit for a public API consumed directly by web browsers?
          </p>
        </div>
      </section>
    </div>
  );
}
