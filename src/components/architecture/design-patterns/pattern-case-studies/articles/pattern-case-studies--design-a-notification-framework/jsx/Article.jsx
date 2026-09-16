export default function PatternCaseStudiesDesignANotificationFrameworkArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A notification framework needs to send messages across several channels, format them
          differently per channel, and let new channels be added without touching existing code
          &mdash; a problem that, worked through step by step, points to a small combination of
          patterns rather than any single one covered in isolation.
        </p>
        <p>
          This case study walks the whole selection process end to end: naming the actual
          problems, considering candidates, and combining exactly two patterns because each
          solves a distinct piece of it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Working through the design, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Name the first problem: sending varies by channel.</b> Email, SMS, and push each
            need different delivery logic, and a new channel shouldn't require editing a shared
            method &mdash; this is Strategy's intent almost exactly.
          </li>
          <li>
            <b>Name the second problem: callers shouldn't juggle strategy selection themselves.</b>{" "}
            Application code wants to say "notify this user" without knowing which channels are
            enabled for them or how each one is constructed &mdash; a case for a Facade in front
            of the strategies.
          </li>
          <li>
            <b>Reject Observer even though notifications sound event-like.</b> The framework
            sends a specific message to specific recipients on request; it isn't broadcasting
            state changes to an unknown set of subscribers, so Observer's intent doesn't actually
            match.
          </li>
          <li>
            <b>Combine Strategy and Facade, each solving its own piece.</b> Strategy varies the
            per-channel sending logic; Facade hides the selection and coordination behind one
            simple <code>notify()</code> call.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="100" height="30" rx="5" />
            <text className="boxText" x="70" y="64" fontSize="8">Caller</text>
            <line className="flow" x1="120" y1="60" x2="180" y2="60" />
            <rect className="boxAccent" x="180" y="45" width="130" height="30" rx="5" />
            <text className="boxText" x="245" y="64" fontSize="8">NotificationFacade</text>
            <line className="flow" x1="310" y1="55" x2="370" y2="30" />
            <line className="flow" x1="310" y1="65" x2="370" y2="90" />
            <text className="figHint" x="375" y="25">EmailStrategy</text>
            <text className="figHint" x="375" y="95">SmsStrategy</text>
          </svg>
          <figcaption>The facade hides which strategies exist and how they're selected; the strategies hide how each channel actually sends.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Strategy and Facade, combined</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface NotificationChannelStrategy { void send(String message, User user); }

class EmailChannelStrategy implements NotificationChannelStrategy {
    public void send(String message, User user) { /* SMTP send */ }
}
class SmsChannelStrategy implements NotificationChannelStrategy {
    public void send(String message, User user) { /* SMS gateway send */ }
}
class PushChannelStrategy implements NotificationChannelStrategy {
    public void send(String message, User user) { /* push service send */ }
}

class NotificationFacade { // hides selection and coordination entirely
    private final Map<Channel, NotificationChannelStrategy> strategies = Map.of(
        Channel.EMAIL, new EmailChannelStrategy(),
        Channel.SMS, new SmsChannelStrategy(),
        Channel.PUSH, new PushChannelStrategy()
    );

    void notify(String message, User user) {
        for (Channel channel : user.enabledChannels()) {
            strategies.get(channel).send(message, user); // caller never sees this loop
        }
    }
}

// Usage: adding a fourth channel means one new strategy class and one map entry --
// NotificationFacade.notify() and every call site stay untouched.
NotificationFacade notifications = new NotificationFacade();
notifications.notify("Your order shipped", user);`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for Observer because "notification" sounds like the Observer pattern's domain.</b>{" "}
            The name is a coincidence; the actual problem here is targeted sending, not broadcast
            subscription to state changes.
          </li>
          <li>
            <b>Skipping the facade and exposing the strategy map directly to callers.</b> Every
            call site would then need to know which channels exist and loop over them itself,
            duplicating exactly the coordination logic the facade exists to centralize.
          </li>
          <li>
            <b>Adding an Abstract Factory for strategies that never vary as a family.</b> Each
            channel strategy is independent and unrelated to the others; there's no "family" of
            related objects that must be constructed together, so Abstract Factory's specific
            problem doesn't apply here.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does this design reject Observer even though "notification" is in the name of both the framework and the pattern?</p>
          <p>
            <b>Answer:</b> Observer's intent is broadcasting state changes to an open-ended set of
            subscribers that register interest in advance. This framework does the opposite: a
            caller explicitly requests that a specific message be sent to a specific user through
            that user's enabled channels. There's no subscription list and no state change being
            observed &mdash; matching on the word "notification" rather than on the actual
            problem would have led to the wrong pattern entirely.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A notification framework's actual problems &mdash; channel-varying send logic, and
        hiding channel selection from callers &mdash; point to Strategy plus Facade specifically,
        not to Observer, which the domain's name superficially suggests.
      </p>
    </div>
  );
}
