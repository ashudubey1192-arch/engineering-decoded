import "../css/Article.css";

export default function ClassesAndModulesLowCouplingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Coupling measures how much one class needs to know about another to work with it. Low
          coupling means a class can change its internals, or be swapped for a different
          implementation entirely, without forcing changes anywhere else.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Depend on the abstraction, not the concrete class</b> &mdash; where an implementation is likely to vary, such as a payment provider or a mail service, code against an interface rather than a specific provider.</li>
          <li><b>Tight coupling blocks testing</b> &mdash; a class that constructs a real network client inside its own methods cannot be tested without that client actually running.</li>
          <li><b>High cohesion inside, low coupling between</b> &mdash; the two properties are not in tension; the goal is classes that are internally tight and externally loosely connected.</li>
          <li><b>Concrete coupling is fine where nothing varies</b> &mdash; coupling to a built-in type like an array or a date is not a problem; the concern is coupling to things that plausibly change.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>InvoiceService</code>, before and after depending on an interface
          instead of a specific provider:
        </p>
        <span className="codeLabel">TIGHTLY COUPLED TO A CONCRETE PROVIDER</span>
        <div className="codeBlock">
          <pre>{`class InvoiceService {
  sendReminder(invoice) {
    const mailer = new SendGridMailer(process.env.SENDGRID_KEY); // concrete, hardcoded
    return mailer.send(invoice.customer.email, "Reminder", buildReminderText(invoice));
  }
}
// testing this requires a real SendGrid client;
// switching providers means editing InvoiceService itself`}</pre>
        </div>
        <span className="codeLabel">COUPLED ONLY TO AN INTERFACE</span>
        <div className="codeBlock">
          <pre>{`class InvoiceService {
  constructor(mailer) { this.mailer = mailer; } // depends on an interface, not a provider
  sendReminder(invoice) {
    return this.mailer.send(invoice.customer.email, "Reminder", buildReminderText(invoice));
  }
}
// tests pass in a FakeMailer that just records calls;
// switching from SendGrid to Postmark means writing one new Mailer, InvoiceService is untouched`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of several classes each directly coupled to a concrete SendGridMailer implementation, all needing changes if the provider is swapped, versus several classes coupled only to a thin Mailer interface, with the concrete provider swappable behind it.">
          <rect className="box" x="20" y="15" width="100" height="24" rx="4" /><text x="70" y="31" className="boxText" style={{fontSize:"4.2px"}}>InvoiceService</text>
          <rect className="box" x="20" y="50" width="100" height="24" rx="4" /><text x="70" y="66" className="boxText" style={{fontSize:"4.2px"}}>ReminderJob</text>
          <rect className="boxWarn" x="200" y="32" width="140" height="24" rx="4" /><text x="270" y="48" className="boxText" style={{fontSize:"4.2px"}}>SendGridMailer (concrete)</text>
          <line className="flowMuted" x1="120" y1="27" x2="198" y2="40" />
          <line className="flowMuted" x1="120" y1="62" x2="198" y2="44" />
          <rect className="box" x="20" y="90" width="100" height="24" rx="4" /><text x="70" y="106" className="boxText" style={{fontSize:"4.2px"}}>InvoiceService</text>
          <rect className="boxAccent" x="200" y="90" width="100" height="24" rx="4" /><text x="250" y="106" className="boxText" style={{fontSize:"4.2px"}}>Mailer (interface)</text>
          <rect className="box" x="330" y="90" width="80" height="24" rx="4" /><text x="370" y="106" className="boxText" style={{fontSize:"4.2px"}}>SendGridMailer</text>
          <line className="flow" x1="120" y1="102" x2="198" y2="102" />
          <line className="flowMuted" x1="300" y1="102" x2="328" y2="102" />
        </svg>
        <figcaption>Coupling directly to a concrete provider ties every caller to it; coupling to a thin interface keeps the provider swappable behind a stable seam.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Introducing an interface for every single class "in case it's needed later," including
          ones with exactly one implementation and no plausible reason to swap, adds a layer of
          indirection that buys nothing. Reserve interfaces for dependencies that genuinely vary
          or need a fake in tests.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why couldn't InvoiceService be tested without a real SendGrid client in the original version, and what changed once it depended on a Mailer interface instead?</p>
        </div>
      </section>
      <p className="takeaway">
        Depend on interfaces where an implementation might vary or needs a fake in tests, and on
        concrete types everywhere else &mdash; low coupling means changing one class doesn't force
        changes in the classes that use it.
      </p>

    </div>
  );
}
