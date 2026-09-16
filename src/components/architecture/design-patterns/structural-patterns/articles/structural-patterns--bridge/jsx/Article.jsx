export default function StructuralPatternsBridgeArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Bridge decouples an abstraction from its implementation so the two can vary
          independently, instead of being locked together in one inheritance hierarchy. Where
          Adapter reconciles two interfaces that already exist, Bridge is designed in from the
          start, specifically to prevent a combinatorial explosion when both "what" and "how" need
          to vary separately.
        </p>
        <p>
          Intent: separate an abstraction from its implementation so both can change
          independently. Applicability: a class has two independent dimensions of variation that
          would otherwise multiply into a subclass per combination.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Recognizing two independent dimensions, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Find two things varying independently inside one hierarchy.</b> A{" "}
            <code>Notification</code> hierarchy with subclasses for both message type (
            <code>OrderNotification</code>, <code>AlertNotification</code>) and delivery channel
            (<code>EmailNotification</code>, <code>SmsNotification</code>) multiplies into
            <code> OrderEmailNotification</code>, <code>OrderSmsNotification</code>,{" "}
            <code>AlertEmailNotification</code>, and so on.
          </li>
          <li>
            <b>Split the abstraction (message type) from the implementation (delivery
            channel).</b> <code>Notification</code> becomes the abstraction; a separate{" "}
            <code>MessageSender</code> interface becomes the implementation side.
          </li>
          <li>
            <b>Have the abstraction hold a reference to the implementation, not extend it.</b>{" "}
            <code>Notification</code> holds a <code>MessageSender</code> field, connecting the two
            sides via composition &mdash; the "bridge" itself.
          </li>
          <li>
            <b>Let each side grow independently.</b> A new message type doesn't touch any{" "}
            <code>MessageSender</code> implementation, and a new delivery channel doesn't touch
            any <code>Notification</code> subclass.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="20" width="150" height="40" rx="6" />
            <text className="boxText" x="105" y="45" fontSize="10">Notification</text>
            <text className="boxText" x="60" y="90" fontSize="9">OrderNotif</text>
            <text className="boxText" x="150" y="90" fontSize="9">AlertNotif</text>
            <line className="flowMuted" x1="60" y1="80" x2="80" y2="60" />
            <line className="flowMuted" x1="150" y1="80" x2="130" y2="60" />
            <line className="flow" x1="180" y1="40" x2="280" y2="40" />
            <rect className="box" x="280" y="20" width="150" height="40" rx="6" />
            <text className="boxText" x="355" y="45" fontSize="10">MessageSender</text>
            <text className="boxText" x="310" y="90" fontSize="9">EmailSender</text>
            <text className="boxText" x="400" y="90" fontSize="9">SmsSender</text>
            <line className="flowMuted" x1="310" y1="80" x2="330" y2="60" />
            <line className="flowMuted" x1="400" y1="80" x2="380" y2="60" />
          </svg>
          <figcaption>The bridge (horizontal arrow) connects two independently growing hierarchies &mdash; two message types times two channels needs only four classes, not four.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Two dimensions, connected by composition</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface MessageSender { void send(String content); } // the implementation side
class EmailSender implements MessageSender { public void send(String c) { /* SMTP */ } }
class SmsSender implements MessageSender { public void send(String c) { /* SMS gateway */ } }

abstract class Notification { // the abstraction side
    protected final MessageSender sender; // the bridge: held, not extended
    Notification(MessageSender sender) { this.sender = sender; }
    abstract void notify(String detail);
}
class OrderNotification extends Notification {
    OrderNotification(MessageSender sender) { super(sender); }
    void notify(String detail) { sender.send("Order update: " + detail); }
}
class AlertNotification extends Notification {
    AlertNotification(MessageSender sender) { super(sender); }
    void notify(String detail) { sender.send("ALERT: " + detail); }
}

// any message type with any channel, freely combined
new OrderNotification(new SmsSender()).notify("shipped");
new AlertNotification(new EmailSender()).notify("payment failed");`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Applying Bridge when only one dimension actually varies.</b> If every notification
            only ever goes by email, there's no second dimension yet &mdash; a plain hierarchy or
            no hierarchy at all is simpler.
          </li>
          <li>
            <b>Confusing Bridge with Strategy.</b> They look structurally similar (composition
            over an interface), but Bridge is specifically about separating two hierarchies that
            both have their own subclass variation; Strategy is about swapping one algorithm.
          </li>
          <li>
            <b>Letting the abstraction reach into implementation-specific details.</b> If{" "}
            <code>OrderNotification</code> starts checking whether its sender is specifically an{" "}
            <code>EmailSender</code>, the independence Bridge is meant to guarantee has already
            broken down.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Without Bridge, why does adding a third message type and a third delivery channel to the original single hierarchy require far more new classes than with Bridge?</p>
          <p>
            <b>Answer:</b> A single hierarchy with one subclass per combination needs a new class
            for every pairing of message type and channel &mdash; three types times three channels
            means nine subclasses. With Bridge, the two dimensions vary independently: a third
            message type is one new <code>Notification</code> subclass, and a third channel is one
            new <code>MessageSender</code> implementation &mdash; two new classes total, not nine.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Bridge when two independent dimensions of variation are locked together in one
        hierarchy &mdash; split them, connect them with composition, and let each grow on its own.
      </p>
    </div>
  );
}
