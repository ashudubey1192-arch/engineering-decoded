import "../css/Article.css";

export default function ServiceCommunicationMessageBrokersArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A message broker is the piece of infrastructure that actually makes asynchronous
          communication reliable &mdash; it durably holds a message between the moment it's
          published and the moment it's successfully consumed, so neither side has to be online at
          the same instant.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>TWO BROKER SHAPES</caption>
          <thead><tr><th>Shape</th><th>Delivery</th><th>Good for</th></tr></thead>
          <tbody>
            <tr><td><span className="badge">QUEUE</span></td><td>Each message goes to exactly one consumer</td><td>Work distribution &mdash; e.g. processing image uploads across a pool of workers</td></tr>
            <tr><td><span className="badge">TOPIC</span></td><td>Each message goes to every subscriber</td><td>Broadcasting an event to several independent interested services</td></tr>
          </tbody>
        </table>
        <p>
          Most brokers also guarantee <b>at-least-once delivery</b>: a message might be delivered
          more than once (say, if a consumer crashes after processing but before acknowledging), but
          it won't silently vanish. That guarantee only helps if consumers are written to handle a
          duplicate delivery safely.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> publishes to an <code>order-events</code> topic; both
          <code>NotificationService</code> and <code>AnalyticsService</code> subscribe independently
          and each get their own copy of every event &mdash; neither knows or cares that the other is
          also listening.
        </p>
        <span className="codeLabel">CONSUMER HANDLING A DUPLICATE SAFELY</span>
        <div className="codeBlock">
          <pre>{`function onOrderConfirmed(event) {
  if (alreadyProcessed(event.orderId)) return   // idempotency check
  sendConfirmationEmail(event)
  markProcessed(event.orderId)
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a topic-based broker: OrderService publishes one event to a topic, and both NotificationService and AnalyticsService each receive their own independent copy of it.">
          <rect className="box" x="20" y="48" width="100" height="28" rx="6" />
          <text x="70" y="66" className="boxText" style={{fontSize:"6.5px"}}>OrderService</text>
          <rect className="boxAccent" x="160" y="48" width="100" height="28" rx="6" />
          <text x="210" y="66" className="boxText" style={{fontSize:"6.5px"}}>order-events topic</text>
          <line className="flow" x1="120" y1="62" x2="158" y2="62" />
          <rect className="box" x="300" y="20" width="105" height="26" rx="5" />
          <text x="352" y="37" className="boxText" style={{fontSize:"6px"}}>NotificationService</text>
          <rect className="box" x="300" y="78" width="105" height="26" rx="5" />
          <text x="352" y="95" className="boxText" style={{fontSize:"6px"}}>AnalyticsService</text>
          <line className="flow" x1="260" y1="55" x2="300" y2="33" />
          <line className="flow" x1="260" y1="68" x2="300" y2="90" />
        </svg>
        <figcaption>One publish, two independent copies &mdash; each subscriber gets the full event with no coordination between them.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Writing a consumer that assumes every message arrives exactly once is the most common and
          most dangerous mistake &mdash; at-least-once delivery means duplicates will happen
          eventually, and a non-idempotent handler (like one that charges a card again) turns a
          routine redelivery into a real incident. Using a queue when you actually need a topic (or
          vice versa) is the other common mix-up: a queue's "exactly one consumer gets it" model
          silently drops the broadcast behavior a second interested service was expecting.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A consumer crashes right after charging a customer's card but before acknowledging the message. The broker redelivers it. What has to be true about the consumer's code for that redelivery to not charge the card twice?</p>
        </div>
      </section>
      <p className="takeaway">
        A broker's delivery guarantee is only half the story &mdash; the other half is writing
        consumers that behave correctly even when that guarantee delivers the same message twice.
      </p>
    </div>
  );
}
