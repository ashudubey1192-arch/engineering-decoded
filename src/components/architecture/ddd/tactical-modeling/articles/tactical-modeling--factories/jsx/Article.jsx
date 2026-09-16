export default function TacticalModelingFactoriesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A factory encapsulates the logic for creating a complex object or aggregate, so callers
          never construct it directly in an invalid or partially-formed state. Cargoflow's
          <code> Shipment.fromAcceptedQuote(&hellip;)</code> is a factory method: it is the only
          way to create a <code>Shipment</code>, and it guarantees every shipment starts life
          fully valid.
        </p>
        <p>
          Factories matter most when construction itself involves a rule, not just field
          assignment &mdash; if a plain constructor would do, a factory adds nothing.
        </p>
      </section>
      <section id="concepts">
        <h2>1. When a plain constructor isn't enough</h2>
        <ol className="stepList">
          <li>
            <b>Creation requires deriving values, not just copying them.</b> A shipment's initial
            status is always <code>BOOKED</code> &mdash; derived, not passed in by the caller.
          </li>
          <li>
            <b>Creation requires validating a combination of inputs together.</b> The quote must
            still be valid (not expired) at the moment of booking &mdash; a check spanning two
            inputs, not a single field.
          </li>
          <li>
            <b>Creation needs to emit a domain event.</b> Booking a shipment should raise a
            <code> ShipmentBooked</code> event, which a bare constructor has no natural place to
            do.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>WHY A PLAIN CONSTRUCTOR ISN'T ENOUGH HERE</small>
          <p>
            <code>new Shipment(route, status, carrier)</code> would let a caller pass any status,
            including <code>DELIVERED</code>, for a shipment that has never moved. The factory
            method removes that possibility entirely by not accepting a status parameter at all.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="45" width="150" height="55" rx="8" />
            <text className="boxText" x="105" y="78">AcceptedQuote</text>
            <rect className="boxAccent" x="230" y="45" width="150" height="55" rx="8" />
            <text className="boxText" x="305" y="70">Shipment.fromAcceptedQuote()</text>
            <text className="figHint" x="305" y="88">the only entry point</text>
            <rect className="box" x="430" y="45" width="110" height="55" rx="8" />
            <text className="boxText" x="485" y="78">Shipment</text>
            <line className="flow" x1="180" y1="72" x2="230" y2="72" />
            <line className="flow" x1="380" y1="72" x2="430" y2="72" />
          </svg>
          <figcaption>The factory is a narrow, guaranteed-valid gate that replaces a general-purpose constructor.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A factory method that guarantees validity</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private Shipment(ShipmentId id, Route route) { // private: only the factory can call this
        this.id = id;
        this.route = route;
        this.status = ShipmentStatus.BOOKED;
    }

    public static Shipment fromAcceptedQuote(ShipmentId id, AcceptedQuoteSummary quote) {
        if (quote.isExpired()) {
            throw new IllegalArgumentException("Cannot book from an expired quote");
        }
        Shipment shipment = new Shipment(id, quote.route());
        DomainEvents.publish(new ShipmentBooked(id, Instant.now()));
        return shipment;
    }
}`}</pre>
        </div>
        <p>
          The constructor is private, so <code>fromAcceptedQuote</code> is provably the only path
          to a <code>Shipment</code> instance &mdash; every one that exists has passed the
          expiration check and raised its booking event.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Adding a factory for every class "for consistency."</b> A class with a simple,
            always-valid constructor does not need one &mdash; factories earn their place through
            genuine construction complexity.
          </li>
          <li>
            <b>Leaving the plain constructor public alongside the factory method.</b> That gives
            callers a way to bypass the guarantees the factory exists to provide.
          </li>
          <li>
            <b>Putting unrelated setup logic (like sending a notification email) inside the
            factory.</b> A factory should guarantee the object's validity, not perform unrelated
            side effects &mdash; publishing a domain event is fine; sending an email directly is
            not.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>Shipment</code> make its constructor private instead of just documenting "always call fromAcceptedQuote instead"?</p>
          <p>
            <b>Answer:</b> Documentation is a convention that can be ignored by accident. A private
            constructor makes it a compile error to bypass the factory, guaranteeing every
            <code> Shipment</code> instance was validated and its booking event raised.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Use a factory when creation involves a rule &mdash; validation, derivation, or an event
        &mdash; and make the plain constructor unreachable so the guarantee actually holds.
      </p>
    </div>
  );
}
