import "../css/Article.css";

export default function SecurityInputSecurityArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Every field in a request is untrusted input until your server validates it &mdash; not
          until your SDK does, not until your frontend form does, because an attacker can always
          skip both and call the raw HTTP endpoint directly.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Validate server-side, always</b> &mdash; type, format, range, and length checks on every field, regardless of what any client-side code already checked.</li>
          <li><b>Never string-concatenate input into a query</b> &mdash; parameterized queries prevent injection; building a query string by hand from request fields invites it.</li>
          <li><b>Bound every collection</b> &mdash; a bulk endpoint accepting an unlimited array is a resource-exhaustion vector, not just an edge case.</li>
          <li><b>Bind explicitly, not blindly</b> &mdash; map only the fields you intend to accept onto internal objects; don't let a whole request body write directly onto a model.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's bulk shipment endpoint caps requests at 500 items and validates every field's
          type and range server-side, even though its official SDKs already validate the same
          fields client-side before sending &mdash; because a request built by hand with
          <code>curl</code>, or by a modified client, skips the SDK entirely and hits the raw API
          directly. The server-side check is the only one that can't be bypassed.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of three different paths a request can take, official SDK, custom client, raw curl, all converging on the same server-side validation gate, since only that gate cannot be bypassed.">
          {["Official SDK","Custom client","Raw curl"].map((t,i) => (
            <g key={t}>
              <rect className="box" x={20 + i*130} y="10" width="110" height="28" rx="5" />
              <text x={75 + i*130} y="29" className="boxText" style={{fontSize:"6px"}}>{t}</text>
              <line className="flow" x1={75 + i*130} y1="38" x2="210" y2="73" />
            </g>
          ))}
          <rect className="boxAccent" x="150" y="75" width="120" height="34" rx="6" />
          <text x="210" y="96" className="boxText" style={{fontSize:"6.5px"}}>Server-side validation</text>
        </svg>
        <figcaption>Client-side and SDK checks are conveniences &mdash; the server-side gate is the only one every path is forced through.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Trusting client-side or SDK-side validation as sufficient is the most damaging mistake
          &mdash; it protects well-behaved clients using the official path and nothing else.
          Binding a request body directly onto an internal model or ORM object without an explicit
          allowlist of writable fields &mdash; sometimes called mass assignment &mdash; is the
          other common one: it means adding an internal field to that model silently makes it
          client-writable too, unless every field is deliberately excluded rather than deliberately
          included.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why doesn't validation built into Parcelly's official SDK protect the API from a request sent with a raw HTTP client instead?</p>
        </div>
      </section>
      <p className="takeaway">
        The server is the only validation layer an attacker can't route around &mdash; treat every
        other layer as a convenience for well-behaved clients, never as the actual security
        boundary.
      </p>
    </div>
  );
}
