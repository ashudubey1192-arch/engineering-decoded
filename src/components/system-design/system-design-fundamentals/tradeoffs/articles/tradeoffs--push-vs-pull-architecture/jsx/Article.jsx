import "../css/Article.css";

export default function TradeoffsPushVsPullArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          In a push architecture, the source sends data to consumers as it becomes available; in a
          pull architecture, consumers ask for data when they're ready for it. The choice shapes
          latency, load control, and who's responsible for handling slow consumers.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Push gives the lowest latency — data arrives the instant it's ready — but the source has
          to manage delivery to every consumer, including slow or offline ones, which can overwhelm
          a consumer that can't keep up. Pull puts the consumer in control of its own pace (it asks
          again when ready), which is naturally more resilient to slow consumers, at the cost of
          some latency (or wasted requests) between polls.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A monitoring system needs metrics from 10,000 servers, and a notification system needs to alert users the instant something happens.</p>
        </div>
        <ol className="stepList">
          <li><b>Metrics → pull.</b> A central collector (like Prometheus) scrapes each server
            every 15 seconds — the collector controls its own load and a slow server just returns
            slightly stale data.</li>
          <li><b>Alerts → push.</b> The moment an event fires, it's pushed to the user's device —
            waiting for the user to "check" would defeat the purpose of an alert.</li>
          <li><b>Mixing both</b> is common: a message queue lets producers push messages in, while
            consumers pull messages off at whatever rate they can handle.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram contrasting a push model where the source sends data to the consumer versus a pull model where the consumer requests data from the source.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">PUSH</text>
          <rect className="boxAccent" x="30" y="35" width="80" height="30" rx="5" /><text x="70" y="55" className="boxText">source</text>
          <line className="flow" x1="110" y1="50" x2="160" y2="50" />
          <rect className="box" x="170" y="35" width="80" height="30" rx="5" /><text x="210" y="55" className="boxText">consumer</text>
          <line className="divider" x1="220" y1="10" x2="220" y2="120" />
          <text x="340" y="18" className="figLabel" textAnchor="middle">PULL</text>
          <rect className="box" x="270" y="80" width="80" height="30" rx="5" /><text x="310" y="100" className="boxText">source</text>
          <line className="flow" x1="410" y1="95" x2="360" y2="95" />
          <rect className="boxAccent" x="360" y="80" width="80" height="30" rx="5" /><text x="400" y="100" className="boxText">consumer</text>
          <text x="400" y="65" className="figHint" textAnchor="middle">consumer asks, on its own schedule</text>
        </svg>
        <figcaption>Push sends immediately; pull lets the consumer set the pace.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Pushing data to consumers with no backpressure mechanism can overwhelm a slow consumer
          and cause cascading failures. Polling too aggressively in a pull system, on the other
          hand, wastes resources on the source and can look like a self-inflicted denial-of-service
          if many consumers poll in sync.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a pull-based model naturally more resilient to a slow consumer than a push-based one?</p>
        </div>
      </section>
      <p className="takeaway">
        Push minimizes latency but puts delivery risk on the source; pull puts the consumer in
        control of its own pace at the cost of some freshness — many real systems use both.
      </p>
    </div>
  );
}
