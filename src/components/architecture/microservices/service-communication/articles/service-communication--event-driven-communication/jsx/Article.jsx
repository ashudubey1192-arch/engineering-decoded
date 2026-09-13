import "../css/Article.css";

export default function ServiceCommunicationEventDrivenCommunicationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Event-driven communication flips the direction of dependency: instead of a service calling
          another to tell it what to do, it publishes a fact about what already happened, and
          whichever services care can react &mdash; without the publisher ever needing to know who's
          listening.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A well-designed event describes something that has already happened, named in the past
          tense &mdash; <code>OrderConfirmed</code>, not <code>ConfirmOrder</code>. That distinction
          matters: a command tells a specific service what to do and expects it to do it; an event
          just states a fact, and the publisher genuinely doesn't know or control how many services
          react to it, or whether any do at all. Adding a brand-new subscriber to an existing event
          requires zero changes to the publisher.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          When <code>OrderService</code> publishes <code>OrderConfirmed</code>,
          <code>NotificationService</code>, <code>AnalyticsService</code>, and
          <code>LoyaltyPointsService</code> all react independently &mdash; sending an email,
          recording a metric, and crediting points, respectively. Six months later, when
          <code>FraudReviewService</code> is introduced and also needs to know about confirmed
          orders, it just subscribes to the existing event. <code>OrderService</code>'s code never
          changes.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of OrderService publishing one OrderConfirmed event that three existing subscribers react to, with a fourth subscriber, FraudReviewService, added later with no change to OrderService at all.">
          <rect className="box" x="150" y="15" width="120" height="26" rx="6" />
          <text x="210" y="32" className="boxText" style={{fontSize:"6.5px"}}>OrderService</text>
          <text x="210" y="52" className="figHint" style={{fontSize:"6px"}}>publishes: OrderConfirmed</text>
          {["Notification","Analytics","Loyalty Points","Fraud Review (added later)"].map((t,i) => (
            <g key={t}>
              <rect className={i===3 ? "boxAccent" : "box"} x={15 + i*100} y="90" width="90" height="34" rx="6" />
              <text x={60 + i*100} y="104" className="boxText" style={{fontSize:"6px"}}>{t.split(" (")[0]}</text>
              {i===3 && <text x={60 + i*100} y="117" className="figHint" style={{fontSize:"5px"}}>added later</text>}
              <line className="flow" x1="210" y1="41" x2={60 + i*100} y2="88" />
            </g>
          ))}
        </svg>
        <figcaption>Every subscriber, including the one added six months later, reacts to the same unchanged event &mdash; OrderService's code never has to know they exist.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Naming events as commands in disguise (<code>SendEmailEvent</code>) leaks the publisher's
          assumptions about who's listening and what they should do &mdash; it stops being a
          statement of fact and becomes a hidden remote-procedure-call, which defeats the purpose.
          The other common mistake is an event carrying so little data that every subscriber has to
          call back to the publisher to look up details anyway &mdash; that reintroduces the
          synchronous coupling this style is meant to avoid.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>FraudReviewService needs to start reacting to confirmed orders six months after launch. Why doesn't OrderService need any code changes to support that?</p>
        </div>
      </section>
      <p className="takeaway">
        Publish facts, not instructions &mdash; a well-named, sufficiently detailed event lets new
        subscribers show up later with zero coordination from the service that raised it.
      </p>
    </div>
  );
}
