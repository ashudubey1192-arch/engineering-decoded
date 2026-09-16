export default function DomainsAndSubdomainsGenericSubdomainsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A generic subdomain solves a problem every company in every industry has already
          solved. Authentication, email delivery, PDF generation, payment processing &mdash;
          Cargoflow needs all of these, and none of them says anything specific about freight
          logistics. The right move is almost always to buy or adopt an existing solution.
        </p>
        <p>
          Generic subdomains are the easiest DDD decision of the three: spend the least possible
          engineering effort here, because effort spent is effort not spent on the core domain.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Recognizing a generic subdomain</h2>
        <ul className="stepList">
          <li>
            <b>Other companies, in unrelated industries, have the exact same need.</b> A
            hospital's authentication problem and Cargoflow's authentication problem are
            identical.
          </li>
          <li>
            <b>A mature off-the-shelf product already solves it well.</b> If a well-supported
            library or SaaS product exists, building your own is pure opportunity cost.
          </li>
          <li>
            <b>No one would ever describe it as "the reason we win deals."</b> If a sentence like
            that does not fit naturally, it is very unlikely to be core.
          </li>
        </ul>
        <table className="miniTable">
          <caption>CARGOFLOW'S GENERIC SUBDOMAINS</caption>
          <thead><tr><th>Need</th><th>Buy instead of build</th></tr></thead>
          <tbody>
            <tr><td>Authentication &amp; SSO</td><td>Auth0 / Okta</td></tr>
            <tr><td>Payment processing</td><td>Stripe</td></tr>
            <tr><td>Transactional email</td><td>SendGrid</td></tr>
            <tr><td>PDF invoice rendering</td><td>An off-the-shelf PDF library</td></tr>
          </tbody>
        </table>
        <figure className="fig">
          <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="45" width="180" height="60" rx="8" />
            <text className="boxText" x="120" y="72">Generic need</text>
            <text className="figHint" x="120" y="92">(auth, email, PDF)</text>
            <line className="flow" x1="210" y1="75" x2="330" y2="75" />
            <rect className="boxAccent" x="330" y="45" width="180" height="60" rx="8" />
            <text className="boxText" x="420" y="72">Off-the-shelf product</text>
            <text className="figHint" x="420" y="92">adopt, integrate, move on</text>
          </svg>
          <figcaption>The default move for a generic subdomain is a straight line to an existing product, not a custom domain model.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Wrapping a generic subdomain thinly</h2>
        <p>
          The Java code here is deliberately unglamorous &mdash; a thin adapter around a
          third-party SDK, not a domain model:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class SendGridEmailSender implements EmailSender {
    private final SendGridClient client;

    public SendGridEmailSender(SendGridClient client) {
        this.client = client;
    }

    @Override
    public void send(EmailAddress to, String subject, String body) {
        client.send(new SendGridMessage(to.value(), subject, body));
    }
}`}</pre>
        </div>
        <p>
          No aggregates, no domain events, no elaborate abstraction &mdash; the adapter exists
          only so the domain code can depend on a small <code>EmailSender</code> interface instead
          of the SendGrid SDK directly.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Building a custom authentication system "to save on vendor cost."</b> The
            engineering hours spent maintaining it almost always exceed the subscription fee, and
            it is pure risk with no differentiation upside.
          </li>
          <li>
            <b>Applying full tactical DDD to a generic subdomain anyway.</b> Aggregates and domain
            events around an email adapter add ceremony with nothing to protect.
          </li>
          <li>
            <b>Misclassifying a supporting subdomain as generic because it feels tedious.</b>{" "}
            Billing is tedious but Cargoflow-specific; that makes it supporting, not generic.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Cargoflow's engineering lead wants to build a custom authentication system instead of using Auth0, arguing "we understand our users best." Good idea?</p>
          <p>
            <b>Answer:</b> Almost certainly not. Authentication is a generic subdomain &mdash;
            other companies in unrelated industries already solved it well, and building it custom
            diverts effort from the core domain for no differentiating benefit.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Generic subdomains are solved problems &mdash; buy or adopt, invest the smallest
        reasonable effort, and redirect the saved time toward the core domain.
      </p>
    </div>
  );
}
