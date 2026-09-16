export default function PatternSelectionIdentifyTheDesignProblemArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Choosing a pattern starts with naming the actual problem in the code &mdash; not "which
          pattern should I use," but "what specifically is hard to change, test, or understand
          here right now." A pattern is a means to an end; without a clearly named problem, it's
          easy to reach for a pattern that solves a problem the code doesn't actually have.
        </p>
        <p>
          This section closes the course by returning to the practice routine from How to
          Practice Patterns: start from symptoms in the code, not from a mental list of pattern
          names, and let the symptom point toward the family of patterns worth considering.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Naming the problem, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Describe the pain in plain language first.</b> "Every time we add a payment
            method, we have to edit this same 200-line class" &mdash; no pattern names yet, just
            the actual friction.
          </li>
          <li>
            <b>Classify what kind of friction it is.</b> Is it: behavior that varies by type
            (often Strategy or State)? Object construction getting complicated (Creational
            patterns)? Two incompatible interfaces needing to work together (Adapter)? Many
            objects that need to be treated uniformly (Composite)?
          </li>
          <li>
            <b>Check whether the friction is real or hypothetical.</b> "We might someday need
            three more payment methods" is weaker evidence than "we've added four payment
            methods in the last year, each requiring the same edit."
          </li>
          <li>
            <b>Only then look at candidate patterns whose intent matches.</b> Once the problem is
            named precisely, a pattern is chosen because its intent matches that specific
            problem, not because it's a well-known pattern that seems to fit somewhere.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="130" height="35" rx="6" />
            <text className="boxText" x="85" y="68" fontSize="8">Symptom in the code</text>
            <line className="flow" x1="150" y1="62" x2="210" y2="62" />
            <rect className="boxAccent" x="210" y="45" width="130" height="35" rx="6" />
            <text className="boxText" x="275" y="68" fontSize="8">Named problem</text>
            <line className="flow" x1="340" y1="62" x2="400" y2="62" />
            <text className="figHint" x="345" y="52">candidate</text>
            <text className="figHint" x="345" y="80">patterns</text>
          </svg>
          <figcaption>Pattern selection starts from a symptom, moves through a precisely named problem, and only then reaches candidate patterns.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. From symptom to precisely named problem</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Symptom: this method has grown a new branch for every notification channel added this year
class NotificationSender {
    void send(String channel, String message, User user) {
        if (channel.equals("email")) { /* SMTP setup, format, send */ }
        else if (channel.equals("sms")) { /* SMS gateway setup, format, send */ }
        else if (channel.equals("push")) { /* push service setup, format, send */ }
        // a 4th channel means editing this method again
    }
}

// Naming the problem precisely: "behavior (how to send) varies by a type discriminator (channel),
// and every new type requires editing this shared method" -- this is Strategy's exact intent:
// "define a family of algorithms, encapsulate each one, make them interchangeable."

// Not: "let's use Strategy because it's a well-known pattern"
// But: "the problem is exactly what Strategy's intent describes, so Strategy is a strong candidate"`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Starting from a pattern name instead of the problem.</b> "This looks like a good
            place for a Decorator" without first naming what's actually wrong risks fitting the
            code to the pattern rather than the reverse.
          </li>
          <li>
            <b>Naming the problem too vaguely to test against a pattern's intent.</b> "The code
            is messy" doesn't point anywhere; "the code has five different things happening in
            one method with no clear owner for any of them" does.
          </li>
          <li>
            <b>Skipping straight to a solution before confirming the problem is real, not
            hypothetical.</b> Designing in a pattern for change that may never come is exactly
            what pattern overuse looks like.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does naming the problem as "behavior varies by a type discriminator, and every new type requires editing a shared method" lead more reliably to Strategy than starting with "I think this needs a design pattern"?</p>
          <p>
            <b>Answer:</b> A precisely named problem can be directly compared against a
            pattern's stated intent &mdash; Strategy's intent is exactly "encapsulate a family
            of interchangeable algorithms," which matches the named problem almost word for word.
            Starting from "this needs a pattern" has no such comparison to make, so it's easy to
            reach for whatever pattern is top of mind rather than the one whose intent actually
            fits.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Pattern selection starts with naming the actual, current problem in plain language
        &mdash; the pattern is chosen afterward, because its intent matches that problem, not
        because the pattern is familiar or the code merely looks like it could use one.
      </p>
    </div>
  );
}
