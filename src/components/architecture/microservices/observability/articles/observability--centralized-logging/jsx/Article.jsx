import "../css/Article.css";

export default function ObservabilityCentralizedLoggingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Centralized logging pulls log output from every service instance into one searchable
          place &mdash; without it, debugging a single user's failed request means SSHing into
          whichever of thirty instances happened to handle it, if you can even figure out which one
          that was.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Every service ships its logs (usually as structured JSON, not free-form text) to a
          central aggregator, which indexes them for search across every service and every instance
          at once. Structure matters: a log line with real fields
          (<code>{"{ level, service, timestamp, message }"}</code>) can be filtered and queried
          precisely; a plain text sentence can only be grepped, and only if you already know roughly
          what to search for.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A customer reports order <code>ord_7734</code> never got a confirmation email. Instead of
          checking each service's local disk, an engineer searches the centralized log store once:
        </p>
        <span className="codeLabel">STRUCTURED LOG LINE, ACROSS ALL SERVICES</span>
        <div className="codeBlock">
          <pre>{`{ "level": "error", "service": "notification-service",
  "timestamp": "2026-03-14T09:12:03Z",
  "message": "SMTP send failed",
  "orderId": "ord_7734", "attempt": 3 }`}</pre>
        </div>
        <p>
          One search across every service, filtered by <code>orderId: "ord_7734"</code>, surfaces
          this line from whichever of the thirty <code>NotificationService</code> instances actually
          handled it &mdash; no need to know or guess which one in advance.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of centralized logging: log output from many separate service instances all ships into one central aggregator, which a single search query can then filter across every service and instance at once." >
          {[0,1,2,3].map(i => (
            <rect key={i} className="box" x={20 + i*95} y="20" width="80" height="26" rx="5" />
          ))}
          {[0,1,2,3].map(i => (
            <text key={i} x={60 + i*95} y="37" className="boxText" style={{fontSize:"6px"}}>Instance {i+1}</text>
          ))}
          {[0,1,2,3].map(i => (
            <line key={i} className="flowMuted" x1={60 + i*95} y1="46" x2="210" y2="75" />
          ))}
          <rect className="boxAccent" x="150" y="80" width="120" height="30" rx="6" />
          <text x="210" y="99" className="boxText" style={{fontSize:"6.5px"}}>Central log store</text>
        </svg>
        <figcaption>Every instance's log output lands in one searchable place &mdash; one query across all of them, instead of checking instances one at a time.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Logging free-form text messages with no consistent structured fields makes searching
          across services nearly impossible at scale &mdash; every service ends up needing its own
          special-cased search pattern. Logging sensitive data (full card numbers, passwords) in
          plain log lines is a serious security mistake of its own &mdash; centralized logging
          means that data is now searchable and readable by anyone with log access, everywhere it
          used to be more contained.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does searching for orderId: "ord_7734" work reliably across all thirty NotificationService instances, when each instance only logs to its own local output?</p>
        </div>
      </section>
      <p className="takeaway">
        Structured logs, shipped centrally, turn "which of thirty instances logged this" into a
        single search &mdash; free-form text logs kept locally turn it into a manual hunt.
      </p>
    </div>
  );
}
