export default function RefactoringToPatternsIntroduceFactoryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Introduce Factory takes object-construction logic that's scattered across a codebase
          &mdash; the same <code>new SomeClass(...)</code> call with the same setup, repeated in
          several places &mdash; and consolidates it into a single factory method or class, so a
          later change to how that object gets built only needs to happen once.
        </p>
        <p>
          This is the refactoring path into Creational Patterns' Factory Method and Abstract
          Factory: those articles cover the resulting structure; this one covers recognizing
          when scattered constructor calls have become a maintenance problem worth fixing.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The refactoring, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Find repeated, non-trivial construction logic.</b> Several places in the codebase
            each build an <code>HttpClient</code> with the same five configuration calls chained
            after <code>new HttpClient()</code>.
          </li>
          <li>
            <b>Extract that logic into one factory method.</b> A static{" "}
            <code>HttpClientFactory.createDefault()</code> method containing exactly that
            construction sequence, written once.
          </li>
          <li>
            <b>Replace every call site with a call to the factory.</b> Each of the scattered{" "}
            <code>new HttpClient()...</code> chains becomes{" "}
            <code>HttpClientFactory.createDefault()</code>.
          </li>
          <li>
            <b>Let future changes to construction happen in one place.</b> Adding a new default
            timeout, say, now means editing the factory method once instead of finding and
            editing every call site.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="15" width="140" height="25" rx="5" />
            <text className="boxText" x="90" y="32" fontSize="7">new HttpClient()... (call site A)</text>
            <rect className="boxWarn" x="20" y="50" width="140" height="25" rx="5" />
            <text className="boxText" x="90" y="67" fontSize="7">new HttpClient()... (call site B)</text>
            <rect className="boxWarn" x="20" y="85" width="140" height="25" rx="5" />
            <text className="boxText" x="90" y="102" fontSize="7">new HttpClient()... (call site C)</text>
            <line className="flow" x1="160" y1="28" x2="230" y2="60" />
            <line className="flow" x1="160" y1="63" x2="230" y2="63" />
            <line className="flow" x1="160" y1="98" x2="230" y2="66" />
            <rect className="boxAccent" x="230" y="45" width="150" height="40" rx="6" />
            <text className="boxText" x="305" y="69" fontSize="8">HttpClientFactory</text>
          </svg>
          <figcaption>Three duplicated construction sequences collapse into one factory method, called from all three places.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Before and after</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Before: the same five-line setup duplicated at every call site
class OrderClient {
    private final HttpClient http = new HttpClient()
        .withTimeout(Duration.ofSeconds(5)).withRetries(3).withCompression(true);
}
class PaymentClient {
    private final HttpClient http = new HttpClient()
        .withTimeout(Duration.ofSeconds(5)).withRetries(3).withCompression(true); // duplicated
}

// After: one factory method, called wherever an HttpClient is needed
class HttpClientFactory {
    static HttpClient createDefault() {
        return new HttpClient()
            .withTimeout(Duration.ofSeconds(5)).withRetries(3).withCompression(true);
    }
}

class OrderClient {
    private final HttpClient http = HttpClientFactory.createDefault();
}
class PaymentClient {
    private final HttpClient http = HttpClientFactory.createDefault(); // no duplication left
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Introducing a factory for a single, trivial <code>new</code> call.</b> A
            one-argument constructor called from one place doesn't need a factory wrapped around
            it; the indirection adds a lookup with nothing to consolidate.
          </li>
          <li>
            <b>Stopping halfway, leaving some call sites still constructing directly.</b> A
            factory that only some code paths use means a future change to construction logic
            still has to be applied in two places instead of one.
          </li>
          <li>
            <b>Turning the factory into a dumping ground for unrelated setup logic.</b> A factory
            method should build one kind of object consistently, not become a catch-all
            initialization routine for unrelated concerns.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>After introducing <code>HttpClientFactory.createDefault()</code>, what has to change to add a sixth configuration option (say, a default header) to every client in the codebase?</p>
          <p>
            <b>Answer:</b> Only <code>HttpClientFactory.createDefault()</code> itself needs to
            change &mdash; add the new configuration call inside that one method, and every
            caller (<code>OrderClient</code>, <code>PaymentClient</code>, and any others) picks
            up the change automatically the next time it's built. Before the refactoring, the
            same change would have required finding and editing every duplicated construction
            block across the codebase.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Introduce Factory consolidates duplicated construction logic into one place &mdash;
        worth it once the same non-trivial setup is repeated across call sites, not for a single
        straightforward constructor call.
      </p>
    </div>
  );
}
