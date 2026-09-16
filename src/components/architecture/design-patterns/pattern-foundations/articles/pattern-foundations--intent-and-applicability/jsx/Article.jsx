export default function PatternFoundationsIntentAndApplicabilityArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Intent is the one- or two-sentence statement of the problem a pattern solves.
          Applicability is the set of conditions under which that solution is actually the right
          call. Together they are the two questions worth asking before writing a single line of
          a pattern's implementation: what does this solve, and does my situation actually match?
        </p>
        <p>
          Skipping straight to a pattern's structure without checking intent and applicability
          first is the single most common route to using a pattern where it doesn't belong.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Using intent and applicability together, step by step</h2>
        <ol className="stepList">
          <li>
            <b>State the intent in one sentence before looking at any code.</b> "Decorator: attach
            additional responsibilities to an object dynamically, without subclassing." If you
            can't state a candidate pattern's intent in one sentence, you don't understand it well
            enough to apply it yet.
          </li>
          <li>
            <b>Check applicability against your actual situation, point by point.</b> Decorator's
            applicability includes "responsibilities can be added and withdrawn at runtime" and
            "subclassing for each combination would be impractical" &mdash; both need to actually
            be true, not just plausible.
          </li>
          <li>
            <b>Notice when intent matches but applicability doesn't.</b> Two patterns can share
            almost identical intent (Strategy and State both swap behavior at runtime) while
            differing sharply in applicability (State's variants form one object's lifecycle;
            Strategy's don't).
          </li>
          <li>
            <b>Reject the pattern explicitly when applicability fails, rather than forcing it.</b>{" "}
            "This looks like Decorator but I only ever need one fixed combination of behaviors" is
            a legitimate, common conclusion &mdash; plain composition or a single class may serve
            better.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="200" height="45" rx="6" />
            <text className="boxText" x="120" y="47" fontSize="11">Intent matches the problem?</text>
            <line className="flow" x1="220" y1="42" x2="270" y2="42" />
            <rect className="box" x="270" y="20" width="210" height="45" rx="6" />
            <text className="boxText" x="375" y="47" fontSize="11">Applicability matches the situation?</text>
            <line className="flowMuted" x1="120" y1="65" x2="120" y2="105" />
            <text className="figHint" x="120" y="120">no &rarr; wrong pattern, keep looking</text>
            <line className="flow" x1="375" y1="65" x2="375" y2="105" />
            <text className="figHint" x="375" y="120">both yes &rarr; proceed to structure</text>
          </svg>
          <figcaption>Two independent gates &mdash; a pattern only earns implementation once both pass.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Applying both checks to one candidate</h2>
        <span className="codeLabel">JAVA &mdash; THE SITUATION</span>
        <div className="codeBlock">
          <pre>{`// A coffee shop's pricing: base drink plus any combination of add-ons
double price = basePrice;
if (order.hasMilk()) price += 0.50;
if (order.hasExtraShot()) price += 0.75;
if (order.hasSyrup()) price += 0.40;
// every new add-on means another if, and every combination is already possible today`}</pre>
        </div>
        <p>
          Intent check: Decorator's intent (attach responsibilities dynamically, without
          subclassing) matches &mdash; this is exactly about combining independent add-ons.
          Applicability check: add-ons genuinely combine in any order and any subset, and
          subclassing for every combination (MilkExtraShot, MilkSyrup, MilkExtraShotSyrup...)
          would be impractical &mdash; both conditions hold, so Decorator is a real candidate,
          worked out fully in its own article later in this course.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Matching on intent alone and skipping applicability.</b> Many patterns share
            similar-sounding intents; applicability is what actually differentiates them for your
            situation.
          </li>
          <li>
            <b>Treating applicability conditions as suggestions rather than checks.</b> If a
            documented applicability condition doesn't hold, the pattern is very likely the wrong
            choice, not a "close enough."
          </li>
          <li>
            <b>Deciding on a pattern from its name alone, without stating intent explicitly.</b>{" "}
            "This feels like it needs a Factory" without articulating why skips the one step that
            would catch a wrong guess early.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Two patterns can have nearly identical intent ("swap behavior at runtime") yet differ in applicability. What does checking applicability separately catch that checking intent alone would miss?</p>
          <p>
            <b>Answer:</b> Intent alone can match multiple patterns that solve superficially
            similar problems in structurally different ways. Applicability adds the situational
            conditions &mdash; do the variants represent one object's lifecycle, or interchangeable
            algorithms with no ordering between them &mdash; that actually determine which of the
            similar-sounding patterns fits.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Before implementing any pattern, state its intent in one sentence and check every
        applicability condition against your real situation &mdash; both have to pass, and a
        failure on either is a legitimate reason to look elsewhere.
      </p>
    </div>
  );
}
