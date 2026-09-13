import "../css/Article.css";

export default function BehavioralPatternsCommandPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Command turns a request into an object, so callers can parameterize behavior with
          different requests, queue them, log them, or undo them &mdash; the action itself becomes
          a first-class value instead of a direct method call.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each command implements a shared interface with an <code>execute()</code> method (and
          usually <code>undo()</code>), wrapping everything needed to perform &mdash; and reverse
          &mdash; one specific action. An invoker holds a command reference and calls
          <code>execute()</code> without needing to know what the command actually does or which
          object it acts on.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A TV remote's buttons are each bound to a <code>Command</code> object &mdash;
          <code>TurnOnCommand</code>, <code>VolumeUpCommand</code> &mdash; rather than hardcoded
          logic per button. Because every command also implements <code>undo()</code>, the remote
          can offer one generic &ldquo;undo last action&rdquo; button that calls
          <code>lastCommand.undo()</code> without needing to know what that last action actually was.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 110" role="img" aria-label="Diagram of a remote button, the invoker, holding a Command reference whose execute call acts on the actual receiver object, such as a TV." >
          <rect className="box" x="20" y="40" width="90" height="26" rx="5" /><text x="65" y="57" className="boxText" style={{fontSize:"7px"}}>Button (invoker)</text>
          <line className="flow" x1="110" y1="53" x2="150" y2="53" /><text x="130" y="43" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>execute()</text>
          <rect className="boxAccent" x="155" y="40" width="100" height="26" rx="5" /><text x="205" y="57" className="boxText" style={{fontSize:"6.5px"}}>TurnOnCommand</text>
          <line className="flow" x1="255" y1="53" x2="300" y2="53" />
          <rect className="box" x="305" y="40" width="80" height="26" rx="5" /><text x="345" y="57" className="boxText" style={{fontSize:"7px"}}>TV</text>
        </svg>
        <figcaption>The invoker never knows what the command does or what it acts on &mdash; it just calls execute().</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing only <code>execute()</code> and skipping <code>undo()</code> gives up most
          of the pattern's actual value &mdash; undo/redo and action logging are usually the whole
          reason Command was reached for. Letting individual commands accumulate unrelated logic
          makes them stop being simple, replayable units.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does implementing undo() alongside execute() matter for getting the real value out of the Command pattern?</p>
        </div>
      </section>
      <p className="takeaway">
        Command's real payoff is treating an action as data &mdash; something you can queue, log,
        or reverse &mdash; not just a slightly indirect way to call a method.
      </p>
    </div>
  );
}
