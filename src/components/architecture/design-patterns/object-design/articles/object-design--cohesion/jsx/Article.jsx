export default function ObjectDesignCohesionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Cohesion is how closely related the responsibilities inside a single class are. A highly
          cohesive class does one job, and every method and field is there in service of that one
          job. Coupling, from the previous article, is about relationships between classes;
          cohesion is about whether what's inside one class actually belongs together. The two are
          related but distinct, and a design can be loosely coupled and still poorly cohesive.
        </p>
        <p>
          The practical test: can you describe the class's responsibility in one sentence, without
          using the word "and"?
        </p>
      </section>
      <section id="concepts">
        <h2>1. Assessing and improving cohesion, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Try to describe the class's job in one sentence.</b> "Calculates order totals and
            sends confirmation emails and logs analytics events" is three jobs wearing one class
            name.
          </li>
          <li>
            <b>Group methods and fields by which responsibility they actually serve.</b> In a low-
            cohesion class, this grouping reveals two or three clusters that barely reference each
            other.
          </li>
          <li>
            <b>Split each cluster into its own class, named after its single responsibility.</b>{" "}
            <code>OrderTotalCalculator</code>, <code>OrderConfirmationMailer</code>,{" "}
            <code>OrderAnalyticsLogger</code> &mdash; each with a name that needs no "and."
          </li>
          <li>
            <b>Recombine the split classes through composition at the call site.</b> Whatever
            originally called the one low-cohesion class now calls three focused ones &mdash;
            directly connecting back to Favor Composition earlier in this section.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="20" width="200" height="110" rx="8" />
            <text className="figLabel" x="120" y="14">low cohesion</text>
            <text className="boxText" x="120" y="45" fontSize="10">OrderProcessor</text>
            <text className="figHint" x="120" y="65">calculateTotal()</text>
            <text className="figHint" x="120" y="80">sendConfirmation()</text>
            <text className="figHint" x="120" y="95">logAnalytics()</text>
            <text className="figHint" x="120" y="110">three unrelated jobs</text>
            <line className="flow" x1="240" y1="75" x2="290" y2="75" />
            <rect className="boxAccent" x="290" y="20" width="180" height="110" rx="8" />
            <text className="figLabel" x="380" y="14">high cohesion</text>
            <text className="boxText" x="380" y="45" fontSize="9">TotalCalculator</text>
            <text className="boxText" x="380" y="65" fontSize="9">ConfirmationMailer</text>
            <text className="boxText" x="380" y="85" fontSize="9">AnalyticsLogger</text>
            <text className="figHint" x="380" y="105">three focused classes</text>
          </svg>
          <figcaption>One class doing three unrelated jobs, split into three classes that each do one.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Splitting a low-cohesion class</h2>
        <span className="codeLabel">JAVA &mdash; LOW COHESION</span>
        <div className="codeBlock">
          <pre>{`class OrderProcessor {
    double calculateTotal(Order order) { /* pricing logic */ return 0; }
    void sendConfirmation(Order order) { /* SMTP logic */ }
    void logAnalytics(Order order) { /* analytics client logic */ }
}
// changing the analytics vendor risks touching a class that also owns pricing`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; HIGH COHESION</span>
        <div className="codeBlock">
          <pre>{`class OrderTotalCalculator { double calculate(Order order) { return 0; } }
class OrderConfirmationMailer { void send(Order order) { /* SMTP logic */ } }
class OrderAnalyticsLogger { void log(Order order) { /* analytics client logic */ } }

class OrderProcessor { // now genuinely one job: orchestrate the other three
    OrderProcessor(OrderTotalCalculator calc, OrderConfirmationMailer mailer, OrderAnalyticsLogger logger) { /* ... */ }
}`}</pre>
        </div>
        <p>
          Changing the analytics vendor now touches only{" "}
          <code>OrderAnalyticsLogger</code> &mdash; pricing logic and email logic are structurally
          protected from that change.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Splitting classes so finely that a single, genuinely unified responsibility gets
            fragmented.</b> A class with one clear job doesn't need to be split into five one-
            method classes just to look more "focused."
          </li>
          <li>
            <b>Confusing cohesion with size.</b> A large class can be highly cohesive if every part
            genuinely serves one responsibility; a tiny class can still be low-cohesion if its two
            methods do unrelated things.
          </li>
          <li>
            <b>Grouping by technical layer instead of responsibility.</b> A class named{" "}
            <code>OrderUtils</code> holding every loosely-related order-adjacent helper method is
            a common low-cohesion pattern hiding behind an innocuous name.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is "calculates order totals and sends confirmation emails and logs analytics events" a sign of low cohesion, specifically because of the word "and"?</p>
          <p>
            <b>Answer:</b> Each "and" marks a separate responsibility bundled into the same class.
            A cohesive class's job should be describable without needing to connect multiple
            distinct responsibilities together &mdash; needing "and" to describe it means the
            class is doing more than one job.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A cohesive class does one describable job with everything inside it in service of that job
        &mdash; when a class's description needs "and," that's the seam to split along.
      </p>
    </div>
  );
}
