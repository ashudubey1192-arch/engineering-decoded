export default function PatternCaseStudiesDesignADocumentEditorArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A document editor needs to represent nested content (sections containing paragraphs
          containing formatted text runs), support undo across arbitrary edits, and export to
          several formats without every content type accumulating export code for each one
          &mdash; three distinct problems, each with its own well-fitting pattern.
        </p>
        <p>
          This case study is deliberately dense: it combines three patterns from three different
          course sections, each addressing a piece of the editor no other one covers.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Working through the design, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Nested content, uniform treatment.</b> A document is sections containing
            paragraphs containing text runs, and operations like "compute total character count"
            need to work the same way regardless of nesting depth &mdash; <code>Composite</code>{" "}
            gives every node, leaf or container, the same interface.
          </li>
          <li>
            <b>Undo across arbitrary edits.</b> A user can undo a formatting change, a paragraph
            deletion, or a paste &mdash; each a different kind of edit &mdash;{" "}
            <code>Command</code> represents every edit uniformly as an object with{" "}
            <code>execute()</code> and <code>undo()</code>, kept on a history stack.
          </li>
          <li>
            <b>Export to PDF, HTML, and plain text without polluting content classes.</b> Adding a
            fourth export format shouldn't mean editing <code>Section</code>,{" "}
            <code>Paragraph</code>, and <code>TextRun</code> all over again &mdash;{" "}
            <code>Visitor</code> adds each new export format as one new class, touching no
            content class.
          </li>
          <li>
            <b>Confirm the three don't overlap.</b> Composite structures the tree; Command
            captures user actions on it; Visitor adds operations across it &mdash; three
            genuinely distinct concerns, matching Combine Patterns' test for a justified
            combination.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="15" width="110" height="28" rx="5" />
            <text className="boxText" x="75" y="33" fontSize="7">Composite (tree)</text>
            <rect className="box" x="20" y="51" width="110" height="28" rx="5" />
            <text className="boxText" x="75" y="69" fontSize="7">Command (undo)</text>
            <rect className="box" x="20" y="87" width="110" height="28" rx="5" />
            <text className="boxText" x="75" y="105" fontSize="7">Visitor (export)</text>
            <text className="figHint" x="150" y="33">structure</text>
            <text className="figHint" x="150" y="69">history</text>
            <text className="figHint" x="150" y="105">operations across the tree</text>
          </svg>
          <figcaption>Three patterns, three distinct responsibilities in the same editor &mdash; none of them substitutes for another.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The three patterns, minimally combined</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface DocumentNode { void accept(ExportVisitor visitor); } // Composite + Visitor's accept hook

class TextRun implements DocumentNode { // leaf
    String text;
    public void accept(ExportVisitor visitor) { visitor.visit(this); }
}
class Paragraph implements DocumentNode { // composite: holds children uniformly
    List<DocumentNode> children = new ArrayList<>();
    public void accept(ExportVisitor visitor) { visitor.visit(this); }
}

interface ExportVisitor { // Visitor: one new export format is one new class
    void visit(TextRun run);
    void visit(Paragraph paragraph);
}
class HtmlExportVisitor implements ExportVisitor {
    public void visit(TextRun run) { /* append <span>...</span> */ }
    public void visit(Paragraph paragraph) {
        for (DocumentNode child : paragraph.children) child.accept(this); // recurse through the tree
    }
}

interface EditCommand { void execute(); void undo(); } // Command: every edit, undoable uniformly
class InsertTextCommand implements EditCommand {
    private final Paragraph paragraph; private final TextRun run;
    InsertTextCommand(Paragraph paragraph, TextRun run) { this.paragraph = paragraph; this.run = run; }
    public void execute() { paragraph.children.add(run); }
    public void undo() { paragraph.children.remove(run); }
}

Deque<EditCommand> history = new ArrayDeque<>();
EditCommand insert = new InsertTextCommand(paragraph, new TextRun());
insert.execute(); history.push(insert);
history.pop().undo(); // undo, regardless of what kind of edit it was`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Adding export logic as a method directly on each content class.</b> A{" "}
            <code>toHtml()</code>, <code>toPdf()</code>, and <code>toPlainText()</code> method on
            every node class means every new format touches every content class &mdash; exactly
            the cost Visitor exists to avoid.
          </li>
          <li>
            <b>Implementing undo as "restore a full document snapshot" instead of per-command undo.</b>{" "}
            Snapshotting the whole document for every keystroke doesn't scale; Command's
            targeted, per-edit undo is proportional to the edit's actual size.
          </li>
          <li>
            <b>Forcing Composite onto content that never actually nests.</b> If the editor only
            ever has a flat list of paragraphs with no further nesting, a plain list may be
            simpler than a full Composite tree &mdash; the pattern is worth it here specifically
            because nesting (sections, paragraphs, runs) is real.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>If a fifth export format (Markdown) needs to be added, and separately, a new kind of edit (splitting a paragraph in two) needs to support undo, what has to change for each?</p>
          <p>
            <b>Answer:</b> Adding Markdown export means writing one new{" "}
            <code>MarkdownExportVisitor</code> implementing <code>ExportVisitor</code> &mdash;
            no existing content class (<code>TextRun</code>, <code>Paragraph</code>) changes at
            all. Adding undo for paragraph-splitting means writing one new{" "}
            <code>SplitParagraphCommand</code> implementing <code>EditCommand</code> &mdash; the
            history stack and every other command stay untouched. The two changes are completely
            independent, which is exactly what having Visitor and Command as separate,
            non-overlapping patterns buys.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A document editor's three distinct problems &mdash; nested structure, undoable edits, and
        growing export formats &mdash; are solved by Composite, Command, and Visitor
        respectively, combined because each owns a piece none of the others touch.
      </p>
    </div>
  );
}
