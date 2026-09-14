import "../css/Article.css";

export default function ApiPlatformDesignReviewsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A design review is the cheapest place to catch a bad API decision &mdash; before it's
          implemented, before a single partner has integrated, when changing course still costs a
          comment on a document instead of a breaking change and a migration.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Review the contract, not the implementation</b> &mdash; a design review happens on the API spec or design document, at step 6 of the design workflow covered earlier in this course, independent of any code.</li>
          <li><b>Use a real checklist</b> &mdash; resource modeling, naming and URI consistency, error shape, pagination, backward compatibility, security &mdash; the same topics this whole course has covered, applied deliberately rather than left to memory.</li>
          <li><b>Include an outside perspective</b> &mdash; at least one reviewer who didn't design the endpoint and can look at it the way a real consumer would, seeing it fresh.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Every new or changed Parcelly endpoint goes through design review before implementation
          begins, checked against a list drawn directly from this course's sections. This is
          exactly the process that caught the missing partial-return case back in the API-First
          Design lesson &mdash; a partner reviewer, reading the draft contract before any backend
          code existed, noticed the gap in an afternoon instead of after three partners had already
          integrated against the incomplete version.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 110" role="img" aria-label="Diagram placing design review at step six of the eight-step API design workflow: identify consumers, model resources, sketch endpoints, define schemas, review edge cases, then write it down and review it, before prototyping and implementation.">
          {["Model &\nsketch","Define\nschemas","Write it\ndown","REVIEW\nHERE","Prototype &\nimplement"].map((t,i) => (
            <g key={i}>
              <rect className={i===3 ? "boxAccent" : "box"} x={10 + i*86} y="30" width="76" height="50" rx="6" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={48 + i*86} y={52 + li*13} className="boxText" style={{fontSize:"6px"}}>{line}</text>
              ))}
              {i < 4 && <line className="flow" x1={86 + i*86} y1="55" x2={96 + i*86} y2="55" />}
            </g>
          ))}
        </svg>
        <figcaption>Review sits right after the contract is written down and before a single line of implementation exists &mdash; the cheapest possible point to catch a problem.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reviewing only for internal code quality or style, while skipping consumer-facing
          contract concerns entirely, misses the actual point of an API-specific review &mdash;
          those concerns need their own checklist, not a rename of a general code review. Treating
          design review as a one-time gate for brand-new endpoints only, skipping it for changes to
          existing ones, is the other common mistake: changes to an existing, already-adopted
          endpoint are exactly where breaking-change risk concentrates.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a design review on an already-published endpoint arguably higher-stakes than one on a brand-new endpoint nobody has integrated with yet?</p>
        </div>
      </section>
      <p className="takeaway">
        A checklist-driven review, done before implementation and repeated for every change to an
        existing contract, is what turns "we know these principles" into "we actually apply them,"
        consistently, under deadline pressure.
      </p>
    </div>
  );
}
