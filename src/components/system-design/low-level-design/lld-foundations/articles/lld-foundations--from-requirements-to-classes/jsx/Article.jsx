import "../css/Article.css";

export default function LldFoundationsFromRequirementsToClassesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Requirements arrive as sentences; a design needs classes. The bridge between them is a
          simple heuristic: nouns tend to become classes, verbs tend to become methods &mdash;
          but not mechanically.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Reading a requirements paragraph and underlining its nouns gives you a first draft of
          candidate classes; underlining its verbs gives you a first draft of methods. The
          mechanical part stops there &mdash; not every noun deserves its own class, and related
          data and behavior should usually be grouped rather than split just because two different
          words were used for them.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Take: &ldquo;A member can borrow up to 5 books; each book has a due date; a librarian can
          add new books.&rdquo;
        </p>
        <ol className="stepList">
          <li><b>Nouns:</b> member, book, due date, librarian &mdash; candidates: Member, Book,
            Librarian.</li>
          <li><b>Verbs:</b> borrow, add &mdash; candidate methods: something like
            <code>borrowBook()</code> and <code>addBook()</code>.</li>
          <li><b>&ldquo;Due date&rdquo; doesn&rsquo;t need its own class</b> &mdash; it's a field
            on whatever tracks an active borrow, which suggests a fourth class this sentence never
            named directly: a <code>Loan</code> linking a Member to a Book with a due date.</li>
          <li><b>&ldquo;Up to 5 books&rdquo;</b> is a rule, not a class &mdash; it belongs as a
            check inside <code>borrowBook()</code>, most naturally on Member or the system
            coordinating the loan.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of a requirements sentence being parsed into nouns and verbs, which become candidate classes and methods, including one class the sentence never names directly." >
          <rect className="box" x="20" y="15" width="400" height="28" rx="6" /><text x="220" y="33" className="boxText" style={{fontSize:"7px"}}>"A member can borrow up to 5 books; each book has a due date..."</text>
          <line className="flow" x1="120" y1="43" x2="120" y2="65" /><text x="120" y="60" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>nouns</text>
          <line className="flow" x1="320" y1="43" x2="320" y2="65" /><text x="320" y="60" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>verbs</text>
          <rect className="boxAccent" x="30" y="70" width="180" height="30" rx="5" /><text x="120" y="89" className="boxText" style={{fontSize:"7px"}}>Member, Book, Librarian, Loan</text>
          <rect className="boxAccent" x="230" y="70" width="180" height="30" rx="5" /><text x="320" y="89" className="boxText" style={{fontSize:"7px"}}>borrowBook(), addBook()</text>
        </svg>
        <figcaption>Nouns and verbs give a first draft; the class the sentence never names (Loan) still has to be inferred.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Creating a class for every noun mechanically &mdash; including ones like &ldquo;due
          date&rdquo; that are really just a field &mdash; produces anemic classes that hold data
          but no meaningful behavior of their own. Folding unrelated responsibilities into one
          convenient class because it&rsquo;s the one already open is the opposite mistake, and
          just as common under time pressure.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does "due date" become a field rather than its own class, while "a member borrowing a book" becomes a whole new class (Loan) the requirements never named?</p>
        </div>
      </section>
      <p className="takeaway">
        Nouns and verbs are a starting draft, not a final answer &mdash; the judgment is in
        deciding which nouns deserve a class and which relationships need one the sentence never
        spelled out.
      </p>
    </div>
  );
}
