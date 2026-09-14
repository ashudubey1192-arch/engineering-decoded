import "../css/Article.css";

export default function CleanCodeFoundationsTechnicalDebtArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Ward Cunningham coined "technical debt" as a metaphor: shipping a quick, imperfect
          solution is like taking out a loan &mdash; it buys speed now, at the cost of interest paid
          in every future change until the debt is paid down.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Principal and interest</b> &mdash; the principal is the cost of doing it right the first time; the interest is the extra effort every future change pays because it wasn't.</li>
          <li><b>Deliberate vs. inadvertent debt</b> &mdash; a distinction popularized by Martin Fowler: debt taken on knowingly ("we'll refactor this after the demo") versus debt incurred without realizing it (not knowing a better design existed).</li>
          <li><b>Reckless vs. prudent debt</b> &mdash; crossed with the above: prudent-deliberate debt is a considered trade-off; reckless-deliberate debt is "we don't have time for good design," taken without weighing the cost.</li>
          <li><b>Debt is not always bad</b> &mdash; prudent, deliberate debt taken to validate an idea quickly, then paid down once it proves out, is a legitimate strategy &mdash; the danger is debt that is never tracked or repaid.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly needed to support a new payment provider within a week for a single large
          customer. The team hardcoded that customer's provider choice directly into
          <code>PaymentGateway</code> instead of building a proper provider-selection abstraction:
        </p>
        <span className="codeLabel">DELIBERATE, TRACKED DEBT</span>
        <div className="codeBlock">
          <pre>{`// TODO(debt): hardcoded for customer #4821 launch, 2026-08-01.
// Replace with ProviderRegistry once a second provider is needed.
// Tracking: LEDG-1092
function selectProvider(customer) {
  if (customer.id === "cust_4821") return new AcmePayProvider();
  return new DefaultStripeProvider();
}`}</pre>
        </div>
        <p>
          This is debt, but it is the good kind: deliberate, scoped, dated, and linked to a
          ticket that will resurface it. Three months later, when a second large customer
          needs a different provider, the comment is exactly what tells the team where to look
          and what to replace &mdash; paying the debt down before it compounds further.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Two by two grid comparing deliberate versus inadvertent debt on one axis and reckless versus prudent debt on the other, with prudent-deliberate debt marked as the acceptable quadrant.">
          <line className="divider" x1="210" y1="15" x2="210" y2="115" />
          <line className="divider" x1="20" y1="65" x2="400" y2="65" />
          <text x="115" y="12" className="figLabel" style={{fontSize:"5px"}}>Reckless</text>
          <text x="305" y="12" className="figLabel" style={{fontSize:"5px"}}>Prudent</text>
          <text x="8" y="42" className="figLabel" style={{fontSize:"5px"}} transform="rotate(-90 8 42)">Deliberate</text>
          <text x="8" y="105" className="figLabel" style={{fontSize:"5px"}} transform="rotate(-90 8 105)">Inadvertent</text>
          <rect className="boxWarn" x="30" y="20" width="170" height="40" rx="4" /><text x="115" y="42" className="boxText" style={{fontSize:"5px"}}>"No time for design"</text>
          <rect className="boxAccent" x="220" y="20" width="170" height="40" rx="4" /><text x="305" y="42" className="boxText" style={{fontSize:"5px"}}>Ledgerly's tracked TODO</text>
          <rect className="box" x="30" y="70" width="170" height="40" rx="4" /><text x="115" y="92" className="boxText" style={{fontSize:"5px"}}>Bad habits</text>
          <rect className="box" x="220" y="70" width="170" height="40" rx="4" /><text x="305" y="92" className="boxText" style={{fontSize:"5px"}}>"Now we know better"</text>
        </svg>
        <figcaption>Ledgerly's hardcoded provider lands in the prudent-deliberate quadrant: a considered trade-off, tracked for repayment.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Untracked debt is the real danger, not debt itself. A shortcut taken without a comment,
          a ticket, or any record becomes invisible &mdash; nobody remembers it was a shortcut, so it
          never gets revisited, and it quietly becomes the permanent design.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What made Ledgerly's hardcoded payment provider "prudent" debt rather than "reckless" debt, given that both involve skipping a proper abstraction?</p>
        </div>
      </section>
      <p className="takeaway">
        Technical debt taken on knowingly, scoped narrowly, and tracked for repayment is a
        legitimate tool &mdash; the failure mode is debt nobody remembers taking on.
      </p>

    </div>
  );
}
