import "../css/Article.css";

export default function CleanArchitecturePracticesCleanBoundariesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          The point where your code meets code you don't control &mdash; a third-party library, an
          external API, a framework &mdash; deserves deliberate design. Left alone, that boundary's
          specific vocabulary leaks throughout your codebase.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Wrap third-party APIs behind an interface you define</b> &mdash; insulates the rest of the codebase from a library's specific vocabulary, and lets you swap or upgrade it later.</li>
          <li><b>Don't let a framework's types show up everywhere</b> &mdash; if every function in your business logic accepts a framework-specific object, that logic is now coupled to the framework.</li>
          <li><b>A boundary you own is the right place for translation</b> &mdash; validation and error normalization for the outside system's quirks belong in the adapter, not scattered through business logic.</li>
          <li><b>A wrapped boundary is trivially fakeable</b> &mdash; an unwrapped one usually isn't, which is why boundaries are also where good test seams naturally appear.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's payment code, before and after wrapping a third-party SDK:
        </p>
        <span className="codeLabel">SDK VOCABULARY LEAKS INTO BUSINESS LOGIC</span>
        <div className="codeBlock">
          <pre>{`function chargeInvoice(invoice) {
  try {
    return stripe.charges.create({ amount: invoice.total, currency: "usd", source: invoice.token });
  } catch (e) {
    if (e.type === "StripeCardError") throw new PaymentDeclinedError(e.message);
    throw e;
  }
}
// every call site that touches payments now needs to know Stripe's specific shape`}</pre>
        </div>
        <span className="codeLabel">SDK SEALED BEHIND AN OWNED ADAPTER</span>
        <div className="codeBlock">
          <pre>{`class StripePaymentGateway {
  charge(invoice) {
    try {
      return stripe.charges.create({ amount: invoice.total, currency: "usd", source: invoice.token });
    } catch (e) {
      if (e.type === "StripeCardError") throw new PaymentDeclinedError(e.message);
      throw e;
    }
  }
}
// business logic now calls gateway.charge(invoice) and never sees Stripe's vocabulary`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of business logic calling a third-party payment SDK directly and handling its specific error types inline, versus business logic calling an owned PaymentGateway adapter that hides the SDK's vocabulary behind a stable interface.">
          <rect className="box" x="20" y="15" width="120" height="24" rx="4" /><text x="80" y="31" className="boxText" style={{fontSize:"4px"}}>chargeInvoice()</text>
          <rect className="boxWarn" x="250" y="15" width="150" height="24" rx="4" /><text x="325" y="31" className="boxText" style={{fontSize:"3.8px"}}>stripe.charges.create(...)</text>
          <line className="flowMuted" x1="140" y1="27" x2="248" y2="27" />
          <rect className="box" x="20" y="65" width="120" height="24" rx="4" /><text x="80" y="81" className="boxText" style={{fontSize:"4px"}}>chargeInvoice()</text>
          <rect className="boxAccent" x="200" y="65" width="110" height="24" rx="4" /><text x="255" y="81" className="boxText" style={{fontSize:"3.8px"}}>PaymentGateway</text>
          <rect className="box" x="330" y="65" width="80" height="24" rx="4" /><text x="370" y="81" className="boxText" style={{fontSize:"3.6px"}}>stripe SDK</text>
          <line className="flow" x1="140" y1="77" x2="198" y2="77" />
          <line className="flowMuted" x1="310" y1="77" x2="328" y2="77" />
        </svg>
        <figcaption>Calling a third-party SDK directly spreads its vocabulary everywhere; an owned adapter seals it behind one stable interface.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Wrapping a third-party library so thinly that the wrapper just mirrors the library's
          own method names and types one-to-one doesn't actually insulate anything &mdash; a
          wrapper that doesn't translate to your own vocabulary still leaves you coupled to the
          library's design decisions.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does calling stripe.charges.create() directly from many places in the codebase make switching payment providers later more difficult than calling it from inside one PaymentGateway class?</p>
        </div>
      </section>
      <p className="takeaway">
        Treat every third-party boundary as a seam to design deliberately &mdash; an owned adapter
        that translates to your own vocabulary keeps the rest of the codebase free of a library's
        specific shape.
      </p>

    </div>
  );
}
