import "../css/Article.css";

export default function ReliabilityAsynchronousOperationsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Some operations genuinely can't finish inside one HTTP request-response cycle &mdash;
          modeling them honestly as asynchronous, instead of forcing a synchronous shape onto them,
          is what keeps both the API and its callers from timing out on something that was never
          going to be fast.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>202 Accepted</b> &mdash; the server immediately confirms the request was received and will be processed, without blocking on the result.</li>
          <li><b>A status resource to poll</b> &mdash; the response includes a URL the client can check, returning something like pending, processing, completed, or failed.</li>
          <li><b>Webhooks as an alternative</b> &mdash; instead of the client polling, the server calls the client back when the work is done, previewed here and covered in full in the Webhooks lesson.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's bulk import endpoint can process thousands of rows &mdash; far too slow for
          one request. It returns immediately with a pointer to check later:
        </p>
        <span className="codeLabel">KICKING OFF THE IMPORT</span>
        <div className="codeBlock">
          <pre>{`POST /v1/imports
HTTP/1.1 202 Accepted
Location: /v1/imports/imp_881a

{ "id": "imp_881a", "status": "processing" }`}</pre>
        </div>
        <span className="codeLabel">POLLING FOR COMPLETION</span>
        <div className="codeBlock">
          <pre>{`GET /v1/imports/imp_881a
{ "id": "imp_881a", "status": "completed", "results_url": "/v1/imports/imp_881a/results" }`}</pre>
        </div>
        <p>
          Partners with a webhook endpoint configured skip polling entirely and just get called
          back the moment <code>status</code> reaches <code>completed</code> or <code>failed</code>.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 110" role="img" aria-label="Diagram of the 202 Accepted pattern: a POST request immediately returns 202 with a status URL, the client polls that URL multiple times, and eventually receives a completed status.">
          {["POST\nimport","202 +\npoll URL","poll\n(processing)","poll\n(completed)"].map((t,i) => (
            <g key={i}>
              <rect className={i===3 ? "boxAccent" : "box"} x={10 + i*108} y="30" width="96" height="46" rx="6" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={58 + i*108} y={50 + li*13} className="boxText" style={{fontSize:"6px"}}>{line}</text>
              ))}
              {i < 3 && <line className="flow" x1={106 + i*108} y1="53" x2={118 + i*108} y2="53" />}
            </g>
          ))}
        </svg>
        <figcaption>The client never waits inside one long request &mdash; it gets an immediate acknowledgment and checks back on its own schedule.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forcing a genuinely long operation to stay synchronous, just behind a very long timeout,
          ties up a client connection for minutes and makes "still working" indistinguishable from
          "failed" until that timeout finally fires. The opposite mistake is making something
          asynchronous that's actually fast &mdash; sub-second &mdash; purely for architectural
          consistency, which adds a needless poll round-trip to an operation that never needed one.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a bulk import that takes several minutes a poor fit for a synchronous request, even one with a very generous timeout?</p>
        </div>
      </section>
      <p className="takeaway">
        Model an operation's real duration honestly &mdash; 202 plus a status resource for anything
        genuinely slow, a normal synchronous response for anything genuinely fast, and webhooks for
        consumers who'd rather be told than have to ask.
      </p>
    </div>
  );
}
