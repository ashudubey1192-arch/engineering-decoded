import "../css/Article.css";

export default function ApiFoundationsApiDesignWorkflowArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Good API design isn't a moment of inspiration before writing code &mdash; it's a
          repeatable sequence of steps, each one catching a different category of mistake before it
          gets expensive to fix.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ol className="stepList">
          <li><b>Identify consumers and use cases</b> &mdash; who's calling this, and what are they actually trying to accomplish?</li>
          <li><b>Model the resources</b> &mdash; what are the nouns, and how do they relate to each other?</li>
          <li><b>Sketch the endpoints</b> &mdash; which operations does each resource need, and which HTTP methods fit them?</li>
          <li><b>Define request and response schemas</b> &mdash; field names, types, required vs. optional, error shape.</li>
          <li><b>Review edge cases</b> &mdash; pagination, empty states, partial failures, concurrent updates.</li>
          <li><b>Write it down</b> &mdash; an OpenAPI spec or equivalent, reviewable by consumers before code exists.</li>
          <li><b>Prototype against a mock</b> &mdash; let real or simulated consumers integrate against the contract before the backend is finished.</li>
          <li><b>Implement, then version deliberately</b> &mdash; build it, and treat every future change as a decision, not an accident.</li>
        </ol>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          When Parcelly designed bulk shipment creation, skipping straight to step 3 would have
          produced an endpoint shaped like the existing single-shipment one, just accepting an
          array. Step 1 &mdash; talking to the two partners who actually requested it &mdash;
          revealed they needed per-item success/failure reporting, because a batch of 200 shipments
          partially failing shouldn't reject the other 199. That single finding from step 1 changed
          the response shape designed in step 4 completely, from a simple array echo to a per-item
          results list with individual status codes.
        </p>
        <table className="miniTable">
          <caption>WHERE MISTAKES GET CAUGHT</caption>
          <thead><tr><th>Skip this step&hellip;</th><th>&hellip;and this mistake survives to production</th></tr></thead>
          <tbody>
            <tr><td>Identify consumers</td><td>Building for an imagined use case instead of the real one</td></tr>
            <tr><td>Review edge cases</td><td>No defined behavior for partial batch failure or empty results</td></tr>
            <tr><td>Prototype against a mock</td><td>Consumers discover integration problems only after backend is "done"</td></tr>
          </tbody>
        </table>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of the eight-step workflow condensed into four visual phases: Discover, Model, Define, and Ship, flowing left to right.">
          {["Discover\n(step 1)","Model\n(steps 2-3)","Define\n(steps 4-6)","Ship\n(steps 7-8)"].map((t,i) => (
            <g key={i}>
              <rect className={i===0 ? "boxAccent" : "box"} x={15 + i*105} y="35" width="90" height="50" rx="7" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={60 + i*105} y={57 + li*13} className="boxText" style={{fontSize:"6.5px"}}>{line}</text>
              ))}
              {i < 3 && <line className="flow" x1={105 + i*105} y1="60" x2={117 + i*105} y2="60" />}
            </g>
          ))}
          <text x="220" y="110" className="figHint" style={{fontSize:"6.5px"}}>each phase catches a different category of mistake before it ships</text>
        </svg>
        <figcaption>The eight steps group into four phases &mdash; each one exists to catch a mistake the next one would make more expensive.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Jumping from "identify consumers" straight to "write the OpenAPI spec," skipping resource
          modeling as a distinct step, is the most common shortcut &mdash; it tends to produce
          endpoints shaped like whatever screen a UI designer had in mind, rather than resources
          that make sense on their own. Treating step 6 (writing it down) as the finish line rather
          than step 7 (prototyping against real consumers) is the second: a spec that reads well is
          not the same as a spec that's pleasant to actually integrate against.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did talking to Parcelly's partners before designing the response shape change the bulk-creation endpoint more than any later step could have?</p>
        </div>
      </section>
      <p className="takeaway">
        Every step in this workflow exists because skipping it lets a specific kind of mistake
        survive to production, where it's dramatically more expensive to fix. Treat the sequence as
        a checklist, not a formality.
      </p>
    </div>
  );
}
