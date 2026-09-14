import "../css/Article.css";

export default function WelcomeHowToPracticeCleanCodeArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Reading about clean code changes how you talk about code. Practicing it changes how
          you write code. The difference shows up under deadline pressure, which is exactly
          when clean code habits either hold or evaporate.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Deliberate practice on old code</b> &mdash; open a file you wrote months ago before you knew better, and try to improve one thing without changing its behavior.</li>
          <li><b>Code katas</b> &mdash; small, repeatable exercises (like a bowling-game scorer or a string calculator) done more than once, focusing on a different principle each time.</li>
          <li><b>Review with intent</b> &mdash; when reviewing a teammate's pull request, ask specifically "could I safely change this in six months?" rather than only checking correctness.</li>
          <li><b>Small, continuous refactors</b> &mdash; the Boy Scout Rule in practice: every time you touch a file for a feature or bug fix, leave one thing about it cleaner.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A realistic weekly practice loop, applied to Ledgerly's codebase by its two-person team:
        </p>
        <ol className="stepList">
          <li><b>Monday</b> &mdash; before starting a new feature, spend 15 minutes renaming anything confusing in the file you are about to touch.</li>
          <li><b>Wednesday</b> &mdash; during code review, leave at least one comment that references a specific clean code principle by name (e.g. "this function has two levels of abstraction mixed together").</li>
          <li><b>Friday</b> &mdash; pick one old function (like the original <code>calc()</code>) and spend 30 minutes writing tests for its current behavior, without changing anything yet.</li>
        </ol>
        <p>
          None of these steps require a dedicated "cleanup sprint." They fit inside normal work,
          which is exactly why they are sustainable &mdash; a team that only cleans code during
          special initiatives rarely does it consistently enough to matter.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a weekly practice loop with three recurring habits: renaming before starting work, principle-referencing code review, and writing tests for old code, feeding back into cleaner code over time.">
          <circle className="box" cx="90" cy="60" r="38" /><text x="90" y="58" className="boxText" style={{fontSize:"5.5px"}}>Rename before</text><text x="90" y="66" className="boxText" style={{fontSize:"5.5px"}}>starting work</text>
          <circle className="box" cx="210" cy="60" r="38" /><text x="210" y="58" className="boxText" style={{fontSize:"5.5px"}}>Review with a</text><text x="210" y="66" className="boxText" style={{fontSize:"5.5px"}}>named principle</text>
          <circle className="box" cx="330" cy="60" r="38" /><text x="330" y="58" className="boxText" style={{fontSize:"5.5px"}}>Test one old</text><text x="330" y="66" className="boxText" style={{fontSize:"5.5px"}}>function weekly</text>
          <line className="flow" x1="128" y1="60" x2="172" y2="60" />
          <line className="flow" x1="248" y1="60" x2="292" y2="60" />
        </svg>
        <figcaption>Three small, recurring habits sustain more improvement than one big cleanup effort.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The most common failure mode is scheduling clean code work as a separate, postponable
          activity &mdash; "we'll clean this up after launch." After-launch cleanup competes with the
          next launch and reliably loses. Practices that ride along with regular work, even in
          small doses, survive; practices that require dedicated time tend to get cut first.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why do small, recurring clean code habits tend to survive deadline pressure better than dedicated "cleanup sprints"?</p>
        </div>
      </section>
      <p className="takeaway">
        Clean code is a habit built through repetition on real, current work &mdash; not a phase you
        schedule after the "real" work is done.
      </p>

    </div>
  );
}
