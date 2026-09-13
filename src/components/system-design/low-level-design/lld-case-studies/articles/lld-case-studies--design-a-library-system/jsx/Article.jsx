import "../css/Article.css";

export default function LldCaseStudiesDesignALibrarySystemArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A good test of relationship modeling &mdash; the split between Book and BookCopy is the
          one detail most first attempts at this design get wrong.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: catalog books, let members borrow and return them, enforce a borrow limit
          and due dates, and track which specific physical copy a member is holding. The key
          modeling decision is splitting <code>Book</code> (the catalog entry &mdash; title,
          author, ISBN, of which there's exactly one per title) from <code>BookCopy</code> (one
          physical instance of a Book, which is what actually gets checked out and can be lost or
          damaged). A library can own five copies of one Book; it's the copy, never the abstract
          Book, that's ever borrowed. <code>Loan</code> links a <code>Member</code> to a specific
          <code>BookCopy</code> with a due date.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A member requests to borrow a title.</b> The Library finds an available
            BookCopy of that Book.</li>
          <li><b>It checks the member's current loan count</b> against their borrow limit before
            proceeding.</li>
          <li><b>A Loan is created</b> linking the Member to that specific BookCopy, with a due
            date, and the copy is marked unavailable.</li>
          <li><b>On return,</b> the Loan closes and that same copy becomes available again for the
            next member.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of one Book catalog entry with multiple BookCopy instances, one of which is linked to an active Loan for a specific Member." >
          <rect className="box" x="20" y="20" width="100" height="28" rx="6" /><text x="70" y="39" className="boxText" style={{fontSize:"7px"}}>Book (catalog)</text>
          <line className="flowMuted" x1="70" y1="48" x2="70" y2="70" />
          {["Copy 1","Copy 2","Copy 3"].map((t,i) => (<rect key={t} className={i===1?"boxAccent":"box"} x={20+i*40} y="75" width="35" height="24" rx="4" />))}
          {["Copy 1","Copy 2","Copy 3"].map((t,i) => (<text key={t} x={37+i*40} y="91" className="boxText" textAnchor="middle" style={{fontSize:"5.5px"}}>{t}</text>))}
          <line className="flow" x1="60" y1="87" x2="200" y2="87" />
          <rect className="box" x="205" y="72" width="90" height="28" rx="5" /><text x="250" y="91" className="boxText" style={{fontSize:"6.5px"}}>Loan (due date)</text>
          <line className="flow" x1="295" y1="86" x2="335" y2="86" />
          <rect className="box" x="340" y="72" width="70" height="28" rx="5" /><text x="375" y="91" className="boxText" style={{fontSize:"6.5px"}}>Member</text>
        </svg>
        <figcaption>Only one of the Book's several physical copies is ever linked to an active Loan at a time.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Modeling only Book and tracking &ldquo;available copies&rdquo; as a plain integer works
          until you need to know which specific copy is overdue or damaged &mdash; a counter can't
          answer that. Scattering the borrow-limit check into Loan, instead of keeping it as
          Member or Library's responsibility, muddles which class actually owns that rule.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does the library need both a Book class and a separate BookCopy class instead of just one?</p>
        </div>
      </section>
      <p className="takeaway">
        Book is the catalog entry; BookCopy is the thing that's actually borrowed &mdash;
        collapsing that split into one class is the design mistake this system exists to catch.
      </p>
    </div>
  );
}
