export default function UbiquitousLanguageBuildingASharedLanguageArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The ubiquitous language is the set of terms that mean exactly one thing inside a bounded
          context, used identically by domain experts in conversation, in requirements, and in the
          code itself. Inside Booking, "Deadline," "Leg," and "Carrier Assignment" are ubiquitous
          language terms &mdash; not jargon invented by engineers, but words the ops team already
          used before any code existed.
        </p>
        <p>
          Building it is not a naming exercise done once. It is an ongoing discipline of catching
          every place the code and the conversation use different words for the same thing.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A step-by-step process for building the language</h2>
        <ol className="stepList">
          <li>
            <b>Collect terms from real conversations, not a glossary meeting.</b> During knowledge
            crunching sessions, write down every noun and verb the domain expert uses naturally.
          </li>
          <li>
            <b>Write a one-sentence definition for each term, with the expert present.</b> "A Leg
            is one carrier-operated segment of a shipment's journey between two stops" &mdash;
            precise enough that two people would model it identically.
          </li>
          <li>
            <b>Check the definition against the code.</b> If a class or method already exists for
            the concept, does its name and shape match the definition exactly?
          </li>
          <li>
            <b>Publish the glossary somewhere the whole team sees it, and revisit it in every
            modeling session.</b> A glossary nobody reads is not a ubiquitous language.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>A REAL DEFINITION FROM CARGOFLOW'S GLOSSARY</small>
          <p>
            "Deadline: the latest Instant by which a shipment's final leg must show DELIVERED
            status to satisfy the shipper's contract. Distinct from 'ETA,' which is a routing
            estimate and carries no contractual weight." That second sentence exists because an
            early version of the code conflated the two.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="30" width="160" height="55" rx="8" />
            <text className="boxText" x="110" y="63">Conversation</text>
            <rect className="boxAccent" x="230" y="30" width="160" height="55" rx="8" />
            <text className="boxText" x="310" y="63">Glossary entry</text>
            <rect className="boxAccent" x="430" y="30" width="130" height="55" rx="8" />
            <text className="boxText" x="495" y="63">Code</text>
            <line className="flow" x1="190" y1="57" x2="230" y2="57" />
            <line className="flow" x1="390" y1="57" x2="430" y2="57" />
            <path className="flowMuted" d="M495,85 C495,120 110,120 110,85" />
            <text className="figHint" x="300" y="140">any drift anywhere on the loop gets corrected, not tolerated</text>
          </svg>
          <figcaption>The language flows from conversation to glossary to code, and drift anywhere on the loop should be treated as a bug.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The glossary definition, made literal in code</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`/**
 * The latest Instant by which a shipment's final leg must show DELIVERED
 * status to satisfy the shipper's contract. Distinct from ETA (a routing
 * estimate with no contractual weight) -- see glossary.md.
 */
public record Deadline(Instant contractualBy) {
    public boolean missedBy(Instant deliveredAt) {
        return deliveredAt.isAfter(contractualBy);
    }
}`}</pre>
        </div>
        <p>
          The class name, the field name, and the Javadoc all trace back to the exact glossary
          sentence &mdash; anyone reading either one can find the other.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Writing the glossary without the domain expert in the room.</b> Engineer-only
            definitions tend to drift toward implementation convenience over accuracy.
          </li>
          <li>
            <b>Treating the glossary as documentation instead of a constraint on naming.</b> If a
            new class is named without checking the glossary first, inconsistency creeps back in
            immediately.
          </li>
          <li>
            <b>Writing vague definitions that two people could interpret two ways.</b> If the
            definition does not distinguish the concept from its closest neighbor (as "Deadline"
            does from "ETA"), it has not done its job yet.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the Deadline glossary entry explicitly mention what it is not (ETA)?</p>
          <p>
            <b>Answer:</b> A precise definition needs to rule out the nearest confusable concept.
            Without that contrast, engineers could reasonably conflate the two, which is exactly
            the drift the glossary exists to prevent.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Build the language from real conversation, pin it down with precise definitions, and check
        the code against it continuously &mdash; not as a one-time glossary exercise.
      </p>
    </div>
  );
}
