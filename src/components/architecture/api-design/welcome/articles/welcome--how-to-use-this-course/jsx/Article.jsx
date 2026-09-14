import "../css/Article.css";

export default function WelcomeHowToUseThisCourseArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Every lesson in this course follows the same five-part shape, on purpose &mdash; so you
          can read for concepts, skim for the example, or jump straight to the mistakes section
          when you already know the theory and just want the parts that trip people up.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Overview</b> &mdash; one or two sentences on what the lesson is actually about and why it matters.</li>
          <li><b>Core concepts</b> &mdash; the definitions and rules, stated precisely enough to apply, not just recognize.</li>
          <li><b>Practical example</b> &mdash; a concrete request, response, or scenario, usually from Parcelly's API, showing the concept in use.</li>
          <li><b>Common mistakes</b> &mdash; the specific ways teams get this wrong in real APIs, and why each one hurts.</li>
          <li><b>Knowledge check</b> &mdash; a question to test whether the concept actually transferred, not just the vocabulary.</li>
        </ul>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 110" role="img" aria-label="Diagram of the five-part lesson structure as a left-to-right pipeline: Overview, Core concepts, Practical example, Common mistakes, Knowledge check.">
          {["Overview","Concepts","Example","Mistakes","Check"].map((t,i) => (
            <g key={t}>
              <rect className={i===0 ? "boxAccent" : "box"} x={10 + i*86} y="30" width="76" height="34" rx="6" />
              <text x={48 + i*86} y="51" className="boxText" style={{fontSize:"6.5px"}}>{t}</text>
              {i < 4 && <line className="flow" x1={86 + i*86} y1="47" x2={96 + i*86} y2="47" />}
            </g>
          ))}
          <text x="220" y="90" className="figHint" style={{fontSize:"7px"}}>same five sections, every lesson, in every course track</text>
        </svg>
        <figcaption>Every lesson in this course, including this one, follows this exact shape.</figcaption>
      </figure>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          If you're evaluating a design decision on a real API right now, the fastest path through
          any lesson is: read the lead sentence for the one-line version, skip to
          <code>Common mistakes</code> to see if your situation matches one of them, and only read
          <code>Core concepts</code> in full if it doesn't. If you're learning the topic for the
          first time, read top to bottom &mdash; the example is written to make the concepts
          section concrete, not to repeat it.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating every lesson as equally load-bearing wastes time &mdash; some sections (resource
          modeling, versioning, idempotency) shape every other decision in an API and reward a slow
          first read; others, like one specific header convention, are fine to reference later when
          you actually need them. Reading this course without ever trying the example requests
          against a real or mocked API is the second-biggest waste: the mistakes section will make
          far more sense once you've felt the awkwardness firsthand.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>If you're mid-review of a colleague's new endpoint and want to sanity-check it fast, which part of a relevant lesson would you read first, and why?</p>
        </div>
      </section>
      <p className="takeaway">
        This course is a reference as much as a read-through &mdash; the five-part structure is
        consistent specifically so you can jump in at whichever part answers the question you
        actually have.
      </p>
    </div>
  );
}
