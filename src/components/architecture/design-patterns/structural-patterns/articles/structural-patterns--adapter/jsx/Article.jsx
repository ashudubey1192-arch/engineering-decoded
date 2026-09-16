export default function StructuralPatternsAdapterArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Adapter converts the interface of an existing class into another interface a client
          expects, letting classes work together that couldn't otherwise because of mismatched
          interfaces. It's the pattern to reach for when you have working code you can't or
          shouldn't modify, and a new interface it needs to satisfy.
        </p>
        <p>
          Intent: make an incompatible interface usable through translation. Applicability: an
          existing class's interface doesn't match what your code needs, and modifying that class
          isn't possible or desirable (it's a third-party library, or shared by other code).
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building an adapter, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the target interface your code already expects.</b> Your billing code
            calls <code>PaymentProcessor.charge(Money amount)</code> everywhere else in the
            system.
          </li>
          <li>
            <b>Identify the adaptee's actual, mismatched interface.</b> A third-party library
            exposes <code>LegacyGateway.chargeCard(int cents, String token)</code> &mdash; a
            different method name, different parameter shape, no <code>Money</code> type.
          </li>
          <li>
            <b>Write an adapter class implementing the target interface, wrapping the adaptee.</b>{" "}
            <code>LegacyGatewayAdapter implements PaymentProcessor</code>, translating each call.
          </li>
          <li>
            <b>Keep the adapter's only job as translation.</b> No business logic belongs inside
            it &mdash; it should do nothing but convert shapes and delegate.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="130" height="50" rx="8" />
            <text className="boxText" x="85" y="68" fontSize="10">Billing code</text>
            <text className="figHint" x="85" y="85">expects PaymentProcessor</text>
            <line className="flow" x1="150" y1="70" x2="210" y2="70" />
            <rect className="boxAccent" x="210" y="45" width="130" height="50" rx="8" />
            <text className="boxText" x="275" y="68" fontSize="10">Adapter</text>
            <text className="figHint" x="275" y="85">implements + wraps</text>
            <line className="flow" x1="340" y1="70" x2="400" y2="70" />
            <rect className="boxWarn" x="400" y="45" width="90" height="50" rx="8" />
            <text className="boxText" x="445" y="68" fontSize="9">LegacyGateway</text>
          </svg>
          <figcaption>The adapter is the only class that knows both interfaces &mdash; everything else stays on one side or the other.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Translating one interface into another</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface PaymentProcessor { void charge(Money amount); } // target, used everywhere else

class LegacyGateway { // adaptee, third-party, cannot be modified
    void chargeCard(int cents, String token) { /* legacy implementation */ }
}

class LegacyGatewayAdapter implements PaymentProcessor {
    private final LegacyGateway legacyGateway;
    private final String token;
    LegacyGatewayAdapter(LegacyGateway legacyGateway, String token) {
        this.legacyGateway = legacyGateway;
        this.token = token;
    }
    public void charge(Money amount) {
        legacyGateway.chargeCard(amount.toCents(), token); // the only translation point
    }
}

// billing code, unaware LegacyGateway even exists
PaymentProcessor processor = new LegacyGatewayAdapter(legacyGateway, savedToken);
processor.charge(Money.of(49, 99));`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the adapter accumulate business logic beyond translation.</b> If{" "}
            <code>LegacyGatewayAdapter</code> starts validating amounts or applying discount
            rules, it has taken on a second job the pattern didn't ask for.
          </li>
          <li>
            <b>Modifying the adaptee instead of wrapping it, when modification is actually
            possible.</b> If <code>LegacyGateway</code> is your own code and changing its
            interface directly is safe, that's often simpler than maintaining a permanent adapter.
          </li>
          <li>
            <b>Confusing Adapter with Facade.</b> Adapter makes one mismatched interface match
            what's expected; Facade, later in this section, simplifies a complex interface rather
            than translating between two specific ones.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>LegacyGatewayAdapter</code> exist as a separate class instead of modifying <code>LegacyGateway</code> directly to implement <code>PaymentProcessor</code>?</p>
          <p>
            <b>Answer:</b> <code>LegacyGateway</code> is a third-party class that can't be
            modified. The adapter sits between it and the rest of the codebase, translating calls
            in one direction, so the billing code can depend on the interface it already expects
            without needing the third-party library to change.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Adapter when you need existing, unmodifiable code to satisfy an interface it
        wasn't written for &mdash; keep the adapter's job limited to translation, nothing more.
      </p>
    </div>
  );
}
