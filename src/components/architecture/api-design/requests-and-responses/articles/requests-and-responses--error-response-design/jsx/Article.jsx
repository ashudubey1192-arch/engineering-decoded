import "../css/Article.css";

export default function RequestsAndResponsesErrorResponseDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          An error response is still an API contract &mdash; client code has to parse it
          programmatically, not just display it, so it needs the same consistent, predictable shape
          as a success response, every time, for every kind of failure.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Machine-readable code</b> &mdash; a stable string like <code>invalid_carrier</code> that client code can branch on, which never changes wording.</li>
          <li><b>Human-readable message</b> &mdash; a sentence for logs and developer consoles; can be reworded anytime without breaking clients that branch on the code instead.</li>
          <li><b>Structured details</b> &mdash; enough context (which field, which resource) to act on the error without parsing English.</li>
        </ul>
        <p>
          A widely used shape for this is <code>RFC 7807</code> ("Problem Details for HTTP APIs"),
          which standardizes fields like <code>type</code>, <code>title</code>, <code>status</code>,
          and <code>detail</code>. You don't have to adopt it verbatim, but its separation of a
          stable machine-readable identifier from a human-readable explanation is worth copying
          regardless of the exact field names you pick.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <span className="codeLabel">PARCELLY'S ERROR SHAPE</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": {
    "code": "invalid_carrier",
    "message": "'dhl-express' is not a supported carrier.",
    "details": { "field": "carrier", "allowed": ["fedex", "ups", "usps"] }
  }
}`}</pre>
        </div>
        <p>
          A client can safely branch on the error code to show a carrier picker, without ever
          parsing the English sentence in <code>message</code> &mdash; which Parcelly is free to
          reword for clarity without breaking a single integration.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of one error split into a stable machine-readable code for client logic and a human-readable message for logs and developers, both backed by structured details.">
          <rect className="boxAccent" x="20" y="20" width="150" height="70" rx="6" />
          <text x="95" y="38" className="figLabel" style={{fontSize:"6px"}}>code</text>
          <text x="95" y="56" className="boxText" style={{fontSize:"6px"}}>invalid_carrier</text>
          <text x="95" y="78" className="figHint" style={{fontSize:"5px"}}>stable &mdash; safe to branch on</text>
          <rect className="box" x="250" y="20" width="150" height="70" rx="6" />
          <text x="325" y="38" className="figLabel" style={{fontSize:"6px"}}>message</text>
          <text x="325" y="56" className="boxText" style={{fontSize:"5.5px"}}>human sentence</text>
          <text x="325" y="78" className="figHint" style={{fontSize:"5px"}}>free to reword anytime</text>
        </svg>
        <figcaption>Two fields, two audiences: code for programs, message for people &mdash; conflating them locks you into never improving your error copy.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Making the human-readable message the only thing a client can key off of is the most
          common mistake &mdash; the moment someone improves the wording for clarity, every client
          that string-matched on it silently breaks. Returning raw exception text or a stack trace
          in the response body is worse: it leaks internal implementation details to anyone who
          triggers an error, and it's not something a client can reliably parse at all.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Parcelly rewords its "invalid carrier" message to be friendlier. Which clients break if they were written correctly against this error shape, and which break if they were keying off the message text instead?</p>
        </div>
      </section>
      <p className="takeaway">
        Design errors as carefully as success responses &mdash; a stable code for programs to
        branch on, a human message that's free to change, and structured details instead of prose
        wherever a client might need to act on the failure.
      </p>
    </div>
  );
}
