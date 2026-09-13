import "../css/Article.css";

export default function UmlModelingUseCaseDiagramsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A use case diagram shows who can do what with a system, at the highest level of
          abstraction UML offers &mdash; closer to a scoping tool than a design tool, and usually
          the very first diagram drawn, before any class exists.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Actors (the people or external systems interacting with it) connect to use cases (goals
          the system helps them accomplish), drawn as labeled ovals. A use case diagram
          deliberately says nothing about how the system achieves any of it &mdash; that's what
          class and sequence diagrams are for, once scope is agreed on.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A library system has two actors: <code>Member</code> and <code>Librarian</code>.
          Member connects to &ldquo;Borrow Book,&rdquo; &ldquo;Return Book,&rdquo; and &ldquo;Pay
          Fine.&rdquo; Librarian connects to &ldquo;Add Book&rdquo; and can also perform
          &ldquo;Borrow Book&rdquo; and &ldquo;Return Book&rdquo; on a member's behalf at the front
          desk. None of this says whether Book is a class, or how a fine gets calculated &mdash;
          it only establishes what the system needs to support before any of that is decided.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of two actors, Member and Librarian, connected to labeled use-case ovals for borrowing, returning, paying a fine, and adding a book." >
          <circle className="ringNode" cx="30" cy="40" r="10" /><text x="30" y="62" className="figLabel" textAnchor="middle" style={{fontSize:"7px"}}>Member</text>
          <circle className="ringNode" cx="30" cy="100" r="10" /><text x="30" y="122" className="figLabel" textAnchor="middle" style={{fontSize:"7px"}}>Librarian</text>
          <ellipse className="boxAccent" cx="180" cy="20" rx="70" ry="16" /><text x="180" y="24" className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>Borrow Book</text>
          <ellipse className="boxAccent" cx="180" cy="55" rx="70" ry="16" /><text x="180" y="59" className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>Return Book</text>
          <ellipse className="boxAccent" cx="180" cy="90" rx="70" ry="16" /><text x="180" y="94" className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>Pay Fine</text>
          <ellipse className="box" cx="330" cy="115" rx="70" ry="16" /><text x="330" y="119" className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>Add Book</text>
          <line className="flowMuted" x1="40" y1="35" x2="115" y2="22" /><line className="flowMuted" x1="40" y1="42" x2="115" y2="53" /><line className="flowMuted" x1="40" y1="48" x2="115" y2="86" />
          <line className="flowMuted" x1="40" y1="95" x2="260" y2="112" /><line className="flowMuted" x1="40" y1="105" x2="115" y2="60" />
        </svg>
        <figcaption>Actors connect to the goals they can accomplish; the diagram deliberately says nothing about how any of it is implemented.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating a use case diagram as if it specifies internal behavior misreads what it's for
          &mdash; it deliberately doesn't. Listing implementation-level operations, like
          &ldquo;validate ISBN checksum,&rdquo; as if they were use cases confuses a user-meaningful
          goal with an internal step toward one.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a use case diagram intentionally say nothing about how the system implements any of its use cases?</p>
        </div>
      </section>
      <p className="takeaway">
        A use case diagram fixes scope &mdash; who needs to do what &mdash; before any class or
        sequence diagram gets to decide how.
      </p>
    </div>
  );
}
