export default function StructuralPatternsCompositeArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Composite lets individual objects and groups of objects be treated through the same
          interface, so client code doesn't need to know or care whether it's working with one
          leaf item or a whole tree of them. The classic case is a filesystem: a single file and a
          folder full of files and other folders should both respond to "what's your total size"
          the same way.
        </p>
        <p>
          Intent: compose objects into tree structures, and let clients treat individual objects
          and compositions of objects uniformly. Applicability: the domain is naturally
          hierarchical, and operations need to apply the same way at any level of that hierarchy.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a composite, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define one shared interface for both leaves and containers.</b>{" "}
            <code>FileSystemNode</code>, with a single <code>size()</code> method that both a
            file and a folder must implement.
          </li>
          <li>
            <b>Implement the leaf as the simplest possible case.</b> <code>File.size()</code>{" "}
            just returns its own byte count &mdash; no recursion, no children.
          </li>
          <li>
            <b>Implement the composite by holding children and delegating.</b>{" "}
            <code>Folder.size()</code> sums <code>size()</code> across every child, whether that
            child is a <code>File</code> or another <code>Folder</code>.
          </li>
          <li>
            <b>Let client code call the shared interface without checking which kind it has.</b>{" "}
            Code that prints total size never needs an <code>instanceof</code> check &mdash; it
            calls <code>size()</code> on whatever <code>FileSystemNode</code> it was handed.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 460 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="170" y="15" width="120" height="35" rx="6" />
            <text className="boxText" x="230" y="37" fontSize="10">Folder (root)</text>
            <line className="flow" x1="200" y1="50" x2="100" y2="90" />
            <line className="flow" x1="260" y1="50" x2="360" y2="90" />
            <rect className="box" x="40" y="90" width="120" height="35" rx="6" />
            <text className="boxText" x="100" y="112" fontSize="9">File: readme.md</text>
            <rect className="boxAccent" x="300" y="90" width="120" height="35" rx="6" />
            <text className="boxText" x="360" y="112" fontSize="9">Folder: src</text>
            <line className="flow" x1="360" y1="125" x2="360" y2="145" />
            <text className="figHint" x="360" y="155">File: Main.java</text>
          </svg>
          <figcaption>Every node, leaf or folder, implements the same interface &mdash; a folder's size is just the sum of whatever its children report.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One interface, recursive composition</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface FileSystemNode { long size(); }

class File implements FileSystemNode {
    private final long bytes;
    File(long bytes) { this.bytes = bytes; }
    public long size() { return bytes; } // leaf: no recursion
}

class Folder implements FileSystemNode {
    private final List<FileSystemNode> children = new ArrayList<>();
    void add(FileSystemNode child) { children.add(child); }
    public long size() {
        return children.stream().mapToLong(FileSystemNode::size).sum(); // recurses through the tree
    }
}

Folder src = new Folder();
src.add(new File(2_048));
Folder project = new Folder();
project.add(new File(512)); // readme.md
project.add(src); // a folder can contain another folder, transparently
long total = project.size(); // 2560 -- caller never distinguished File from Folder`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Adding container-only methods to the shared interface.</b> Putting{" "}
            <code>add(FileSystemNode)</code> on <code>FileSystemNode</code> itself forces{" "}
            <code>File</code> to implement a method that makes no sense for a leaf &mdash; keep
            child-management methods on the composite type only.
          </li>
          <li>
            <b>Checking <code>instanceof Folder</code> in client code anyway.</b> This defeats the
            entire point of Composite &mdash; if calling code branches by type, the uniform
            interface isn't actually being used uniformly.
          </li>
          <li>
            <b>Forgetting a cycle can be constructed (a folder added to itself, indirectly).</b>{" "}
            Composite doesn't protect against this by default; if cycles are possible in your
            domain, guard against them explicitly.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why can <code>project.size()</code> correctly compute the total across nested folders without any code that specifically checks "is this a File or a Folder"?</p>
          <p>
            <b>Answer:</b> Both <code>File</code> and <code>Folder</code> implement the same{" "}
            <code>FileSystemNode</code> interface. <code>Folder.size()</code> simply calls{" "}
            <code>size()</code> on each of its children through that shared interface &mdash;
            whether a child happens to be a <code>File</code> or another <code>Folder</code>, the
            call looks identical, and the recursion falls out naturally from each type's own
            implementation.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Composite when your domain is naturally a tree and operations need to work the
        same way on a single item as on a whole branch &mdash; one shared interface, implemented
        differently by leaves and containers, is what makes that uniformity possible.
      </p>
    </div>
  );
}
