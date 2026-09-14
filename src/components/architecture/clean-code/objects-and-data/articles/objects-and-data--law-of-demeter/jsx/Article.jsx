import "../css/Article.css";

export default function ObjectsAndDataLawOfDemeterArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          The Law of Demeter, often summarized as "don't talk to strangers," says a method
          should only call methods on itself, its own parameters, objects it creates, or its
          direct components &mdash; never reach through one object to get to another, and another,
          and another.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Train wrecks</b> &mdash; a chain like <code>invoice.getCustomer().getBillingAddress().getCountry().getTaxRegion()</code> reaches through three intermediate objects just to get one value, and is nicknamed a "train wreck" for its shape.</li>
          <li><b>Fragility from deep chains</b> &mdash; a change to any link in that chain &mdash; <code>getBillingAddress()</code> starts returning null for some customers, say &mdash; breaks every caller that reached through it, even ones that never cared about addresses directly.</li>
          <li><b>Ask, don't reach through</b> &mdash; instead of navigating an object's internals to compute something, ask the object itself to compute it: <code>invoice.getTaxRegion()</code>, with the traversal hidden inside.</li>
          <li><b>Not about chained method calls in general</b> &mdash; a fluent builder chain (<code>query.where(...).orderBy(...).limit(...)</code>) is fine, because each call returns the same kind of object; the Law of Demeter is specifically about reaching through unrelated objects to get at a distant one.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's tax calculation originally reached three objects deep to find a customer's
          tax region:
        </p>
        <span className="codeLabel">TRAIN WRECK</span>
        <div className="codeBlock">
          <pre>{`function calculateTax(invoice) {
  const region = invoice.getCustomer().getBillingAddress().getCountry().getTaxRegion();
  return applyTaxForRegion(invoice.subtotal, region);
}
// when Address was restructured to support multiple addresses per customer,
// getBillingAddress() started returning an array — this line broke, along
// with eleven other places that reached through the same chain`}</pre>
        </div>
        <span className="codeLabel">ASK, DON'T REACH THROUGH</span>
        <div className="codeBlock">
          <pre>{`function calculateTax(invoice) {
  const region = invoice.getCustomer().getTaxRegion(); // Customer hides its own traversal
  return applyTaxForRegion(invoice.subtotal, region);
}
class Customer {
  getTaxRegion() {
    return this.getPrimaryBillingAddress().getCountry().getTaxRegion();
  }
}`}</pre>
        </div>
        <p>
          When the address restructuring happened, only <code>Customer.getTaxRegion()</code>
          needed to change &mdash; to call <code>getPrimaryBillingAddress()</code> instead of
          <code>getBillingAddress()</code> &mdash; because every other caller asked
          <code>Customer</code> for the answer instead of reaching through it themselves.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a train wreck chain reaching through invoice, customer, address, and country to get a tax region, versus a single call to customer.getTaxRegion, which hides that same traversal inside one method.">
          <rect className="boxWarn" x="20" y="20" width="70" height="24" rx="4" /><text x="55" y="35" className="boxText" style={{fontSize:"4.5px"}}>invoice</text>
          <rect className="boxWarn" x="110" y="20" width="70" height="24" rx="4" /><text x="145" y="35" className="boxText" style={{fontSize:"4.5px"}}>.customer</text>
          <rect className="boxWarn" x="200" y="20" width="70" height="24" rx="4" /><text x="235" y="35" className="boxText" style={{fontSize:"4.5px"}}>.address</text>
          <rect className="boxWarn" x="290" y="20" width="100" height="24" rx="4" /><text x="340" y="35" className="boxText" style={{fontSize:"4.5px"}}>.country.region</text>
          <line className="flowMuted" x1="90" y1="32" x2="108" y2="32" /><line className="flowMuted" x1="180" y1="32" x2="198" y2="32" /><line className="flowMuted" x1="270" y1="32" x2="288" y2="32" />
          <rect className="boxAccent" x="130" y="70" width="160" height="26" rx="5" /><text x="210" y="87" className="boxText" style={{fontSize:"5px"}}>customer.getTaxRegion()</text>
        </svg>
        <figcaption>One four-object chain, callable from anywhere, versus one method call whose internal traversal only Customer needs to know about.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Applying the Law of Demeter mechanically to every chained call, including safe fluent
          interfaces that return the same type at every step, creates unnecessary indirection.
          The rule targets chains that punch through unrelated object boundaries &mdash; not every
          multi-call expression.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did restructuring Address only require a code change inside Customer, instead of at every one of the twelve call sites that needed a tax region?</p>
        </div>
      </section>
      <p className="takeaway">
        A method chain that reaches through several unrelated objects couples every caller to
        each link in that chain &mdash; ask the nearest object to do the traversal for you, and only
        that one object has to know how.
      </p>

    </div>
  );
}
