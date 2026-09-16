export default function BehavioralPatternsCommandArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Command turns a request into a standalone object, carrying everything needed to execute
          it later &mdash; the receiver, the method to call, and its arguments. Once a request is
          an object instead of a direct method call, it can be queued, logged, undone, or handed
          to code that has no idea what the command actually does.
        </p>
        <p>
          Intent: encapsulate a request as an object, so it can be parameterized, queued, and
          reversed independently of the code that invokes it. Applicability: operations need to be
          queued, logged, undone, or triggered from something (a UI button, a scheduler) that
          shouldn't need to know the operation's details.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Turning a request into an object, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define a common command interface.</b> <code>Command</code>, with an{" "}
            <code>execute()</code> method and, if undo is needed, an <code>undo()</code> method.
          </li>
          <li>
            <b>Implement each command holding its receiver and parameters.</b>{" "}
            <code>InsertTextCommand</code> holds the document, the text to insert, and the
            position &mdash; everything <code>execute()</code> needs, captured at construction.
          </li>
          <li>
            <b>Let the invoker hold and trigger commands without knowing what they do.</b> A menu
            button, a keyboard shortcut, and a macro replay engine can all call{" "}
            <code>command.execute()</code> on whatever command they were configured with.
          </li>
          <li>
            <b>Keep executed commands on a stack for undo, if that's a requirement.</b> Each{" "}
            <code>execute()</code> pushes onto a history stack; <code>undo()</code> pops and
            reverses the most recent one.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="110" height="40" rx="6" />
            <text className="boxText" x="75" y="68" fontSize="10">Invoker</text>
            <text className="figHint" x="75" y="30">menu button</text>
            <line className="flow" x1="130" y1="65" x2="190" y2="65" />
            <rect className="boxAccent" x="190" y="45" width="140" height="40" rx="6" />
            <text className="boxText" x="260" y="68" fontSize="9">InsertTextCommand</text>
            <line className="flow" x1="330" y1="65" x2="390" y2="65" />
            <rect className="box" x="390" y="45" width="90" height="40" rx="6" />
            <text className="boxText" x="435" y="68" fontSize="9">Document</text>
          </svg>
          <figcaption>The invoker only calls execute() on whatever command it holds &mdash; it never needs to know Document exists.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A command carrying its own undo</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface Command { void execute(); void undo(); }

class InsertTextCommand implements Command {
    private final Document doc;
    private final String text;
    private final int position;
    InsertTextCommand(Document doc, String text, int position) {
        this.doc = doc; this.text = text; this.position = position;
    }
    public void execute() { doc.insert(position, text); }
    public void undo() { doc.delete(position, text.length()); }
}

class CommandHistory {
    private final Deque<Command> executed = new ArrayDeque<>();
    void run(Command command) { command.execute(); executed.push(command); }
    void undoLast() { if (!executed.isEmpty()) executed.pop().undo(); }
}

CommandHistory history = new CommandHistory();
history.run(new InsertTextCommand(doc, "Hello", 0));
history.undoLast(); // reverses that exact insertion, nothing else`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Implementing <code>execute()</code> without a matching, symmetric <code>undo()</code>{" "}
            when undo is actually required.</b> An <code>undo()</code> that doesn't precisely
            reverse its own <code>execute()</code> corrupts state the moment it's called.
          </li>
          <li>
            <b>Using Command when a plain method call would do.</b> If a request never needs to be
            queued, logged, undone, or handed to generic invoking code, wrapping it in a command
            object is unnecessary indirection.
          </li>
          <li>
            <b>Letting the invoker peek inside the command to decide how to run it.</b> If the
            invoker starts checking <code>instanceof InsertTextCommand</code>, the decoupling the
            pattern provides has already been lost.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why can <code>CommandHistory.undoLast()</code> correctly reverse any command pushed onto it, without knowing whether it was an insert, a delete, or something else entirely?</p>
          <p>
            <b>Answer:</b> Every command implements the same <code>Command</code> interface with
            its own <code>undo()</code> method that knows how to reverse exactly what its own{" "}
            <code>execute()</code> did. <code>CommandHistory</code> only ever calls{" "}
            <code>undo()</code> through the shared interface &mdash; it never needs to know which
            concrete command type it's holding.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Command when a request needs to be queued, logged, undone, or triggered by code
        that shouldn't know its details &mdash; turning the request into an object is what makes
        all of that possible.
      </p>
    </div>
  );
}
