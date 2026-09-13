import "../css/Article.css";

export default function WelcomeHowToUseThisCourseArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Every lesson in this course follows the same five-part shape, on purpose &mdash; once you
          know the shape, you can pull exactly the part you need instead of reading linearly every
          time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Overview</b> &mdash; one paragraph: what this is and why it exists, in plain terms.</li>
          <li><b>Core concepts</b> &mdash; the actual mechanism: what moves, what decides, what the moving parts are called.</li>
          <li><b>Practical example</b> &mdash; a concrete, named scenario with real specifics (service names, requests, numbers) &mdash; never left abstract.</li>
          <li><b>Common mistakes</b> &mdash; the specific ways people misuse or misapply this in a real codebase.</li>
          <li><b>Knowledge check</b> &mdash; one question that only makes sense if you understood the mechanism, not just the definition.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Say you already understand what a circuit breaker is conceptually, but you're trying to
          decide whether your <code>PaymentService</code> client needs one this week. Skip straight
          to that lesson's <b>Practical example</b> and <b>Common mistakes</b> sections &mdash; they're
          written to be useful on their own, without re-reading the overview you already know.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 100" role="img" aria-label="Diagram of the five-part reading path of a lesson: Overview, then Core Concepts, then Practical Example, then Common Mistakes, then Knowledge Check, shown as a left-to-right sequence.">
          {["Overview","Concepts","Example","Mistakes","Check"].map((t,i) => (
            <g key={t}>
              <rect className={i===2 ? "boxAccent" : "box"} x={10 + i*86} y="30" width="72" height="34" rx="6" />
              <text x={46 + i*86} y="51" className="boxText" style={{fontSize:"7px"}}>{t}</text>
              {i < 4 && <line className="flow" x1={82 + i*86} y1="47" x2={94 + i*86} y2="47" />}
            </g>
          ))}
        </svg>
        <figcaption>The same five-part path in every lesson &mdash; jump straight to whichever part you actually need.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reading only the overview and skipping the practical example is the most common way to
          come away with a definition you can recite but can't actually apply &mdash; the example is
          where the mechanism gets concrete. The second is skipping the knowledge-check question
          because it "feels optional": it's deliberately written so that guessing without
          understanding the mechanism doesn't work, which makes it a fast, honest check on whether a
          lesson actually landed.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>If you already understand a concept and just need to decide whether to apply it to a specific service this week, which two of the five sections should you read first?</p>
        </div>
      </section>
      <p className="takeaway">
        Use the five-part shape as a menu, not a mandatory sequence &mdash; the fastest way through
        this course is reading exactly the section you're missing, not always starting from the top.
      </p>
    </div>
  );
}
