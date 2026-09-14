import "../css/Article.css";

export default function TestingReadableTestsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A test suite is the one piece of documentation guaranteed to be checked on every
          build &mdash; unlike a comment or a wiki page, an inaccurate test simply fails. Making that
          documentation genuinely readable is what lets someone new understand a system by
          reading its tests.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>A test should read without cross-referencing other files</b> &mdash; a reader who has to open a shared setup helper to understand what's being tested has to work too hard.</li>
          <li><b>Push irrelevant detail into a builder</b> &mdash; a small helper that constructs a valid object with sensible defaults lets each test override only the field or two it actually cares about.</li>
          <li><b>Some duplication keeps a test self-contained</b> &mdash; repeating a short setup line across several tests can be more readable than a shared method that hides what each test does.</li>
          <li><b>Write for the person investigating a red build</b> &mdash; months from now, with no memory of writing the test, and often not the original author.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's late-fee test, before and after moving incidental setup into a builder:
        </p>
        <span className="codeLabel">SIX LINES OF SETUP, TWO THAT MATTER</span>
        <div className="codeBlock">
          <pre>{`test("late fee test", () => {
  const customer = new Customer("c1", "Acme Co", "acme@example.com", "US", "net-30", true, 0);
  const invoice = new Invoice("inv1", customer, [], "2024-01-01", "2024-01-31", false);
  invoice.lineItems.push(new LineItem("Consulting", 1, 500000));
  invoice.dueDate = "2024-01-31";
  invoice.paidDate = null;
  const fee = calculateLateFee(invoice, new Date("2024-02-15"));
  expect(fee).toBe(25000);
});
// which of these lines actually matters for a late-fee test?`}</pre>
        </div>
        <span className="codeLabel">A BUILDER SURFACES WHAT MATTERS</span>
        <div className="codeBlock">
          <pre>{`test("charges a 5% late fee 15 days past the due date", () => {
  const invoice = anInvoice({ total: 500000, dueDate: "2024-01-31" }); // builder fills in the rest
  const fee = calculateLateFee(invoice, asOf("2024-02-15"));
  expect(fee).toBe(25000);
});
// only the two fields this test actually cares about are visible`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a test with six lines of setup where only two are relevant to what is being tested, versus a test using a builder helper that surfaces only the two relevant fields and hides the rest as sensible defaults.">
          <rect className="boxWarn" x="20" y="10" width="180" height="90" rx="4" />
          <text x="30" y="26" className="boxText" style={{fontSize:"4px"}}>new Customer(...)</text>
          <text x="30" y="38" className="boxText" style={{fontSize:"4px"}}>new Invoice(...)</text>
          <text x="30" y="50" className="boxText" style={{fontSize:"4px"}}>lineItems.push(...)</text>
          <text x="30" y="62" className="boxText" style={{fontSize:"4px", fontWeight:700}}>dueDate = "2024-01-31"</text>
          <text x="30" y="74" className="boxText" style={{fontSize:"4px"}}>paidDate = null</text>
          <text x="30" y="86" className="boxText" style={{fontSize:"4px", fontWeight:700}}>total = 500000</text>
          <text x="110" y="108" className="figHint" style={{fontSize:"4.2px"}}>only 2 of 6 lines matter</text>
          <rect className="boxAccent" x="250" y="35" width="150" height="40" rx="4" />
          <text x="260" y="52" className="boxText" style={{fontSize:"4.5px"}}>total: 500000</text>
          <text x="260" y="65" className="boxText" style={{fontSize:"4.5px"}}>dueDate: "2024-01-31"</text>
        </svg>
        <figcaption>A builder with sensible defaults lets a test show only the fields it actually cares about.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Extracting one shared setup method used by a dozen unrelated tests optimizes for DRY at
          the cost of readability &mdash; a reader investigating one failing test now has to open a
          separate method to learn what state it starts from. Small, obvious duplication is often
          the more readable choice in test code.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a builder that fills in sensible defaults make a test more readable than a shared setup method used by many unrelated tests?</p>
        </div>
      </section>
      <p className="takeaway">
        Write tests for the person reading a failing one &mdash; a small builder that surfaces only
        the relevant fields beats either a wall of setup code or a shared method that hides what's
        actually being tested.
      </p>

    </div>
  );
}
