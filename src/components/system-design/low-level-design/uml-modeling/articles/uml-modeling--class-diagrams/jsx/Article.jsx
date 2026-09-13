import "../css/Article.css";

export default function UmlModelingClassDiagramsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A class diagram shows a design's static structure &mdash; the classes that exist, their
          attributes and methods, and the relationships between them &mdash; giving visual notation
          to the vocabulary this course already built up in words.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each class is drawn as a box with three compartments: the class name on top, its
          attributes in the middle, its methods at the bottom. Relationships between classes are
          drawn as lines, distinguished by the same vocabulary covered earlier &mdash; association,
          aggregation, composition, dependency &mdash; so the diagram communicates not just which
          classes exist, but exactly how they're coupled.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A two-class diagram for a tiny library slice: a <code>Book</code> box listing
          <code>title</code> and <code>author</code> as attributes and no methods of its own, and a
          <code>Library</code> box listing a <code>books</code> collection as an attribute and
          <code>addBook()</code> as a method, connected to Book by an aggregation line &mdash; the
          library holds books, but a book's existence doesn't depend on any one library holding it.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of two three-compartment UML class boxes, Book and Library, connected by an aggregation relationship, each box showing its name, attributes, and methods in separate sections." >
          <rect className="box" x="30" y="15" width="130" height="95" rx="4" />
          <line className="divider" x1="30" y1="42" x2="160" y2="42" /><line className="divider" x1="30" y1="78" x2="160" y2="78" />
          <text x="95" y="31" className="boxText" textAnchor="middle" style={{fontSize:"8px"}}>Book</text>
          <text x="40" y="56" className="figHint" style={{fontSize:"6.5px"}}>title</text><text x="40" y="70" className="figHint" style={{fontSize:"6.5px"}}>author</text>
          <text x="240" y="31" className="boxText" textAnchor="middle" style={{fontSize:"8px"}}>Library</text>
          <rect className="box" x="175" y="15" width="130" height="95" rx="4" />
          <line className="divider" x1="175" y1="42" x2="305" y2="42" /><line className="divider" x1="175" y1="78" x2="305" y2="78" />
          <text x="185" y="56" className="figHint" style={{fontSize:"6.5px"}}>books: Book[]</text>
          <text x="185" y="93" className="figHint" style={{fontSize:"6.5px"}}>addBook()</text>
          <line className="flowMuted" x1="160" y1="60" x2="175" y2="60" />
        </svg>
        <figcaption>Each box's three compartments show a class's name, attributes, and methods; the line between them shows how they relate.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Drawing a class diagram with only names and no attributes or methods loses most of the
          information a class diagram actually exists to convey. Trying to diagram an entire system
          in one giant sprawling picture, instead of one focused diagram per subsystem or concern,
          produces something too dense for anyone to actually read.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What do the three compartments of a UML class box represent, and why does omitting the bottom two lose most of the diagram's value?</p>
        </div>
      </section>
      <p className="takeaway">
        A class diagram earns its keep by showing attributes, methods, and relationships together
        &mdash; a box with just a name is barely more useful than a bullet list.
      </p>
    </div>
  );
}
