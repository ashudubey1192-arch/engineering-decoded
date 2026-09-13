import "../css/Article.css";

export default function ServiceCommunicationAsynchronousCommunicationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Asynchronous communication lets the caller fire off a message and move on immediately,
          trusting that the work will happen soon rather than right now &mdash; trading an immediate
          answer for looser coupling in time and better tolerance of the callee being briefly slow or
          unavailable.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of calling another service directly and waiting, the caller publishes a message
          (to a queue or a topic) and continues immediately. The receiving service picks the message
          up whenever it's ready &mdash; a second later, or after recovering from an outage a minute
          later &mdash; and the caller was never blocked waiting to find out which. This decouples
          the two services' uptime: the receiver being briefly down doesn't fail the caller's
          request, it just delays when the message gets handled.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          When <code>CheckoutService</code> confirms an order, it publishes an
          <code>OrderConfirmed</code> event and returns success to the customer immediately &mdash;
          it does not wait for <code>NotificationService</code> to actually send the confirmation
          email.
        </p>
        <span className="codeLabel">EVENT PUBLISHED, NOT AWAITED</span>
        <div className="codeBlock">
          <pre>{`publish("order.confirmed", {
  orderId: "ord_7734",
  customerId: "c_991",
  total: 42.50,
})
return httpOk({ orderId: "ord_7734" })   // returns right away`}</pre>
        </div>
        <p>
          If <code>NotificationService</code> is down for two minutes during a deploy, the event
          just waits in the queue &mdash; the customer's checkout still succeeds instantly, and the
          email goes out two minutes later than usual instead of not going out at all.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of asynchronous communication: CheckoutService publishes an OrderConfirmed event to a queue and returns immediately, while NotificationService consumes the event from the queue independently, whenever it is ready.">
          <rect className="box" x="20" y="40" width="100" height="26" rx="5" />
          <text x="70" y="58" className="boxText" style={{fontSize:"6.5px"}}>CheckoutService</text>
          <rect className="boxAccent" x="165" y="40" width="90" height="26" rx="5" />
          <text x="210" y="58" className="boxText" style={{fontSize:"6.5px"}}>Queue</text>
          <rect className="box" x="300" y="40" width="105" height="26" rx="5" />
          <text x="352" y="58" className="boxText" style={{fontSize:"6.5px"}}>NotificationService</text>
          <line className="flow" x1="120" y1="53" x2="163" y2="53" />
          <text x="140" y="40" className="figHint" style={{fontSize:"5.5px"}}>publish</text>
          <line className="flowMuted" x1="255" y1="53" x2="298" y2="53" />
          <text x="278" y="40" className="figHint" style={{fontSize:"5.5px"}}>consume, whenever ready</text>
          <text x="70" y="90" className="figHint" style={{fontSize:"6px"}}>returns immediately, no waiting</text>
        </svg>
        <figcaption>CheckoutService never waits on NotificationService directly &mdash; the queue absorbs the gap if the consumer is briefly behind or down.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using an asynchronous message for something the caller actually needs an immediate answer
          to &mdash; like a stock-availability check before confirming a purchase &mdash; forces an
          awkward workaround (polling, or a second synchronous call anyway). The other common
          mistake is forgetting that "fire and forget" isn't really forgotten: if nothing ever checks
          whether the message was eventually processed, a permanently failing consumer can silently
          drop work with no one noticing until a customer complains.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>NotificationService is down for two minutes during a deploy. What actually happens to the OrderConfirmed events published during that window, and what happens to the customers checking out at that time?</p>
        </div>
      </section>
      <p className="takeaway">
        Asynchronous communication trades an immediate answer for time-decoupling &mdash; use it for
        work that can safely happen a little later, and keep a real way to notice if that "later"
        never actually arrives.
      </p>
    </div>
  );
}
