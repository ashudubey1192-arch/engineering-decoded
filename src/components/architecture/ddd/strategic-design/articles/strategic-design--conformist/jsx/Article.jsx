export default function StrategicDesignConformistArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Conformist is what happens when a downstream context has no realistic influence over an
          upstream one, and simply accepts and adapts to whatever model the upstream provides.
          Cargoflow's Support context is a conformist toward the government customs-status API it
          integrates with &mdash; Support has zero leverage over how that external system shapes
          its data.
        </p>
        <p>
          Conformist is not automatically a mistake. It is an honest acknowledgment of a power
          imbalance, and choosing it deliberately is cheaper than pretending you have negotiating
          leverage you do not actually have.
        </p>
      </section>
      <section id="concepts">
        <h2>1. When Conformist is the right call</h2>
        <div className="twoCol">
          <div>
            <h3>Appropriate</h3>
            <p>
              The upstream is external, huge, or otherwise unmovable &mdash; a government API, a
              major carrier's legacy system, an industry-standard format Cargoflow has no
              standing to change.
            </p>
          </div>
          <div>
            <h3>Worth challenging</h3>
            <p>
              The upstream is another internal team at Cargoflow. Defaulting to Conformist there
              is often a symptom of avoided negotiation, not a genuine power imbalance &mdash; an
              Anti-Corruption Layer, covered next, is usually the better internal answer.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>WHY SUPPORT CONFORMS HERE</small>
          <p>
            The customs API returns status codes like <code>"HOLD-INSP-2"</code> with no
            documentation Cargoflow controls. Support cannot negotiate a cleaner contract with a
            government system, so instead of fighting it, Support conforms &mdash; and quarantines
            the mess deliberately, as shown below.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="30" y="45" width="180" height="60" rx="8" />
            <text className="boxText" x="120" y="80">Customs API (external, unmovable)</text>
            <rect className="boxAccent" x="290" y="45" width="180" height="60" rx="8" />
            <text className="boxText" x="380" y="80">Support (conforms)</text>
            <line className="flow" x1="210" y1="75" x2="290" y2="75" />
            <text className="figHint" x="250" y="120">no negotiation possible</text>
          </svg>
          <figcaption>Conformist: the downstream accepts the upstream's model as-is, because it has no power to change it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Conforming without letting the mess spread</h2>
        <p>
          Conforming to a bad upstream contract does not mean scattering its raw shape throughout
          your codebase &mdash; keep the translation in one place, even if you cannot avoid it:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class CustomsStatusConformist {
    public CustomsHoldReason interpret(String rawCode) {
        // Conforms to the government API's undocumented codes, in one place only.
        return switch (rawCode) {
            case "HOLD-INSP-2" -> CustomsHoldReason.PHYSICAL_INSPECTION;
            case "HOLD-DOC-1" -> CustomsHoldReason.MISSING_DOCUMENTATION;
            default -> CustomsHoldReason.UNKNOWN;
        };
    }
}`}</pre>
        </div>
        <p>
          The rest of Support's code depends only on <code>CustomsHoldReason</code>, a clean enum
          &mdash; the conformity to the messy upstream format is confined to this one class.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Choosing Conformist by default instead of deliberately.</b> It should be a decision
            made after confirming you truly have no negotiating leverage, not the path of least
            resistance.
          </li>
          <li>
            <b>Letting the upstream's raw shape leak everywhere.</b> Even when you must conform,
            confine the ugly translation to one place, as shown above.
          </li>
          <li>
            <b>Conforming to an internal team when an Anti-Corruption Layer was available.</b>{" "}
            Internal power imbalances are often solvable; treating them as immovable forfeits a
            better option.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Is Conformist always a design smell to avoid?</p>
          <p>
            <b>Answer:</b> No &mdash; against a genuinely unmovable upstream like a government API,
            conforming deliberately (and confining the mess to one translation point) is more
            honest and cheaper than pretending you have leverage you don't.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Conform deliberately, not by default &mdash; and when you must, contain the upstream's
        mess to a single translation point instead of letting it spread.
      </p>
    </div>
  );
}
