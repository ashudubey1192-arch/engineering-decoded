export default function StrategicDesignBoundedContextStrategyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A bounded context is the boundary inside which a particular model applies consistently
          &mdash; the same term means the same thing, and the same rules hold, everywhere inside
          it. Outside that boundary, the same word can mean something different, on purpose.
        </p>
        <p>
          Cargoflow's word "Customer" means something different inside Billing (an entity with
          payment terms and a credit limit) than inside Support (a case history and a
          satisfaction score). Trying to force one universal <code>Customer</code> class across
          both is exactly the mistake bounded contexts exist to prevent.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Choosing where the boundaries go</h2>
        <p>
          Bounded contexts are chosen, not discovered by nature &mdash; a strategy, not a law.
          Good boundary candidates line up with places where:
        </p>
        <ol className="stepList">
          <li>The same word is used to mean genuinely different things.</li>
          <li>A different team owns the logic and needs to evolve it independently.</li>
          <li>The subdomain classification (core/supporting/generic) changes.</li>
        </ol>
        <div className="scenarioBox">
          <small>CARGOFLOW'S BOUNDED CONTEXTS</small>
          <p>
            Booking (shipment lifecycle, pricing inputs), Fleet &amp; Routing (the core domain
            &mdash; carrier capacity, route optimization), Billing (invoices, payments), and
            Support (case management). Four contexts, four separate models, deliberately not
            merged into one.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="20" y="20" width="140" height="80" rx="8" />
            <text className="boxText" x="90" y="55">Booking</text>
            <rect className="boxWarn" x="180" y="20" width="140" height="80" rx="8" />
            <text className="boxText" x="250" y="55">Fleet &amp; Routing</text>
            <rect className="boxAccent" x="340" y="20" width="140" height="80" rx="8" />
            <text className="boxText" x="410" y="55">Billing</text>
            <rect className="boxAccent" x="480" y="20" width="120" height="80" rx="8" />
            <text className="boxText" x="540" y="55">Support</text>
            <text className="figHint" x="90" y="130">"Customer" = payer of record</text>
            <text className="figHint" x="410" y="150">"Customer" = billing account</text>
            <text className="figHint" x="540" y="170">"Customer" = support case owner</text>
          </svg>
          <figcaption>Each box is a separate model; the same word can carry a different meaning in each without conflict.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The same word, two contexts, two classes</h2>
        <span className="codeLabel">JAVA &mdash; BILLING CONTEXT</span>
        <div className="codeBlock">
          <pre>{`package com.cargoflow.billing;

public final class Customer {
    private final CustomerId id;
    private Money creditLimit;
    private PaymentTerms terms;
    // billing-relevant state only
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; SUPPORT CONTEXT</span>
        <div className="codeBlock">
          <pre>{`package com.cargoflow.support;

public final class Customer {
    private final CustomerId id;
    private List<CaseId> openCases;
    private SatisfactionScore score;
    // support-relevant state only
}`}</pre>
        </div>
        <p>
          Both classes are legitimately named <code>Customer</code>; neither is "more correct."
          Each is complete for its own context's purposes and would be actively wrong bloated with
          the other's fields.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Building one universal <code>Customer</code> class shared everywhere.</b> It grows
            fields for every context's needs and satisfies none of them well.
          </li>
          <li>
            <b>Drawing bounded contexts along database tables instead of language and ownership.</b>{" "}
            Tables optimize for storage; contexts should optimize for where meaning and change
            actually diverge.
          </li>
          <li>
            <b>Making every microservice its own bounded context by default.</b> Sometimes yes,
            but the boundary decision should come from the model, not from deployment convenience.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Billing's <code>Customer</code> and Support's <code>Customer</code> both exist with different fields. Is this duplication a problem to fix?</p>
          <p>
            <b>Answer:</b> No &mdash; it is the intended outcome of bounded contexts. Each
            <code>Customer</code> is complete for its own context; merging them would produce a
            bloated class that serves neither context well.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Draw bounded contexts where language and ownership genuinely diverge, and let the same
        word mean different things in different contexts on purpose.
      </p>
    </div>
  );
}
