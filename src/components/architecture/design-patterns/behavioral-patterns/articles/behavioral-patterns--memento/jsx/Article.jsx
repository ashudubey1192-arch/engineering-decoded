export default function BehavioralPatternsMementoArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Memento captures an object's internal state so it can be restored later, without
          exposing that state to anything outside the object itself. It's the pattern behind
          "undo" when Command's own <code>undo()</code> method (from earlier in this section)
          isn't a good fit &mdash; specifically when reversing an operation isn't a simple inverse
          action, but needs a full snapshot of prior state.
        </p>
        <p>
          Intent: capture and externalize an object's internal state, without violating
          encapsulation, so it can be restored later. Applicability: an operation's effects are too
          complex to reverse with a simple inverse action, and a full state snapshot is a more
          reliable way to undo it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Capturing state without exposing it, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify state complex enough that "undo" means "restore," not "reverse."</b> A
            text editor's formatting state (font, size, color, alignment) after a batch of
            unrelated edits is easier to snapshot and restore wholesale than to reverse operation
            by operation.
          </li>
          <li>
            <b>Have the originator create its own memento, keeping its internal fields private.</b>{" "}
            <code>Editor.save()</code> returns an <code>EditorMemento</code> holding a private
            copy of the editor's state &mdash; nothing outside <code>Editor</code> can read that
            state directly.
          </li>
          <li>
            <b>Store mementos in a separate caretaker, which never inspects their contents.</b> A{" "}
            <code>History</code> class holds a stack of <code>EditorMemento</code> objects, purely
            as opaque values it passes back to the originator.
          </li>
          <li>
            <b>Restore by handing a memento back to the same originator that created it.</b>{" "}
            <code>Editor.restore(memento)</code> is the only place that can read the memento's
            captured state &mdash; encapsulation stays intact throughout.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="50" width="120" height="40" rx="6" />
            <text className="boxText" x="90" y="73" fontSize="10">Editor</text>
            <text className="figLabel" x="90" y="35">originator</text>
            <line className="flow" x1="150" y1="60" x2="210" y2="60" />
            <rect className="box" x="210" y="40" width="120" height="35" rx="6" />
            <text className="boxText" x="270" y="62" fontSize="8">EditorMemento</text>
            <line className="flowMuted" x1="270" y1="75" x2="270" y2="100" />
            <rect className="box" x="210" y="100" width="120" height="30" rx="6" />
            <text className="boxText" x="270" y="120" fontSize="9">History (caretaker)</text>
          </svg>
          <figcaption>History stores mementos but never reads them &mdash; only Editor, the originator, knows what's inside.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A memento with private, originator-only access</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class Editor {
    private String font = "Sans"; private int size = 12;

    EditorMemento save() { return new EditorMemento(font, size); } // only Editor can construct one
    void restore(EditorMemento memento) { this.font = memento.font; this.size = memento.size; }

    static class EditorMemento { // private fields: caretaker can hold this, never read it
        private final String font;
        private final int size;
        private EditorMemento(String font, int size) { this.font = font; this.size = size; } // private constructor
    }
}

class History {
    private final Deque<Editor.EditorMemento> snapshots = new ArrayDeque<>();
    void push(Editor.EditorMemento m) { snapshots.push(m); } // opaque to History
    Editor.EditorMemento pop() { return snapshots.pop(); }
}

Editor editor = new Editor();
History history = new History();
history.push(editor.save()); // snapshot before a batch of changes
// ... editor.font = "Serif"; editor.size = 18; (via other methods)
editor.restore(history.pop()); // back to the exact prior state`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Exposing the memento's fields publicly.</b> A public <code>font</code> field on{" "}
            <code>EditorMemento</code> lets the caretaker (or anything else) read and depend on
            internal state, defeating the encapsulation the pattern is built to preserve.
          </li>
          <li>
            <b>Letting the caretaker modify a memento after capturing it.</b> A memento should be
            immutable once created &mdash; mutable snapshots can drift from the state they were
            supposed to represent.
          </li>
          <li>
            <b>Snapshotting excessively large state without considering the cost.</b> Every
            memento is a real memory cost; a history of a thousand full-document snapshots for a
            large document can be expensive enough to need a smarter strategy (diffs, size limits)
            than naive full copies.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is <code>EditorMemento</code>'s constructor private, and why does that matter for the pattern?</p>
          <p>
            <b>Answer:</b> A private constructor, reachable only from inside <code>Editor</code>,
            guarantees that only the originator itself can create a memento capturing its state.
            Combined with private fields, this means <code>History</code> (the caretaker) can hold
            and pass mementos around without ever being able to read or construct one itself
            &mdash; which is exactly what keeps <code>Editor</code>'s internal state properly
            encapsulated.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Memento when undoing an operation means restoring a full prior state rather than
        reversing a single action &mdash; let the originator alone create and read its own
        snapshots, and keep the caretaker holding them blind to their contents.
      </p>
    </div>
  );
}
