import "../css/Article.css";

export default function CreationalPatternsFactoryMethodPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Factory Method defines an interface for creating an object, but lets subclasses decide
          which concrete class actually gets instantiated &mdash; calling code depends on an
          abstract product type, never a specific class.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          An abstract <code>Creator</code> class declares a factory method that returns some
          abstract <code>Product</code> type; each concrete <code>Creator</code> subclass overrides
          that method to return its own matching concrete <code>Product</code> subclass. The result
          is a parallel hierarchy &mdash; one Creator subclass per Product subclass &mdash; which is
          the pattern's most recognizable visual signature.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>NotificationFactory</code> with <code>EmailNotificationFactory</code> and
          <code>SmsNotificationFactory</code> subclasses, each overriding
          <code>createNotification()</code> to return an <code>EmailNotification</code> or
          <code>SmsNotification</code> respectively. Calling code just asks whichever factory it
          was handed for &ldquo;a notification&rdquo; and calls <code>send()</code> on it &mdash;
          no if/else on notification type anywhere in that calling code.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a parallel hierarchy: an abstract Creator and Product at the top, with EmailNotificationFactory and SmsNotificationFactory each producing their own matching Notification subtype." >
          <rect className="box" x="30" y="15" width="150" height="24" rx="5" /><text x="105" y="31" className="boxText" style={{fontSize:"7px"}}>NotificationFactory</text>
          <rect className="box" x="240" y="15" width="150" height="24" rx="5" /><text x="315" y="31" className="boxText" style={{fontSize:"7px"}}>Notification</text>
          <line className="flow" x1="180" y1="27" x2="235" y2="27" />
          <line className="flowMuted" x1="70" y1="39" x2="70" y2="60" /><line className="flowMuted" x1="140" y1="39" x2="140" y2="60" />
          <rect className="boxAccent" x="30" y="65" width="90" height="26" rx="5" /><text x="75" y="82" className="boxText" style={{fontSize:"6.5px"}}>EmailFactory</text>
          <rect className="boxAccent" x="130" y="65" width="90" height="26" rx="5" /><text x="175" y="82" className="boxText" style={{fontSize:"6.5px"}}>SmsFactory</text>
          <line className="flowMuted" x1="290" y1="39" x2="290" y2="60" /><line className="flowMuted" x1="360" y1="39" x2="360" y2="60" />
          <rect className="boxAccent" x="245" y="65" width="90" height="26" rx="5" /><text x="290" y="82" className="boxText" style={{fontSize:"6.5px"}}>Email</text>
          <rect className="boxAccent" x="345" y="65" width="90" height="26" rx="5" /><text x="390" y="82" className="boxText" style={{fontSize:"6.5px"}}>Sms</text>
        </svg>
        <figcaption>Each concrete factory produces its own matching product subtype &mdash; the parallel-hierarchy signature of Factory Method.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using Factory Method where a plain constructor call would do &mdash; with no subclass
          logic that actually varies &mdash; adds a hierarchy for no real benefit. Confusing it
          with Abstract Factory is common too: Factory Method produces one product via a subclass
          override, while Abstract Factory produces a whole family of related products via
          composition, which the next article covers directly.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the "parallel hierarchy" that Factory Method produces, and why is it the pattern's most recognizable trait?</p>
        </div>
      </section>
      <p className="takeaway">
        Factory Method lets subclasses choose which concrete product gets built &mdash; useful only
        when that choice genuinely varies by subclass, not as a default way to construct objects.
      </p>
    </div>
  );
}
