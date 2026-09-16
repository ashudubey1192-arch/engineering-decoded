export default function PatternSelectionReviewPatternDecisionsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A pattern chosen for a good reason at the time can still become the wrong choice later
          &mdash; requirements shift, only one branch of a Strategy ever gets used, or a Factory's
          flexibility is never exercised. Reviewing pattern decisions periodically, the same way
          code gets reviewed, catches structure that's outlived the problem it was built for.
        </p>
        <p>
          This is the deliberate counterpart to Avoiding Pattern Overuse: that article covers not
          adding structure too early; this one covers noticing when structure that was once
          justified should now be removed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Reviewing a decision, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Revisit the original problem the pattern was introduced for.</b> A{" "}
            <code>NotificationChannelStrategy</code> was introduced because the codebase
            supported email, SMS, and push &mdash; check whether that's still true.
          </li>
          <li>
            <b>Check how many variants actually exist and are actually used today.</b> If SMS and
            push were both removed from the product eighteen months ago and only{" "}
            <code>EmailNotificationStrategy</code> remains, the interface now has exactly one
            implementation.
          </li>
          <li>
            <b>Decide whether the abstraction still earns its cost with the current variant count.</b>{" "}
            One implementation behind an interface, with no near-term second implementation
            planned, is a strong signal the abstraction can be collapsed back to a plain class.
          </li>
          <li>
            <b>Simplify deliberately, the same way the pattern was introduced deliberately.</b>{" "}
            Removing an unused abstraction is a real refactoring, not neglect &mdash; it deserves
            the same care as adding one did.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 110" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="15" width="150" height="30" rx="5" />
            <text className="boxText" x="95" y="34" fontSize="7">3 strategies, introduced for a reason</text>
            <line className="flow" x1="95" y1="50" x2="95" y2="70" />
            <rect className="boxWarn" x="20" y="70" width="150" height="30" rx="5" />
            <text className="boxText" x="95" y="89" fontSize="7">18 months later: only 1 remains</text>
            <line className="flow" x1="170" y1="85" x2="240" y2="60" />
            <text className="figHint" x="245" y="55">review:</text>
            <text className="figHint" x="245" y="68">still worth the interface?</text>
          </svg>
          <figcaption>A pattern justified by three variants may no longer be justified once only one variant remains.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Recognizing an abstraction that's outlived its reason</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Introduced when the product supported 3 channels
interface NotificationStrategy { void send(String message, User user); }
class EmailNotificationStrategy implements NotificationStrategy {
    public void send(String message, User user) { /* SMTP send */ }
}
// SmsNotificationStrategy and PushNotificationStrategy -- both removed from the product long ago

class NotificationService {
    private final NotificationStrategy strategy; // always EmailNotificationStrategy now, in practice
    NotificationService(NotificationStrategy strategy) { this.strategy = strategy; }
    void notify(String message, User user) { strategy.send(message, user); }
}

// After review: with no second channel planned, the interface is collapsed back to one class --
// simpler to read, and easy to reintroduce Strategy again if a real second channel returns.
class NotificationService {
    void notify(String message, User user) { /* SMTP send, directly */ }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Never revisiting a pattern decision once it's made.</b> Treating "we chose
            Strategy here" as permanent, regardless of whether the reason for choosing it still
            holds, leaves dead abstraction in the codebase indefinitely.
          </li>
          <li>
            <b>Removing an abstraction reflexively just because it currently has one implementation.</b>{" "}
            If a second implementation is genuinely planned soon, collapsing the interface now
            just means reintroducing it again shortly &mdash; context matters more than a
            snapshot count.
          </li>
          <li>
            <b>Simplifying without checking every call site depends only on the interface.</b>{" "}
            Collapsing an abstraction back to a concrete class can break callers that were
            correctly depending on the interface for testing or substitution reasons that still
            apply.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does reviewing <code>NotificationStrategy</code> eighteen months later potentially lead to removing it, even though introducing it was the right call at the time?</p>
          <p>
            <b>Answer:</b> The interface was justified by three real, varying implementations.
            Once SMS and push notifications were removed from the product, only{" "}
            <code>EmailNotificationStrategy</code> remains, meaning the interface no longer
            represents genuine variation &mdash; it's an abstraction over a single, fixed
            behavior. The cost of maintaining the interface (an extra type, an extra layer of
            indirection at every call site) is no longer offset by any real flexibility it
            provides, which is exactly the situation that justifies collapsing it back to a plain
            class.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A pattern decision deserves review as requirements change, not just judgment at the
        moment it's introduced &mdash; removing an abstraction that's outlived its reason is as
        deliberate and valuable a refactoring as adding one in the first place.
      </p>
    </div>
  );
}
