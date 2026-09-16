export default function StrategicDesignSharedKernelArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A shared kernel is a small, deliberately limited piece of model that two bounded
          contexts both depend on directly, by explicit agreement. At Cargoflow, Booking and
          Billing share the <code>Money</code> value object and the <code>ShipmentId</code>{" "}
          identifier type &mdash; nothing else.
        </p>
        <p>
          It is the riskiest of the context-mapping patterns because it reintroduces exactly the
          coupling bounded contexts exist to avoid, so it is used sparingly and only for genuinely
          stable, tiny pieces of model.
        </p>
      </section>
      <section id="concepts">
        <h2>1. What belongs in a shared kernel, and what does not</h2>
        <div className="twoCol">
          <div>
            <h3>Good candidates</h3>
            <p>
              Small value objects with almost no business logic and near-zero rate of change:
              <code>Money</code>, <code>ShipmentId</code>, a shared <code>Percentage</code> type.
              Changing them requires both teams' sign-off, which is acceptable because they change
              so rarely.
            </p>
          </div>
          <div>
            <h3>Bad candidates</h3>
            <p>
              Anything with real business rules attached, like a <code>Shipment</code> entity or a
              pricing policy. Sharing those defeats the purpose of separate bounded contexts
              entirely.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>THE GOVERNANCE RULE THAT MAKES IT SAFE</small>
          <p>
            Any change to the shared kernel module requires a reviewer from both the Booking and
            Billing teams before merging. That single rule is what keeps a shared kernel from
            silently becoming one team's unilateral dependency on the other.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="30" width="160" height="55" rx="8" />
            <text className="boxText" x="110" y="63">Booking</text>
            <rect className="boxAccent" x="330" y="30" width="160" height="55" rx="8" />
            <text className="boxText" x="410" y="63">Billing</text>
            <rect className="boxWarn" x="180" y="105" width="160" height="50" rx="8" />
            <text className="boxText" x="260" y="135">Shared kernel</text>
            <text className="figHint" x="260" y="150">Money, ShipmentId</text>
            <line className="flow" x1="110" y1="85" x2="240" y2="105" />
            <line className="flow" x1="410" y1="85" x2="280" y2="105" />
          </svg>
          <figcaption>Both contexts depend directly on the same small module &mdash; the smallest possible surface, governed jointly.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A shared kernel, kept deliberately tiny</h2>
        <span className="codeLabel">JAVA &mdash; com.cargoflow.shared.kernel (owned jointly)</span>
        <div className="codeBlock">
          <pre>{`public final class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money plus(Money other) {
        requireSameCurrency(other);
        return new Money(amount.add(other.amount), currency);
    }

    private void requireSameCurrency(Money other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
    }
}

public record ShipmentId(String value) {}`}</pre>
        </div>
        <p>
          Nothing here knows about invoices, carrier pricing, or shipment status &mdash; only
          arithmetic and identity. That narrowness is what makes joint ownership sustainable.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the shared kernel grow.</b> Each addition needs to survive "does this
            genuinely need to be identical in both contexts?" &mdash; most things do not.
          </li>
          <li>
            <b>Skipping joint review on changes.</b> Without the two-team review rule, a shared
            kernel quietly becomes one team's dependency the other did not agree to.
          </li>
          <li>
            <b>Using it as a shortcut instead of Published Language.</b> If the two contexts only
            need to exchange data, not share the actual class, a published event contract is
            safer and less coupled.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Should Cargoflow's <code>Shipment</code> entity go into the shared kernel so Booking and Billing can both use it directly?</p>
          <p>
            <b>Answer:</b> No &mdash; it has real business logic and status transitions specific to
            each context's concerns. Sharing it would recouple the two contexts; only small, stable
            value objects like <code>Money</code> belong in a shared kernel.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Keep a shared kernel tiny, stable, and jointly governed &mdash; anything with real
        business logic belongs in one context, not shared.
      </p>
    </div>
  );
}
