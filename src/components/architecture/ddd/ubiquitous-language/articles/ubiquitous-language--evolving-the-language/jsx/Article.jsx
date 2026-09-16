export default function UbiquitousLanguageEvolvingTheLanguageArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The business keeps changing, so the language has to change with it. When Cargoflow
          added refrigerated cargo support, "Leg" needed a new attribute the original definition
          never anticipated. This article covers changing a glossary term without breaking the
          code and conversations that already depend on the old definition.
        </p>
        <p>
          The goal is deliberate, visible evolution &mdash; the opposite of the silent drift the
          earlier articles in this section worked to prevent.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A step-by-step process for evolving a term</h2>
        <ol className="stepList">
          <li>
            <b>Identify what the business actually added, in plain language, with the domain
            expert.</b> "Some Legs now require temperature control, and that changes which
            carriers can be assigned."
          </li>
          <li>
            <b>Decide: extend the existing term, or introduce a new one?</b> Here, "Leg" itself
            still applies to every leg; temperature control is a new attribute of Leg, not a new
            concept requiring its own term.
          </li>
          <li>
            <b>Update the glossary definition and date the change.</b> "Leg (updated 2026-03):
            &hellip; may additionally require refrigeration, in which case only refrigeration-
            capable carriers can be assigned to it."
          </li>
          <li>
            <b>Update the code to match, in the same change that updates the glossary.</b> The two
            should never be out of sync even temporarily.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>WHEN TO INTRODUCE A NEW TERM INSTEAD</small>
          <p>
            If refrigerated cargo had instead required an entirely different booking flow, pricing
            model, and carrier network &mdash; not just a new attribute on the existing concept
            &mdash; the right move would have been a new term ("Cold Chain Shipment") and possibly
            a new bounded context, not an extension of "Leg."
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="45" width="180" height="60" rx="8" />
            <text className="boxText" x="120" y="70">Business change</text>
            <text className="figHint" x="120" y="90">refrigerated cargo</text>
            <line className="flow" x1="210" y1="75" x2="280" y2="45" />
            <line className="flow" x1="210" y1="75" x2="280" y2="105" />
            <rect className="boxAccent" x="280" y="20" width="150" height="50" rx="8" />
            <text className="boxText" x="355" y="50">Extend existing term</text>
            <rect className="boxAccent" x="280" y="80" width="150" height="50" rx="8" />
            <text className="boxText" x="355" y="110">Introduce new term</text>
          </svg>
          <figcaption>Every business change forces a choice: does an existing term stretch to cover it, or does it need its own name?</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Extending, with the glossary change and code change together</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`/**
 * A carrier-operated segment of a shipment's journey between two stops.
 * (Updated 2026-03: may require refrigeration -- see requiresRefrigeration.)
 */
public final class Leg {
    private final boolean requiresRefrigeration;

    public boolean canBeAssignedTo(Carrier carrier) {
        return !requiresRefrigeration || carrier.supportsRefrigeration();
    }
}`}</pre>
        </div>
        <p>
          The Javadoc's dated note is the code-side half of the same change that updated the
          shared glossary &mdash; both are committed together, not sequenced days apart.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Stretching a term past its natural meaning instead of introducing a new one.</b>{" "}
            If "Leg" had to grow ten unrelated new attributes for cold-chain shipping, that would
            be a sign a new concept was needed, not an extension.
          </li>
          <li>
            <b>Updating the code before the glossary, or vice versa, with a gap between them.</b>{" "}
            Even a short gap is a period where the "shared" language is not actually shared.
          </li>
          <li>
            <b>Skipping the domain expert because the change feels purely technical.</b> Whether
            refrigeration is an attribute of Leg or a wholly new concept is a domain judgment, not
            an engineering one.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why did refrigeration become an attribute of Leg instead of a whole new concept?</p>
          <p>
            <b>Answer:</b> It affects only which carriers can be assigned to an existing Leg
            &mdash; the booking flow, pricing model, and rest of the domain stayed the same. Had
            it required a fundamentally different flow, a new term would have been the better
            choice.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Let the language evolve deliberately with the business &mdash; decide explicitly whether
        to extend an existing term or introduce a new one, and update code and glossary together.
      </p>
    </div>
  );
}
