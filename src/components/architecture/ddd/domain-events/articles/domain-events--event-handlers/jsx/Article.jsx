export default function DomainEventsEventHandlersArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An event handler reacts to a published domain event, usually by changing state in a
          different aggregate or bounded context. Billing's handler for
          <code> ShipmentDelivered</code>, which generates an invoice, is the running example this
          course has referenced repeatedly &mdash; this article covers how to write handlers that
          stay correct under failure and retries.
        </p>
        <p>
          The central design question for a handler is always: what happens if this runs twice?
        </p>
      </section>
      <section id="concepts">
        <h2>1. Designing a handler step by step</h2>
        <ol className="stepList">
          <li>
            <b>Make the handler idempotent first, before anything else.</b> If
            <code> ShipmentDelivered</code> is delivered twice &mdash; a common reality with most
            messaging systems &mdash; generating two invoices would be a real financial bug.
          </li>
          <li>
            <b>Keep the handler narrow: one event type, one clear reaction.</b> A handler that
            reacts to five different event types by branching internally is hiding several
            handlers inside one, and hides which reactions actually depend on which events.
          </li>
          <li>
            <b>Let the handler fail loudly and retry, rather than silently swallowing errors.</b>{" "}
            A failed invoice generation should be visible and retried, not lost.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>WHY IDEMPOTENCY IS NOT OPTIONAL</small>
          <p>
            Most event delivery mechanisms &mdash; including the in-process publish-after-commit
            pattern from the previous article, once combined with retries on infrastructure
            failures &mdash; offer at-least-once delivery, not exactly-once. A handler that is not
            idempotent will eventually run twice for the same event in production.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="45" width="160" height="55" rx="8" />
            <text className="boxText" x="110" y="70">ShipmentDelivered</text>
            <text className="figHint" x="110" y="88">delivered twice</text>
            <line className="flow" x1="190" y1="72" x2="250" y2="72" />
            <rect className="boxAccent" x="250" y="45" width="160" height="55" rx="8" />
            <text className="boxText" x="330" y="70">Idempotent handler</text>
            <line className="flow" x1="410" y1="72" x2="470" y2="72" />
            <rect className="box" x="470" y="45" width="90" height="55" rx="8" />
            <text className="boxText" x="515" y="70">1 invoice</text>
          </svg>
          <figcaption>An idempotent handler produces the same end state no matter how many times the same event arrives.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. An idempotent handler, checked against a natural key</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`@EventListener
@Transactional
public void onShipmentDelivered(ShipmentDelivered event) {
    // idempotency check first: has this exact event already produced an invoice?
    if (invoiceRepository.existsForShipment(event.id())) {
        return; // already handled -- safe to no-op on a redelivered event
    }
    Invoice invoice = Invoice.forDeliveredShipment(event.id(), event.deliveredAt());
    invoiceRepository.save(invoice);
}`}</pre>
        </div>
        <p>
          The existence check makes redelivery safe: whether this handler runs once or five times
          for the same <code>ShipmentDelivered</code> event, exactly one invoice results.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Assuming events are delivered exactly once.</b> Almost no real messaging
            infrastructure guarantees this reliably; design every handler as if redelivery will
            happen.
          </li>
          <li>
            <b>Swallowing exceptions inside a handler to "keep things moving."</b> A silently
            failed invoice generation is worse than a loudly failed one that gets retried or
            alerted on.
          </li>
          <li>
            <b>Cramming logic for multiple unrelated events into one handler method.</b> This
            makes the mapping from event to reaction hard to audit and test in isolation.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the handler check <code>invoiceRepository.existsForShipment()</code> before creating an invoice?</p>
          <p>
            <b>Answer:</b> Because the event might be delivered more than once. The check makes
            the handler idempotent &mdash; running it twice for the same shipment produces exactly
            one invoice instead of two.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Design every event handler assuming redelivery will happen &mdash; idempotency is not an
        edge case to handle later, it is the core design requirement.
      </p>
    </div>
  );
}
