export default function WelcomeHowToPracticePatternsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Reading a pattern's definition and being able to recognize when your own code needs it
          are different skills, and only the second one is useful. This article covers a concrete
          practice routine: spotting pattern-shaped problems in code you already have, rather than
          hunting for places to insert a pattern you just learned.
        </p>
        <p>
          The instinct to insert a freshly-learned pattern everywhere is strong and almost always
          wrong &mdash; the routine below is built specifically to counter it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A practice routine, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Start from a real symptom, not a pattern name.</b> "This class has a huge switch
            statement that grows every time we add a feature" is a symptom; "I should use
            Strategy" is a conclusion you jump to only after the symptom is clear.
          </li>
          <li>
            <b>Name the forces at play before reaching for a solution.</b> What varies? What stays
            fixed? Who needs to add a new variant later, and how often? The Forces and Trade-Offs
            article, later in this section, is the deeper version of this step.
          </li>
          <li>
            <b>Sketch two candidate patterns, not one.</b> A growing switch statement might call
            for Strategy or for State, depending on whether the branches represent interchangeable
            behavior or a single object's lifecycle &mdash; picking between them is a skill in its
            own right, covered fully in the Selecting Patterns section.
          </li>
          <li>
            <b>Implement the smallest version, then check if the code actually got clearer.</b> A
            pattern that adds three new classes and no clarity was the wrong call, regardless of
            how faithfully it matches the textbook diagram.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="45" width="120" height="50" rx="8" />
            <text className="boxText" x="80" y="68" fontSize="11">Symptom</text>
            <text className="figHint" x="80" y="85">growing switch</text>
            <line className="flow" x1="140" y1="70" x2="190" y2="70" />
            <rect className="box" x="190" y="45" width="120" height="50" rx="8" />
            <text className="boxText" x="250" y="68" fontSize="11">Name forces</text>
            <line className="flow" x1="310" y1="70" x2="360" y2="70" />
            <rect className="boxAccent" x="360" y="45" width="140" height="50" rx="8" />
            <text className="boxText" x="430" y="68" fontSize="11">Candidate patterns</text>
          </svg>
          <figcaption>Practice starts from a real symptom in code you already have, not from a pattern name looking for a home.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Applying the routine to one real symptom</h2>
        <span className="codeLabel">JAVA &mdash; THE SYMPTOM</span>
        <div className="codeBlock">
          <pre>{`public void process(Notification n) {
    if (n.getType() == NotificationType.EMAIL) { sendEmail(n); }
    else if (n.getType() == NotificationType.SMS) { sendSms(n); }
    else if (n.getType() == NotificationType.PUSH) { sendPush(n); }
    // a fourth branch gets added almost every quarter
}`}</pre>
        </div>
        <p>
          Naming the forces: the branches are interchangeable ways of doing the same job (deliver
          a notification), not stages of one object's life &mdash; that points toward Strategy
          over State, worked through fully once that pattern is covered later in this course.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Practicing by inserting a pattern into code that doesn't need one.</b> This builds
            the habit of forcing patterns rather than recognizing where they fit, which the
            Avoiding Pattern Overuse article covers as a real cost, not a harmless exercise.
          </li>
          <li>
            <b>Stopping at "which pattern matches this diagram" instead of "does this actually
            help."</b> A textbook-faithful implementation that makes the code harder to follow has
            failed at the actual goal.
          </li>
          <li>
            <b>Practicing only on toy examples, never on real, messy code.</b> Real code rarely
            matches a textbook example exactly; the valuable skill is adapting a pattern to an
            imperfect fit, not just reciting eleven canonical wire diagrams.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the practice routine start from a symptom in real code rather than from a pattern name?</p>
          <p>
            <b>Answer:</b> Starting from a pattern name tends to produce code that inserts the
            pattern regardless of fit, which is exactly the overuse this course warns against.
            Starting from a real symptom and naming the actual forces at play means the pattern,
            if one applies at all, is chosen because it solves a problem that's actually there.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Practice by recognizing pattern-shaped symptoms in real code, naming the forces at play,
        and checking whether the pattern actually clarified anything &mdash; not by hunting for
        places to insert whatever you just read about.
      </p>
    </div>
  );
}
