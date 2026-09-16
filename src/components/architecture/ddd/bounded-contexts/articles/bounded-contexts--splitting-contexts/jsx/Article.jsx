export default function BoundedContextsSplittingContextsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Contexts grow. A bounded context that was coherent at launch can accumulate enough
          internal divergence that it is really two contexts wearing one name. This article
          walks through splitting one, using Cargoflow's own Booking context as the example
          &mdash; it eventually split off a separate Quoting context.
        </p>
        <p>
          Splitting is expensive and disruptive, so it is worth being precise about when the signs
          actually justify it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A step-by-step signal check before splitting</h2>
        <ol className="stepList">
          <li>
            <b>Look for a sub-vocabulary that has quietly formed.</b> Inside Booking,
            "quote," "pricing tier," and "rate card" had started forming their own dense cluster
            of terms, distinct from "shipment," "leg," and "deadline."
          </li>
          <li>
            <b>Check whether two groups inside the context change on different schedules.</b>{" "}
            Pricing rules changed weekly as Cargoflow negotiated new rate cards; booking mechanics
            changed rarely. That mismatch is a strong split signal.
          </li>
          <li>
            <b>Confirm two different sets of people care about each half.</b> Sales and pricing
            analysts cared deeply about quoting; ops cared about booking mechanics. Different
            audiences reinforce the split.
          </li>
          <li>
            <b>Draw the new boundary and repeat the model-boundary process</b> from earlier in
            this section on each resulting piece.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="30" width="540" height="60" rx="8" />
            <text className="figLabel" x="300" y="55">ORIGINAL BOOKING CONTEXT</text>
            <text className="boxText" x="150" y="78">Shipment, Leg, Deadline</text>
            <text className="boxText" x="450" y="78">Quote, PricingTier, RateCard</text>
            <line className="flow" x1="300" y1="90" x2="300" y2="120" />
            <rect className="boxAccent" x="30" y="130" width="250" height="50" rx="8" />
            <text className="boxText" x="155" y="160">Booking (shipment mechanics)</text>
            <rect className="boxAccent" x="320" y="130" width="250" height="50" rx="8" />
            <text className="boxText" x="445" y="160">Quoting (pricing)</text>
          </svg>
          <figcaption>The split follows the natural cluster boundary that had already formed inside the vocabulary and change cadence.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. What the split looks like in the interface</h2>
        <span className="codeLabel">JAVA &mdash; AFTER THE SPLIT</span>
        <div className="codeBlock">
          <pre>{`package com.cargoflow.quoting;
public final class Quote {
    public static Quote generate(ShipmentRequest request, RateCard rateCard) { /* ... */ }
}

package com.cargoflow.booking;
public final class Shipment {
    // Booking depends on Quoting only through this narrow interface now.
    public static Shipment fromAcceptedQuote(QuoteId quoteId, AcceptedQuoteSummary summary) {
        return new Shipment(summary.route(), summary.deadline());
    }
}`}</pre>
        </div>
        <p>
          Booking no longer contains any pricing logic at all; it depends on a narrow
          <code> AcceptedQuoteSummary</code> the same way it depends on Fleet &amp; Routing's
          published data &mdash; through an interface, not a shared internal model.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Splitting reactively during an incident instead of proactively.</b> The signals in
            step 1-3 are visible well before the pain becomes acute; watch for them on purpose.
          </li>
          <li>
            <b>Splitting along an arbitrary line, like alphabetical class names.</b> The split
            must follow the actual vocabulary and change-rate clusters, not a convenient cut.
          </li>
          <li>
            <b>Doing the split without updating the context map.</b> A new bounded context needs
            its relationship pattern to every existing context defined, not left implicit.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What was the concrete evidence Booking needed to split, beyond "the class got big"?</p>
          <p>
            <b>Answer:</b> A distinct sub-vocabulary (quote, pricing tier, rate card), a different
            change cadence (weekly vs. rare), and a different audience (sales/pricing vs. ops) had
            all formed independently &mdash; size alone was not the signal, divergence was.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Split a context when its vocabulary, change cadence, and audience have already diverged
        internally &mdash; then re-run the model-boundary process on each new piece.
      </p>
    </div>
  );
}
