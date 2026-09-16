export default function DddFoundationsDomainExpertsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A domain expert is not a job title &mdash; it is whoever actually understands how the
          business works well enough to explain the exceptions, not just the happy path. At
          Cargoflow that might be an operations lead who has personally handled a hundred customs
          holds, not the product manager who wrote the original ticket.
        </p>
        <p>
          Finding the real domain expert, and structuring conversations so their knowledge reaches
          the code, is as much a part of DDD as any tactical pattern.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Signs you have found the right person</h2>
        <ul className="stepList">
          <li>
            <b>They answer "what happens if&hellip;" questions with a specific story,</b> not a
            shrug or a guess. Ask a Cargoflow ops lead what happens if a carrier cancels mid-route
            and you get a real sequence of events, not a hypothesis.
          </li>
          <li>
            <b>They correct your model instead of just approving it.</b> A true expert pushes back
            on details a proxy would wave through.
          </li>
          <li>
            <b>They talk about exceptions unprompted.</b> "Usually X, except when the shipment
            crosses into &hellip;" is the sentence pattern of someone who has lived the edge cases.
          </li>
        </ul>
        <div className="scenarioBox">
          <small>PROXY VS. EXPERT</small>
          <p>
            A product manager who relays "customer support says refunds are complicated" is a
            proxy. The support lead who can walk through the three different refund percentages
            depending on how far into transit a shipment was cancelled is the expert. Modeling from
            the proxy alone reliably produces a model that is confidently wrong.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 560 180" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="30" width="170" height="50" rx="8" />
            <text className="boxText" x="105" y="60">Proxy (relays secondhand)</text>
            <rect className="boxAccent" x="20" y="100" width="170" height="50" rx="8" />
            <text className="boxText" x="105" y="130">Domain expert (lived it)</text>
            <rect className="box" x="360" y="65" width="170" height="50" rx="8" />
            <text className="boxText" x="445" y="95">Model in code</text>
            <line className="flowMuted" x1="190" y1="55" x2="360" y2="85" />
            <line className="flow" x1="190" y1="125" x2="360" y2="95" />
          </svg>
          <figcaption>Both paths feel like "talking to the business," but only the expert's path carries the exceptions that make the model correct.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. What a modeling conversation produces</h2>
        <p>
          After an actual conversation with a Cargoflow refund specialist, this rule became
          explicit instead of tribal knowledge kept in one person's head:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class RefundPolicy {
    public Percentage refundRateFor(Shipment shipment, Instant cancelledAt) {
        if (shipment.status() == ShipmentStatus.BOOKED) {
            return Percentage.of(100);
        }
        Duration sinceBooked = Duration.between(shipment.bookedAt(), cancelledAt);
        if (shipment.status() == ShipmentStatus.IN_TRANSIT && sinceBooked.toHours() < 24) {
            return Percentage.of(50); // grace window learned directly from the specialist
        }
        return Percentage.of(0);
    }
}`}</pre>
        </div>
        <p>
          The 24-hour grace window is exactly the kind of detail a proxy summary ("refunds depend
          on timing") would have lost. Getting it right required the person who applies the rule
          daily.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Modeling from the ticket, not the person.</b> Written requirements are a summary,
            already stripped of the exceptions that make the domain hard.
          </li>
          <li>
            <b>Treating "the business" as one uniform voice.</b> Support, pricing, and operations
            often have different, sometimes conflicting, understandings of the same term.
          </li>
          <li>
            <b>One-time interviews instead of ongoing access.</b> New edge cases surface during
            implementation; the expert relationship needs to stay open, not close after a kickoff.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is a product manager relaying "support says refunds are complicated" usually not enough to model the refund rule correctly?</p>
          <p>
            <b>Answer:</b> A proxy summary strips out the exact exceptions &mdash; like a specific
            24-hour grace window &mdash; that only the person who applies the rule daily can
            supply accurately.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Find the person who has lived the exceptions, not the one who can summarize the happy
        path &mdash; and keep the conversation open past the kickoff.
      </p>
    </div>
  );
}
