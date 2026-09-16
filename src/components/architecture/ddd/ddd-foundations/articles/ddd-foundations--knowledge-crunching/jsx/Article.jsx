export default function DddFoundationsKnowledgeCrunchingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Knowledge crunching is Eric Evans's term for the messy, iterative process of turning a
          domain expert's raw knowledge into a model precise enough to code against. It is
          deliberately not called "requirements gathering" &mdash; gathering implies the knowledge
          already exists in usable form. It rarely does.
        </p>
        <p>
          A Cargoflow operations manager can tell you, fluently, what happens when a shipment gets
          stuck at customs. They cannot hand you a class diagram for it. Crunching is the work of
          getting from one to the other, together, through repeated small conversations.
        </p>
      </section>
      <section id="concepts">
        <h2>1. What crunching looks like in practice</h2>
        <ol className="stepList">
          <li>
            <b>Ask for a concrete example, not a definition.</b> "Walk me through a shipment that
            got delayed at customs last week" produces better material than "how does customs
            delay work?"
          </li>
          <li>
            <b>Play the model back in the expert's language.</b> "So a shipment can be
            HeldAtCustoms while still IN_TRANSIT, and only Ops can release it?" Experts correct
            wrong models faster than they can specify right ones from scratch.
          </li>
          <li>
            <b>Sketch, discard, resketch.</b> The first model is a hypothesis. Expect to redraw the
            Shipment/Leg boundary two or three times as new examples surface exceptions.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>A CRUNCHING SESSION, CONDENSED</small>
          <p>
            "So when customs holds a shipment, does the delivery deadline pause?" &mdash; "Yes,
            but only for international legs, and only if we filed the hold notice within 24
            hours." That single follow-up question turned a boolean flag
            (<code>heldAtCustoms</code>) into three real pieces of state: the hold itself, whether
            it was reported on time, and which leg it applies to.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="55" width="160" height="55" rx="8" />
            <text className="boxText" x="100" y="88">Raw knowledge</text>
            <rect className="boxAccent" x="220" y="55" width="160" height="55" rx="8" />
            <text className="boxText" x="300" y="88">Playback &amp; correction</text>
            <rect className="boxAccent" x="420" y="55" width="160" height="55" rx="8" />
            <text className="boxText" x="500" y="88">Sharper model</text>
            <line className="flow" x1="180" y1="82" x2="220" y2="82" />
            <line className="flow" x1="380" y1="82" x2="420" y2="82" />
            <path className="flowMuted" d="M500,110 C500,145 100,145 100,110" />
          </svg>
          <figcaption>Crunching loops: each playback either confirms the model or surfaces the next exception.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. How the model changed after crunching</h2>
        <span className="codeLabel">JAVA &mdash; BEFORE THE FOLLOW-UP QUESTION</span>
        <div className="codeBlock">
          <pre>{`class Leg {
    boolean heldAtCustoms; // loses "which rules apply" information
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; AFTER CRUNCHING THE EXAMPLE</span>
        <div className="codeBlock">
          <pre>{`class Leg {
    private CustomsHold customsHold; // null when not held
}

record CustomsHold(Instant heldAt, boolean reportedWithin24Hours, boolean pausesDeadline) {
    static CustomsHold report(Instant heldAt, Instant reportedAt) {
        boolean onTime = Duration.between(heldAt, reportedAt).toHours() <= 24;
        return new CustomsHold(heldAt, onTime, onTime);
    }
}`}</pre>
        </div>
        <p>
          The single follow-up question replaced a lossy boolean with a small value object that
          can answer the question that actually matters to Ops: does this hold pause the deadline?
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Treating one long requirements meeting as sufficient.</b> Crunching is ongoing; the
            model keeps sharpening as new examples surface, not just during a kickoff.
          </li>
          <li>
            <b>Modeling from documentation instead of examples.</b> Policy documents describe the
            intended process; real examples reveal the exceptions that actually happen.
          </li>
          <li>
            <b>Letting engineers crunch alone and present a finished model.</b> Playback only works
            if the domain expert is in the room to correct it.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is "play the model back in the expert's language" an effective crunching technique?</p>
          <p>
            <b>Answer:</b> Domain experts are usually much better at recognizing an incorrect
            statement about their domain than at specifying a correct model from a blank page.
            Playback turns modeling into correction, which is a faster feedback loop.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Knowledge crunching is iterative playback against concrete examples, not a one-time
        requirements document &mdash; each round should sharpen the model, not just confirm it.
      </p>
    </div>
  );
}
