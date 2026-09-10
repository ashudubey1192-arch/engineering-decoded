import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiDesignDataFormatsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A data format is the agreed way to write structured data as bytes so the sender and
          receiver understand it the same way. JSON, XML, Protocol Buffers, and others each trade
          readability for speed and size.
        </p>
        <p>
          The API contract must say which format(s) it speaks &mdash; usually via the{" "}
          <code>Content-Type</code> and <code>Accept</code> headers.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your public API returns JSON &mdash; easy for any developer to read and debug in a
            browser. But two of your internal services exchange 50,000 messages a second; there,
            JSON&apos;s text parsing and bulky field names waste CPU and bandwidth, so they switch to
            Protocol Buffers &mdash; a compact binary format that is ~5&times; smaller and faster to
            parse. Same data, different format for a different job.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The main formats</h2>
        <table className="miniTable">
          <caption>PICK BY AUDIENCE AND SCALE</caption>
          <thead>
            <tr>
              <th>Format</th>
              <th>Human-readable</th>
              <th>Size / speed</th>
              <th>Typical use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>JSON</td>
              <td>Yes</td>
              <td>Medium</td>
              <td>Public REST APIs, web front-ends, config</td>
            </tr>
            <tr>
              <td>XML</td>
              <td>Yes (verbose)</td>
              <td>Larger, slower</td>
              <td>Legacy enterprise, SOAP, some banking / gov</td>
            </tr>
            <tr>
              <td>Protocol Buffers</td>
              <td>No (binary)</td>
              <td>Small, fast</td>
              <td>gRPC, high-throughput internal services</td>
            </tr>
            <tr>
              <td>Avro</td>
              <td>No (binary)</td>
              <td>Small, fast</td>
              <td>Kafka / big-data pipelines (schema travels with data)</td>
            </tr>
            <tr>
              <td>MessagePack / CBOR</td>
              <td>No</td>
              <td>Small</td>
              <td>&quot;Binary JSON&quot; for constrained devices</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="fmtTitle">
            <title id="fmtTitle">
              The same record is verbose in XML, medium in JSON, and tiny in Protocol Buffers.
            </title>
            <text className="figHint" x="70" y="35">
              XML
            </text>
            <rect className="box" x="120" y="22" width="470" height="18" />
            <text className="figHint" x="70" y="70">
              JSON
            </text>
            <rect className="box" x="120" y="57" width="300" height="18" />
            <text className="figHint" x="70" y="105">
              Protobuf
            </text>
            <rect className="boxAccent" x="120" y="92" width="90" height="18" />
          </svg>
          <figcaption>
            Bar length = bytes on the wire for one small object. Binary formats also skip the
            parse-the-text step entirely.
          </figcaption>
        </figure>

        <h2>2. Schema or no schema</h2>
        <ul>
          <li>
            <b>Schema-less (JSON, XML):</b> the data describes itself with field names. Flexible,
            easy to start, but a typo like <code>{`"prce"`}</code> is only caught at runtime.
          </li>
          <li>
            <b>Schema-first (Protobuf, Avro):</b> you define fields and types in a{" "}
            <code>.proto</code> / <code>.avsc</code> file; code is generated; mismatches fail at
            build time. Enforces a contract and enables safe evolution (add fields with new numbers,
            never reuse old ones).
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>3. Step by step: choosing a format for an endpoint</h2>
        <ol className="stepList">
          <li>
            <b>Who calls it?</b> External developers / browsers &rarr; <b>JSON</b>. It is the
            default expectation and debuggable with <code>curl</code>.
          </li>
          <li>
            <b>Is it a hot internal path?</b> Millions of calls between your own services &rarr;
            consider <b>Protobuf over gRPC</b> for the size and speed win.
          </li>
          <li>
            <b>Is it an event stream?</b> Kafka topic feeding analytics &rarr; <b>Avro</b>, so each
            message carries or references its schema and consumers can evolve independently.
          </li>
          <li>
            <b>Must you support an old client?</b> They may only speak <b>XML</b> &mdash; use content
            negotiation (<code>Accept: application/xml</code>) rather than forcing a rewrite.
          </li>
          <li>
            <b>Set the headers.</b> Send <code>Content-Type</code>, honour <code>Accept</code>, and
            document exactly which formats the endpoint supports.
          </li>
        </ol>
        <div className="takeaway">
          JSON until proven slow. Move to a binary, schema-first format when profiling shows
          serialization or bandwidth is a real bottleneck &mdash; usually only on internal
          high-volume links.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Binary format on a public API</h3>
            <p>
              Forcing external developers to compile <code>.proto</code> files for a simple REST call
              kills adoption. Keep the public edge JSON.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Reusing Protobuf field numbers</h3>
            <p>
              Deleting field 3 and later adding a new field 3 silently corrupts old messages. Numbers
              are forever; mark removed ones <code>reserved</code>.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Floats for money</h3>
            <p>
              <code>0.1 + 0.2 != 0.3</code> in JSON numbers. Send currency as integer minor units
              (paise, cents) or a decimal string.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your public API is JSON. An internal recommendations service is called 80,000 times a
            second by your web tier. What format would you use there and what two benefits does it
            give over JSON?
          </p>
        </div>
      </section>
    </div>
  );
}
