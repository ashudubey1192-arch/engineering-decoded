import "../css/Article.css";

export default function LldCaseStudiesDesignATicTacToeGameArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Small in scope, but a good test of keeping board state, turn logic, and win-checking as
          separate, clean responsibilities instead of one tangled Game class.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: two players alternate marking a 3x3 grid, and a win or draw is detected
          after each move. Candidate classes: <code>Board</code> (the grid, and whether a given
          cell is free), <code>Player</code> &mdash; deliberately an interface, not a fixed enum of
          &ldquo;X&rdquo; or &ldquo;O&rdquo;, so a future AI-controlled player can be added without
          touching <code>Game</code> &mdash; and <code>Game</code> (turn order, invoking
          win-checking after each move). Win-checking (rows, columns, diagonals) is naturally its
          own small, focused piece rather than folded into Board or Game.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Game asks the current Player for a move.</b></li>
          <li><b>Game validates the target cell is empty</b> via Board before accepting it.</li>
          <li><b>Board records the mark</b> at that cell.</li>
          <li><b>Game asks a WinChecker to evaluate the board</b> from the perspective of the
            player who just moved.</li>
          <li><b>If there's no winner and the board isn't full,</b> turn passes to the other
            Player; otherwise the game ends and reports the result.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of Game coordinating Board, the current Player, and a separate WinChecker for one turn, rather than folding win-checking into Board or Game itself." >
          <rect className="boxAccent" x="160" y="15" width="100" height="26" rx="5" /><text x="210" y="32" className="boxText" style={{fontSize:"7px"}}>Game</text>
          <line className="flowMuted" x1="160" y1="29" x2="70" y2="55" /><rect className="box" x="20" y="60" width="90" height="24" rx="5" /><text x="65" y="76" className="boxText" style={{fontSize:"6.5px"}}>Player</text>
          <line className="flow" x1="210" y1="41" x2="210" y2="60" /><rect className="box" x="165" y="65" width="90" height="24" rx="5" /><text x="210" y="81" className="boxText" style={{fontSize:"6.5px"}}>Board</text>
          <line className="flowMuted" x1="260" y1="29" x2="350" y2="55" /><rect className="box" x="305" y="60" width="90" height="24" rx="5" /><text x="350" y="76" className="boxText" style={{fontSize:"6.5px"}}>WinChecker</text>
        </svg>
        <figcaption>Game coordinates three separate collaborators for one turn instead of owning all their logic itself.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Putting win-checking logic directly inside Board or Game, instead of its own focused
          piece, makes it hard to test in isolation or reuse for a different board size later.
          Modeling Player as a fixed enum of &ldquo;X&rdquo; or &ldquo;O&rdquo; instead of an
          object makes adding a computer-controlled player a much bigger rewrite than it should be.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does modeling Player as an interface, rather than a fixed X/O enum, matter for adding a computer-controlled opponent later?</p>
        </div>
      </section>
      <p className="takeaway">
        Even a small system benefits from splitting board state, turn logic, and win-checking into
        separate, focused classes &mdash; scope doesn't excuse tangled responsibilities.
      </p>
    </div>
  );
}
