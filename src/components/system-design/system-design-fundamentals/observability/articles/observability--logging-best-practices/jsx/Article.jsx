import "../css/Article.css";

export default function ObservabilityLoggingBestPracticesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Good logging practice turns logs from a wall of unstructured text into a genuinely
          searchable, useful debugging tool — the difference mostly comes down to structure,
          consistent levels, and being deliberate about what actually gets logged.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          <b>Structured logging</b> (writing logs as JSON with consistent fields, rather than
          free-form sentences) makes logs machine-parseable and searchable by field, instead of
          requiring fragile text pattern matching. Consistent <b>log levels</b> (DEBUG, INFO, WARN,
          ERROR) let you filter by severity and tune verbosity per environment. Logging with{" "}
          <b>context</b> — always including identifiers like request ID, user ID, and service name
          — is what makes a single log line useful on its own rather than needing to hunt through
          surrounding lines to understand it.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="twoCol">
          <div>
            <h3>Bad</h3>
            <p><code>"Error processing order"</code> — no ID, no level, no context. Impossible to
              search for a specific failure among thousands of similar lines.</p>
          </div>
          <div>
            <h3>Good</h3>
            <p><code>{`{level: "ERROR", msg: "payment declined", orderId: "o-4471", userId: "u-92", service: "checkout"}`}</code>{" "}
              — structured, filterable, and self-contained.</p>
          </div>
        </div>
        <ol className="stepList">
          <li><b>Log at the right level.</b> Routine operations at DEBUG/INFO, genuine problems at
            WARN/ERROR — so production log volume stays manageable and searchable.</li>
          <li><b>Always include request context</b> — a request ID at minimum — so every log line
            from one request can be found and grouped together.</li>
          <li><b>Avoid logging sensitive data</b> (passwords, full credit card numbers) even at
            DEBUG level — logs often have weaker access controls than the primary database.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram contrasting an unstructured free-text log line that is hard to search against a structured JSON log line with consistent, filterable fields." >
          <text x="100" y="20" className="figLabel" textAnchor="middle">UNSTRUCTURED</text>
          <rect className="box" x="20" y="30" width="160" height="40" rx="5" /><text x="100" y="54" className="boxText" style={{fontSize:"10px"}}>"error processing order"</text>
          <text x="320" y="20" className="figLabel" textAnchor="middle">STRUCTURED</text>
          <rect className="boxAccent" x="240" y="30" width="160" height="40" rx="5" /><text x="320" y="48" className="boxText" style={{fontSize:"9px"}}>{"{level, msg, orderId,"}</text><text x="320" y="62" className="boxText" style={{fontSize:"9px"}}>{"  userId, service}"}</text>
        </svg>
        <figcaption>Structured, context-rich logs are searchable by field instead of requiring fragile text matching.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Logging everything at INFO level (or worse, ERROR) regardless of actual severity trains
          engineers to ignore alerts and makes genuine problems harder to spot in the noise. Over-
          logging in hot code paths can also introduce real performance overhead and generate
          enormous, costly log volume for little debugging value.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does structured (JSON) logging make production debugging significantly easier than free-form text logs?</p>
        </div>
      </section>
      <p className="takeaway">
        Structure, consistent levels, and rich context are what turn logs from noise into a
        genuinely searchable record of what a system actually did.
      </p>
    </div>
  );
}
