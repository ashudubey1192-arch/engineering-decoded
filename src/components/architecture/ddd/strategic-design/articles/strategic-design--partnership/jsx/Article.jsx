export default function StrategicDesignPartnershipArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Partnership is a context-mapping pattern where two teams succeed or fail together, and
          coordinate closely as equals &mdash; neither is upstream or downstream of the other. At
          Cargoflow, Booking and Fleet &amp; Routing briefly used this pattern while co-designing
          the multi-leg shipment feature, since neither model could be finished without the other.
        </p>
        <p>
          It is the most expensive relationship pattern to sustain, because it requires ongoing,
          synchronized planning between two teams, so it is usually a temporary state rather than
          a permanent architecture.
        </p>
      </section>
      <section id="concepts">
        <h2>1. When Partnership is the right call</h2>
        <div className="twoCol">
          <div>
            <h3>Use it when</h3>
            <p>
              Two contexts are being designed or substantially reshaped together, and getting the
              interface right requires tight, frequent joint decisions &mdash; a shared release
              plan is genuinely necessary.
            </p>
          </div>
          <div>
            <h3>Avoid it when</h3>
            <p>
              One context can reasonably move at its own pace. Most stable relationships resolve
              into Customer/Supplier or Published Language instead, once the coupled design phase
              ends.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>THE CARGOFLOW EXAMPLE</small>
          <p>
            Multi-leg shipments meant Booking needed to know about intermediate stops, and Fleet
            &amp; Routing needed to know about Booking's deadline semantics per leg &mdash;
            neither team's model could be finalized independently. They ran joint planning and
            shared their release calendar for six weeks, then split back into a Customer/Supplier
            relationship once the shape stabilized.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="40" y="45" width="170" height="60" rx="8" />
            <text className="boxText" x="125" y="80">Booking</text>
            <rect className="boxAccent" x="290" y="45" width="170" height="60" rx="8" />
            <text className="boxText" x="375" y="80">Fleet &amp; Routing</text>
            <line className="flow" x1="210" y1="65" x2="290" y2="65" />
            <line className="flow" x1="290" y1="85" x2="210" y2="85" />
            <text className="figHint" x="250" y="120">joint planning, shared release calendar</text>
          </svg>
          <figcaption>Partnership: two-way arrows, both teams move together &mdash; expensive, so kept temporary.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. What "designed together" looks like in the interface</h2>
        <p>
          The interface both teams co-designed exposes concepts neither could have defined alone:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Jointly designed by Booking and Fleet & Routing during the Partnership window.
public record LegPlan(
        String legId,
        String fromStop,
        String toStop,
        Instant legDeadline // Booking's deadline semantics, applied per leg
) {}

public interface MultiLegPlanner {
    List<LegPlan> planLegs(ShipmentRequest request); // needs both teams' domain knowledge
}`}</pre>
        </div>
        <p>
          Neither <code>ShipmentRequest</code> (Booking's concept) nor per-leg capacity (Fleet
          &amp; Routing's concept) alone could define what a valid <code>LegPlan</code> looks
          like &mdash; the interface itself is the joint output of the partnership.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Defaulting to Partnership because "the teams get along."</b> Team rapport is not
            the criterion; genuine mutual design dependency is.
          </li>
          <li>
            <b>Leaving Partnership in place indefinitely.</b> Once the joint design work is done,
            staying in lockstep costs coordination overhead neither team needs anymore.
          </li>
          <li>
            <b>Skipping the joint planning ritual that makes Partnership work.</b> Without a
            shared release calendar and regular sync, "Partnership" becomes just an unmanaged
            two-way dependency.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why did Booking and Fleet &amp; Routing move out of Partnership after six weeks?</p>
          <p>
            <b>Answer:</b> Once the multi-leg shipment interface stabilized, the two contexts no
            longer needed synchronized joint design &mdash; a lighter-weight Customer/Supplier
            relationship was sufficient and cheaper to sustain.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Partnership is for genuine mutual design dependency between two teams &mdash; use it
        deliberately, and expect to graduate out of it once the joint work is done.
      </p>
    </div>
  );
}
