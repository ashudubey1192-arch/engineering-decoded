import "../css/Article.css";

export default function LldFoundationsWhatIsLowLevelDesignArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Low level design turns a component&rsquo;s responsibilities into a concrete object model
          &mdash; the classes that exist, what each one knows and does, and how instances of those
          classes collaborate.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A good LLD is detailed enough that writing the actual code becomes close to
          transcription &mdash; the hard decisions (who's responsible for what, how objects relate)
          are already made. The usual artifacts are a class diagram (structure), sometimes a
          sequence diagram (behavior for one scenario), and clear interfaces between the pieces.
        </p>
        <div className="twoCol">
          <div>
            <h3>HLD-level answer</h3>
            <p>A notification system uses a queue in front of separate push, email, and SMS
              workers, each calling its own provider.</p>
          </div>
          <div>
            <h3>LLD-level answer</h3>
            <p>A <code>NotificationChannel</code> interface with <code>PushChannel</code>,
              <code>EmailChannel</code>, and <code>SmsChannel</code> implementations, and a
              <code>Notifier</code> class that holds a list of channels and calls each one's
              <code>send()</code> method.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Take one requirement: &ldquo;a member can check out a book.&rdquo; Turning that into LLD
          means deciding there's a <code>Book</code> class (title, author), that &ldquo;check
          out&rdquo; is a method that probably lives on a <code>Library</code> or
          <code>Loan</code> class rather than on <code>Book</code> itself, and that the operation
          needs to check availability before it succeeds. None of that was visible in the one-line
          requirement &mdash; it's the product of doing the design work.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Diagram of a one-line requirement expanding into a small object model with a Book class and a checkOut method that checks availability first." >
          <rect className="box" x="20" y="35" width="140" height="30" rx="6" /><text x="90" y="54" className="boxText" style={{fontSize:"7.5px"}}>"A member can check out a book"</text>
          <line className="flow" x1="160" y1="50" x2="205" y2="50" />
          <rect className="boxAccent" x="210" y="15" width="90" height="28" rx="5" /><text x="255" y="33" className="boxText" style={{fontSize:"7.5px"}}>Book</text>
          <rect className="boxAccent" x="210" y="55" width="90" height="28" rx="5" /><text x="255" y="73" className="boxText" style={{fontSize:"7px"}}>Loan.checkOut()</text>
          <line className="flow" x1="300" y1="69" x2="345" y2="69" />
          <rect className="box" x="350" y="55" width="60" height="28" rx="5" /><text x="380" y="73" className="boxText" style={{fontSize:"6.5px"}}>availability check</text>
        </svg>
        <figcaption>A single requirement expands into specific classes, a specific method, and an explicit precondition once LLD is applied.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Writing code directly without first naming responsibilities and relationships tends to
          produce classes that grew organically rather than by design &mdash; harder to explain
          and harder to change. Treating LLD as UML-drawing for its own sake, disconnected from how
          the objects actually behave, produces diagrams that look thorough but don't help anyone
          write or review the code.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What makes an LLD "good enough" to hand off, according to this article?</p>
        </div>
      </section>
      <p className="takeaway">
        LLD is finished when writing the code is close to transcription &mdash; the classes,
        responsibilities, and relationships are already decided.
      </p>
    </div>
  );
}
