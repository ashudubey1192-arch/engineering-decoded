export default function ObjectDesignProgramToAnInterfaceArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          "Program to an interface, not an implementation" means code should depend on what an
          object can do, expressed as an interface or abstract type, rather than on which concrete
          class does it. This is the single most load-bearing principle in the entire pattern
          catalog &mdash; Strategy, Factory Method, Observer, Decorator, and most of the rest are
          specific structural applications of this one idea.
        </p>
        <p>
          The test is simple: can the concrete class behind a variable be swapped for another
          implementation of the same interface, with zero changes to the code that uses it?
        </p>
      </section>
      <section id="concepts">
        <h2>1. Applying the principle, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify what the calling code actually needs, as behavior.</b> A method that sends
            a receipt needs "something that can send a message," not specifically an{" "}
            <code>EmailSender</code>.
          </li>
          <li>
            <b>Extract that behavior as an interface, named for the capability.</b>{" "}
            <code>MessageSender</code>, with a <code>send(Message)</code> method &mdash; not named
            after any one implementation.
          </li>
          <li>
            <b>Declare variables, parameters, and fields using the interface type.</b> A field
            typed <code>MessageSender sender</code>, never <code>EmailSender sender</code>, even
            when only one implementation currently exists.
          </li>
          <li>
            <b>Let concrete implementations vary freely behind the interface.</b>{" "}
            <code>EmailSender</code>, <code>SmsSender</code>, and a test's{" "}
            <code>RecordingSender</code> can all satisfy the same calling code unchanged.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="150" y="20" width="160" height="40" rx="6" />
            <text className="boxText" x="230" y="45" fontSize="11">MessageSender</text>
            <text className="figLabel" x="230" y="12">interface</text>
            <rect className="box" x="30" y="100" width="110" height="40" rx="6" />
            <text className="boxText" x="85" y="125" fontSize="10">EmailSender</text>
            <rect className="box" x="175" y="100" width="110" height="40" rx="6" />
            <text className="boxText" x="230" y="125" fontSize="10">SmsSender</text>
            <rect className="box" x="320" y="100" width="120" height="40" rx="6" />
            <text className="boxText" x="380" y="125" fontSize="9">RecordingSender</text>
            <line className="flowMuted" x1="85" y1="100" x2="200" y2="60" />
            <line className="flowMuted" x1="230" y1="100" x2="230" y2="60" />
            <line className="flowMuted" x1="380" y1="100" x2="260" y2="60" />
          </svg>
          <figcaption>Calling code depends only on the interface at top; any number of implementations can satisfy it without that code changing.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Before and after</h2>
        <span className="codeLabel">JAVA &mdash; PROGRAMMED TO AN IMPLEMENTATION</span>
        <div className="codeBlock">
          <pre>{`class ReceiptService {
    private final EmailSender sender = new EmailSender(); // locked to one implementation
    void sendReceipt(Order order) { sender.send(order.toReceiptMessage()); }
}
// adding SMS receipts means editing ReceiptService itself`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; PROGRAMMED TO AN INTERFACE</span>
        <div className="codeBlock">
          <pre>{`interface MessageSender { void send(Message message); }

class ReceiptService {
    private final MessageSender sender; // any MessageSender works
    ReceiptService(MessageSender sender) { this.sender = sender; }
    void sendReceipt(Order order) { sender.send(order.toReceiptMessage()); }
}
// new ReceiptService(new SmsSender()) needs zero changes inside ReceiptService`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Extracting an interface with only one method that will only ever have one
            implementation.</b> Programming to an interface has a real cost (an extra type to
            maintain); it should be paid when substitution is a genuine, present need &mdash; the
            Forces and Trade-Offs article's discipline applies here too.
          </li>
          <li>
            <b>Naming the interface after its first implementation.</b>{" "}
            <code>EmailSenderInterface</code> defeats the purpose &mdash; the name should describe
            the capability, not the first class that happened to provide it.
          </li>
          <li>
            <b>Leaking implementation-specific methods onto the interface.</b> If{" "}
            <code>MessageSender</code> grows an <code>getSmtpConnection()</code> method, it has
            stopped being a true abstraction over "something that sends messages."
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What's the concrete test for whether <code>ReceiptService</code> is actually programmed to an interface, not an implementation?</p>
          <p>
            <b>Answer:</b> Whether a different <code>MessageSender</code> implementation
            (<code>SmsSender</code>, a test's <code>RecordingSender</code>) can be substituted in
            with zero changes to <code>ReceiptService</code>'s own code &mdash; only the value
            passed to its constructor changes.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Depend on what an object can do, not on which concrete class does it &mdash; this single
        habit is what makes most of the patterns later in this course possible in the first place.
      </p>
    </div>
  );
}
