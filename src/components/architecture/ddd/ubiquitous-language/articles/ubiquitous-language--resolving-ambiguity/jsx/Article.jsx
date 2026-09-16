export default function UbiquitousLanguageResolvingAmbiguityArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Ambiguity in the language is not a failure to catch early &mdash; it is a normal,
          expected stage every term passes through before it is pinned down. This article is a
          concrete process for resolving it once it surfaces, using a real Cargoflow example: the
          word "Cancelled."
        </p>
        <p>
          Left unresolved, ambiguity does not stay neutral. Each engineer quietly picks their own
          interpretation, and the code starts encoding several incompatible definitions at once.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A four-step resolution process</h2>
        <ol className="stepList">
          <li>
            <b>Collect every distinct meaning currently in use.</b> "Cancelled" turned out to mean
            three things at Cargoflow: the shipper cancelled before pickup, Cargoflow cancelled
            because no carrier was available, and a carrier cancelled after pickup.
          </li>
          <li>
            <b>Ask the domain expert whether these are genuinely one concept or several.</b> The
            ops lead confirmed they trigger different refund rules and different downstream
            notifications &mdash; genuinely different concepts wearing one word.
          </li>
          <li>
            <b>Give each meaning its own precise term.</b> <code>ShipperCancelled</code>,
            <code> NoCarrierAvailable</code>, <code>CarrierCancelledInTransit</code>.
          </li>
          <li>
            <b>Retire the ambiguous term everywhere &mdash; code, tickets, conversation.</b> Plain
            "Cancelled" stops being used alone once the precise terms exist.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="220" y="20" width="160" height="45" rx="8" />
            <text className="boxText" x="300" y="47">"Cancelled" (ambiguous)</text>
            <line className="flow" x1="300" y1="65" x2="120" y2="105" />
            <line className="flow" x1="300" y1="65" x2="300" y2="105" />
            <line className="flow" x1="300" y1="65" x2="480" y2="105" />
            <rect className="boxAccent" x="40" y="105" width="160" height="55" rx="8" />
            <text className="boxText" x="120" y="135">ShipperCancelled</text>
            <rect className="boxAccent" x="220" y="105" width="160" height="55" rx="8" />
            <text className="boxText" x="300" y="135">NoCarrierAvailable</text>
            <rect className="boxAccent" x="400" y="105" width="160" height="55" rx="8" />
            <text className="boxText" x="480" y="128">CarrierCancelled</text>
            <text className="boxText" x="480" y="146">InTransit</text>
          </svg>
          <figcaption>One ambiguous term resolves into three precise ones, each with its own downstream behavior.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Three events instead of one flag</h2>
        <span className="codeLabel">JAVA &mdash; BEFORE</span>
        <div className="codeBlock">
          <pre>{`shipment.cancel(); // which kind? refund rules can't tell from this alone`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; AFTER RESOLUTION</span>
        <div className="codeBlock">
          <pre>{`public sealed interface ShipmentCancellation
        permits ShipperCancelled, NoCarrierAvailable, CarrierCancelledInTransit {}

public record ShipperCancelled(ShipmentId id, Instant cancelledAt) implements ShipmentCancellation {}
public record NoCarrierAvailable(ShipmentId id, Instant cancelledAt) implements ShipmentCancellation {}
public record CarrierCancelledInTransit(ShipmentId id, Leg lastCompletedLeg) implements ShipmentCancellation {}`}</pre>
        </div>
        <p>
          The <code>RefundPolicy</code> from an earlier article can now pattern-match on the
          sealed interface and apply a different rule to each &mdash; something impossible with a
          single ambiguous <code>cancel()</code> call.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Picking one meaning arbitrarily to "just move forward."</b> This just makes the
            ambiguity silent instead of resolved &mdash; the other meanings still exist in the
            business, unrepresented in the code.
          </li>
          <li>
            <b>Resolving ambiguity without the domain expert.</b> Only they can confirm whether
            two usages are truly the same concept or two that happen to share a word.
          </li>
          <li>
            <b>Over-splitting a term that really was one concept.</b> Not every synonym pair is
            ambiguity; if two words genuinely mean the same thing with no behavioral difference,
            standardizing on one is enough.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What confirmed that "Cancelled" was genuinely three concepts, not one term used loosely?</p>
          <p>
            <b>Answer:</b> The domain expert confirmed each situation triggered a different refund
            rule and different downstream notifications &mdash; a real behavioral difference, not
            just stylistic variation in how people talked about the same thing.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Ambiguity is normal until resolved &mdash; collect the real meanings, confirm with the
        domain expert whether they differ, then give each one its own precise term.
      </p>
    </div>
  );
}
