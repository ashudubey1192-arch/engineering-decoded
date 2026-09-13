import "../css/Article.css";

export default function StructuralPatternsCompositePatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Composite arranges objects into tree structures representing part-whole hierarchies, so a
          single object and a group of objects can be treated through the exact same interface.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A shared interface defines an operation that makes sense for both an individual
          &ldquo;leaf&rdquo; and a &ldquo;composite&rdquo; that holds children of that same
          interface. The composite's implementation typically delegates to each of its children
          &mdash; calling code never needs to check whether it's holding a leaf or a composite
          before calling the shared operation.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A file system: <code>File</code> and <code>Folder</code> both implement a
          <code>FileSystemNode</code> interface with <code>getSize()</code>.
          <code>File.getSize()</code> just returns its own size; <code>Folder.getSize()</code>
          recursively sums <code>getSize()</code> across every child, whether each child happens to
          be a File or another Folder. Calling code asking &ldquo;how big is this?&rdquo; never
          needs to special-case which kind of node it's holding.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of a folder tree where a top folder contains two files and a subfolder, and every node responds to the same getSize call regardless of whether it's a file or a folder." >
          <rect className="boxAccent" x="150" y="15" width="100" height="26" rx="5" /><text x="200" y="32" className="boxText" style={{fontSize:"7px"}}>Folder</text>
          <line className="flowMuted" x1="200" y1="41" x2="90" y2="70" /><line className="flowMuted" x1="200" y1="41" x2="200" y2="70" /><line className="flowMuted" x1="200" y1="41" x2="310" y2="70" />
          <rect className="box" x="50" y="75" width="80" height="24" rx="5" /><text x="90" y="91" className="boxText" style={{fontSize:"6.5px"}}>File.txt</text>
          <rect className="box" x="160" y="75" width="80" height="24" rx="5" /><text x="200" y="91" className="boxText" style={{fontSize:"6.5px"}}>File2.txt</text>
          <rect className="boxAccent" x="270" y="75" width="80" height="24" rx="5" /><text x="310" y="91" className="boxText" style={{fontSize:"6.5px"}}>Subfolder</text>
          <line className="flowMuted" x1="310" y1="99" x2="310" y2="115" />
          <rect className="box" x="270" y="115" width="80" height="20" rx="4" /><text x="310" y="129" className="boxText" style={{fontSize:"6px"}}>File3.txt</text>
        </svg>
        <figcaption>Files and folders alike respond to getSize(); a folder just delegates to whatever its children happen to be.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Giving leaf nodes a meaningless implementation of composite-only operations, like
          <code>addChild()</code> on a <code>File</code> that can never have children, is a sign
          the interface needs a cleaner split. Assuming the tree will always stay shallow can also
          backfire &mdash; deep recursive structures can hit real stack depth or performance limits
          if that assumption turns out wrong.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does Folder.getSize() never need to check whether each child is a File or another Folder?</p>
        </div>
      </section>
      <p className="takeaway">
        Composite's payoff is treating one object and a whole subtree of objects identically
        &mdash; the calling code stops needing to know which one it's holding.
      </p>
    </div>
  );
}
