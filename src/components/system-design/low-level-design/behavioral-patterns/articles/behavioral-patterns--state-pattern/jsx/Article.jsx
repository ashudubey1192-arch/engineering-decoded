import "../css/Article.css";

export default function BehavioralPatternsStatePatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          State lets an object change its behavior when its internal state changes, by delegating
          state-specific logic to separate state objects &mdash; the direct code counterpart to
          the state diagrams drawn earlier in this course.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of one class checking a status flag with if/else inside every method, each state
          gets its own class implementing a shared interface, and the context object simply
          delegates each call to whichever state object is current. The object appears to change
          its class as it moves between states, without any single method growing a branch per state.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>MediaPlayer</code>'s <code>play()</code> button behaves differently depending on
          whether it's <code>Playing</code>, <code>Paused</code>, or <code>Stopped</code>. Rather
          than an if/else on a status field inside every method, each state
          (<code>PlayingState</code>, <code>PausedState</code>, <code>StoppedState</code>)
          implements its own <code>play()</code>/<code>pause()</code>/<code>stop()</code>, and the
          player just forwards each call to whichever state object it currently holds.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Diagram of a MediaPlayer context delegating every call to whichever state object is current, with transitions moving the current-state reference between Playing, Paused, and Stopped." >
          <rect className="box" x="30" y="45" width="110" height="30" rx="6" /><text x="85" y="64" className="boxText" style={{fontSize:"7px"}}>MediaPlayer</text>
          <line className="flow" x1="140" y1="60" x2="185" y2="60" /><text x="162" y="50" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>delegates to</text>
          {["Playing","Paused","Stopped"].map((t,i) => (<rect key={t} className={i===0?"boxAccent":"box"} x="190" y={10+i*35} width="90" height="24" rx="5" />))}
          {["Playing","Paused","Stopped"].map((t,i) => (<text key={t} x="235" y={26+i*35} className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>{t}State</text>))}
        </svg>
        <figcaption>The player delegates to its current state object; which object that is changes as the player transitions between states.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing "State" as just a fancy enum-driven if/else, without genuinely giving each
          state its own object and behavior, misses the pattern's point entirely. Forgetting to
          define state transitions explicitly &mdash; leaving it implicit in scattered code &mdash;
          lets an object drift into combinations of state that were never meant to be reachable.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>How does giving each state its own class avoid the if/else-on-status-flag problem that State is meant to solve?</p>
        </div>
      </section>
      <p className="takeaway">
        State turns "what mode am I in" from a flag checked everywhere into an object the context
        simply delegates to &mdash; the same idea the state diagrams drew, now expressed in code.
      </p>
    </div>
  );
}
