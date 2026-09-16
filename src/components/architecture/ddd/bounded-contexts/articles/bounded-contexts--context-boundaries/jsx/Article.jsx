export default function BoundedContextsContextBoundariesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A model boundary (previous article) is a design decision. A context boundary is where
          that decision becomes real in your system &mdash; a deployment unit, a database, an API
          surface, or at minimum a package that nothing outside it imports directly.
        </p>
        <p>
          This article covers the concrete forms a context boundary takes at Cargoflow, from
          loosest to strictest, and how to pick the right one for a given context.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Three levels of enforcement, weakest to strongest</h2>
        <ol className="stepList">
          <li>
            <b>Package boundary, same deployable.</b> Booking and Support both currently live in
            one Java application, but in separate packages with an architecture test (ArchUnit)
            failing the build on a cross-package import that skips the public interface.
          </li>
          <li>
            <b>Separate deployable, shared database.</b> Fleet &amp; Routing runs as its own
            service, but still shares Cargoflow's primary database &mdash; boundary enforced in
            code, not yet in storage.
          </li>
          <li>
            <b>Separate deployable, separate database.</b> Billing has its own service and its own
            database; the only way in is its published API. This is the strictest and most
            expensive form.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>WHY CARGOFLOW USES ALL THREE</small>
          <p>
            Support started inside the Booking deployable because splitting it out wasn't worth
            the operational cost yet &mdash; a package boundary was enough. Billing needed
            independent scaling and its own compliance requirements around payment data, which
            justified a fully separate database from day one.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="40" width="160" height="90" rx="8" />
            <text className="boxText" x="100" y="70">Package boundary</text>
            <text className="figHint" x="100" y="90">cheapest, weakest</text>
            <rect className="boxAccent" x="220" y="40" width="160" height="90" rx="8" />
            <text className="boxText" x="300" y="70">Separate deploy</text>
            <text className="figHint" x="300" y="90">shared DB</text>
            <rect className="boxWarn" x="420" y="40" width="160" height="90" rx="8" />
            <text className="boxText" x="500" y="70">Separate deploy</text>
            <text className="boxText" x="500" y="88">+ separate DB</text>
            <text className="figHint" x="500" y="106">strongest, costliest</text>
          </svg>
          <figcaption>Pick the cheapest enforcement level that still protects the boundary the domain actually needs.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Enforcing a package boundary in code</h2>
        <span className="codeLabel">JAVA &mdash; ARCHITECTURE TEST</span>
        <div className="codeBlock">
          <pre>{`@ArchTest
static final ArchRule booking_does_not_reach_into_support_internals =
    noClasses().that().resideInAPackage("..booking..")
        .should().dependOnClassesThat().resideInAPackage("..support.internal..");`}</pre>
        </div>
        <p>
          Even without separate deployables, this test fails the build the moment someone imports
          a Support internal class from Booking &mdash; the boundary is real even at the cheapest
          enforcement level.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Jumping straight to separate services for every context.</b> The operational cost
            of a full split is real; match the enforcement level to the actual need.
          </li>
          <li>
            <b>Declaring a boundary in a diagram with no enforcement in code.</b> Without a test or
            deployment constraint backing it, a documented boundary erodes within months.
          </li>
          <li>
            <b>Never upgrading enforcement as a context grows.</b> Support may eventually need its
            own deployable; the package boundary is a starting point, not a permanent ceiling.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does Billing get a fully separate database while Support only gets a package boundary?</p>
          <p>
            <b>Answer:</b> Billing has independent scaling and compliance needs around payment
            data that justify the stronger, costlier enforcement. Support's needs so far are met
            by the cheaper package-level boundary.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A model boundary only holds if something enforces it in the running system &mdash; choose
        the cheapest enforcement level that genuinely protects the boundary you drew.
      </p>
    </div>
  );
}
