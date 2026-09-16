export default function PatternFoundationsPatternLanguageArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A pattern language is the standard template the Gang of Four used to document every
          pattern in their catalog: Name, Intent, Motivation, Applicability, Structure,
          Participants, Consequences. Learning this template once means every pattern in this
          course &mdash; and every pattern you encounter outside it &mdash; can be read the same
          way, instead of each write-up needing to be parsed from scratch.
        </p>
        <p>
          This article is the key to reading the rest of this course efficiently: every remaining
          pattern article implicitly follows this shape, even where the section headers differ
          slightly.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The template, section by section</h2>
        <ol className="stepList">
          <li>
            <b>Name.</b> The shared vocabulary term &mdash; "Strategy," "Adapter" &mdash; that lets
            a team communicate a whole structure in one word.
          </li>
          <li>
            <b>Intent.</b> A one- or two-sentence statement of the problem the pattern solves,
            covered in depth in the next article.
          </li>
          <li>
            <b>Motivation.</b> A concrete scenario showing the problem occurring, and why a naive
            solution falls short &mdash; the "why this pattern exists" story.
          </li>
          <li>
            <b>Applicability.</b> The conditions under which this pattern is the right call,
            covered alongside Intent in the next article.
          </li>
          <li>
            <b>Structure and Participants.</b> The class diagram and the named roles each
            participating class or interface plays.
          </li>
          <li>
            <b>Consequences.</b> The trade-offs &mdash; what the pattern buys you, and what it
            costs &mdash; covered in the Forces and Trade-Offs article next.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="10" y="20" width="80" height="35" rx="5" />
            <text className="boxText" x="50" y="42" fontSize="9">Name</text>
            <rect className="box" x="100" y="20" width="80" height="35" rx="5" />
            <text className="boxText" x="140" y="42" fontSize="9">Intent</text>
            <rect className="box" x="190" y="20" width="90" height="35" rx="5" />
            <text className="boxText" x="235" y="42" fontSize="9">Motivation</text>
            <rect className="box" x="290" y="20" width="100" height="35" rx="5" />
            <text className="boxText" x="340" y="42" fontSize="9">Applicability</text>
            <rect className="box" x="400" y="20" width="80" height="35" rx="5" />
            <text className="boxText" x="440" y="35" fontSize="8">Structure /</text>
            <text className="boxText" x="440" y="46" fontSize="8">Participants</text>
            <rect className="boxAccent" x="490" y="20" width="70" height="35" rx="5" />
            <text className="boxText" x="525" y="42" fontSize="9">Consequences</text>
            <line className="flow" x1="50" y1="55" x2="50" y2="90" />
            <text className="figLabel" x="280" y="100">this course's sections: overview / concepts / example / mistakes</text>
          </svg>
          <figcaption>The GoF template, and how this course's fixed 5-section article format maps onto it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Reading a short pattern language entry</h2>
        <span className="codeLabel">PATTERN LANGUAGE &mdash; WORKED EXAMPLE</span>
        <div className="codeBlock">
          <pre>{`Name: Adapter
Intent: Convert the interface of a class into another interface clients expect.
Motivation: A payment library exposes chargeCard(cents, token); our code expects
            a PaymentProcessor.charge(Money amount) interface everywhere else.
Applicability: Use when you need to use an existing class whose interface doesn't
               match what your code needs, and you can't or don't want to modify it.
Structure: Adapter implements the target interface, wraps the adaptee, translates calls.
Consequences: + isolates the mismatch in one place. - adds an extra layer of indirection.`}</pre>
        </div>
        <p>
          Every field here maps directly onto what the full Adapter article, later in this course,
          expands into a working Java example &mdash; the template is what makes that expansion
          predictable before you've even read it.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reading only the Structure diagram and skipping Motivation.</b> The diagram shows
            the "what"; the motivation is what makes the "why" concrete enough to recognize later
            in your own code.
          </li>
          <li>
            <b>Treating Consequences as an afterthought.</b> The trade-offs section is often the
            most decision-relevant part &mdash; it's what tells you when not to use a pattern that
            otherwise looks like a fit.
          </li>
          <li>
            <b>Assuming every pattern write-up you encounter elsewhere will use this exact
            template.</b> Many will use a shortened or reordered version; recognizing the same
            underlying fields under different headers is the actual transferable skill.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the pattern language template separate "Applicability" from "Consequences" instead of combining them into one "pros and cons" section?</p>
          <p>
            <b>Answer:</b> Applicability describes the conditions under which the pattern is a
            candidate solution at all &mdash; a precondition check. Consequences describe what you
            gain and pay once you've already decided to apply it. Keeping them separate lets a
            reader first ask "does this even fit my situation" before weighing costs and benefits
            that only matter if it does.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Learn the pattern language template once, and every pattern &mdash; in this course or
        elsewhere &mdash; becomes readable through the same lens: name, intent, motivation,
        applicability, structure, and consequences.
      </p>
    </div>
  );
}
