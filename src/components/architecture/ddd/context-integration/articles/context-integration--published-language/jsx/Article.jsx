export default function ContextIntegrationPublishedLanguageArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A published language is a well-documented, shared interchange format &mdash; often an
          industry-standard one &mdash; that multiple bounded contexts translate to and from,
          instead of integrating pairwise. Where a translation layer handles one integration,
          a published language is what several unrelated contexts, possibly including
          third parties, agree to speak.
        </p>
        <p>
          Cargoflow's carrier integrations increasingly speak a published language: the industry-
          standard EDI 214 shipment status format, rather than each carrier's proprietary API
          shape.
        </p>
      </section>
      <section id="concepts">
        <h2>1. When a published language earns its cost</h2>
        <ol className="stepList">
          <li>
            <b>Count the integrations, not just the current one.</b> One carrier integration
            barely justifies a published language; Cargoflow integrating with twelve carriers,
            each with a proprietary API, is exactly the case where one shared format pays for
            itself.
          </li>
          <li>
            <b>Prefer an existing industry standard over inventing a new one.</b> EDI 214 already
            exists, is documented outside Cargoflow, and carriers already know it &mdash;
            reinventing it captures none of that shared understanding.
          </li>
          <li>
            <b>Translate to and from the published language at each context's edge, exactly like a
            translation layer.</b> Cargoflow's domain model never speaks EDI 214 directly; a
            translator converts it to and from <code>Shipment</code>/<code>ShipmentStatus</code>.
          </li>
          <li>
            <b>Accept that the published language moves slowly, on purpose.</b> Changing an
            industry standard is a multi-party negotiation, not a pull request &mdash; that
            stability is exactly why it is worth adopting for wide integration.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 180" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="110" height="40" rx="6" />
            <text className="boxText" x="75" y="45" fontSize="11">Carrier A</text>
            <rect className="box" x="20" y="120" width="110" height="40" rx="6" />
            <text className="boxText" x="75" y="145" fontSize="11">Carrier B</text>
            <rect className="boxAccent" x="220" y="70" width="120" height="40" rx="6" />
            <text className="boxText" x="280" y="95" fontSize="11">EDI 214</text>
            <rect className="box" x="430" y="70" width="110" height="40" rx="6" />
            <text className="boxText" x="485" y="95" fontSize="11">Cargoflow</text>
            <line className="flow" x1="130" y1="40" x2="220" y2="80" />
            <line className="flow" x1="130" y1="140" x2="220" y2="100" />
            <line className="flow" x1="340" y1="90" x2="430" y2="90" />
          </svg>
          <figcaption>Every carrier translates to the same published standard once, instead of Cargoflow building a bespoke translator per carrier.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One boundary translator for the published format</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public class Edi214Translator {
    // EDI 214 status codes are an external, industry-documented vocabulary
    public ShipmentStatus toDomainStatus(String edi214StatusCode) {
        return switch (edi214StatusCode) {
            case "AF" -> ShipmentStatus.DELIVERED;   // "Arrived at Final Destination"
            case "X6" -> ShipmentStatus.DELAYED;      // "Delayed"
            case "CD" -> ShipmentStatus.IN_TRANSIT;   // "Consolidated Departure"
            default -> throw new UnrecognizedEdiStatusException(edi214StatusCode);
        };
    }
}`}</pre>
        </div>
        <p>
          Adding carrier C means writing one adapter that produces EDI 214, then reusing{" "}
          <code>Edi214Translator</code> unchanged &mdash; the cost of a new carrier stops growing
          linearly with each integration.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Adopting a published language for a single integration.</b> The translation
            overhead only pays off once multiple parties actually share the format; for one
            carrier, a direct translation layer is simpler and just as safe.
          </li>
          <li>
            <b>Inventing a proprietary "published language" used by no one outside the
            company.</b> That is just an internal contract wearing a bigger name &mdash; it gets
            none of the benefit of an externally maintained standard.
          </li>
          <li>
            <b>Letting the domain model absorb the published language's quirks directly.</b>{" "}
            EDI 214's terse two-letter codes should never appear in <code>Shipment</code> itself;
            they stop at the translator, exactly as with any other external model.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does adopting EDI 214 pay off for Cargoflow's twelve-carrier integration but not for a single carrier?</p>
          <p>
            <b>Answer:</b> With one carrier, a direct translation layer already solves the
            problem at lower cost than adopting an external standard. With twelve, a shared
            published language means each new carrier needs one adapter to the standard instead
            of Cargoflow building and maintaining a bespoke translator per carrier &mdash; the
            cost stops growing linearly.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for a published language when several parties need to integrate around one shared
        format, prefer an existing standard over inventing one, and keep translating at the edge
        exactly as you would for a single integration.
      </p>
    </div>
  );
}
