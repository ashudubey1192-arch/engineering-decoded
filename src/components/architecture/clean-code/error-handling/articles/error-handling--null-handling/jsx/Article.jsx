import "../css/Article.css";

export default function ErrorHandlingNullHandlingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Tony Hoare, who introduced the null reference in 1965, later called it his "billion
          dollar mistake." Every function that can return null quietly obligates every caller
          to remember to check for it &mdash; and callers reliably forget.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Null is an invisible extra case</b> &mdash; a function typed to return a <code>Customer</code> that sometimes returns null is really returning "a Customer, or nothing," but only one of those cases is visible in the type.</li>
          <li><b>Prefer not returning null at all</b> &mdash; an empty array instead of null for "no results," or a default/empty object instead of null for "not found," often removes the need for a null check entirely.</li>
          <li><b>Use an explicit optional type where the language supports it</b> &mdash; a type like <code>Customer | null</code>, or an <code>Optional</code>/<code>Maybe</code> wrapper, makes the "might be absent" case visible and checkable at compile time instead of only at runtime.</li>
          <li><b>Never pass null as an argument by convention</b> &mdash; a function that silently accepts null and does something different is asking every caller to remember an undocumented special case.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's customer lookup, before and after removing an unnecessary null case:
        </p>
        <span className="codeLabel">NULL AS A SILENT EXTRA CASE</span>
        <div className="codeBlock">
          <pre>{`function findActiveDiscounts(customer) {
  return customer.discounts.filter((d) => d.active); // works fine...
}
function getCustomer(id) {
  return database.customers.find((c) => c.id === id) || null;
}
// three months later, a new call site forgets the null case:
const discounts = findActiveDiscounts(getCustomer(unknownId));
// TypeError: Cannot read properties of null (reading 'discounts')`}</pre>
        </div>
        <span className="codeLabel">NULL CASE ELIMINATED WHERE POSSIBLE</span>
        <div className="codeBlock">
          <pre>{`function getCustomerOrGuest(id) {
  return database.customers.find((c) => c.id === id) || Customer.GUEST; // never null
}
// Customer.GUEST is a real, well-formed Customer with discounts: []
const discounts = findActiveDiscounts(getCustomerOrGuest(unknownId)); // returns [], no crash`}</pre>
        </div>
        <p>
          For the cases where "customer genuinely was not found" must be distinguishable from
          "a guest customer," an explicit <code>Customer | null</code> return type (or an
          <code>Optional</code> wrapper) would be the right tool &mdash; the key fix either way is
          making the absent case impossible to silently forget.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a function's declared return type promising a Customer while its real behavior sometimes returns null, an invisible extra case that a caller who trusts the declared type will not check for.">
          <rect className="box" x="30" y="15" width="150" height="26" rx="4" /><text x="105" y="32" className="boxText" style={{fontSize:"5px"}}>Declared: returns Customer</text>
          <rect className="boxWarn" x="240" y="15" width="150" height="26" rx="4" /><text x="315" y="32" className="boxText" style={{fontSize:"5px"}}>Reality: Customer or null</text>
          <text x="210" y="32" className="figHint" style={{fontSize:"8px"}}>&#8800;</text>
          <rect className="boxWarn" x="120" y="65" width="180" height="26" rx="4" /><text x="210" y="82" className="boxText" style={{fontSize:"5px"}}>Caller trusts declared type, crashes</text>
        </svg>
        <figcaption>An undeclared null case is an invisible mismatch between what a function promises and what it actually returns.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reflexively adding a null check at every call site, instead of asking whether the
          function should return null in the first place, treats the symptom repeatedly rather
          than removing the cause once. Every added null check is one more place a future
          engineer can forget to add the next one.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is returning a real "guest" Customer object often a better fix than adding a null check at every call site?</p>
        </div>
      </section>
      <p className="takeaway">
        Treat every null-returning function as a hidden extra case in its own contract &mdash; remove
        it where you can with a sensible default, and make it explicit and impossible to ignore
        where you cannot.
      </p>

    </div>
  );
}
