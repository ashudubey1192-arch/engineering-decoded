export default function DomainEventsEventualConsistencyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Eventual consistency is the accepted trade-off behind every cross-aggregate,
          event-driven interaction in this course: after <code>Shipment.markDelivered()</code>{" "}
          commits, there is a real window &mdash; milliseconds to seconds &mdash; before Billing's
          invoice exists. This article is about designing for that window honestly, instead of
          pretending it does not exist.
        </p>
        <p>
          The Transaction Boundaries article established that one transaction should touch one
          aggregate. Eventual consistency is the direct consequence of that rule, made explicit.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Deciding what can be eventually consistent</h2>
        <ol className="stepList">
          <li>
            <b>Ask whether the two facts must always agree, or can briefly disagree.</b> Shipment
            delivery and invoice existence can briefly disagree &mdash; a short delay generating an
            invoice causes no business harm.
          </li>
          <li>
            <b>Identify who might observe the inconsistent window, and whether that is
            acceptable.</b> A support agent looking up a shipment two seconds after delivery might
            briefly see "no invoice yet" &mdash; acceptable, since the UI can show "generating."
          </li>
          <li>
            <b>Design the UI or API to make the window visible rather than hiding it badly.</b>{" "}
            Cargoflow's shipment detail page shows an explicit "Invoice pending" state instead of
            a misleading blank field.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>WHAT MUST STAY STRONGLY CONSISTENT INSTEAD</small>
          <p>
            The total-distance invariant from the Business Invariants article cannot tolerate
            eventual consistency &mdash; a shipment must never be observably over its contracted
            distance, even briefly. That is exactly why it is enforced inside one aggregate's
            transaction, not through an event.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg">
            <line className="divider" x1="30" y1="90" x2="570" y2="90" />
            <circle className="ringNode" cx="150" cy="90" r="8" />
            <text className="boxText" x="150" y="70">Shipment delivered</text>
            <circle className="ringNode" cx="420" cy="90" r="8" />
            <text className="boxText" x="420" y="70">Invoice created</text>
            <text className="figHint" x="285" y="120">the window: briefly inconsistent, by design</text>
            <path className="flowMuted" d="M150,90 L420,90" />
          </svg>
          <figcaption>The gap between the two events is real and accepted &mdash; the design choice is making it safe, not eliminating it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Making the pending window explicit in the API</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public sealed interface InvoiceStatusView permits Pending, Available {}
public record Pending() implements InvoiceStatusView {}
public record Available(InvoiceId id, Money amount) implements InvoiceStatusView {}

public InvoiceStatusView invoiceStatusFor(ShipmentId shipmentId) {
    return invoiceRepository.findByShipment(shipmentId)
        .map(invoice -> (InvoiceStatusView) new Available(invoice.id(), invoice.amount()))
        .orElse(new Pending()); // honest about the window, not a silent null
}`}</pre>
        </div>
        <p>
          Callers are forced to handle the <code>Pending</code> case explicitly &mdash; the type
          system makes the eventual-consistency window impossible to ignore by accident.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Returning <code>null</code> for a not-yet-created invoice.</b> That hides the
            pending window behind an ambiguous value that looks identical to "will never exist."
          </li>
          <li>
            <b>Applying eventual consistency to an invariant that actually needs to be strong.</b>{" "}
            The total-distance rule above is exactly the kind of case that must stay inside one
            transaction, never deferred to an event.
          </li>
          <li>
            <b>Assuming the window is always short enough to ignore.</b> Under load or during an
            outage, the window can grow from milliseconds to minutes &mdash; designs should
            tolerate that range, not just the common case.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is it acceptable for Shipment delivery and Invoice creation to be eventually consistent, but not for the total-distance invariant?</p>
          <p>
            <b>Answer:</b> A brief delay before an invoice appears causes no real business harm and
            can be shown honestly in the UI. A shipment briefly exceeding its contracted distance
            is a rule violation with no safe "briefly incorrect" state, so it must be enforced
            atomically inside one transaction instead.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Accept eventual consistency deliberately where a brief disagreement is harmless, and make
        the pending window visible in your types and UI rather than hiding it behind a null.
      </p>
    </div>
  );
}
