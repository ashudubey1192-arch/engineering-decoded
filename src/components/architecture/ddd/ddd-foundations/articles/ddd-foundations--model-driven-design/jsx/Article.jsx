export default function DddFoundationsModelDrivenDesignArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Model-driven design means the conceptual model and the implementation are the same
          thing, kept in lockstep on purpose. If you can point at a class and a domain expert can
          recognize the concept it represents, and vice versa, the model and the design have not
          diverged.
        </p>
        <p>
          The opposite &mdash; and the more common situation &mdash; is a design that starts close
          to the model and drifts as deadlines force shortcuts, until the code and the business
          conversation are describing two different systems.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Model and design, kept as one</h2>
        <div className="twoCol">
          <div>
            <h3>Model-driven</h3>
            <p>
              <code>Shipment.reassignCarrier(Carrier next)</code> exists because "reassigning a
              carrier mid-route" is a named business action Ops performs. The method name matches
              the sentence a person would say.
            </p>
          </div>
          <div>
            <h3>Drifted</h3>
            <p>
              <code>ShipmentService.update(id, Map&lt;String,Object&gt; fields)</code> can do the
              same thing, but the code no longer states what action is happening &mdash; it has
              to be inferred from which keys are in the map at a given call site.
            </p>
          </div>
        </div>
        <p>
          Drift usually happens gradually: a generic <code>update</code> method is added "just for
          this one field," then reused for a second field, and within months it is the only way
          anything changes on <code>Shipment</code>.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 580 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="30" width="220" height="50" rx="8" />
            <text className="boxText" x="140" y="60">Conceptual model</text>
            <rect className="boxAccent" x="330" y="30" width="220" height="50" rx="8" />
            <text className="boxText" x="440" y="60">Implementation</text>
            <line className="flow" x1="250" y1="55" x2="330" y2="55" />
            <line className="flow" x1="330" y1="65" x2="250" y2="65" />
            <text className="figHint" x="290" y="105">kept identical, both directions</text>
            <rect className="boxWarn" x="180" y="140" width="220" height="40" rx="8" />
            <text className="boxText" x="290" y="165">drift: only the arrow going right survives</text>
          </svg>
          <figcaption>Model-driven design keeps both directions of the arrow alive; drift is what happens when only code changes get made and the shared model stops being updated.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Naming the method after the business action</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private Carrier carrier;
    private ShipmentStatus status;

    public void reassignCarrier(Carrier next) {
        if (status == ShipmentStatus.DELIVERED) {
            throw new IllegalStateException("Cannot reassign a carrier after delivery");
        }
        Carrier previous = this.carrier;
        this.carrier = next;
        DomainEvents.publish(new CarrierReassigned(id, previous.id(), next.id()));
    }
}`}</pre>
        </div>
        <p>
          Every rule about reassignment &mdash; when it is allowed, what event it raises &mdash;
          lives in the one place named after the action a domain expert would describe. A generic
          <code>setCarrier</code> would have no natural place for the delivered-status check.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the database schema drive class shape.</b> Foreign keys and normalized
            tables optimize for storage, not for expressing "reassign a carrier" as one atomic
            business action.
          </li>
          <li>
            <b>Adding generic update methods "just this once."</b> Each one is a small hole the
            model-code correspondence leaks through, and they accumulate.
          </li>
          <li>
            <b>Updating the model but not the conversation.</b> Model-driven design fails just as
            badly in the other direction &mdash; if code changes and nobody tells the domain
            expert, the shared understanding still drifts.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is a generic <code>update(id, Map&lt;String,Object&gt;)</code> method a warning sign under model-driven design?</p>
          <p>
            <b>Answer:</b> It can express any change, so it stops expressing which specific
            business action is occurring. The correspondence between "what a domain expert would
            say happened" and "what the code says happened" breaks down.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Model-driven design keeps the model and the code as one artifact, not two &mdash; every
        drift toward generic setters is a drift away from that.
      </p>
    </div>
  );
}
